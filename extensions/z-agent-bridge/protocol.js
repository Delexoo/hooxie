/**
 * Shared message schema for the loopback channel between Z and the companion extension.
 * Both sides import this file. Unknown fields are rejected.
 */

export const BRIDGE_VERSION = 1;

export const LIMITS = {
  promptText: 120_000,
  pathLength: 1024,
  nameLength: 260,
  workspaces: 20,
  detail: 2_000,
  appName: 120,
  extensionVersion: 40,
};

const HELLO_KEYS = new Set(["v", "ide", "appName", "extensionVersion", "workspaces"]);
const WORKSPACE_KEYS = new Set(["path", "name"]);
const RESULT_KEYS = new Set(["v", "id", "outcome", "detail"]);
const JOB_KEYS = new Set(["id", "promptText", "projectPath", "experimentalSubmit"]);

const IDES = new Set(["cursor", "vscode", "windsurf", "jetbrains", "visualstudio", "zed", "unknown"]);
const OUTCOMES = new Set(["placed", "submit_attempted", "failed"]);

export function validateHello(input) {
  const obj = plain(input, HELLO_KEYS, "hello");
  if (!obj.ok) return obj;
  const body = obj.value;
  if (body.v !== BRIDGE_VERSION) return fail("Unsupported bridge version.");
  if (!IDES.has(body.ide)) return fail("Unknown IDE id.");
  if (!shortString(body.appName, LIMITS.appName)) return fail("Invalid appName.");
  if (!shortString(body.extensionVersion, LIMITS.extensionVersion)) return fail("Invalid extensionVersion.");
  if (!Array.isArray(body.workspaces) || body.workspaces.length > LIMITS.workspaces) {
    return fail("Invalid workspaces.");
  }
  const workspaces = [];
  for (const entry of body.workspaces) {
    const ws = plain(entry, WORKSPACE_KEYS, "workspace");
    if (!ws.ok) return ws;
    if (!absolutePath(ws.value.path)) return fail("Workspace path must be absolute.");
    if (!shortString(ws.value.name, LIMITS.nameLength)) return fail("Invalid workspace name.");
    workspaces.push({ path: ws.value.path, name: ws.value.name });
  }
  return ok({
    v: BRIDGE_VERSION,
    ide: body.ide,
    appName: body.appName,
    extensionVersion: body.extensionVersion,
    workspaces,
  });
}

export function chatOpenArgs(job) {
  return {
    query: job.promptText,
    isPartialQuery: job.experimentalSubmit !== true,
  };
}

export function validateJob(input) {
  const obj = plain(input, JOB_KEYS, "job");
  if (!obj.ok) return obj;
  const body = obj.value;
  if (!/^[A-Za-z0-9_-]{4,80}$/.test(body.id)) return fail("Invalid job id.");
  if (typeof body.promptText !== "string" || body.promptText.length === 0 || body.promptText.length > LIMITS.promptText) {
    return fail("Invalid prompt.");
  }
  if (!absolutePath(body.projectPath)) return fail("Invalid project path.");
  if (typeof body.experimentalSubmit !== "boolean") return fail("Invalid submit flag.");
  return ok({
    id: body.id,
    promptText: body.promptText,
    projectPath: body.projectPath,
    experimentalSubmit: body.experimentalSubmit,
  });
}

export function validateResult(input) {
  const obj = plain(input, RESULT_KEYS, "result");
  if (!obj.ok) return obj;
  const body = obj.value;
  if (body.v !== BRIDGE_VERSION) return fail("Unsupported bridge version.");
  if (!shortString(body.id, 80) || !/^[A-Za-z0-9_-]+$/.test(body.id)) return fail("Invalid job id.");
  if (!OUTCOMES.has(body.outcome)) return fail("Invalid outcome.");
  if (!shortString(body.detail, LIMITS.detail)) return fail("Invalid detail.");
  return ok({
    v: BRIDGE_VERSION,
    id: body.id,
    outcome: body.outcome,
    detail: body.detail,
  });
}

function plain(input, allowed, label) {
  if (input === null || typeof input !== "object" || Array.isArray(input)) {
    return fail(`${label} must be an object.`);
  }
  const keys = Object.keys(input);
  for (const key of keys) {
    if (!allowed.has(key)) return fail(`${label} has an unexpected field.`);
  }
  for (const key of allowed) {
    if (!Object.prototype.hasOwnProperty.call(input, key)) {
      return fail(`${label} is missing ${key}.`);
    }
  }
  return ok(input);
}

function absolutePath(value) {
  if (typeof value !== "string" || value.length === 0 || value.length > LIMITS.pathLength) return false;
  if (value.includes("\0")) return false;
  return /^[A-Za-z]:[\\/]/.test(value) || value.startsWith("\\\\") || value.startsWith("/");
}

function shortString(value, max) {
  return typeof value === "string" && value.length <= max;
}

function ok(value) {
  return { ok: true, value };
}

function fail(error) {
  return { ok: false, error };
}
