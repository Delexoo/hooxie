export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed." });
    return;
  }
  try {
    const url = await startCheckout(req);
    res.status(200).json({ url });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Billing could not start.";
    res.status(400).json({ error: message.slice(0, 180) });
  }
}

async function startCheckout(req) {
  const secret = process.env.STRIPE_SECRET_KEY || "";
  const promoCode = process.env.HOOXIE_PROMO_CODE || "";
  const promoId = process.env.STRIPE_PROMO_ID || "";
  if (!secret) throw new Error("Billing is not configured yet.");
  const body = req.body && typeof req.body === "object" ? req.body : {};
  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (email && (email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    throw new Error("Enter a valid email address.");
  }
  const device = typeof body.device === "string" ? body.device.trim() : "";
  if (device && !/^[a-f0-9]{64}$/.test(device)) throw new Error("This computer could not be identified.");
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const proto = req.headers["x-forwarded-proto"] || "https";
  const origin = `${proto}://${host}`;
  const successUrl = returnUrl(body.successUrl, `${origin}/dashboard?billing=success&session_id={CHECKOUT_SESSION_ID}`);
  const cancelUrl = returnUrl(body.cancelUrl, `${origin}/dashboard?billing=cancel`);
  const params = new URLSearchParams();
  params.set("mode", "payment");
  params.set("line_items[0][quantity]", "1");
  params.set("line_items[0][price_data][currency]", "usd");
  params.set("line_items[0][price_data][unit_amount]", "599");
  params.set("line_items[0][price_data][product_data][name]", "Hooxie");
  params.set("line_items[0][price_data][product_data][description]", "One-time license for this computer.");
  params.set("success_url", successUrl);
  params.set("cancel_url", cancelUrl);
  if (email) params.set("customer_email", email);
  if (device) {
    params.set("metadata[device]", device);
    params.set("client_reference_id", device);
  }
  const typed = typeof body.promo === "string" ? body.promo.trim() : "";
  if (typed && promoId && typed.toUpperCase() === promoCode.toUpperCase()) {
    params.set("discounts[0][promotion_code]", promoId);
  } else {
    params.set("allow_promotion_codes", "true");
  }
  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secret}`,
      "content-type": "application/x-www-form-urlencoded",
    },
    body: params,
  });
  const payload = await response.json();
  if (!response.ok || typeof payload.url !== "string") {
    const message = payload.error && payload.error.message ? payload.error.message : "Billing could not start.";
    throw new Error(String(message).slice(0, 180));
  }
  return payload.url;
}

function returnUrl(value, fallback) {
  if (typeof value !== "string") return fallback;
  let url;
  try {
    url = new URL(value.replace("{CHECKOUT_SESSION_ID}", "cs_test_placeholder"));
  } catch {
    return fallback;
  }
  const local = url.protocol === "http:" && url.hostname === "127.0.0.1";
  const site = url.protocol === "https:" && (url.hostname === "hooxie.com" || url.hostname === "www.hooxie.com");
  if ((!local && !site) || url.pathname !== "/dashboard") return fallback;
  return value;
}
