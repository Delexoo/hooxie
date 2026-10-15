import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const log = JSON.parse(fs.readFileSync(path.join(root, "brain", "log.json"), "utf8"));
const repo = String(log.repo || "");
if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) throw new Error("brain/log.json needs a repo owner/name.");
const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN || "";
if (!token) throw new Error("Set GH_TOKEN before posting release notes.");

let posted = 0;
for (const update of log.updates) {
  const tag = `v${update.version}`;
  if (await releaseExists(tag)) continue;
  const notes = update.sections.flatMap((section) => [`## ${section.heading}`, ...section.notes.map((note) => `- ${note}`), ""]).join("\n");
  const response = await fetch(`https://api.github.com/repos/${repo}/releases`, {
    method: "POST",
    headers: githubHeaders(),
    body: JSON.stringify({
      tag_name: tag,
      target_commitish: update.target || "main",
      name: `${update.version} · ${update.title}`,
      body: notes.trim(),
    }),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Could not post ${tag}: ${response.status} ${detail.slice(0, 300)}`);
  }
  posted += 1;
  console.log(`Posted ${tag}.`);
}
if (posted === 0) console.log("GitHub releases already match the log.");

async function releaseExists(tag) {
  const response = await fetch(`https://api.github.com/repos/${repo}/releases/tags/${encodeURIComponent(tag)}`, {
    headers: githubHeaders(),
  });
  if (response.status === 404) return false;
  if (!response.ok) throw new Error(`Could not check ${tag}: ${response.status}`);
  return true;
}

function githubHeaders() {
  return {
    authorization: `Bearer ${token}`,
    accept: "application/vnd.github+json",
    "user-agent": "hooxie-release-notes",
  };
}
