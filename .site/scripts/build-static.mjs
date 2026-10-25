// Static, path-based prerendering for every written topic, subject and subject glossary, plus sitemap.xml,
// robots.txt and llms.txt. A hash fragment (#/math/logarithms) is never sent to a server, so no crawler can
// ever be shown a distinct document per route on the hash-routed SPA alone. This script is additive, not a
// routing migration: it reads content.json and content/<id>.json (already written by build-content.mjs) and
// writes plain, self-contained HTML pages at real paths (.site/math/logarithms/index.html, served at
// /math/logarithms/) alongside the unchanged SPA at .site/index.html, which still handles all in-site
// navigation. A visitor arriving from search gets a fully readable article immediately, with a link to open
// the same topic in the interactive site for the full reader toolbar, progress tracking and Explorer Mode.
// Run: `npm run content` (runs this automatically after build-content.mjs) or `node scripts/build-static.mjs` alone.
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { cover } from "../cover.js";

const SITE = join(dirname(fileURLToPath(import.meta.url)), "..");
const VAULT = join(SITE, "..");
const SITE_URL = "https://ai.saranmahadev.in";
// Top-level generated output directories, cleaned and rebuilt each run. Keep this in sync with
// .site/planets.json's planet ids when a planet is added or renamed.
const GENERATED_DIRS = ["ai", "explore", "fundamentals", "math", "machine-learning", "deep-learning",
  "neural-networks", "transformers", "generative-ai", "llms", "rag", "agents"];

if (!existsSync(join(SITE, "content.json"))) { console.error("Run `node scripts/build-content.mjs` first."); process.exit(1); }
const content = JSON.parse(readFileSync(join(SITE, "content.json"), "utf8"));
const bodyOf = (id) => JSON.parse(readFileSync(join(SITE, "content", `${id}.json`), "utf8")).html;

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const decode = (t) => t.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const STATUS = { written: "Written", outlined: "Outlined", index: "Index", planned: "Undiscovered", explored: "Written" };
// A topic/planet wikilink in the stored article HTML points at a hash route; the static page needs a real,
// crawlable path instead so search engines can follow the site's internal link structure between pages.
const toPaths = (html) => html.replace(/href="#\/([a-z0-9-]+(?:\/[a-z0-9-]+)?)"/g, 'href="/$1/"');

// The "Quick check" section's <details>/<summary> pairs double as FAQPage structured data.
function quickCheckOf(html) {
  const m = html.match(/<h2 id="quick-check">[\s\S]*?<\/h2>([\s\S]*?)(?=<h2[ >]|$)/);
  if (!m) return [];
  return [...m[1].matchAll(/<details>\s*<summary>([\s\S]*?)<\/summary>([\s\S]*?)<\/details>/g)]
    .map((x) => ({
      q: decode(x[1].replace(/<[^>]+>/g, "")).replace(/^\s*\d+\.\s*/, "").trim(),
      a: decode(x[2].replace(/<[^>]+>/g, "")).replace(/\s+/g, " ").trim()
    })).filter((x) => x.q && x.a);
}

const jsonLd = (obj) => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`;
const breadcrumb = (items) => jsonLd({
  "@context": "https://schema.org", "@type": "BreadcrumbList",
  itemListElement: items.map((it, i) => ({ "@type": "ListItem", position: i + 1, name: it.name, item: it.url }))
});

function page({ title, description, url, body, extraHead = "" }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${url}">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<meta property="og:type" content="article">
<meta property="og:site_name" content="AI Base">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${SITE_URL}/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="alternate" type="application/atom+xml" title="AI Base: recently added topics" href="/feed.xml">
<link rel="stylesheet" href="/styles.css">
${extraHead}
</head>
<body class="reading" data-theme="light">
<header class="hud">
  <a class="brand clay-pill" href="/" aria-label="AI Base, home"><span class="dot"></span>AI Base</a>
  <nav class="clay-pill" aria-label="Main">
    <a href="/explore/">Explore</a>
    <a href="https://github.com/saranmahadev/ai" target="_blank" rel="noopener">GitHub ↗</a>
  </nav>
</header>
<main id="view">${body}</main>
<footer class="home-footer">
  <p><a href="https://github.com/saranmahadev/ai" target="_blank" rel="noopener">GitHub ↗</a> · <a href="https://github.com/saranmahadev/ai/blob/main/LICENSE" target="_blank" rel="noopener">MIT License</a> · <a href="/feed.xml">RSS ↗</a></p>
</footer>
</body>
</html>`;
}

