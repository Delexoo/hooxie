import assert from "node:assert/strict";
import test from "node:test";
import {
  activeGrantCredits,
  creditBalance,
  mergeCredits,
  stripeCreditCents,
  usagePercent,
} from "../src/cursor-usage.ts";

test("included spend over the plan limit is the usage percent", () => {
  assert.equal(usagePercent({ planUsage: { includedSpend: 500, limit: 2000, totalPercentUsed: 10 } }), 25);
  assert.equal(usagePercent({ plan_usage: { included_spend: "2500", limit: "2000" } }), 100);
});

test("a reported percent is used when the plan has no limit", () => {
  assert.equal(usagePercent({ planUsage: { limit: 0, totalPercentUsed: 40.4 } }), 40);
  assert.equal(usagePercent({}), null);
  assert.equal(usagePercent({ planUsage: {} }), null);
});

test("credit grant balance uses remaining over total cents", () => {
  assert.deepEqual(
    creditBalance({ hasCreditGrants: true, totalCents: "2500", usedCents: "2400", expiresAtMs: "1794118467000" }),
    { remainingCents: 100, totalCents: 2500, expiresAtMs: 1794118467000 },
  );
  assert.equal(creditBalance({ hasCreditGrants: false, totalCents: 2500 }), null);
  assert.equal(creditBalance({}), null);
});

test("active grants sum remaining and keep the earliest expiry", () => {
  assert.deepEqual(
    activeGrantCredits({
      activeGrants: [
        { totalCents: "10000", remainingCents: "9972", expiresAtMs: "1794118467000" },
        { totalCents: "500", remainingCents: "100", expiresAtMs: "1794000000000" },
      ],
    }),
    { remainingCents: 10072, totalCents: 10500, expiresAtMs: 1794000000000 },
  );
  assert.equal(activeGrantCredits({ activeGrants: [] }), null);
});

test("stripe prepaid credit is the absolute negative customer balance", () => {
  assert.equal(stripeCreditCents({ customerBalance: -125 }), 125);
  assert.equal(stripeCreditCents({ customerBalance: 0 }), 0);
  assert.equal(stripeCreditCents({ customer_balance: "50" }), 0);
});

test("credits prefer grant balance then active grants and add stripe prepaid", () => {
  assert.deepEqual(
    mergeCredits(
      { remainingCents: 100, totalCents: 2500, expiresAtMs: 10 },
      { remainingCents: 9972, totalCents: 10000, expiresAtMs: 20 },
      200,
    ),
    { remainingCents: 300, totalCents: 2700, expiresAtMs: 10 },
  );
  assert.deepEqual(
    mergeCredits(null, { remainingCents: 9972, totalCents: 10000, expiresAtMs: 20 }, 0),
    { remainingCents: 9972, totalCents: 10000, expiresAtMs: 20 },
  );
  assert.deepEqual(
    mergeCredits(null, null, 500),
    { remainingCents: 500, totalCents: 500, expiresAtMs: null },
  );
  assert.equal(mergeCredits(null, null, 0), null);
});
