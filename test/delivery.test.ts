import assert from "node:assert/strict";
import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import test from "node:test";
import type { AgentAdapter } from "../src/adapters.ts";
import { prepareShared } from "../src/adapters.ts";
import { chatOpenArgs, validateHello, validateJob } from "../extensions/z-agent-bridge/protocol.js";
import { api, boot, createFakeSdk, sendDelivery, untilStatus } from "./helper.ts";

const PNG = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

test("prompt reaches the Cursor SDK for the selected project and a retry does not send it twice", async () => {
  const ctx = await boot();
  try {
    await fs.writeFile(path.join(ctx.project, "note.txt"), "selected note");
    await fs.writeFile(path.join(ctx.project, "secret.txt"), "do not attach");
    const first = await sendDelivery(ctx.bridge, ctx.project, {
      prompt: "Inspect the selected note.",
      files: ["note.txt"],
      includeProjectPath: true,
      images: [{ data: PNG, mimeType: "image/png" }],
    });
    assert.equal(first.status, 200);
    assert.equal(first.body.status, "agent_working");
    assert.equal(first.body.responseVerified, false);
    assert.equal(ctx.sdk.calls.length, 1);
    assert.equal(ctx.sdk.calls[0].cwd, path.resolve(ctx.project));
    assert.equal(ctx.sdk.calls[0].sandbox, true);
    const text = ctx.sdk.calls[0].message.text;
    assert.match(text, /Inspect the selected note/);
    assert.match(text, /selected note/);
    assert.match(text, /Project path/);
    assert.doesNotMatch(text, /do not attach/);
    const done = await untilStatus(ctx.bridge, first.body.id, "completed");
    assert.equal(done.responseVerified, true);
    assert.equal(done.responseText, "agent said pong");

    const retry = await sendDelivery(ctx.bridge, ctx.project, {
      prompt: "Inspect the selected note.",
      files: ["note.txt"],
      includeProjectPath: true,
      images: [{ data: PNG, mimeType: "image/png" }],
      retry: true,
    });
    assert.equal(retry.status, 200);
    assert.equal(retry.body.id, first.body.id);
    assert.equal(ctx.sdk.calls.length, 1);

    const changed = await sendDelivery(ctx.bridge, ctx.project, {
      prompt: "A different prompt.",
      retry: true,
    });
    assert.equal(changed.status, 409);
    assert.equal(ctx.sdk.calls.length, 1);
  } finally {
    await ctx.bridge.close();
  }
});

test("an unsupported sandbox starts the agent without one", async () => {
  const sdk = createFakeSdk();
  const original = sdk.client.createAgent.bind(sdk.client);
  sdk.client.createAgent = async (options) => {
    if (options.sandbox) {
      throw new Error("Local SDK sandboxing was requested, but sandboxing is not supported in this environment.");
    }
    return original(options);
  };
  const ctx = await boot({ sdk });
  try {
    const first = await sendDelivery(ctx.bridge, ctx.project, { prompt: "Reply with the word pong." });
    assert.equal(first.status, 200);
    const working = await untilDetail(ctx.bridge, first.body.id, /without a sandbox/);
    assert.equal(working.status, "agent_working");
    assert.equal(ctx.sdk.calls.length, 1);
    assert.equal(ctx.sdk.calls[0].sandbox, false);
  } finally {
    await ctx.bridge.close();
  }
});

test("parallel submits share one SDK call", async () => {
  const ctx = await boot();
  let release: (value?: void) => void = () => undefined;
  ctx.sdk.hold = new Promise((resolve) => {
    release = resolve;
  });
  try {
    const first = sendDelivery(ctx.bridge, ctx.project);
    await waitFor(() => ctx.sdk.calls.length === 1);
    const second = sendDelivery(ctx.bridge, ctx.project);
    await new Promise((resolve) => setTimeout(resolve, 50));
    assert.equal(ctx.sdk.calls.length, 1);
    release();
    const [left, right] = await Promise.all([first, second]);
    assert.equal(left.body.id, right.body.id);
    assert.equal(ctx.sdk.calls.length, 1);
  } finally {
    release();
    await ctx.bridge.close();
  }
});

