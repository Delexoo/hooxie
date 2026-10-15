import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import * as vscode from "vscode";
import { chatOpenArgs, validateJob } from "./protocol.js";

const CHAT_OPEN = "workbench.action.chat.open";
const POLL_WAIT_MS = 12000;
let sessionId;
let stopped = false;

export async function activate(context) {
  context.subscriptions.push(
    vscode.commands.registerCommand("z-agent-bridge.status", () => {
      const where = sessionId ? `Connected as ${sessionId.slice(0, 8)}.` : "Not connected to Z.";
      void vscode.window.showInformationMessage(`Z Agent Bridge: ${where}`);
    }),
  );
  void pump();
  context.subscriptions.push({ dispose: () => stop() });
}

export function deactivate() {
  stop();
}

function stop() {
  stopped = true;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function pump() {
  while (!stopped) {
    const started = Date.now();
    let outcome = "error";
    try {
      outcome = await connect();
    } catch {
      sessionId = undefined;
      outcome = "error";
    }
    if (stopped) return;
    if (outcome === "job") continue;
    if (outcome === "idle" && Date.now() - started >= 200) continue;
    await delay(400);
  }
}

async function connect() {
  const bridge = await readBridge();
  if (!bridge) return "missing";
  if (!sessionId) sessionId = await hello(bridge);
  const response = await bridgeFetch(bridge, `/api/bridge/poll?wait=${POLL_WAIT_MS}`, { method: "GET" });
  if (response.status === 401) {
    sessionId = undefined;
    return "error";
  }
  if (!response.ok) return "error";
  const body = await response.json();
  if (!body.job) return "idle";
  const outcome = await deliver(body.job);
  await bridgeFetch(bridge, "/api/bridge/result", {
    method: "POST",
    body: JSON.stringify({ v: 1, ...outcome }),
  });
  return "job";
}

async function hello(bridge) {
  const folders = vscode.workspace.workspaceFolders ?? [];
  const response = await bridgeFetch(bridge, "/api/bridge/hello", {
    method: "POST",
    body: JSON.stringify({
      v: 1,
      ide: detectIde(),
      appName: vscode.env.appName,
      extensionVersion: "0.1.0",
      workspaces: folders.map((folder) => ({
        path: folder.uri.fsPath,
        name: folder.name,
      })),
    }),
  });
  if (!response.ok) throw new Error("hello failed");
  const body = await response.json();
  if (!body.sessionId || typeof body.sessionId !== "string") throw new Error("missing session");
  return body.sessionId;
}

async function deliver(job) {
  const parsed = validateJob(job);
  if (!parsed.ok) {
    const id = job && typeof job.id === "string" ? job.id : "invalid";
    return { id, outcome: "failed", detail: parsed.error };
  }
  const folders = vscode.workspace.workspaceFolders ?? [];
  const openHere = folders.some((folder) => samePath(folder.uri.fsPath, parsed.value.projectPath));
  if (!openHere) {
    return {
      id: parsed.value.id,
      outcome: "failed",
      detail: "This IDE window is not open on the selected project. The prompt was not placed.",
    };
  }
  const commands = await vscode.commands.getCommands(true);
  if (!commands.includes(CHAT_OPEN)) {
    return {
      id: parsed.value.id,
      outcome: "failed",
      detail: "This IDE does not expose workbench.action.chat.open. The prompt was not placed.",
    };
  }
  try {
    const args = chatOpenArgs(parsed.value);
    if (parsed.value.experimentalSubmit) {
      await vscode.commands.executeCommand(CHAT_OPEN, args);
      return {
        id: parsed.value.id,
        outcome: "submit_attempted",
        detail:
          "Z asked the IDE to submit through an internal chat command. That command is not a stable public API, and Z cannot see whether the agent accepted the prompt.",
      };
    }
    await vscode.commands.executeCommand(CHAT_OPEN, args);
    return {
      id: parsed.value.id,
      outcome: "placed",
      detail:
        "The prompt is in the chat input. The agent has not accepted it. Review the project window, then submit it in the IDE.",
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "The chat command failed.";
    return {
      id: parsed.value.id,
      outcome: "failed",
      detail: `The prompt was not placed. ${message}`,
    };
  }
}

function detectIde() {
  const name = (vscode.env.appName || "").toLowerCase();
  if (name.includes("cursor")) return "cursor";
  if (name.includes("windsurf")) return "windsurf";
  if (name.includes("visual studio code")) return "vscode";
  return "unknown";
}

function samePath(left, right) {
  const a = path.resolve(left);
  const b = path.resolve(right);
  return process.platform === "win32" ? a.toLowerCase() === b.toLowerCase() : a === b;
}

async function readBridge() {
  try {
    const file = path.join(process.env.APPDATA || path.join(os.homedir(), ".config"), "Z", "bridge.json");
    const parsed = JSON.parse(await fs.readFile(file, "utf8"));
    if (parsed.v !== 1 || parsed.host !== "127.0.0.1") return undefined;
    if (!Number.isInteger(parsed.port) || typeof parsed.token !== "string") return undefined;
    return parsed;
  } catch {
    return undefined;
  }
}

function bridgeFetch(bridge, pathname, init) {
  return fetch(`http://127.0.0.1:${bridge.port}${pathname}`, {
    ...init,
    headers: {
      authorization: `Bearer ${bridge.token}`,
      "content-type": "application/json",
      "x-z-session": sessionId ?? "",
    },
  });
}
