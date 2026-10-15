import assert from "node:assert/strict";
import test from "node:test";
import {
  activeGrantCredits,
  creditBalance,
  mergeCredits,
  stripeCreditCents,
  usageDetails,
  usagePercent,
} from "../src/cursor-usage.ts";

test("the account percent is the included usage Cursor reports", () => {
  assert.equal(usagePercent({ planUsage: { includedSpend: 2000, limit: 2000, totalPercentUsed: 12.4, bonusSpend: 4142 } }), 12);
  assert.equal(usagePercent({ planUsage: { includedSpend: 500, limit: 2000, totalPercentUsed: 10 } }), 10);
  assert.equal(usagePercent({ individualUsage: { plan: { used: 2000, limit: 2000, totalPercentUsed: 37.2 } } }), 37);
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

test("usage details include plan, included spend, auto and api, bonus, and reset", () => {
  assert.deepEqual(
    usageDetails(
      {
        billingCycleEnd: "1794529706000",
        planUsage: {
          includedSpend: 2000,
          limit: 2000,
          bonusSpend: 16730,
          autoPercentUsed: 41.62,
          apiPercentUsed: 0,
          totalPercentUsed: 37.8,
        },
      },
      { planInfo: { planName: "Pro", price: "$20/mo", billingCycleEnd: "1" } },
      { membershipType: "ultra" },
    ),
    {
      planName: "Pro",
      price: "$20/mo",
      includedCents: 2000,
      limitCents: 2000,
      bonusCents: 16730,
      autoPercent: 42,
      apiPercent: 0,
      resetsAtMs: 1794529706000,
    },
  );
});

test("usage details fall back to the stripe plan and hide empty spend", () => {
  assert.deepEqual(
    usageDetails(
      { planUsage: { limit: 0, bonusSpend: 0 } },
      { planInfo: { planName: "  ", price: "free" } },
      { individualMembershipType: "pro_plus" },
    ),
    {
      planName: "Pro+",
      price: null,
      includedCents: null,
      limitCents: null,
      bonusCents: null,
      autoPercent: null,
      apiPercent: null,
      resetsAtMs: null,
    },
  );
  assert.equal(usageDetails({}, {}, {}).planName, null);
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