test("a failed SDK start can be retried once, then a success is not sent again", async () => {
  const ctx = await boot();
  ctx.sdk.mode = "throw";
  try {
    const failed = await sendDelivery(ctx.bridge, ctx.project);
    const failedBody = await untilStatus(ctx.bridge, failed.body.id, "failed");
    assert.equal(failedBody.committed, false);
    assert.equal(failedBody.retryable, true);
    assert.match(failedBody.detail, /did not start/);
    const ignored = await sendDelivery(ctx.bridge, ctx.project);
    assert.equal(ignored.body.status, "failed");
    assert.equal(ctx.sdk.calls.length, 1);

    ctx.sdk.mode = "finish";
    const retried = await sendDelivery(ctx.bridge, ctx.project, { retry: true });
    await untilStatus(ctx.bridge, retried.body.id, "agent_working");
    await waitFor(() => ctx.sdk.calls.length === 2);
    assert.equal(ctx.sdk.calls.length, 2);
    const again = await sendDelivery(ctx.bridge, ctx.project, { retry: true });
    assert.equal(again.body.id, retried.body.id);
    assert.equal(ctx.sdk.calls.length, 2);
  } finally {
    await ctx.bridge.close();
  }
});

test("cancel asks the SDK run to stop", async () => {
  const ctx = await boot();
  ctx.sdk.mode = "hang";
  try {
    const started = await sendDelivery(ctx.bridge, ctx.project, { idempotencyKey: "cancel-me-1" });
    await waitFor(async () => {
      const current = await api(ctx.bridge, `/api/deliveries/${started.body.id}`);
      return current.body.canCancel === true;
    });
    const cancelled = await api(ctx.bridge, `/api/deliveries/${started.body.id}/cancel`, ctx.bridge.pageToken, { method: "POST" });
    assert.equal(cancelled.status, 200);
    const done = await untilStatus(ctx.bridge, started.body.id, "failed");
    assert.match(done.detail, /cancel/i);
  } finally {
    await ctx.bridge.close();
  }
});

test("clipboard fallback copies the prompt and does not claim the agent started", async () => {
  const ctx = await boot();
  try {
    const copied = await sendDelivery(ctx.bridge, ctx.project, {
      routeId: "clipboard",
      ide: "windsurf",
      idempotencyKey: "clip-board-1",
      prompt: "Paste this into Cascade.",
    });
    const copiedBody = await untilStatus(ctx.bridge, copied.body.id, "awaiting_user_action");
    assert.equal(copiedBody.responseVerified, false);
    assert.equal(ctx.clipboard.value, "Paste this into Cascade.");
    assert.equal(ctx.sdk.calls.length, 0);
    const again = await sendDelivery(ctx.bridge, ctx.project, {
      routeId: "clipboard",
      ide: "windsurf",
      idempotencyKey: "clip-board-1",
      prompt: "Paste this into Cascade.",
      retry: true,
    });
    assert.equal(again.body.id, copied.body.id);
  } finally {
    await ctx.bridge.close();
  }
});

test("images are refused on routes that cannot carry them", async () => {
  const ctx = await boot();
  try {
    const refused = await sendDelivery(ctx.bridge, ctx.project, {
      routeId: "clipboard",
      ide: "vscode",
      idempotencyKey: "no-image-1",
      images: [{ data: PNG, mimeType: "image/png" }],
    });
    assert.equal(refused.status, 400);
    assert.match(refused.body.error, /images/i);
    assert.equal(ctx.clipboard.value, "");
  } finally {
    await ctx.bridge.close();
  }
});

test("sensitive and out-of-project files are not sent", async () => {
  const ctx = await boot();
  const outside = await fs.mkdtemp(path.join(os.tmpdir(), "z-outside-"));
  try {
    await fs.writeFile(path.join(ctx.project, ".env"), "-----BEGIN PRIVATE KEY-----\nabc\n");
    await fs.writeFile(path.join(outside, "secret.txt"), "outside");
    const sensitive = await sendDelivery(ctx.bridge, ctx.project, { files: [".env"], idempotencyKey: "secret-file" });
    assert.equal(sensitive.status, 400);
    assert.match(sensitive.body.error, /not sent/i);
    const escaped = await sendDelivery(ctx.bridge, ctx.project, {
      files: [path.join("..", path.basename(outside), "secret.txt")],
      idempotencyKey: "escaped-file",
    });
    assert.equal(escaped.status, 400);
    assert.equal(ctx.sdk.calls.length, 0);
  } finally {
    await ctx.bridge.close();
  }
});

