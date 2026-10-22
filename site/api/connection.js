const STATUS_PAGES = {
  resend: "https://resend-status.com/api/v2/status.json",
  stripe: "https://status.stripe.com/api/v2/status.json",
  openai: "https://status.openai.com/api/v2/status.json",
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed." });
    return;
  }
  const body = req.body && typeof req.body === "object" ? req.body : {};
  const service = typeof body.service === "string" ? body.service : "";
  const ref = typeof body.ref === "string" ? body.ref.slice(0, 200) : "";
  res.status(200).json(await checkConnection(service, ref));
}

async function checkConnection(service, ref) {
  const value = ref.trim();
  if (!value) return { status: "not-connected", detail: "Not connected." };
  if (value === "linked" && !STATUS_PAGES[service]) return { status: "online", detail: "Connected." };
  try {
    if (service === "github") return await checkGithub(value);
    if (service === "supabase") return await checkUrl(value, "supabase.co", "/auth/v1/health", "Supabase");
    if (service === "vercel") return await checkUrl(value, "", "", "The Vercel site");
    if (service === "cloudflare") return await checkHost(value);
    if (STATUS_PAGES[service]) return await checkStatus(service);
    return { status: "problem", detail: "That service is not supported." };
  } catch {
    return { status: "offline", detail: "Could not reach it." };
  }
}

async function checkGithub(repo) {
  if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) return { status: "problem", detail: "Use owner/repo." };
  const response = await fetch(`https://api.github.com/repos/${repo}`, {
    headers: { accept: "application/vnd.github+json", "user-agent": "hooxie" },
    signal: AbortSignal.timeout(5000),
  });
  if (response.status === 404) return { status: "problem", detail: "That repository was not found." };
  if (!response.ok) return { status: "offline", detail: "GitHub did not answer." };
  return { status: "online", detail: "The repository is reachable." };
}

async function checkHost(ref) {
  const host = ref.replace(/^https?:\/\//, "").split("/")[0].trim();
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(host)) return { status: "problem", detail: "Use a public hostname." };
  return checkUrl(`https://${host}`, "", "", "The site");
}

async function checkUrl(ref, hostSuffix, path, name) {
  const url = publicUrl(ref);
  if (!url) return { status: "problem", detail: "Use a public https address." };
  if (hostSuffix && !url.hostname.endsWith(hostSuffix)) return { status: "problem", detail: `Use a ${hostSuffix} address.` };
  if (path) {
    url.pathname = path;
    url.search = "";
  }
  const response = await fetch(url, { method: path ? "GET" : "HEAD", redirect: "follow", signal: AbortSignal.timeout(5000) });
  if (response.ok || response.status === 401) return { status: "online", detail: `${name} answered.` };
  if (response.status >= 500) return { status: "problem", detail: `${name} reported an error.` };
  return { status: "offline", detail: `${name} did not answer.` };
}

async function checkStatus(service) {
  const response = await fetch(STATUS_PAGES[service], { signal: AbortSignal.timeout(5000) });
  if (!response.ok) return { status: "offline", detail: "The status page did not answer." };
  const body = await response.json();
  const indicator = body.status?.indicator || "";
  const description = body.status?.description || "Status received.";
  if (indicator === "minor" || indicator === "major" || indicator === "critical") return { status: "problem", detail: description };
  return { status: "online", detail: description };
}

function publicUrl(value) {
  let url;
  try { url = new URL(value); } catch { return null; }
  if (url.protocol !== "https:") return null;
  const host = url.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) return null;
  if (/^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.|0\.|169\.254\.)/.test(host)) return null;
  return url;
}
