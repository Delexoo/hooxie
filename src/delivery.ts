import crypto from "node:crypto";
import type { AdapterContext, AgentAdapter, DeliveryUpdate, PreparedDelivery } from "./adapters.ts";
import { AdapterRegistry } from "./adapters.ts";
import { resolveProjectTarget } from "./prompt.ts";
import { IDE_IDS, type DeliveryPhase, type DeliveryStatus, type IdeId, type PublicDelivery, type SubmitInput } from "./types.ts";
import { DeliveryError } from "./types.ts";

interface DeliveryRecord {
  id: string;
  idempotencyKey: string;
  payloadHash?: string;
  status: DeliveryStatus;
  phase: DeliveryPhase;
  detail: string;
  destination: string;
  ide: IdeId;
  routeId: string;
  projectPath: string;
  mechanism: PublicDelivery["mechanism"];
  responseText?: string;
  responseVerified: boolean;
  limitations: string[];
  unsupported: string[];
  committed: boolean;
  retryable: boolean;
  canCancel: boolean;
  thought?: string;
  process?: string;
  terminals: PublicDelivery["terminals"];
  files: PublicDelivery["files"];
  cancel?: () => Promise<void>;
}

interface Gate {
  promise: Promise<void>;
  release: () => void;
}

export class DeliveryService {
  private records = new Map<string, DeliveryRecord>();
  private byKey = new Map<string, string>();
  private locks = new Map<string, Gate>();
  private registry: AdapterRegistry;
  private contextFor: (input: SubmitInput) => AdapterContext;

  constructor(registry: AdapterRegistry, contextFor: (input: SubmitInput) => AdapterContext) {
    this.registry = registry;
    this.contextFor = contextFor;
  }

  async routes(ide: IdeId, projectPath: string, options?: { allowUnsandboxed?: boolean }) {
    const target = await resolveProjectTarget(projectPath);
    const directory = target.directory;
    const ctx = this.contextFor({ ...blank(ide, directory), allowUnsandboxed: options?.allowUnsandboxed === true });
    const routes = [];
    for (const adapter of this.registry.list()) {
      if (adapter.ide !== "any" && adapter.ide !== ide) continue;
      const availability = await adapter.available({ ...ctx, ide, projectPath: directory });
      routes.push({
        id: adapter.id,
        label: adapter.displayName,
        available: availability.ok,
        reason: availability.reason ?? "",
        priority: adapter.priority,
        capabilities: adapter.capabilities,
        limitations: adapter.limitations,
        unsupported: adapter.unsupported,
        recommended: false,
      });
    }
    routes.sort((a, b) => a.priority - b.priority);
    const best = routes.find((route) => route.available);
    if (best) best.recommended = true;
    return routes;
  }

  get(id: string): PublicDelivery {
    const record = this.records.get(id);
    if (!record) throw new DeliveryError(404, "No delivery with that id.");
    return toPublic(record);
  }

  async cancel(id: string): Promise<PublicDelivery> {
    const record = this.records.get(id);
    if (!record) throw new DeliveryError(404, "No delivery with that id.");
    if (!record.cancel || record.status !== "agent_working") {
      throw new DeliveryError(400, "This delivery cannot be cancelled.");
    }
    await record.cancel();
    record.status = "failed";
    record.phase = "failed";
    record.detail = "Cancellation was requested. Waiting for the agent to confirm it stopped.";
    record.canCancel = false;
    return toPublic(record);
  }

  async submit(input: SubmitInput): Promise<PublicDelivery> {
    validateShape(input);
    const gate = await this.lock(input.idempotencyKey);
    let handedOff = false;
    try {
      const target = await resolveProjectTarget(input.projectPath);
      const focused = target.file
        ? {
            ...input,
            projectPath: target.directory,
            additionalInstructions: [`The selected file is ${target.file}.`, input.additionalInstructions].filter(Boolean).join("\n"),
          }
        : { ...input, projectPath: target.directory };
      input = focused;
      if (!input.confirmDestination) {
        throw new DeliveryError(400, "Confirm the destination IDE and project before sending.");
      }
      const adapter = this.registry.get(input.routeId);
      if (!adapter || (adapter.ide !== "any" && adapter.ide !== input.ide)) {
        throw new DeliveryError(400, "That delivery route is not available for the selected IDE.");
      }
      const ctx = this.contextFor(input);
      const availability = await adapter.available(ctx);
      if (!availability.ok) {
        throw new DeliveryError(409, availability.reason || "That route is unavailable.");
      }
      if (input.images.length && !adapter.capabilities.images) {
        throw new DeliveryError(400, `${adapter.displayName} cannot receive images. Remove them or choose another route.`);
      }
      const prepared = await adapter.prepare(input, ctx);
      const existingId = this.byKey.get(input.idempotencyKey);
      if (existingId) {
        const existing = this.records.get(existingId);
        if (!existing) throw new DeliveryError(500, "Delivery state was lost.");
        if (existing.payloadHash !== prepared.hash) {
          throw new DeliveryError(409, "This retry key was already used for a different prompt. Nothing new was sent.");
        }
        if (existing.committed || !input.retry) return toPublic(existing);
        if (!existing.retryable) return toPublic(existing);
      }

      const record = this.begin(input, adapter, prepared);
      record.status = "agent_working";
      record.phase = "processing";
      record.detail = "Starting the agent.";
      record.thought = "Starting the agent.";
      record.process = "Starting the agent.";
      handedOff = true;
      void this.complete(record, adapter, prepared, ctx).finally(() => gate.release());
      return toPublic(record);
    } finally {
      if (!handedOff) gate.release();
    }
  }

