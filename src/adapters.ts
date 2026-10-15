import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { catalogFor } from "./catalog.ts";
import { changedSince, emptyActivity, foldActivity, mergeFileChanges, readGitStatus, type RunActivity } from "./run-activity.ts";
import type { CompanionHub } from "./companion.ts";
import { buildPromptText, imageFingerprint, stackMarkers } from "./prompt.ts";
import { assertImage, assertUploads, readSelectedFile } from "./safety.ts";
import type {
  AgentCapabilities,
  DeliveryPhase,
  DeliveryStatus,
  IdeId,
  ImageAttachment,
  Installation,
  Mechanism,
  SubmitInput,
} from "./types.ts";
import { DeliveryError } from "./types.ts";

export interface AdapterContext {
  ide: IdeId;
  projectPath: string;
  apiKey?: string;
  sdkAccount?: boolean;
  sdkReady: boolean;
  allowUnsandboxed: boolean;
  experimentalSubmit: boolean;
  hub: CompanionHub;
  clipboard: ClipboardPort;
  sdk?: CursorSdkClient;
  storeDir: string;
  installations: Installation[];
}

export interface ClipboardPort {
  write(text: string): Promise<void>;
  read(): Promise<string>;
}

export interface SdkRun {
  requestId?: string;
  status: string;
  supports(op: string): boolean;
  wait(): Promise<{ status: string; result?: string; error?: { message?: string } }>;
  cancel(): Promise<void>;
  stream?(): AsyncIterable<unknown>;
}

export interface CursorSdkClient {
  createAgent(options: {
    cwd: string;
    apiKey?: string;
    model: string;
    sandbox: boolean;
    storeDir: string;
  }): Promise<{
    send(message: string | { text: string; images: ImageAttachment[] }): Promise<SdkRun>;
    dispose(): Promise<void>;
  }>;
}

export interface DeliveryUpdate {
  status: DeliveryStatus;
  phase: DeliveryPhase;
  detail: string;
  responseText?: string;
  responseVerified: boolean;
  limitations: string[];
  retryable?: boolean;
  unsupported: string[];
  activity?: import("./run-activity.ts").RunActivity;
}

export interface ActiveRun {
  cancel(): Promise<void>;
}

export interface SendResult {
  update: DeliveryUpdate;
  run?: ActiveRun;
  committed: boolean;
}

export interface PreparedDelivery {
  text: string;
  images: ImageAttachment[];
  projectPath: string;
  hash: string;
  destination: string;
}

export interface AgentAdapter {
  id: string;
  ide: IdeId | "any";
  priority: number;
  displayName: string;
  capabilities: AgentCapabilities;
  limitations: string[];
  unsupported: string[];
  available(ctx: AdapterContext): Promise<{ ok: boolean; reason?: string }>;
  prepare(input: SubmitInput, ctx: AdapterContext): Promise<PreparedDelivery>;
  send(prepared: PreparedDelivery, ctx: AdapterContext, report: (update: DeliveryUpdate) => void): Promise<SendResult>;
  close?(): Promise<void>;
}

export class AdapterRegistry {
  private adapters: AgentAdapter[] = [];

  register(adapter: AgentAdapter): void {
    if (this.adapters.some((item) => item.id === adapter.id)) {
      throw new Error(`Adapter ${adapter.id} is already registered.`);
    }
    this.adapters.push(adapter);
  }

  list(): AgentAdapter[] {
    return [...this.adapters];
  }

  get(id: string): AgentAdapter | undefined {
    return this.adapters.find((item) => item.id === id);
  }
}

