// Turns the Obsidian vault (Markdown notes) into .site/content.json.
// Vault = source of truth. Run: `npm run content` (from .site/). `--check` builds without writing.
import { readFileSync, writeFileSync, readdirSync, statSync } from "node:fs";
import { join, dirname, basename, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";

const SITE = join(dirname(fileURLToPath(import.meta.url)), "..");
const VAULT = join(SITE, "..");
const CHECK = process.argv.includes("--check");
const SKIP_DIRS = new Set([".git", ".obsidian", ".agents", ".github", ".site", "node_modules"]);
const SKIP_FILES = new Set(["AGENTS.md", "CLAUDE.md", "README.md"]);
const warnings = [];
const warn = (m) => warnings.push(m);

const slug = (s) => s.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
const norm = (s) => s.trim().replace(/\s+/g, " ").toLowerCase();
const posix = (p) => p.split(sep).join("/");

// ---- 1. Read every note in the vault
const notes = new Map(); // vault-relative posix path -> note
(function walk(dir) {
  for (const name of readdirSync(dir).sort()) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) { if (!SKIP_DIRS.has(name)) walk(full); continue; }
    if (!name.endsWith(".md") || SKIP_FILES.has(name)) continue;
    const rel = posix(relative(VAULT, full));
    const { meta, body } = parseFrontmatter(readFileSync(full, "utf8"));
    notes.set(rel, { path: rel, title: meta.title || basename(name, ".md"), meta, body, folder: posix(dirname(rel)) });
  }
})(VAULT);

function parseFrontmatter(src) {
  const m = src.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/);
  if (!m) return { meta: {}, body: src };
  const meta = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z_][\w-]*):\s*(.*)$/);
    if (kv) meta[kv[1]] = kv[2].replace(/^["']|["']$/g, "");
  }
  return { meta, body: src.slice(m[0].length) };
}

const byTitle = new Map(); // normalised title -> note
for (const n of notes.values()) {
  const k = norm(basename(n.path, ".md"));
  if (byTitle.has(k)) warn(`Duplicate note title "${n.title}": ${byTitle.get(k).path} and ${n.path}`);
  else byTitle.set(k, n);
}
const noteByPath = (p) => notes.get(p);
const wikiTargets = (body) => [...body.matchAll(/\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|[^\]]*)?\]\]/g)].map((m) => m[1]);

// ---- 2. Planets, districts and topics
const config = JSON.parse(readFileSync(join(SITE, "planets.json"), "utf8"));
const topicIdOf = new Map(); // note path -> topic id
const planets = [];
const assigned = new Set();

function claim(planetId, note) {
  if (assigned.has(note.path)) { warn(`${note.path} is claimed by more than one planet`); return null; }
  assigned.add(note.path);
  const id = `${planetId}/${slug(basename(note.path, ".md"))}`;
  topicIdOf.set(note.path, id);
  return id;
}

for (const cfg of config.planets) {
  const planet = { id: cfg.id, title: cfg.title, color: cfg.color, blurb: cfg.blurb, planned: !!cfg.planned, districts: [] };
  if (cfg.planned) { planets.push(planet); continue; }

  if (cfg.folder) {
    const indexNote = cfg.index && noteByPath(cfg.index);
    if (!indexNote) warn(`Planet ${cfg.id}: index note ${cfg.index} not found`);
    if (indexNote) { planet.index = claim(cfg.id, indexNote); }
    const inFolder = [...notes.values()].filter((n) => n.path.startsWith(cfg.folder + "/"));
    const used = new Set();
    // Districts in the order the index note links to them
    const order = indexNote ? wikiTargets(indexNote.body).map((t) => byTitle.get(norm(t))).filter(Boolean) : [];
    const districtNotes = [...order, ...inFolder.filter((n) => !order.includes(n) && n.folder === cfg.folder)];
    for (const head of districtNotes) {
      if (used.has(head.path) || !inFolder.includes(head)) continue;
      const own = head.folder !== cfg.folder && basename(head.folder) === basename(head.path, ".md");
      const members = own ? inFolder.filter((n) => n.folder === head.folder) : [head];
      const rest = members.filter((n) => n !== head);
      const linked = wikiTargets(head.body).map((t) => byTitle.get(norm(t))).filter((n) => n && rest.includes(n));
      const seq = [head, ...new Set(linked), ...rest.filter((n) => !linked.includes(n)).sort((a, b) => a.title.localeCompare(b.title))];
      seq.forEach((n) => used.add(n.path));
      planet.districts.push({ id: slug(head.title), title: head.title, topics: seq.map((n) => claim(cfg.id, n)).filter(Boolean) });
    }
    for (const n of inFolder) if (!used.has(n.path)) { warn(`${n.path} is not linked from ${cfg.index}; added to "More"`); }
    const stray = inFolder.filter((n) => !used.has(n.path));
    if (stray.length) planet.districts.push({ id: "more", title: "More", topics: stray.map((n) => claim(cfg.id, n)).filter(Boolean) });
  } else {
    const list = (cfg.notes || []).map((p) => noteByPath(p) || warn(`Planet ${cfg.id}: ${p} not found`)).filter(Boolean);
    planet.districts.push({ id: "core", title: cfg.title, topics: list.map((n) => claim(cfg.id, n)).filter(Boolean) });
  }
  planets.push(planet);
}

