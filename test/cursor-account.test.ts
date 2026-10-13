import assert from "node:assert/strict";
import test from "node:test";
import { accountConnected, assertLoginUrl, publicConnectError } from "../src/cursor-account.ts";

test("a stored key or an SDK login counts as connected", () => {
  assert.equal(accountConnected(undefined, false), false);
  assert.equal(accountConnected("   ", false), false);
  assert.equal(accountConnected("cursor-key", false), true);
  assert.equal(accountConnected(undefined, true), true);
});

test("connect errors stay generic", () => {
  assert.match(publicConnectError(new Error("Login was cancelled.")), /canceled/);
  assert.match(publicConnectError(new Error("Login failed or timed out.")), /timed out/);
  assert.match(publicConnectError(new Error("token crsr_secret_value")), /did not finish/);
});

test("only https login pages can be opened", () => {
  assert.equal(assertLoginUrl("https://cursor.com/loginDeepControl?uuid=1"), "https://cursor.com/loginDeepControl?uuid=1");
  assert.throws(() => assertLoginUrl("http://cursor.com/login"), /browser/);
  assert.throws(() => assertLoginUrl("not a url"), /browser/);
});
