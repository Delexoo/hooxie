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
  successUrl: string;
  cancelUrl: string;
}): Promise<string> {
  if (!config.secretKey || !config.priceId) {
    throw new DeliveryError(400, "Billing is not configured yet.");
  }
  const params = new URLSearchParams();
  params.set("mode", "subscription");
  params.set("line_items[0][price]", config.priceId);
  params.set("line_items[0][quantity]", "1");
  params.set("success_url", input.successUrl);
  params.set("cancel_url", input.cancelUrl);
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

export async function checkoutIsComplete(secretKey: string, sessionId: string): Promise<{ active: boolean; email: string }> {
  if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) throw new DeliveryError(400, "Unknown checkout.");
  const payload = await stripeForm(secretKey, "GET", `/v1/checkout/sessions/${sessionId}`, new URLSearchParams());
  const email = typeof payload.customer_email === "string" ? payload.customer_email : "";
  const status = payload.status;
  const payment = payload.payment_status;
  const active = status === "complete" && (payment === "paid" || payment === "no_payment_required");
  return { active, email };
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
