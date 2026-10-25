// Atom feed of recently-touched written topics, so a reader (or a crawler) can follow new and updated
// content without checking back manually. "Recently touched" comes from one batched `git log` walk over
// the vault (not one spawn per topic — 624 topics would make that slow) that records each note's most
// recent commit date; the newest 30 written topics by that date become the feed's entries, linking to the
// real static page for each (scripts/build-static.mjs). Run: `npm run content` (runs this automatically
// after build-static.mjs) or `node scripts/build-feed.mjs` alone once content.json exists.
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { execFileSync } from "node:child_process";

const SITE = join(dirname(fileURLToPath(import.meta.url)), "..");
const VAULT = join(SITE, "..");
const SITE_URL = "https://ai.saranmahadev.in";
const MAX_ENTRIES = 30;

if (!existsSync(join(SITE, "content.json"))) { console.error("Run `node scripts/build-content.mjs` first."); process.exit(1); }
const content = JSON.parse(readFileSync(join(SITE, "content.json"), "utf8"));
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function lastTouchedDates() {
  const out = execFileSync("git", ["-C", VAULT, "log", "--name-only", "--format=COMMIT|%aI"], { encoding: "utf8", maxBuffer: 1024 * 1024 * 64 });
  const dates = new Map();
  let current = null;
  for (const line of out.split("\n")) {
    if (line.startsWith("COMMIT|")) { current = line.slice(7); continue; }
    const path = line.trim();
    if (!path || dates.has(path)) continue; // first time seen, walking newest-first, is the most recent touch
    dates.set(path, current);
  }
  return dates;
}

const dates = lastTouchedDates();
const fallback = content.generated || new Date().toISOString();
const entries = Object.values(content.topics)
  .filter((t) => t.status === "written")
  .map((t) => ({ id: t.id, title: t.title, summary: t.summary, updated: dates.get(t.path) || fallback }))
  .sort((a, b) => b.updated.localeCompare(a.updated))
  .slice(0, MAX_ENTRIES);

const feedUpdated = entries[0]?.updated || fallback;

const entryXml = entries.map((t) => {
  const url = `${SITE_URL}/${t.id}/`;
  return `  <entry>
    <title>${esc(t.title)}</title>
    <link href="${url}"/>
    <id>${url}</id>
    <updated>${t.updated}</updated>
    <summary>${esc(t.summary || t.title)}</summary>
  </entry>`;
}).join("\n");

writeFileSync(join(SITE, "feed.xml"), `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>AI Base: recently added topics</title>
  <subtitle>A free, structured knowledge base for learning AI.</subtitle>
  <link href="${SITE_URL}/feed.xml" rel="self"/>
  <link href="${SITE_URL}/"/>
  <id>${SITE_URL}/</id>
  <updated>${feedUpdated}</updated>
  <generator>AI Base</generator>
${entryXml}
</feed>
`);

console.log(`feed: ${entries.length} entries, most recent ${feedUpdated.slice(0, 10)}`);