test("companion delivery places text only for the connected project", async () => {
  const ctx = await boot();
  const other = await fs.mkdtemp(path.join(os.tmpdir(), "z-other-"));
  try {
    const hello = await api(ctx.bridge, "/api/bridge/hello", ctx.bridge.bridgeToken, {
      method: "POST",
      body: JSON.stringify({
        v: 1,
        ide: "vscode",
        appName: "Visual Studio Code",
        extensionVersion: "0.1.0",
        workspaces: [{ path: ctx.project, name: "demo" }],
      }),
    });
    assert.equal(hello.status, 200);
    const session = hello.body.sessionId as string;
    const pending = sendDelivery(ctx.bridge, ctx.project, {
      routeId: "companion",
      ide: "vscode",
      idempotencyKey: "companion-1",
      prompt: "Explain the entry point.",
    });
    const job = await waitForJob(ctx.bridge, session);
    assert.match(job.promptText, /Explain the entry point/);
    assert.equal(path.resolve(job.projectPath), path.resolve(ctx.project));
    assert.equal(chatOpenArgs(job).isPartialQuery, true);
    const posted = await api(ctx.bridge, "/api/bridge/result", ctx.bridge.bridgeToken, {
      method: "POST",
      headers: { "x-z-session": session },
      body: JSON.stringify({
        v: 1,
        id: job.id,
        outcome: "placed",
        detail: "The prompt is in the chat input. The agent has not accepted it.",
      }),
    });
    assert.equal(posted.status, 200);
    const delivery = await pending;
    const placed = await untilStatus(ctx.bridge, delivery.body.id, "awaiting_user_action");
    assert.equal(placed.committed, true);
    assert.equal(ctx.sdk.calls.length, 0);

    const duplicate = await sendDelivery(ctx.bridge, ctx.project, {
      routeId: "companion",
      ide: "vscode",
      idempotencyKey: "companion-1",
      prompt: "Explain the entry point.",
      retry: true,
    });
    assert.equal(duplicate.body.id, delivery.body.id);
    const quiet = await api(ctx.bridge, "/api/bridge/poll", ctx.bridge.bridgeToken, {
      headers: { "x-z-session": session },
    });
    assert.equal(quiet.body.job, null);

    const wrong = await sendDelivery(ctx.bridge, other, {
      routeId: "companion",
      ide: "vscode",
      idempotencyKey: "wrong-window",
      prompt: "Do not send this.",
    });
    assert.equal(wrong.status, 409);
  } finally {
    await ctx.bridge.close();
  }
});

test("an unconfirmed or unauthenticated send does nothing", async () => {
  const ctx = await boot();
  try {
    const open = await fetch(`${ctx.bridge.baseUrl}/api/deliveries`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ prompt: "nope" }),
    });
    assert.equal(open.status, 401);
    const unconfirmed = await sendDelivery(ctx.bridge, ctx.project, { confirmDestination: false, idempotencyKey: "needs-confirm" });
    assert.equal(unconfirmed.status, 400);
    assert.equal(ctx.sdk.calls.length, 0);
    const page = await fetch(ctx.bridge.baseUrl);
    const html = await page.text();
    assert.match(html, /Hooxie/);
    const script = await fetch(`${ctx.bridge.baseUrl}/app.js`);
    const js = await script.text();
    assert.match(js, /Awaiting user action/);
    assert.match(js, /Status unavailable/);
  } finally {
    await ctx.bridge.close();
  }
});