export async function prepareShared(input: SubmitInput, destination: string): Promise<PreparedDelivery> {
  const files = [];
  if (input.files.length > 8) throw new DeliveryError(400, "Attach at most 8 files.");
  for (const relativePath of input.files) {
    files.push(await readSelectedFile(input.projectPath, relativePath));
  }
  const markers = input.includeStackMarkers ? await stackMarkers(input.projectPath) : null;
  const text = buildPromptText({
    prompt: input.prompt,
    projectPath: input.projectPath,
    additionalInstructions: input.additionalInstructions,
    includeProjectPath: input.includeProjectPath,
    includeScreen: input.includeScreen,
    markers,
    files,
    uploads: assertUploads(input.uploads),
  });
  if (text.length > 120_000) throw new DeliveryError(400, "The prepared prompt is too large.");
  for (const image of input.images) assertImage(image);
  const hash = crypto
    .createHash("sha256")
    .update(
      JSON.stringify({
        routeId: input.routeId,
        ide: input.ide,
        projectPath: path.resolve(input.projectPath),
        text,
        images: imageFingerprint(input.images),
        allowUnsandboxed: input.allowUnsandboxed,
        experimentalSubmit: input.experimentalSubmit,
      }),
    )
    .digest("hex");
  return { text, images: input.images, projectPath: path.resolve(input.projectPath), hash, destination };
}

type HeldAgent = Awaited<ReturnType<CursorSdkClient["createAgent"]>>;

export function cursorSdkAdapter(): AgentAdapter {
  const profile = catalogFor("cursor");
  const warming = new Map<string, Promise<HeldAgent>>();
  let closed = false;

  const open = (ctx: AdapterContext, projectPath: string, sandbox: boolean) =>
    Promise.resolve().then(() => ctx.sdk!.createAgent({
      cwd: projectPath,
      apiKey: ctx.apiKey,
      model: "auto",
      sandbox,
      storeDir: ctx.storeDir,
    }));

  const prime = (ctx: AdapterContext, projectPath: string, sandbox: boolean) => {
    if (closed || !ctx.sdk) return;
    const key = warmKey(ctx, projectPath, sandbox);
    if (warming.has(key)) return;
    for (const [other, pendingAgent] of warming) {
      warming.delete(other);
      void pendingAgent.then((agent) => agent.dispose()).catch(() => undefined);
    }
    const pending = open(ctx, projectPath, sandbox);
    const guarded = pending.then(
      (agent) => agent,
      (error: unknown) => {
        if (warming.get(key) === guarded) warming.delete(key);
        throw error;
      },
    );
    warming.set(key, guarded);
    void guarded.catch(() => undefined);
  };

  const claim = async (ctx: AdapterContext, projectPath: string, sandbox: boolean): Promise<HeldAgent> => {
    const key = warmKey(ctx, projectPath, sandbox);
    const pending = warming.get(key);
    warming.delete(key);
    let agent: HeldAgent;
    try {
      agent = pending ? await pending : await open(ctx, projectPath, sandbox);
    } catch {
      agent = await open(ctx, projectPath, sandbox);
    }
    prime(ctx, projectPath, sandbox);
    return agent;
  };

  return {
    id: "cursor-sdk",
    ide: "cursor",
    priority: 10,
    displayName: "Cursor agent (official SDK)",
    capabilities: profile.capabilities,
    limitations: profile.limitations,
    unsupported: ["Native file attachments. Selected files are inlined as text."],
    async close() {
      closed = true;
      const pending = [...warming.values()];
      warming.clear();
      await Promise.all(pending.map((item) => item.then((agent) => agent.dispose()).catch(() => undefined)));
    },
    async available(ctx) {
      if (ctx.ide !== "cursor") return { ok: false, reason: "The Cursor SDK only targets Cursor." };
      if (!ctx.sdkReady && !ctx.sdk) return { ok: false, reason: "@cursor/sdk is not installed." };
      if (!ctx.apiKey && !ctx.sdkAccount) return { ok: false, reason: "Connect the Cursor account on this computer." };
      if (!ctx.sdk) return { ok: false, reason: "The Cursor SDK client is not loaded." };
      prime(ctx, path.resolve(ctx.projectPath), !ctx.allowUnsandboxed);
      return { ok: true };
    },
    prepare(input, _ctx) {
      return prepareShared(
        input,
        `Cursor agent via the official SDK at ${input.projectPath}. This starts a new agent session and can edit that folder.`,
      );
    },
    async send(prepared, ctx, report) {
      if (!ctx.sdk || (!ctx.apiKey && !ctx.sdkAccount)) {
        return failed(this, "Connect the Cursor account on this computer.", false);
      }
      if (prepared.images.length && !this.capabilities.images) {
        return failed(this, "This route cannot accept images.", false);
      }
      let agent: HeldAgent | undefined;
      let fellBackFromSandbox = false;
      try {
        const message = prepared.images.length
          ? { text: prepared.text, images: prepared.images }
          : prepared.text;
        const start = async (sandbox: boolean) => {
          const next = await claim(ctx, prepared.projectPath, sandbox);
          try {
            const run = await next.send(message);
            return { agent: next, run };
          } catch (error) {
            await next.dispose().catch(() => undefined);
            throw error;
          }
        };
        let started: { agent: NonNullable<typeof agent>; run: SdkRun };
        try {
          started = await start(!ctx.allowUnsandboxed);
        } catch (error) {
          if (ctx.allowUnsandboxed || !sandboxUnsupported(error)) throw error;
          fellBackFromSandbox = true;
          started = await start(false);
        }
        agent = started.agent;
        const run = started.run;
        const handle = agent;
        const adapter = this;
        const nextSandbox = !fellBackFromSandbox && !ctx.allowUnsandboxed;
        setImmediate(() => {
          void observeRun(run, handle, adapter, prepared.projectPath, report).finally(() => {
            prime(ctx, prepared.projectPath, nextSandbox);
          });
        });
        return {
          committed: true,
          run: {
            async cancel() {
              if (run.supports("cancel")) await run.cancel();
              await handle.dispose().catch(() => undefined);
            },
          },
          update: {
            status: "agent_working",
            phase: "processing",
            detail: fellBackFromSandbox
              ? "This machine cannot sandbox a local Cursor agent, so Hooxie started this run without a sandbox. The agent run is in progress."
              : "The Cursor SDK accepted the prompt. The agent run is in progress. This is observable run status, not a guess.",
            responseVerified: false,
            limitations: this.limitations,
            unsupported: this.unsupported,
          },
        };
      } catch (error) {
        if (agent) await agent.dispose().catch(() => undefined);
        prime(ctx, prepared.projectPath, ctx.allowUnsandboxed ? false : !sandboxUnsupported(error));
        const retryable = Boolean((error as { isRetryable?: boolean }).isRetryable);
        const message = error instanceof Error ? error.message : "The Cursor SDK rejected the prompt.";
        return failed(this, `The Cursor agent did not start. ${message}`, retryable);
      }
    },
  };
}

