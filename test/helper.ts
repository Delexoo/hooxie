import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import type { ClipboardPort, CursorSdkClient, SdkRun } from "../src/adapters.ts";
import { startBridge, type BridgeHandle } from "../src/server.ts";
import type { Installation } from "../src/types.ts";

export interface FakeSdk {
  client: CursorSdkClient;
  calls: { cwd: string; sandbox: boolean; message: { text: string } }[];
  hold: Promise<void> | undefined;
  mode: "finish" | "hang" | "throw";
}

export function createFakeSdk(): FakeSdk {
  const fake: FakeSdk = {
    calls: [],
    hold: undefined,
    mode: "finish",
    client: {
      async createAgent(options) {
        return {
          async send(message) {
            fake.calls.push({
              cwd: options.cwd,
              sandbox: options.sandbox,
              message: { text: typeof message === "string" ? message : message.text },
            });
            if (fake.hold) await fake.hold;
            if (fake.mode === "throw") {
              const error = new Error("rejected before start") as Error & { isRetryable: boolean };
              error.isRetryable = true;
              throw error;
            }
            let finish: (value: { status: string; result?: string }) => void = () => undefined;
            const waiting = new Promise<{ status: string; result?: string }>((resolve) => {
              finish = resolve;
            });
            const run: SdkRun = {
              requestId: "req-test",
              status: "running",
              supports: (op) => op === "cancel" || op === "wait",
              async cancel() {
                finish({ status: "cancelled" });
              },
              wait: () => waiting,
            };
            if (fake.mode === "finish") finish({ status: "finished", result: "agent said pong" });
            return run;
          },
          async dispose() {},
        };
      },
    },
  };
  return fake;
}

export function memoryClipboard(): ClipboardPort & { value: string } {
  const box = {
    value: "",
    async write(text: string) {
      box.value = text;
    },
    async read() {
      return box.value;
    },
  };
  return box;
}

export async function boot(options?: {
  installations?: Installation[];
  opener?: (executable: string, projectPath: string) => void;
  openUrl?: (url: string) => void;
  companionTimeoutMs?: number;
  sdk?: FakeSdk;
}) {
  const configDir = await fs.mkdtemp(path.join(os.tmpdir(), "z-bridge-"));
  const project = await fs.mkdtemp(path.join(os.tmpdir(), "z-project-"));
  const sdk = options?.sdk ?? createFakeSdk();
  const clipboard = memoryClipboard();
  const bridge = await startBridge({
    port: 0,
    configDir,
    clipboard,
    sdk: sdk.client,
    sdkReady: true,
    apiKey: "test-key-value",
    installations: options?.installations ?? [],
    opener: options?.opener,
    openUrl: options?.openUrl,
    companionTimeoutMs: options?.companionTimeoutMs ?? 400,
    sessionTtlMs: 5000,
  });
  return { bridge, sdk, clipboard, project, configDir };
}

export async function api(bridge: BridgeHandle, pathname: string, token = bridge.pageToken, init: RequestInit = {}) {
  const response = await fetch(`${bridge.baseUrl}${pathname}`, {
    ...init,
    headers: {
      authorization: `Bearer ${token}`,
      "content-type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const body = await response.json();
  return { status: response.status, body };
}

export function deliveryBody(project: string, extra: Record<string, unknown> = {}) {
  return {
    idempotencyKey: "delivery-1",
    routeId: "cursor-sdk",
    ide: "cursor",
    projectPath: project,
    prompt: "Reply with the word pong.",
    additionalInstructions: "",
    includeProjectPath: false,
    includeStackMarkers: false,
    files: [],
    images: [],
    allowUnsandboxed: false,
    experimentalSubmit: false,
    confirmDestination: true,
    retry: false,
    ...extra,
  };
}

export async function sendDelivery(bridge: BridgeHandle, project: string, extra: Record<string, unknown> = {}) {
  return api(bridge, "/api/deliveries", bridge.pageToken, {
    method: "POST",
    body: JSON.stringify(deliveryBody(project, extra)),
  });
}

export async function untilStatus(bridge: BridgeHandle, id: string, expected: string) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const current = await api(bridge, `/api/deliveries/${id}`);
    if (current.body.status === expected) return current.body;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  const last = await api(bridge, `/api/deliveries/${id}`);
  throw new Error(`status stayed ${last.body.status}: ${last.body.detail}`);
}
