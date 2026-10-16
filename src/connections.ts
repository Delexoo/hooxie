export type ConnectionStatus = "online" | "offline" | "problem" | "not-connected";

const STATUS_PAGES: Record<string, string> = {
  resend: "https://resend-status.com/api/v2/status.json",
  stripe: "https://status.stripe.com/api/v2/status.json",
  openai: "https://status.openai.com/api/v2/status.json",
  anthropic: "https://status.anthropic.com/api/v2/status.json",
  discord: "https://discordstatus.com/api/v2/status.json",
  notion: "https://status.notion.so/api/v2/status.json",
  npm: "https://status.npmjs.org/api/v2/status.json",
  sentry: "https://status.sentry.io/api/v2/status.json",
  slack: "https://status.slack.com/api/v2/status.json",
  datadog: "https://status.datadoghq.com/api/v2/status.json",
  twilio: "https://status.twilio.com/api/v2/status.json",
  sendgrid: "https://status.sendgrid.com/api/v2/status.json",
  huggingface: "https://status.huggingface.co/api/v2/status.json",
  clerk: "https://status.clerk.com/api/v2/status.json",
  linear: "https://linearstatus.com/api/v2/status.json",
  postmark: "https://status.postmarkapp.com/api/v2/status.json",
  mongodb: "https://status.mongodb.com/api/v2/status.json",
  figma: "https://status.figma.com/api/v2/status.json",
  docker: "https://www.dockerstatus.com/api/v2/status.json",
  planetscale: "https://www.planetscalestatus.com/api/v2/status.json",
  pinecone: "https://status.pinecone.io/api/v2/status.json",
  upstash: "https://status.upstash.com/api/v2/status.json",
  replicate: "https://status.replicate.com/api/v2/status.json",
  neon: "https://neonstatus.com/api/v2/status.json",
  render: "https://status.render.com/api/v2/status.json",
  firebase: "https://status.firebase.google.com/api/v2/status.json",
  auth0: "https://status.auth0.com/api/v2/status.json",
  aws: "https://health.aws.amazon.com/health/status",
  azure: "https://status.azure.com/en-us/status/feed/",
  google: "https://status.cloud.google.com/incidents.json",
};

type UrlCheck = { kind: "url"; suffix: string; path: string; name: string };
type ConnectionCheck = { kind: "github" } | { kind: "gitlab" } | { kind: "bitbucket" } | { kind: "host" } | { kind: "status" } | UrlCheck;

export const CONNECTION_CHECKS: Record<string, ConnectionCheck> = {
  github: { kind: "github" },
  gitlab: { kind: "gitlab" },
  bitbucket: { kind: "bitbucket" },
  supabase: { kind: "url", suffix: "supabase.co", path: "/auth/v1/health", name: "Supabase" },
  vercel: { kind: "url", suffix: "", path: "", name: "The Vercel site" },
  netlify: { kind: "url", suffix: "", path: "", name: "The Netlify site" },
  cloudflare: { kind: "host" },
  railway: { kind: "url", suffix: "", path: "", name: "The Railway site" },
  render: { kind: "status" },
  fly: { kind: "url", suffix: "", path: "", name: "The Fly site" },
  neon: { kind: "status" },
  planetscale: { kind: "status" },
  mongodb: { kind: "status" },
  firebase: { kind: "status" },
  clerk: { kind: "status" },
  auth0: { kind: "status" },
  resend: { kind: "status" },
  stripe: { kind: "status" },
  openai: { kind: "status" },
  anthropic: { kind: "status" },
  google: { kind: "status" },
  azure: { kind: "status" },
  aws: { kind: "status" },
  twilio: { kind: "status" },
  sendgrid: { kind: "status" },
  postmark: { kind: "status" },
  sentry: { kind: "status" },
  datadog: { kind: "status" },
  linear: { kind: "status" },
  notion: { kind: "status" },
  slack: { kind: "status" },
  discord: { kind: "status" },
  figma: { kind: "status" },
  shopify: { kind: "host" },
  huggingface: { kind: "status" },
  replicate: { kind: "status" },
  pinecone: { kind: "status" },
  upstash: { kind: "status" },
  docker: { kind: "status" },
  npm: { kind: "status" },
};