async function observeRun(
  run: SdkRun,
  agent: { dispose(): Promise<void> },
  adapter: AgentAdapter,
  projectPath: string,
  report: (update: DeliveryUpdate) => void,
): Promise<void> {
  let activity = emptyActivity();
  let closed = false;
  const baseline = await readGitStatus(projectPath);
  const publish = () => {
    if (closed) return;
    report({
      status: "agent_working",
      phase: "processing",
      detail: "The agent run is in progress.",
      responseVerified: false,
      limitations: adapter.limitations,
      unsupported: adapter.unsupported,
      activity,
    });
  };
  if (run.stream && run.supports("stream")) {
    void readRunStream(run, () => closed, () => activity, (next) => {
      activity = next;
      publish();
    });
  }
  const gitTimer = setInterval(() => {
    void readGitStatus(projectPath).then((now) => {
      if (closed) return;
      const files = mergeFileChanges(activity.files, changedSince(baseline, now));
      if (files === activity.files) return;
      activity = { terminals: activity.terminals, files };
      publish();
    });
  }, 2000);
  try {
    const result = await run.wait();
    closed = true;
    clearInterval(gitTimer);
    const now = await readGitStatus(projectPath);
    activity = { terminals: activity.terminals, files: mergeFileChanges(activity.files, changedSince(baseline, now)) };
    if (result.status === "finished") {
      const text = typeof result.result === "string" ? result.result : undefined;
      report({
        status: "completed",
        phase: "completed",
        detail: text ? "The run finished and returned a result." : "The run finished without a text result.",
        responseText: text,
        responseVerified: true,
        limitations: adapter.limitations,
        unsupported: adapter.unsupported,
        activity,
      });
      return;
    }
    if (result.status === "cancelled") {
      report({
        status: "failed",
        phase: "failed",
        detail: "You cancelled the run before it finished.",
        responseVerified: false,
        limitations: adapter.limitations,
        unsupported: adapter.unsupported,
        activity,
      });
      return;
    }
    report({
      status: "failed",
      phase: "failed",
      detail: result.error?.message || "The agent run failed.",
      responseVerified: false,
      limitations: adapter.limitations,
      unsupported: adapter.unsupported,
      activity,
    });
  } catch {
    closed = true;
    clearInterval(gitTimer);
    report({
      status: "status_unavailable",
      phase: "failed",
      detail: "The prompt was accepted, then Hooxie lost the run result. It was not sent again.",
      responseVerified: false,
      limitations: adapter.limitations,
      unsupported: adapter.unsupported,
      activity,
    });
  } finally {
    closed = true;
    clearInterval(gitTimer);
    await agent.dispose().catch(() => undefined);
  }
}