test("unsupported IDEs stay labeled and a new adapter can be registered", async () => {
  const ctx = await boot();
  const seen: string[] = [];
  const sample: AgentAdapter = {
    id: "sample-ide",
    ide: "zed",
    priority: 1,
    displayName: "Sample IDE adapter",
    capabilities: {
      programmaticSubmit: true,
      projectTargeting: true,
      textContext: true,
      nativeFileAttachments: false,
      images: false,
      readResponses: false,
      observeWorking: false,
      observeCompletion: false,
      cancel: false,
      mechanism: "official_api",
      stability: "experimental",
    },
    limitations: ["Test adapter only."],
    unsupported: ["Images"],
    async available() {
      return { ok: true };
    },
    prepare(input) {
      return prepareShared(input, `Sample IDE at ${input.projectPath}`);
    },
    async send(prepared) {
      seen.push(prepared.text);
      return {
        committed: true,
        update: {
          status: "delivered",
          phase: "delivered",
          detail: "Sample adapter accepted the handoff.",
          responseVerified: false,
          limitations: ["Test adapter only."],
          unsupported: ["Images"],
        },
      };
    },
  };
  ctx.bridge.registry.register(sample);
  try {
    const state = await api(ctx.bridge, "/api/state");
    const windsurf = state.body.ides.find((ide: { ide: string }) => ide.ide === "windsurf");
    const jetbrains = state.body.ides.find((ide: { ide: string }) => ide.ide === "jetbrains");
    const visualstudio = state.body.ides.find((ide: { ide: string }) => ide.ide === "visualstudio");
    assert.equal(windsurf.capabilities.programmaticSubmit, false);
    assert.equal(jetbrains.capabilities.programmaticSubmit, false);
    assert.equal(visualstudio.capabilities.programmaticSubmit, false);
    const routes = await api(ctx.bridge, `/api/routes?ide=windsurf&projectPath=${encodeURIComponent(ctx.project)}`);
    assert.equal(routes.body.routes.some((route: { id: string }) => route.id === "cursor-sdk"), false);
    const clipboard = routes.body.routes.find((route: { id: string }) => route.id === "clipboard");
    assert.equal(clipboard.available, true);
    assert.equal(clipboard.capabilities.stability, "fallback");
    assert.ok(clipboard.unsupported.length > 0);

    const sent = await sendDelivery(ctx.bridge, ctx.project, {
      ide: "zed",
      routeId: "sample-ide",
      idempotencyKey: "sample-adapter",
      prompt: "Hello sample adapter.",
    });
    const delivered = await untilStatus(ctx.bridge, sent.body.id, "delivered");
    assert.equal(delivered.status, "delivered");
    assert.match(seen[0], /Hello sample adapter/);
    assert.equal(ctx.sdk.calls.length, 0);
  } finally {
    await ctx.bridge.close();
  }
});

test("exit closes through the widget route and leaves the test server running", async () => {
  const ctx = await boot();
  try {
    const result = await api(ctx.bridge, "/api/widget/exit", ctx.bridge.pageToken, { method: "POST", body: "{}" });
    assert.equal(result.status, 200);
    assert.equal(result.body.ok, true);
    const page = await fetch(ctx.bridge.baseUrl);
    const html = await page.text();
    assert.match(html, /id="more-exit"/);
    assert.match(html, /Exit Hooxie/);
    const still = await api(ctx.bridge, "/api/state");
    assert.equal(still.status, 200);
  } finally {
    await ctx.bridge.close();
  }
});

test("opening an IDE uses the selected installation and project", async () => {
  const opened: string[][] = [];
  const ctx = await boot({
    installations: [{ id: "cursor-1", ide: "cursor", label: "Cursor", executable: "C:\\cursor\\Cursor.exe" }],
    opener: (executable, projectPath) => opened.push([executable, projectPath]),
  });
  try {
    const result = await api(ctx.bridge, "/api/open", ctx.bridge.pageToken, {
      method: "POST",
      body: JSON.stringify({ installationId: "cursor-1", projectPath: ctx.project }),
    });
    assert.equal(result.status, 200);
    assert.deepEqual(opened, [["C:\\cursor\\Cursor.exe", ctx.project]]);
    assert.match(result.body.detail, /Confirm the window/);
  } finally {
    await ctx.bridge.close();
  }
});

