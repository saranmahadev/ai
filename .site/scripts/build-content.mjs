// Turns the Obsidian vault (Markdown notes) into .site/content.json.
// Vault = source of truth. Run: `npm run content` (from .site/). `--check` builds without writing.
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync, mkdirSync, rmSync } from "node:fs";
import { join, dirname, basename, relative, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { marked } from "marked";

const SITE = join(dirname(fileURLToPath(import.meta.url)), "..");
const VAULT = join(SITE, "..");
const CHECK = process.argv.includes("--check");
const SKIP_DIRS = new Set([".git", ".obsidian", ".agents", ".github", ".site", "node_modules"]);
const SKIP_FILES = new Set(["AGENTS.md", "CLAUDE.md", "README.md", "LICENSE", "CONTRIBUTING.md", "SECURITY.md", "CODE_OF_CONDUCT.md"]);
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

// ---- 2. Courses, chapters and lessons
const config = JSON.parse(readFileSync(join(SITE, "courses.json"), "utf8"));
const topicIdOf = new Map(); // note path -> topic id
const courses = [];
const assigned = new Set();

function claim(courseId, note) {
  if (assigned.has(note.path)) { warn(`${note.path} is claimed by more than one course`); return null; }
  assigned.add(note.path);
  const id = `${courseId}/${slug(basename(note.path, ".md"))}`;
  topicIdOf.set(note.path, id);
  return id;
}

for (const cfg of config.courses) {
  const course = { id: cfg.id, title: cfg.title, blurb: cfg.blurb, planned: !!cfg.planned, chapters: [] };
  if (cfg.planned) { courses.push(course); continue; }

  if (cfg.folder) {
    const indexNote = cfg.index && noteByPath(cfg.index);
    if (!indexNote) warn(`Course ${cfg.id}: index note ${cfg.index} not found`);
    if (indexNote) { course.index = claim(cfg.id, indexNote); }
    const inFolder = [...notes.values()].filter((n) => n.path.startsWith(cfg.folder + "/"));
    const used = new Set();
    // Chapters in the order the index note links to them
    const order = indexNote ? wikiTargets(indexNote.body).map((t) => byTitle.get(norm(t))).filter(Boolean) : [];
    const chapterNotes = [...order, ...inFolder.filter((n) => !order.includes(n) && n.folder === cfg.folder)];
    for (const head of chapterNotes) {
      if (used.has(head.path) || !inFolder.includes(head)) continue;
      const own = head.folder !== cfg.folder && basename(head.folder) === basename(head.path, ".md");
      const members = own ? inFolder.filter((n) => n.folder === head.folder) : [head];
      const rest = members.filter((n) => n !== head);
      const linked = wikiTargets(head.body).map((t) => byTitle.get(norm(t))).filter((n) => n && rest.includes(n));
      const seq = [head, ...new Set(linked), ...rest.filter((n) => !linked.includes(n)).sort((a, b) => a.title.localeCompare(b.title))];
      seq.forEach((n) => used.add(n.path));
      // a chapter with its own folder opens with its landing note (the intro); the notes it links are the lessons
      const ids = seq.map((n) => claim(cfg.id, n)).filter(Boolean);
      course.chapters.push({ id: slug(head.title), title: head.title, intro: own ? ids[0] : null, lessons: own ? ids.slice(1) : ids });
    }
    for (const n of inFolder) if (!used.has(n.path)) { warn(`${n.path} is not linked from ${cfg.index}; added to "More"`); }
    const stray = inFolder.filter((n) => !used.has(n.path));
    if (stray.length) course.chapters.push({ id: "more", title: "More", intro: null, lessons: stray.map((n) => claim(cfg.id, n)).filter(Boolean) });
  } else {
    const list = (cfg.notes || []).map((p) => noteByPath(p) || warn(`Course ${cfg.id}: ${p} not found`)).filter(Boolean);
    course.chapters.push({ id: "core", title: cfg.title, intro: null, lessons: list.map((n) => claim(cfg.id, n)).filter(Boolean) });
  }
  courses.push(course);
}

const overviewNote = config.overview && noteByPath(config.overview.note);
if (overviewNote) topicIdOf.set(overviewNote.path, "ai");
for (const n of notes.values()) if (!assigned.has(n.path) && n !== overviewNote) warn(`${n.path} is not assigned to any course (edit .site/courses.json)`);

// ---- 3. Render Markdown (wiki links, callouts, headings with ids)
const courseByTitle = new Map(courses.map((p) => [norm(p.title), p]));
const chapterIds = (ch) => [ch.intro, ...ch.lessons].filter(Boolean);
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
        const course = courseByTitle.get(norm(target));
        if (course) return `<a class="wikilink course" href="#/${course.id}" data-course="${course.id}">${label}</a>`;
        warn(`Unresolved link [[${target.trim()}]]`);
        return `<span class="wikilink missing" title="Not written yet">${label}</span>`;
      });
  }).join("");
}