  private async complete(
    record: DeliveryRecord,
    adapter: AgentAdapter,
    prepared: PreparedDelivery,
    ctx: AdapterContext,
  ): Promise<void> {
    try {
      const result = await adapter.send(prepared, ctx, (update) => applyUpdate(record, update));
      applyUpdate(record, result.update);
      record.committed = result.committed;
      if (result.run) {
        record.cancel = () => result.run!.cancel();
        record.canCancel = adapter.capabilities.cancel && record.status === "agent_working";
      }
      if (result.update.retryable) record.retryable = result.update.retryable && !record.committed;
      else record.retryable = !record.committed && record.status === "failed";
    } catch (error) {
      if (record.status === "completed" || record.status === "failed") return;
      record.status = "failed";
      record.phase = "failed";
      record.detail = error instanceof Error ? error.message : "The agent did not start.";
      record.canCancel = false;
      record.process = undefined;
    }
  }

  private begin(input: SubmitInput, adapter: AgentAdapter, prepared: PreparedDelivery): DeliveryRecord {
    const prior = this.byKey.get(input.idempotencyKey);
    const record: DeliveryRecord = {
      id: prior ?? crypto.randomBytes(8).toString("hex"),
      idempotencyKey: input.idempotencyKey,
      payloadHash: prepared.hash,
      status: "sending",
      phase: "prepared",
      detail: "Prepared. Sending now.",
      destination: prepared.destination,
      ide: input.ide,
      routeId: adapter.id,
      projectPath: prepared.projectPath,
      mechanism: adapter.capabilities.mechanism,
      responseVerified: false,
      limitations: adapter.limitations,
      unsupported: adapter.unsupported,
      committed: false,
      retryable: false,
      canCancel: false,
      terminals: [],
      files: [],
    };
    this.records.set(record.id, record);
    this.byKey.set(input.idempotencyKey, record.id);
    return record;
  }

  private async lock(key: string): Promise<Gate> {
    const previous = this.locks.get(key)?.promise ?? Promise.resolve();
    let release: () => void = () => undefined;
    const promise = new Promise<void>((resolve) => {
      release = resolve;
    });
    const gate: Gate = {
      promise,
      release: () => {
        if (this.locks.get(key)?.promise === promise) this.locks.delete(key);
        release();
      },
    };
    this.locks.set(key, gate);
    await previous;
    return gate;
  }
}

function applyUpdate(record: DeliveryRecord, update: DeliveryUpdate): void {
  if (update.activity) {
    record.terminals = update.activity.terminals.map((item) => ({
      id: item.id,
      command: item.command,
      status: item.status,
    }));
    record.files = update.activity.files;
  }
  const settled = record.status === "completed" || record.status === "failed" || record.status === "delivered" || record.status === "disconnected" || record.status === "status_unavailable";
  if (settled && update.status === "agent_working") return;
  record.status = update.status;
  record.phase = update.phase;
  record.detail = update.detail;
  record.responseVerified = update.responseVerified;
  record.limitations = update.limitations;
  record.unsupported = update.unsupported;
  if (typeof update.responseText === "string") record.responseText = update.responseText;
  if (typeof update.thought === "string") record.thought = update.thought;
  else if (update.status !== "agent_working") record.thought = undefined;
  if (typeof update.process === "string") record.process = update.process || undefined;
  if (record.status !== "agent_working") {
    record.canCancel = false;
    record.thought = undefined;
  }
}

function toPublic(record: DeliveryRecord): PublicDelivery {
  return {
    id: record.id,
    status: record.status,
    phase: record.phase,
    detail: record.detail,
    destination: record.destination,
    ide: record.ide,
    routeId: record.routeId,
    projectPath: record.projectPath,
    mechanism: record.mechanism,
    responseText: record.responseText,
    responseVerified: record.responseVerified,
    limitations: record.limitations,
    unsupported: record.unsupported,
    committed: record.committed,
    retryable: record.retryable,
    canCancel: record.canCancel,
    thought: record.thought,
    process: record.process,
    terminals: record.terminals,
    files: record.files,
  };
}

function blank(ide: IdeId, projectPath: string): SubmitInput {
  return {
    idempotencyKey: "route-check",
    routeId: "clipboard",
    ide,
    projectPath,
    prompt: "route check",
    additionalInstructions: "",
    includeProjectPath: false,
    includeStackMarkers: false,
    includeScreen: false,
    files: [],
    uploads: [],
    images: [],
    allowUnsandboxed: false,
    experimentalSubmit: false,
    confirmDestination: false,
    retry: false,
  };
}

function validateShape(input: SubmitInput): void {
  if (!/^[A-Za-z0-9-]{8,80}$/.test(input.idempotencyKey)) {
    throw new DeliveryError(400, "Missing a valid submission id.");
  }
  if (!IDE_IDS.includes(input.ide)) throw new DeliveryError(400, "Unknown IDE.");
  if (!input.prompt.trim()) throw new DeliveryError(400, "Write a prompt before sending.");
  if (input.prompt.length > 100_000) throw new DeliveryError(400, "That prompt is too long.");
  if (input.additionalInstructions.length > 20_000) {
    throw new DeliveryError(400, "Additional instructions are too long.");
  }
}