export const CONNECTION_IDS = Object.keys(CONNECTION_CHECKS);

export async function checkConnection(service: string, ref: string): Promise<{ status: ConnectionStatus; detail: string }> {
  const check = CONNECTION_CHECKS[service];
  const value = ref.trim();
  if (!check) return { status: "problem", detail: "That service is not supported." };
  if (!value) return { status: "not-connected", detail: "Not connected." };
  try {
    if (check.kind === "github") return await checkGithub(value);
    if (check.kind === "gitlab") return await checkProject(value, `https://gitlab.com/api/v4/projects/${encodeURIComponent(value)}`, "GitLab");
    if (check.kind === "bitbucket") return await checkProject(value, `https://api.bitbucket.org/2.0/repositories/${value}`, "Bitbucket");
    if (check.kind === "host") return await checkHost(value);
    if (check.kind === "status") return await checkStatus(service);
    return await checkUrl(value, check.suffix, check.path, check.name);
  } catch {
    return { status: "offline", detail: "Could not reach it." };
  }
}

async function checkGithub(ref: string): Promise<{ status: ConnectionStatus; detail: string }> {
  if (!/^[\w.-]+\/[\w.-]+$/.test(ref)) return { status: "problem", detail: "Use owner/repo." };
  return checkProject(ref, `https://api.github.com/repos/${ref}`, "GitHub");
}

async function checkProject(ref: string, endpoint: string, name: string): Promise<{ status: ConnectionStatus; detail: string }> {
  if (!/^[\w.-]+(?:\/[\w.-]+){1,4}$/.test(ref)) return { status: "problem", detail: "Use owner/repo." };
  const response = await fetch(endpoint, {
    headers: { accept: "application/json", "user-agent": "hooxie" },
    signal: AbortSignal.timeout(5000),
  });
  if (response.status === 404) return { status: "problem", detail: "That repository was not found." };
  if (!response.ok) return { status: "offline", detail: `${name} did not answer.` };
  return { status: "online", detail: "The repository is reachable." };
}

async function checkHost(ref: string): Promise<{ status: ConnectionStatus; detail: string }> {
  const host = ref.replace(/^https?:\/\//, "").split("/")[0]?.trim() ?? "";
  if (!/^[a-z0-9.-]+\.[a-z]{2,}$/i.test(host)) return { status: "problem", detail: "Use a public hostname." };
  return checkUrl(`https://${host}`, "", "", "The site");
}

async function checkUrl(ref: string, hostSuffix: string, path: string, name: string): Promise<{ status: ConnectionStatus; detail: string }> {
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

async function checkStatus(service: string): Promise<{ status: ConnectionStatus; detail: string }> {
  const page = STATUS_PAGES[service];
  if (!page) return { status: "problem", detail: "That service is not supported." };
  const response = await fetch(page, { signal: AbortSignal.timeout(5000) });
  if (!response.ok) return { status: "offline", detail: "The status page did not answer." };
  const body = await response.json().catch(() => null) as { status?: { indicator?: string; description?: string } } | null;
  if (!body?.status) return { status: "online", detail: "The status page answered." };
  const indicator = body.status.indicator || "";
  const description = body.status?.description || "Status received.";
  if (indicator === "minor" || indicator === "major" || indicator === "critical") return { status: "problem", detail: description };
  return { status: "online", detail: description };
}

function publicUrl(value: string): URL | null {
  let url: URL;
  try { url = new URL(value); } catch { return null; }
  if (url.protocol !== "https:") return null;
  const host = url.hostname.toLowerCase();
  if (host === "localhost" || host.endsWith(".local") || host.endsWith(".internal")) return null;
  if (/^(127\.|10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.|0\.|169\.254\.)/.test(host)) return null;
  return url;
}
