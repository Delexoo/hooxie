import assert from "node:assert/strict";
import test from "node:test";
import { paidCheckoutFromSearch } from "../src/billing.ts";

const device = "a".repeat(64);

test("a completed checkout for this computer is recognized", () => {
  const found = paidCheckoutFromSearch({
    data: [{
      id: "cs_test_paid",
      status: "complete",
      payment_status: "paid",
      client_reference_id: device,
      customer_details: { email: "person@example.com" },
    }],
  }, device);
  assert.deepEqual(found, { sessionId: "cs_test_paid", email: "person@example.com" });
});

test("a payment for another computer is ignored", () => {
  const found = paidCheckoutFromSearch({
    data: [{
      id: "cs_test_other",
      status: "complete",
      payment_status: "paid",
      client_reference_id: "b".repeat(64),
    }],
  }, device);
  assert.equal(found, null);
});

test("an unfinished checkout is ignored", () => {
  const found = paidCheckoutFromSearch({
    data: [{
      id: "cs_test_open",
      status: "open",
      payment_status: "unpaid",
      client_reference_id: device,
    }],
  }, device);
  assert.equal(found, null);
});