async function readRunStream(
  run: SdkRun,
  closed: () => boolean,
  current: () => RunActivity,
  apply: (next: RunActivity) => void,
): Promise<void> {
  try {
    for await (const message of run.stream!()) {
      if (closed()) return;
      const next = foldActivity(current(), message);
      if (next !== current()) apply(next);
    }
  } catch {
    /* wait() still reports the run result. */
  }
}

export function companionAdapter(): AgentAdapter {
  return {
    id: "companion",
    ide: "any",
    priority: 20,
    displayName: "IDE chat input (companion extension)",
    capabilities: {
      programmaticSubmit: false,
      projectTargeting: true,
      textContext: true,
      nativeFileAttachments: false,
      images: false,
      readResponses: false,
      observeWorking: false,
      observeCompletion: false,
      cancel: false,
      mechanism: "companion_extension",
      stability: "experimental",
    },
    limitations: [
      "The extension places the prompt with workbench.action.chat.open when that internal command exists.",
      "Text in the chat input is not proof the agent accepted it.",
      "Hooxie does not report agent progress on this route.",
      "Selected files are inlined as text. Images are not forwarded.",
    ],
    unsupported: ["Verified agent acceptance", "Agent progress", "Cancellation", "Images", "Native file attachments"],
    async available(ctx) {
      const matches = ctx.hub.matching(ctx.ide, ctx.projectPath);
      if (matches.length === 1) return { ok: true };
      if (matches.length > 1) {
        return { ok: false, reason: "More than one IDE window is open on this project. Hooxie will not pick one." };
      }
      return { ok: false, reason: "No companion extension is connected for this IDE and project." };
    },
    prepare(input) {
      return prepareShared(
        input,
        `Chat input of the connected ${input.ide} window at ${input.projectPath}. You still need to submit it there unless you explicitly enable the experimental submit option.`,
      );
    },
    async send(prepared, ctx) {
      if (prepared.images.length) {
        return failed(this, "This route cannot carry images. Remove them or choose a route that lists image support.", false);
      }
      const matches = ctx.hub.matching(ctx.ide, prepared.projectPath);
      if (matches.length !== 1) {
        return {
          committed: false,
          update: {
            status: "disconnected",
            phase: "failed",
            detail: "The IDE extension is not connected to this project anymore. Nothing was sent.",
            responseVerified: false,
            limitations: this.limitations,
            unsupported: this.unsupported,
            retryable: true,
          },
        };
      }
      const jobId = crypto.randomBytes(8).toString("hex");
      let outcome;
      try {
        outcome = await ctx.hub.enqueue(matches[0].id, {
          id: jobId,
          promptText: prepared.text,
          projectPath: prepared.projectPath,
          experimentalSubmit: ctx.experimentalSubmit,
        });
      } catch {
        return {
          committed: false,
          update: {
            status: "disconnected",
            phase: "failed",
            detail: "The IDE extension disconnected before the prompt was handed off. Nothing was sent.",
            responseVerified: false,
            limitations: this.limitations,
            unsupported: this.unsupported,
            retryable: true,
          },
        };
      }
      if (outcome.outcome === "placed") {
        return {
          committed: true,
          update: {
            status: "awaiting_user_action",
            phase: "awaiting_user",
            detail: outcome.detail,
            responseVerified: false,
            limitations: this.limitations,
            unsupported: this.unsupported,
          },
        };
      }
      if (outcome.outcome === "submit_attempted") {
        return {
          committed: true,
          update: {
            status: "delivered",
            phase: "delivered",
            detail: `${outcome.detail} Agent progress is unavailable on this route.`,
            responseVerified: false,
            limitations: this.limitations,
            unsupported: this.unsupported,
          },
        };
      }
      return {
        committed: outcome.handedOff,
        update: {
          status: outcome.handedOff ? "status_unavailable" : "failed",
          phase: "failed",
          detail: outcome.detail,
          responseVerified: false,
          limitations: this.limitations,
          unsupported: this.unsupported,
          retryable: !outcome.handedOff,
        },
      };
    },
  };
}

