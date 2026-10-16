const buckets = new Map();
const WINDOW_MS = 60_000;
const MAX = 8;

export function tooMany(req, route) {
  const forwarded = req.headers["x-forwarded-for"];
  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  const ip = String(raw || "unknown").split(",")[0].trim() || "unknown";
  const key = `${route}:${ip}`;
  const now = Date.now();
  const hits = (buckets.get(key) || []).filter((time) => now - time < WINDOW_MS);
  if (hits.length >= MAX) {
    buckets.set(key, hits);
    return true;
  }
  hits.push(now);
  buckets.set(key, hits);
  return false;
}

export function rejectLimited(res) {
  res.setHeader("retry-after", "60");
  res.status(429).json({ error: "Too many attempts. Try again in a minute." });
}
