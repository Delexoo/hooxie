import { DeliveryError } from "./types.ts";

export interface BillingConfig {
  secretKey: string;
  priceId: string;
  promoCode: string;
  promoId: string;
}

export function readDotEnv(text: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq < 1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith("\"") && value.endsWith("\"")) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    out[key] = value;
  }
  return out;
}

export function validEmail(value: string | undefined): string | undefined {
  if (!value) return undefined;
  const email = value.trim();
  if (email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new DeliveryError(400, "Enter a valid email address.");
  }
  return email;
}

export async function createCheckoutSession(config: BillingConfig, input: {
  email?: string;
  promo?: string;
  deviceId: string;
  successUrl: string;
  cancelUrl: string;
}): Promise<string> {
  if (!config.secretKey) {
    throw new DeliveryError(400, "Billing is not configured yet.");
  }
  if (!/^[a-zA-Z0-9_-]{8,128}$/.test(input.deviceId)) {
    throw new DeliveryError(400, "This computer could not be identified.");
  }
  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("line_items[0][quantity]", "1");
  params.set("line_items[0][price_data][currency]", "usd");
  params.set("line_items[0][price_data][unit_amount]", "599");
  params.set("line_items[0][price_data][product_data][name]", "Hooxie");
  params.set("line_items[0][price_data][product_data][description]", "One-time license for this computer.");
  params.set("success_url", input.successUrl);
  params.set("cancel_url", input.cancelUrl);
  params.set("metadata[device]", input.deviceId);
  params.set("client_reference_id", input.deviceId);
  if (input.email) params.set("customer_email", input.email);
  const typed = (input.promo ?? "").trim();
  const usePromo = typed.length > 0 && config.promoId && typed.toUpperCase() === config.promoCode.toUpperCase();
  if (usePromo) params.set("discounts[0][promotion_code]", config.promoId);
  else params.set("allow_promotion_codes", "true");
  const payload = await stripeForm(config.secretKey, "POST", "/v1/checkout/sessions", params);
  const url = payload.url;
  if (typeof url !== "string" || !url.startsWith("https://")) {
    throw new DeliveryError(502, "Billing could not start.");
  }
  return url;
}

export function paidCheckoutFromSearch(payload: unknown, deviceId: string): { sessionId: string; email: string } | null {
  if (!payload || typeof payload !== "object" || !("data" in payload) || !Array.isArray(payload.data)) return null;
  for (const item of payload.data) {
    if (!item || typeof item !== "object") continue;
    const record = item as Record<string, unknown>;
    const reference = typeof record.client_reference_id === "string" ? record.client_reference_id : "";
    const metadata = record.metadata;
    const device = metadata && typeof metadata === "object" && "device" in metadata && typeof metadata.device === "string"
      ? metadata.device
      : "";
    if (reference !== deviceId && device !== deviceId) continue;
    const status = record.status;
    const payment = record.payment_status;
    const paid = status === "complete" && (payment === "paid" || payment === "no_payment_required");
    const sessionId = typeof record.id === "string" ? record.id : "";
    if (!paid || !/^cs_[A-Za-z0-9_]+$/.test(sessionId)) continue;
    const details = record.customer_details;
    const detailEmail = details && typeof details === "object" && "email" in details && typeof details.email === "string" ? details.email : "";
    const email = typeof record.customer_email === "string" && record.customer_email ? record.customer_email : detailEmail;
    return { sessionId, email };
  }
  return null;
}

export async function findPaidDeviceCheckout(secretKey: string, deviceId: string): Promise<{ sessionId: string; email: string } | null> {
  if (!secretKey || !/^[a-f0-9]{64}$/.test(deviceId)) return null;
  const params = new URLSearchParams();
  params.set("query", `client_reference_id:'${deviceId}' AND status:'complete'`);
  params.set("limit", "5");
  try {
    const payload = await stripeForm(secretKey, "GET", `/v1/checkout/sessions/search?${params}`, new URLSearchParams());
    return paidCheckoutFromSearch(payload, deviceId);
  } catch {
    return findPaidDeviceInList(secretKey, deviceId);
  }
}

async function findPaidDeviceInList(secretKey: string, deviceId: string): Promise<{ sessionId: string; email: string } | null> {
  let startingAfter = "";
  for (let page = 0; page < 10; page += 1) {
    const params = new URLSearchParams();
    params.set("limit", "100");
    params.set("status", "complete");
    if (startingAfter) params.set("starting_after", startingAfter);
    let payload: Record<string, unknown>;
    try {
      payload = await stripeForm(secretKey, "GET", `/v1/checkout/sessions?${params}`, new URLSearchParams());
    } catch {
      return null;
    }
    const found = paidCheckoutFromSearch(payload, deviceId);
    if (found) return found;
    const rows = Array.isArray(payload.data) ? payload.data : [];
    const last = rows.at(-1);
    const lastId = last && typeof last === "object" && "id" in last && typeof last.id === "string" ? last.id : "";
    if (payload.has_more !== true || !lastId) return null;
    startingAfter = lastId;
  }
  return null;
}

export async function checkoutIsComplete(secretKey: string, sessionId: string): Promise<{ active: boolean; email: string; device: string }> {
  if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) throw new DeliveryError(400, "Unknown checkout.");
  const payload = await stripeForm(secretKey, "GET", `/v1/checkout/sessions/${sessionId}`, new URLSearchParams());
  const email = typeof payload.customer_email === "string" ? payload.customer_email : "";
  const metadata = payload.metadata;
  const device = metadata && typeof metadata === "object" && "device" in metadata && typeof metadata.device === "string"
    ? metadata.device
    : "";
  const status = payload.status;
  const payment = payload.payment_status;
  const active = status === "complete" && (payment === "paid" || payment === "no_payment_required");
  return { active, email, device };
}

async function stripeForm(secretKey: string, method: string, path: string, params: URLSearchParams): Promise<Record<string, unknown>> {
  const response = await fetch(`https://api.stripe.com${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    body: method === "GET" ? undefined : params,
  });
  const payload = await response.json() as Record<string, unknown>;
  if (!response.ok) {
    const error = payload.error;
    const message = error && typeof error === "object" && "message" in error && typeof error.message === "string"
      ? error.message
      : "Billing could not start.";
    throw new DeliveryError(response.status === 400 ? 400 : 502, message.slice(0, 180));
  }
  return payload;
}