function topicPage(id) {
  const t = content.topics[id];
  const html = bodyOf(id);
  const planet = t.planet && content.planets.find((p) => p.id === t.planet);
  const district = planet && t.district && planet.districts.find((d) => d.id === t.district);
  const color = planet ? planet.color : "#b39cf5";
  const url = `${SITE_URL}/${id}/`;
  const flat = planet ? planet.districts.flatMap((d) => d.topics) : [];
  const at = flat.indexOf(id);
  const prev = at > 0 ? content.topics[flat[at - 1]] : null;
  const next = at >= 0 && at < flat.length - 1 ? content.topics[flat[at + 1]] : null;
  const mins = Math.max(1, Math.round((t.words || 0) / 200));
  const more = [...new Set([...(t.links || []), ...(t.backlinks || [])])]
    .map((x) => content.topics[x]).filter((o) => o && o.status === "written").slice(0, 6);
  const interactive = `${SITE_URL}/#/${id}`;

  const crumbs = [{ name: "Home", url: `${SITE_URL}/` }];
  if (planet) crumbs.push({ name: planet.title, url: `${SITE_URL}/${planet.id}/` });
  crumbs.push({ name: t.title, url });

  const qc = quickCheckOf(html);
  const ld = [
    breadcrumb(crumbs),
    jsonLd({
      "@context": "https://schema.org", "@type": "Article", headline: t.title, description: t.summary || t.title, url,
      ...(planet ? { isPartOf: { "@type": "CreativeWorkSeries", name: planet.title, url: `${SITE_URL}/${planet.id}/` } } : {}),
      publisher: { "@type": "Organization", name: "AI Base", url: SITE_URL }
    }),
    ...(qc.length ? [jsonLd({
      "@context": "https://schema.org", "@type": "FAQPage",
      mainEntity: qc.map((x) => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.a } }))
    })] : [])
  ].join("\n");

  const card = (o) => `<a class="rc-card" href="/${o.id}/"><b>${esc(o.title)}</b><p>${esc(o.summary || "")}</p></a>`;

  const body = `
    <article class="doc topic" style="--c:${color}">
      <header class="doc-head">
        <p class="doc-kicker">${planet ? `<a href="/${planet.id}/">${esc(planet.title)}</a>` : "Overview"}${district && district.title !== planet.title ? ` · ${esc(district.title)}` : ""}</p>
        <h1 class="doc-title">${esc(t.title)}</h1>
        <div class="doc-by"><span class="doc-orb" aria-hidden="true"></span><div><b>${planet ? esc(planet.title) : "AI Base"}</b><span>${mins} min read</span></div></div>
      </header>
      <figure class="doc-cover" aria-hidden="true">${cover(t.title, color)}</figure>
      <div class="doc-body"><div class="prose">${toPaths(html)}</div></div>
      <footer class="doc-end">
        <p class="source"><a class="cta" href="${interactive}">Open in the interactive site →</a></p>
        ${next ? `<a class="read-next" href="/${next.id}/"><small>Read next</small><b>${esc(next.title)}</b><p>${esc(next.summary || "")}</p><span aria-hidden="true">→</span></a>` : ""}
        ${more.length ? `<section class="more"><h3>Keep exploring</h3><div class="rc-grid">${more.map(card).join("")}</div></section>` : ""}
        ${prev ? `<p class="doc-prev"><a href="/${prev.id}/">← Previous: ${esc(prev.title)}</a></p>` : ""}
      </footer>
    </article>`;

  return page({ title: `${t.title} — AI Base`, description: t.summary || t.title, url, body, extraHead: ld });
}

