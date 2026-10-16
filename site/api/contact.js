import { rejectLimited, tooMany } from "./limit.js";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed." });
    return;
  }
  if (tooMany(req, "contact")) {
    rejectLimited(res);
    return;
  }
  const body = req.body && typeof req.body === "object" ? req.body : {};
  const fields = {};
  const name = clean(body.name, 80);
  const email = clean(body.email, 200);
  const message = clean(body.message, 2000);
  if (!name) fields.name = "Enter your name.";
  else if (String(body.name).trim().length > 80) fields.name = "Use 80 characters or fewer for your name.";
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) fields.email = "Enter a valid email address.";
  else if (String(body.email).trim().length > 200) fields.email = "Use 200 characters or fewer for your email.";
  if (!message) fields.message = "Write a short message.";
  else if (String(body.message).trim().length > 2000) fields.message = "Use 2000 characters or fewer.";
  if (Object.keys(fields).length) {
    res.status(400).json({ error: "Check the highlighted fields.", fields });
    return;
  }
  res.status(200).json({ ok: true });
}

function clean(value, max) {
  if (typeof value !== "string") return "";
  return value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "").trim().slice(0, max);
}