test("bridge messages reject unexpected fields", () => {
  const hello = validateHello({ v: 1, ide: "vscode", appName: "Visual Studio Code", extensionVersion: "0.1.0", workspaces: [], extra: true });
  assert.equal(hello.ok, false);
  const job = validateJob({ id: "abc123", promptText: "hi", projectPath: "E:\\work\\app", experimentalSubmit: false });
  assert.equal(job.ok, true);
  if (job.ok) assert.equal(chatOpenArgs({ ...job.value, experimentalSubmit: true }).isPartialQuery, false);
});

test("the Cursor connection is open before the prompt is sent", async () => {
  const sdk = createFakeSdk();
  let creates = 0;
  let releaseCreate: () => void = () => undefined;
  const gate = new Promise<void>((resolve) => {
    releaseCreate = resolve;
  });
  const original = sdk.client.createAgent.bind(sdk.client);
  sdk.client.createAgent = async (options) => {
    creates += 1;
    if (creates === 1) await gate;
    return original(options);
  };
  const ctx = await boot({ sdk });
  try {
    const listed = await api(ctx.bridge, `/api/routes?ide=cursor&projectPath=${encodeURIComponent(ctx.project)}`);
    assert.equal(listed.status, 200);
    assert.equal(creates, 1);
    const sent = sendDelivery(ctx.bridge, ctx.project, { idempotencyKey: "warm-connection-1" });
    await new Promise((resolve) => setTimeout(resolve, 50));
    assert.equal(creates, 1);
    assert.equal(sdk.calls.length, 0);
    const delivery = await sent;
    assert.equal(delivery.status, 200);
    assert.equal(delivery.body.status, "agent_working");
    assert.equal(delivery.body.thought, "Opening the Cursor agent.");
    assert.equal(sdk.calls.length, 0);
    releaseCreate();
    await waitFor(() => sdk.calls.length === 1);
    assert.equal(sdk.calls.length, 1);
  } finally {
    releaseCreate();
    await ctx.bridge.close();
  }
});

test("a running prompt keeps the same agent instead of opening a second one", async () => {
  const sdk = createFakeSdk();
  sdk.mode = "hang";
  let creates = 0;
  let releaseNext: () => void = () => undefined;
  const gate = new Promise<void>((resolve) => {
    releaseNext = resolve;
  });
  const original = sdk.client.createAgent.bind(sdk.client);
  sdk.client.createAgent = async (options) => {
    creates += 1;
    if (creates > 1) await gate;
    return original(options);
  };
  const ctx = await boot({ sdk });
  try {
    const listed = await api(ctx.bridge, `/api/routes?ide=cursor&projectPath=${encodeURIComponent(ctx.project)}`);
    assert.equal(listed.status, 200);
    assert.equal(creates, 1);
    const delivery = await sendDelivery(ctx.bridge, ctx.project, { idempotencyKey: "warm-connection-2" });
    assert.equal(delivery.status, 200);
    assert.equal(delivery.body.status, "agent_working");
    assert.equal(creates, 1);
    await api(ctx.bridge, `/api/deliveries/${delivery.body.id}/cancel`, ctx.bridge.pageToken, { method: "POST" });
  } finally {
    releaseNext();
    await ctx.bridge.close();
  }
});

