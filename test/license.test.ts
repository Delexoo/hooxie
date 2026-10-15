import assert from "node:assert/strict";
import test from "node:test";
import { licenseMatches, signLicense } from "../src/license.ts";

test("a license only matches the device it was signed for", () => {
  const sig = signLicense("secret", "device-a", "cs_test_device", "owner@example.com");
  const record = { v: 1 as const, device: "device-a", sessionId: "cs_test_device", email: "owner@example.com", sig };
  assert.equal(licenseMatches("secret", "device-a", record), true);
  assert.equal(licenseMatches("secret", "device-b", record), false);
  assert.equal(licenseMatches("other-secret", "device-a", record), false);
  assert.equal(licenseMatches("secret", "device-a", { ...record, sig: sig.replace(/^./, "0") }), false);
});
