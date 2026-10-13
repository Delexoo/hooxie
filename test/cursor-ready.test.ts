import assert from "node:assert/strict";
import test from "node:test";
import { assessCursor } from "../src/cursor-ready.ts";

test("a missing Cursor install is not ready", () => {
  const report = assessCursor({ installed: false, signedIn: false, membership: "", subscriptionStatus: "" });
  assert.equal(report.ready, false);
  assert.equal(report.installed, false);
  assert.equal(report.steps.map((step) => step.done).join(","), "false,false,false");
  assert.equal(report.steps[0].href, "https://cursor.com/download");
});

test("an installed app that is not signed in is not ready", () => {
  const report = assessCursor({ installed: true, signedIn: false, membership: "", subscriptionStatus: "" });
  assert.equal(report.ready, false);
  assert.equal(report.steps[0].done, true);
  assert.equal(report.steps[1].done, false);
  assert.equal(report.steps[2].done, false);
});

test("a signed-in Hobby plan is an available plan", () => {
  const report = assessCursor({ installed: true, signedIn: true, membership: "free", subscriptionStatus: "" });
  assert.equal(report.ready, true);
  assert.equal(report.plan, "Hobby");
  assert.equal(report.planActive, true);
});

test("an active Pro plan is ready", () => {
  const report = assessCursor({ installed: true, signedIn: true, membership: "pro", subscriptionStatus: "active" });
  assert.equal(report.ready, true);
  assert.equal(report.plan, "Pro");
});

test("a canceled Pro plan is not available", () => {
  const report = assessCursor({ installed: true, signedIn: true, membership: "pro", subscriptionStatus: "canceled" });
  assert.equal(report.ready, false);
  assert.equal(report.planActive, false);
  assert.equal(report.steps[2].done, false);
  assert.match(report.steps[2].detail, /not active/);
});

test("a past-due plan is not available", () => {
  const report = assessCursor({ installed: true, signedIn: true, membership: "business", subscriptionStatus: "past_due" });
  assert.equal(report.ready, false);
  assert.equal(report.plan, "Business");
  assert.equal(report.planActive, false);
});