test("a plain prompt is sent as written, and a follow-up stays on the same agent", async () => {
  const sdk = createFakeSdk();
  let creates = 0;
  const original = sdk.client.createAgent.bind(sdk.client);
  sdk.client.createAgent = async (options) => {
    creates += 1;
    return original(options);
  };
  const ctx = await boot({ sdk });
  try {
    const first = await sendDelivery(ctx.bridge, ctx.project, {
      prompt: "Add a hello heading.",
      idempotencyKey: "chat-turn-1",
    });
    await untilStatus(ctx.bridge, first.body.id, "completed");
    const second = await sendDelivery(ctx.bridge, ctx.project, {
      prompt: "Make it bold.",
      idempotencyKey: "chat-turn-2",
    });
    await untilStatus(ctx.bridge, second.body.id, "completed");
    assert.equal(creates, 1);
    assert.equal(ctx.sdk.calls.length, 2);
    assert.equal(ctx.sdk.calls[0].message.text, "Add a hello heading.");
    assert.equal(ctx.sdk.calls[1].message.text, "Make it bold.");

    const reset = await api(ctx.bridge, "/api/conversation/reset", ctx.bridge.pageToken, {
      method: "POST",
      body: JSON.stringify({ projectPath: ctx.project }),
    });
    assert.equal(reset.status, 200);
    const third = await sendDelivery(ctx.bridge, ctx.project, {
      prompt: "Start over.",
      idempotencyKey: "chat-turn-3",
    });
    await untilStatus(ctx.bridge, third.body.id, "completed");
    assert.equal(creates, 2);
    assert.equal(ctx.sdk.calls[2].message.text, "Start over.");
  } finally {
    await ctx.bridge.close();
  }
});

test("a connected IDE receives a prompt on the open connection", async () => {
  const ctx = await boot({ companionTimeoutMs: 2000 });
  try {
    const hello = await api(ctx.bridge, "/api/bridge/hello", ctx.bridge.bridgeToken, {
      method: "POST",
      body: JSON.stringify({
        v: 1,
        ide: "vscode",
        appName: "Visual Studio Code",
        extensionVersion: "0.1.0",
        workspaces: [{ path: ctx.project, name: "demo" }],
      }),
    });
    const session = hello.body.sessionId as string;
    const waiting = api(ctx.bridge, "/api/bridge/poll?wait=2000", ctx.bridge.bridgeToken, {
      headers: { "x-z-session": session },
    });
    await new Promise((resolve) => setTimeout(resolve, 40));
    const started = Date.now();
    const pending = sendDelivery(ctx.bridge, ctx.project, {
      routeId: "companion",
      ide: "vscode",
      idempotencyKey: "fast-bridge-1",
      prompt: "Explain the entry point.",
    });
    const polled = await waiting;
    assert.ok(polled.body.job, "prompt was not delivered on the open connection");
    assert.ok(Date.now() - started < 1000);
    assert.match(polled.body.job.promptText, /Explain the entry point/);
    const posted = await api(ctx.bridge, "/api/bridge/result", ctx.bridge.bridgeToken, {
      method: "POST",
      headers: { "x-z-session": session },
      body: JSON.stringify({
        v: 1,
        id: polled.body.job.id,
        outcome: "placed",
        detail: "The prompt is in the chat input. The agent has not accepted it.",
      }),
    });
    assert.equal(posted.status, 200);
    const delivery = await pending;
    const placed = await untilStatus(ctx.bridge, delivery.body.id, "awaiting_user_action");
    assert.equal(placed.status, "awaiting_user_action");
    const quietStarted = Date.now();
    const quiet = await api(ctx.bridge, "/api/bridge/poll?wait=80", ctx.bridge.bridgeToken, {
      headers: { "x-z-session": session },
    });
    assert.equal(quiet.body.job, null);
    assert.ok(Date.now() - quietStarted >= 70);
  } finally {
    await ctx.bridge.close();
  }
});

async function waitFor(predicate: () => boolean | Promise<boolean>) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    if (await predicate()) return;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  throw new Error("condition was not met");
}

async function untilDetail(bridge: Awaited<ReturnType<typeof boot>>["bridge"], id: string, pattern: RegExp) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const current = await api(bridge, `/api/deliveries/${id}`);
    if (pattern.test(String(current.body.detail || ""))) return current.body;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  const last = await api(bridge, `/api/deliveries/${id}`);
  throw new Error(`detail stayed ${last.body.detail}`);
}

async function waitForJob(bridge: Awaited<ReturnType<typeof boot>>["bridge"], session: string) {
  for (let attempt = 0; attempt < 40; attempt += 1) {
    const polled = await api(bridge, "/api/bridge/poll", bridge.bridgeToken, { headers: { "x-z-session": session } });
    if (polled.body.job) return polled.body.job;
    await new Promise((resolve) => setTimeout(resolve, 25));
  }
  throw new Error("extension did not receive a job");
}
