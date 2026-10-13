import assert from "node:assert/strict";
import test from "node:test";

test("@cursor/sdk exposes the official agent entry points", async (t) => {
  let sdk: {
    Agent?: { create?: unknown; prompt?: unknown };
    JsonlLocalAgentStore?: unknown;
    Cursor?: { auth?: { login?: unknown; status?: unknown } };
  };
  try {
    sdk = await import("@cursor/sdk");
  } catch {
    t.skip("@cursor/sdk is not installed");
    return;
  }
  assert.equal(typeof sdk.Agent?.create, "function");
  assert.equal(typeof sdk.Agent?.prompt, "function");
  assert.equal(typeof sdk.JsonlLocalAgentStore, "function");
  assert.equal(typeof sdk.Cursor?.auth?.login, "function");
  assert.equal(typeof sdk.Cursor?.auth?.status, "function");
});