// A ```bench block ("id: dot-product", optional "title:" and "fallback:") becomes a mount point for benches/<id>.js.
function benchHtml(text, benches, note) {
  const f = {};
  for (const line of text.split(/\r?\n/)) { const kv = line.match(/^\s*([a-z]+):\s*(.*?)\s*$/); if (kv) f[kv[1]] = kv[2]; }
  if (!/^[a-z0-9-]+$/.test(f.id || "")) { warn(`${note.path}: bench block needs an "id:" of lowercase letters, digits and dashes`); return ""; }
  if (!existsSync(join(SITE, "benches", `${f.id}.js`))) warn(`${note.path}: bench "${f.id}" has no module at .site/benches/${f.id}.js`);
  benches.push(f.id);
  const title = f.title || f.id;
  return `<div class="bench" data-bench="${f.id}" data-title="${escapeHtml(title)}"><p class="bench-fallback"><strong>Interactive bench: ${escapeHtml(title)}.</strong> ${escapeHtml(f.fallback || "It needs JavaScript; the text around it explains the same idea.")}</p></div>\n`;
}

function render(note) {
  const links = new Set();
  const benches = [];
  const toc = [];
  const md = resolveWikilinks(note.body, links);
  marked.use({
    gfm: true,
    renderer: {
      code({ text, lang, escaped }) {
        if ((lang || "").trim() === "bench") return benchHtml(text, benches, note);
        return false;
      },
      heading({ tokens, depth }) {
        const html = this.parser.parseInline(tokens);
        const text = html.replace(/<[^>]+>/g, "").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
        const id = slug(text) || `h${toc.length}`;
        if (depth >= 1 && depth <= 3) toc.push({ id, text, depth });
        return `<h${depth} id="${id}">${html}</h${depth}>\n`;
      }
    }
  });
  let html = marked.parse(md, { async: false });
  if (toc.length && toc[0].depth === 1 && html.trimStart().startsWith("<h1")) toc.shift(); // the leading title repeats the page title
  html = html.replace(/<blockquote>\s*<p>\[!(\w+)\]\s*([^\n<]*)/g, (_, type, title) =>
    `<blockquote class="callout callout-${type.toLowerCase()}"><p><strong>${title.trim() || type}</strong>`);
  return { html, toc, links, benches };
}

// "Key terms" section: `* **Term:** definition` items become a glossary the reader shows as popovers
const decode = (t) => t.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
function glossaryOf(html) {
  const m = html.match(/<h2 id="key-terms">[\s\S]*?<ul>([\s\S]*?)<\/ul>/);
  if (!m) return [];
  return [...m[1].matchAll(/<li><strong>([\s\S]*?):<\/strong>\s*([\s\S]*?)<\/li>/g)]
    .map((x) => ({ term: decode(x[1].replace(/<[^>]+>/g, "")).trim(), def: decode(x[2].replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim() }))
    .filter((g) => g.term && g.def);
}

const isIndexOnly = (body) => body.split(/\r?\n/).every((l) => !l.trim() || /^\s*[-*]\s*\[\[[^\]]+\]\]\s*$/.test(l));
const plain = (html) => html.replace(/<[^>]+>/g, "").replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/\s+/g, " ").trim();