function subjectPage(p) {
  const url = `${SITE_URL}/${p.id}/`;
  const mins = (t) => Math.max(1, Math.round((t.words || 0) / 200));
  const topicRow = (id) => {
    const t = content.topics[id];
    return `<li class="topic-row ${t.status}"><a href="/${id}/"><span class="tr-icon" aria-hidden="true"></span><span class="tr-title">${esc(t.title)}</span><span class="tr-meta">${t.status === "written" ? `<span class="tr-time">${mins(t)} min</span>` : ""}</span></a></li>`;
  };
  const bodyHtml = p.districts.map((d) => `
    <section class="district"><h3>${esc(d.title)}</h3><ul class="topic-rows">${d.topics.map(topicRow).join("")}</ul></section>`).join("");
  const body = `
    <header class="page-head" style="--c:${p.color}"><span class="orb" style="--c:${p.color}" aria-hidden="true"></span>
      <div><p class="kicker">${STATUS[p.status] || p.status}</p><h2>${esc(p.title)}</h2><p class="blurb">${esc(p.blurb)}</p>
      <p class="subject-links"><a href="/${p.id}/glossary/">Glossary →</a> · <a href="${SITE_URL}/#/${p.id}">Open in the interactive site →</a></p></div>
    </header>
    ${bodyHtml}`;
  const ld = breadcrumb([{ name: "Home", url: `${SITE_URL}/` }, { name: p.title, url }]);
  return page({ title: `${p.title} — AI Base`, description: p.blurb, url, body, extraHead: ld });
}

function glossaryData(p) {
  const byTerm = new Map();
  for (const id of p.districts.flatMap((d) => d.topics)) {
    const t = content.topics[id];
    if (!t || t.status !== "written" || !t.glossary) continue;
    for (const g of t.glossary) {
      const key = g.term.trim().toLowerCase();
      if (!byTerm.has(key)) byTerm.set(key, { term: g.term, entries: [] });
      const group = byTerm.get(key);
      if (!group.entries.some((e) => e.def === g.def)) group.entries.push({ def: g.def, topicId: id, topicTitle: t.title });
    }
  }
  return [...byTerm.values()].sort((a, b) => a.term.localeCompare(b.term));
}

function glossaryPage(p) {
  const url = `${SITE_URL}/${p.id}/glossary/`;
  const terms = glossaryData(p);
  const bodyHtml = !terms.length ? `<p class="notice">No key terms yet.</p>` :
    `<dl class="glossary-list">${terms.map((g) => `
      <div class="glossary-entry"><dt>${esc(g.term)}</dt>
      ${g.entries.map((e) => `<dd>${esc(e.def)} <a class="glossary-source" href="/${e.topicId}/">from ${esc(e.topicTitle)}</a></dd>`).join("")}
      </div>`).join("")}</dl>`;
  const body = `
    <header class="page-head" style="--c:${p.color}"><span class="orb" style="--c:${p.color}" aria-hidden="true"></span>
      <div><p class="kicker">Glossary</p><h2>${esc(p.title)} Glossary</h2><p class="blurb">${terms.length} term${terms.length === 1 ? "" : "s"} from ${esc(p.title)}.</p></div>
    </header>
    ${bodyHtml}`;
  const ld = [
    breadcrumb([{ name: "Home", url: `${SITE_URL}/` }, { name: p.title, url: `${SITE_URL}/${p.id}/` }, { name: "Glossary", url }]),
    ...(terms.length ? [jsonLd({
      "@context": "https://schema.org", "@type": "DefinedTermSet", name: `${p.title} Glossary`, url,
      hasDefinedTerm: terms.map((g) => ({ "@type": "DefinedTerm", name: g.term, description: g.entries[0].def }))
    })] : [])
  ].join("\n");
  return page({ title: `${p.title} Glossary — AI Base`, description: `${terms.length} key terms from ${p.title}, defined in context.`, url, body, extraHead: ld });
}