const galaxyNote = config.galaxy && noteByPath(config.galaxy.note);
if (galaxyNote) topicIdOf.set(galaxyNote.path, "ai");
for (const n of notes.values()) if (!assigned.has(n.path) && n !== galaxyNote) warn(`${n.path} is not assigned to any planet (edit .site/planets.json)`);

// ---- 3. Render Markdown (wiki links, callouts, headings with ids)
const planetByTitle = new Map(planets.map((p) => [norm(p.title), p]));
const escapeHtml = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function resolveWikilinks(md, links) {
  return md.split(/(```[\s\S]*?```|`[^`\n]*`)/).map((seg, i) => {
    if (i % 2) return seg; // code
    return seg
      .replace(/!\[\[[^\]]*\]\]/g, "") // embeds are not supported yet
      .replace(/\[\[([^\]|#]+)(?:#[^\]|]*)?(?:\|([^\]]*))?\]\]/g, (_, target, alias) => {
        const label = escapeHtml((alias || target).trim());
        const note = byTitle.get(norm(target));
        const id = note && topicIdOf.get(note.path);
        if (id) { links.add(id); return `<a class="wikilink" href="#/${id}" data-topic="${id}">${label}</a>`; }
        const planet = planetByTitle.get(norm(target));
        if (planet) return `<a class="wikilink planet" href="#/${planet.id}" data-planet="${planet.id}">${label}</a>`;
        warn(`Unresolved link [[${target.trim()}]]`);
        return `<span class="wikilink missing" title="Not written yet">${label}</span>`;
      });
  }).join("");
}

function render(note) {
  const links = new Set();
  const toc = [];
  const md = resolveWikilinks(note.body, links);
  marked.use({
    gfm: true,
    renderer: {
      heading({ tokens, depth }) {
        const html = this.parser.parseInline(tokens);
        const text = html.replace(/<[^>]+>/g, "");
        const id = slug(text) || `h${toc.length}`;
        if (depth >= 2 && depth <= 3) toc.push({ id, text, depth });
        return `<h${depth} id="${id}">${html}</h${depth}>\n`;
      }
    }
  });
  let html = marked.parse(md, { async: false });
  html = html.replace(/<blockquote>\s*<p>\[!(\w+)\]\s*([^\n<]*)/g, (_, type, title) =>
    `<blockquote class="callout callout-${type.toLowerCase()}"><p><strong>${title.trim() || type}</strong>`);
  return { html, toc, links };
}

const isIndexOnly = (body) => body.split(/\r?\n/).every((l) => !l.trim() || /^\s*[-*]\s*\[\[[^\]]+\]\]\s*$/.test(l));
const plain = (html) => html.replace(/<[^>]+>/g, "").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();

const topics = {};
const planetOf = (id) => id.split("/")[0];
for (const [path, id] of topicIdOf) {
  const note = notes.get(path);
  const { html, toc, links } = render(note);
  const words = plain(html).split(" ").filter(Boolean).length;
  const firstP = (html.match(/<p>([\s\S]*?)<\/p>/) || [])[1] || "";
  let summary = note.meta.summary || plain(firstP);
  if (summary.length > 200) summary = summary.slice(0, 197).trimEnd() + "…";
  const district = planets.flatMap((p) => p.districts.map((d) => ({ p, d }))).find(({ d }) => d.topics.includes(id));
  topics[id] = {
    id, title: note.title, planet: id === "ai" ? null : planetOf(id), district: district ? district.d.id : null,
    path, summary, words, toc,
    status: note.meta.status || (words === 0 ? "outlined" : isIndexOnly(note.body) ? "index" : "written"),
    html, links: [...links].filter((l) => l !== id), backlinks: []
  };
}
for (const t of Object.values(topics)) for (const l of t.links) if (topics[l] && !topics[l].backlinks.includes(t.id)) topics[l].backlinks.push(t.id);

for (const p of planets) {
  const ts = p.districts.flatMap((d) => d.topics).map((id) => topics[id]);
  p.status = p.planned ? "planned" : ts.some((t) => t.status === "written") ? "explored" : "outlined";
  p.topicCount = ts.length;
}

const stats = {
  planets: planets.length,
  explored: planets.filter((p) => p.status === "explored").length,
  topics: Object.keys(topics).length,
  written: Object.values(topics).filter((t) => t.status === "written").length
};
const out = { generated: new Date().toISOString(), galaxy: galaxyNote ? { ...config.galaxy, id: "ai" } : null, planets, topics, stats };

if (!CHECK) writeFileSync(join(SITE, "content.json"), JSON.stringify(out));
console.log(`content: ${stats.planets} planets (${stats.explored} explored), ${stats.topics} topics (${stats.written} written)${CHECK ? " [check only]" : ""}`);
if (warnings.length) console.warn(`\n${warnings.length} warning(s):\n- ${[...new Set(warnings)].join("\n- ")}`);
