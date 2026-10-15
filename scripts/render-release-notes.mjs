import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const log = JSON.parse(fs.readFileSync(path.join(root, "brain", "log.json"), "utf8"));
const repo = String(log.repo || "");
if (!/^[\w.-]+\/[\w.-]+$/.test(repo)) throw new Error("brain/log.json needs a repo owner/name.");

const releases = {
  repo,
  updates: log.updates.map((update) => ({
    version: update.version,
    date: update.date,
    title: update.title,
    tag: `v${update.version}`,
    url: `https://github.com/${repo}/releases/tag/v${update.version}`,
    sections: update.sections,
  })),
};

fs.writeFileSync(path.join(root, "site", "releases.json"), `${JSON.stringify(releases, null, 2)}\n`);

const page = path.join(root, "site", "releases.html");
const html = fs.readFileSync(page, "utf8");
const start = "<!-- brain:notes -->";
const end = "<!-- /brain:notes -->";
if (!html.includes(start) || !html.includes(end)) {
  throw new Error("site/releases.html is missing the brain note markers.");
}
const notes = releases.updates.map(renderUpdate).join("\n");
const next = html.replace(
  new RegExp(`${escapeRegExp(start)}[\\s\\S]*${escapeRegExp(end)}`),
  `${start}\n${notes}\n      ${end}`,
);
fs.writeFileSync(page, next);
console.log(`Release notes rendered for ${releases.updates.map((update) => update.version).join(", ")}.`);

function renderUpdate(update) {
  const heading = `${update.version} · ${formatDate(update.date)}`;
  const sections = update.sections.map((section) => `        <h3>${escapeHtml(section.heading)}</h3>\n${list(section.notes, 8)}`).join("\n");
  return `      <section id="v${escapeHtml(update.version)}">
        <h2>${escapeHtml(heading)}</h2>
        <p><a href="${escapeHtml(update.url)}">GitHub release ${escapeHtml(update.tag)}</a></p>
${sections}
      </section>`;
}

function list(notes, indent) {
  const pad = " ".repeat(indent);
  return `${pad}<ul>\n${notes.map((note) => `${pad}  <li>${escapeHtml(note)}</li>`).join("\n")}\n${pad}</ul>`;
}

function formatDate(iso) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!match) throw new Error(`Bad release date: ${iso}`);
  return new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])))
    .toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