export function clipboardAdapter(): AgentAdapter {
  return {
    id: "clipboard",
    ide: "any",
    priority: 30,
    displayName: "Clipboard fallback",
    capabilities: {
      programmaticSubmit: false,
      projectTargeting: false,
      textContext: true,
      nativeFileAttachments: false,
      images: false,
      readResponses: false,
      observeWorking: false,
      observeCompletion: false,
      cancel: false,
      mechanism: "clipboard",
      stability: "fallback",
    },
    limitations: [
      "Hooxie copies the prompt. It does not paste it and does not submit it.",
      "Copying text is not agent acceptance.",
      "Images are not placed on the clipboard by this fallback.",
    ],
    unsupported: ["Agent acceptance", "Agent progress", "Cancellation", "Images"],
    async available() {
      return { ok: true };
    },
    prepare(input) {
      return prepareShared(
        input,
        `Clipboard, for you to paste into ${input.ide} at ${input.projectPath}.`,
      );
    },
    async send(prepared, ctx) {
      if (prepared.images.length) {
        return failed(this, "Clipboard delivery cannot carry images. Remove them before using this fallback.", false);
      }
      try {
        await ctx.clipboard.write(prepared.text);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Clipboard write failed.";
        return failed(this, message, true);
      }
      return {
        committed: true,
        update: {
          status: "awaiting_user_action",
          phase: "awaiting_user",
          detail: "The prompt is on the clipboard. Open the IDE, confirm the project, paste into the agent input, and submit it yourself.",
          responseVerified: false,
          limitations: this.limitations,
          unsupported: this.unsupported,
        },
      };
    },
  };
}

function warmKey(ctx: AdapterContext, projectPath: string, sandbox: boolean): string {
  return `${path.resolve(projectPath)}\0${sandbox ? "1" : "0"}\0${ctx.apiKey ?? ""}\0${ctx.storeDir}`;
}

function sandboxUnsupported(error: unknown): boolean {
  const message = error instanceof Error ? `${error.message} ${error.cause ?? ""}` : String(error);
  return /sandbox/i.test(message);
}

function failed(adapter: AgentAdapter, detail: string, retryable: boolean): SendResult {
  return {
    committed: false,
    update: {
      status: "failed",
      phase: "failed",
      detail,
      responseVerified: false,
      limitations: adapter.limitations,
      unsupported: adapter.unsupported,
      retryable,
    },
  };
}

export async function loadRealCursorSdk(storeDir: string): Promise<CursorSdkClient | undefined> {
  try {
    const sdk = (await import("@cursor/sdk")) as {
      Agent: {
        create(options: Record<string, unknown>): Promise<{
          send(message: unknown): Promise<SdkRun>;
          [Symbol.asyncDispose](): Promise<void>;
        }>;
      };
      JsonlLocalAgentStore: new (dir: string) => unknown;
      CursorAgentError: new (...args: never[]) => Error & { isRetryable?: boolean };
    };
    await fs.mkdir(storeDir, { recursive: true });
    const store = new sdk.JsonlLocalAgentStore(storeDir);
    return {
      async createAgent(options) {
        const agent = await sdk.Agent.create({
          ...(options.apiKey ? { apiKey: options.apiKey } : {}),
          model: { id: options.model },
          local: {
            cwd: options.cwd,
            settingSources: ["project"],
            store,
            sandboxOptions: { enabled: process.platform === "win32" ? false : options.sandbox },
          },
        });
        return {
          async send(message) {
            try {
              return await agent.send(message);
            } catch (error) {
              if (error instanceof sdk.CursorAgentError) throw error;
              throw error;
            }
          },
          async dispose() {
            await agent[Symbol.asyncDispose]();
          },
        };
      },
    };
  } catch {
    return undefined;
  }
}