function catalogPage() {
  const url = `${SITE_URL}/explore/`;
  const planetCard = (p) => `<a class="card planet-card ${p.planned ? "planned" : ""}" href="/${p.id}/" style="--c:${p.color}">
    <span class="orb" style="--c:${p.color}" aria-hidden="true"></span>
    <div><h3>${esc(p.title)}</h3><p>${esc(p.blurb)}</p>
    <div class="meta"><span class="badge ${p.status}">${STATUS[p.status] || p.status}</span>${p.topicCount ? `<span>${p.topicCount} topic${p.topicCount > 1 ? "s" : ""}</span>` : ""}</div></div>
  </a>`;
  const body = `
    <header class="page-head"><p class="kicker">The knowledge base</p><h2>Browse subjects</h2>
    <p class="blurb">${content.stats.planets} subjects, ${content.stats.written} topics written, each with a worked example and an interactive demo.</p></header>
    <div class="planet-grid">${content.planets.map(planetCard).join("")}</div>`;
  const ld = breadcrumb([{ name: "Home", url: `${SITE_URL}/` }, { name: "Explore", url }]);
  const description = `${content.stats.planets} subjects, ${content.stats.written} AI topics, each with a worked example and an interactive demo.`;
  return page({ title: "Explore — AI Base", description, url, body, extraHead: ld });
}

// ---- generate everything

for (const d of GENERATED_DIRS) rmSync(join(SITE, d), { recursive: true, force: true });

function writePage(relDir, html) {
  const dir = join(SITE, relDir);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), html);
}

const lastmod = (content.generated || new Date().toISOString()).slice(0, 10);
const urls = [{ loc: `${SITE_URL}/`, lastmod }, { loc: `${SITE_URL}/explore/`, lastmod }];

writePage("explore", catalogPage());

let subjectCount = 0;
for (const p of content.planets) {
  if (p.planned) continue;
  subjectCount++;
  writePage(p.id, subjectPage(p));
  urls.push({ loc: `${SITE_URL}/${p.id}/`, lastmod });
  writePage(`${p.id}/glossary`, glossaryPage(p));
  urls.push({ loc: `${SITE_URL}/${p.id}/glossary/`, lastmod });
}

let topicCount = 0;
for (const [id, t] of Object.entries(content.topics)) {
  if (t.status !== "written") continue;
  writePage(id, topicPage(id));
  urls.push({ loc: `${SITE_URL}/${id}/`, lastmod });
  topicCount++;
}

writeFileSync(join(SITE, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod></url>`).join("\n")}\n</urlset>\n`);

writeFileSync(join(SITE, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);

writeFileSync(join(SITE, "llms.txt"), `# AI Base

> A free, structured knowledge base for learning AI — ${content.stats.planets} subjects, ${content.stats.written} topics, each with a worked example and a running interactive demo. MIT licensed, no tracking, no ads.

${content.planets.filter((p) => !p.planned).map((p) => `- [${p.title}](${SITE_URL}/${p.id}/): ${p.blurb}`).join("\n")}

## Reference

- [Explore all subjects](${SITE_URL}/explore/)
- [The full corpus, concatenated](${SITE_URL}/llms-full.txt)
- [Source](https://github.com/saranmahadev/ai)
`);

// llms-full.txt: every written topic's source note, concatenated in site order. Reads the vault files
// directly (content.topics[id].path) rather than converting the rendered HTML back to text, so it is
// byte-faithful to the notes rather than a lossy round trip.
const stripFrontmatter = (src) => src.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
const llmsFull = [`# AI Base — full corpus\n\nEvery written topic's source note, concatenated in site order. See llms.txt for a shorter index.\n`];
const ai = content.topics.ai;
if (ai && ai.status === "written") llmsFull.push(`\n# Overview\n\n${stripFrontmatter(readFileSync(join(VAULT, ai.path), "utf8")).trim()}\n`);
let fullCount = ai && ai.status === "written" ? 1 : 0;
for (const p of content.planets) {
  if (p.planned) continue;
  llmsFull.push(`\n# ${p.title}\n`);
  const order = [p.index, ...p.districts.flatMap((d) => d.topics)].filter(Boolean); // p.index (the subject's own landing note) isn't in any district's topic list
  for (const id of order) {
    const t = content.topics[id];
    if (!t || t.status !== "written") continue;
    llmsFull.push(`\n## ${t.title}\n\n${stripFrontmatter(readFileSync(join(VAULT, t.path), "utf8")).trim()}\n`);
    fullCount++;
  }
}
writeFileSync(join(SITE, "llms-full.txt"), llmsFull.join(""));

console.log(`prerender: ${topicCount} topic pages, ${subjectCount} subject pages (+ glossaries), sitemap.xml, robots.txt, llms.txt, llms-full.txt (${fullCount} notes)`);
