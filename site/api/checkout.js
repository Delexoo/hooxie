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
  const price = process.env.STRIPE_PRICE_ID || "";
  const promoCode = process.env.HOOXIE_PROMO_CODE || "";
  const promoId = process.env.STRIPE_PROMO_ID || "";
  if (!secret || !price) throw new Error("Billing is not configured yet.");
  const body = req.body && typeof req.body === "object" ? req.body : {};
  const email = typeof body.email === "string" ? body.email.trim() : "";
  if (email && (email.length > 200 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))) {
    throw new Error("Enter a valid email address.");
  }
  const host = req.headers["x-forwarded-host"] || req.headers.host;
  const proto = req.headers["x-forwarded-proto"] || "https";
  const origin = `${proto}://${host}`;
  const params = new URLSearchParams();
  params.set("mode", "subscription");
  params.set("line_items[0][price]", price);
  params.set("line_items[0][quantity]", "1");
  params.set("success_url", `${origin}/dashboard?billing=success&session_id={CHECKOUT_SESSION_ID}`);
  params.set("cancel_url", `${origin}/dashboard?billing=cancel`);
  if (email) params.set("customer_email", email);
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
