import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const log = JSON.parse(fs.readFileSync(path.join(root, "brain", "log.json"), "utf8"));
const repo = String(log.repo || "");
if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) throw new Error("brain/log.json needs a repo owner/name.");

let posted = 0;
for (const update of log.updates) {
  const tag = `v${update.version}`;
  if (releaseExists(repo, tag)) continue;
  const notes = update.sections.flatMap((section) => [`## ${section.heading}`, ...section.notes.map((note) => `- ${note}`), ""]).join("\n");
  execFileSync("gh", [
    "release", "create", tag,
    "--repo", repo,
    "--title", `${update.version} · ${update.title}`,
    "--notes", notes.trim(),
  ], { stdio: "inherit" });
  posted += 1;
  console.log(`Posted ${tag}.`);
}
if (posted === 0) console.log("GitHub releases already match the log.");

function releaseExists(repoName, tag) {
  try {
    execFileSync("gh", ["release", "view", tag, "--repo", repoName], { stdio: "ignore" });
    return true;
  } catch {
    return false;
  }
}