const topics = {};
const courseOf = (id) => id.split("/")[0];
for (const [path, id] of topicIdOf) {
  const note = notes.get(path);
  const { html, toc, links, benches } = render(note);
  const words = plain(html).split(" ").filter(Boolean).length;
  const firstP = (html.match(/<p>([\s\S]*?)<\/p>/) || [])[1] || "";
  let summary = note.meta.summary || plain(firstP);
  if (summary.length > 200) { // keep whole sentences where possible, else cut at a word
    let cut = "";
    for (const sentence of summary.split(/(?<=[.!?])\s+/)) { if ((cut + " " + sentence).trim().length > 200) break; cut = (cut + " " + sentence).trim(); }
    summary = cut || summary.slice(0, 197).replace(/\s+\S*$/, "").trimEnd() + "…";
  }
  const chapter = courses.flatMap((p) => p.chapters).find((d) => chapterIds(d).includes(id));
  topics[id] = {
    id, title: note.title, course: id === "ai" ? null : courseOf(id), chapter: chapter ? chapter.id : null,
    path, summary, words, toc,
    status: note.meta.status || (words === 0 ? "outlined" : isIndexOnly(note.body) ? "index" : "written"),
    html, benches, glossary: glossaryOf(html), links: [...links].filter((l) => l !== id), backlinks: []
  };
}
for (const t of Object.values(topics)) for (const l of t.links) if (topics[l] && !topics[l].backlinks.includes(t.id)) topics[l].backlinks.push(t.id);

// A lesson's "You need:" prerequisites (in the same course) must come earlier in the course
for (const p of courses) {
  const pos = new Map(p.chapters.flatMap(chapterIds).map((id, i) => [id, i]));
  for (const [path, id] of topicIdOf) {
    if (!pos.has(id)) continue;
    const m = notes.get(path).body.match(/\*\*You need:\*\*([^\n]*)/);
    if (!m) continue;
    for (const target of wikiTargets(m[1])) {
      const n = byTitle.get(norm(target)), pid = n && topicIdOf.get(n.path);
      if (pid && pos.has(pid) && pos.get(pid) > pos.get(id)) warn(`Prerequisite "${target}" of "${notes.get(path).title}" comes later in the course`);
    }
  }
}

for (const p of courses) {
  const ts = p.chapters.flatMap((d) => d.lessons).map((id) => topics[id]);
  p.status = p.planned ? "planned" : ts.some((t) => t.status === "written") ? "written" : "outlined";
  p.lessonCount = ts.length;
}

const stats = {
  courses: courses.filter((p) => !p.planned).length,
  chapters: courses.reduce((n, p) => n + p.chapters.length, 0),
  lessons: courses.reduce((n, p) => n + p.lessonCount, 0),
  topics: Object.keys(topics).length,
  written: Object.values(topics).filter((t) => t.status === "written").length,
  benches: Object.values(topics).filter((t) => t.benches.length > 0).length
};
// The index (content.json) carries everything except article bodies; each body (html + table of contents) is its own file
// under content/, fetched when the topic is opened, so the first load stays small however many courses there are.
const index = {};
for (const [id, t] of Object.entries(topics)) { const { html, toc, ...rest } = t; index[id] = rest; }
const out = { generated: new Date().toISOString(), overview: overviewNote ? { ...config.overview, id: "ai" } : null, courses, topics: index, stats };

if (!CHECK) {
  writeFileSync(join(SITE, "content.json"), JSON.stringify(out));
  rmSync(join(SITE, "content"), { recursive: true, force: true });
  for (const [id, t] of Object.entries(topics)) {
    const file = join(SITE, "content", `${id}.json`);
    mkdirSync(dirname(file), { recursive: true });
    writeFileSync(file, JSON.stringify({ html: t.html, toc: t.toc }));
  }
}
console.log(`content: ${stats.courses} courses, ${stats.chapters} chapters, ${stats.lessons} lessons (${stats.topics} pages, ${stats.written} written)${CHECK ? " [check only]" : ""}`);
if (warnings.length) console.warn(`\n${warnings.length} warning(s):\n- ${[...new Set(warnings)].join("\n- ")}`);
