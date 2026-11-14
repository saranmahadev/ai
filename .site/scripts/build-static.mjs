// Static, path-based prerendering for every written lesson, course and course glossary, plus sitemap.xml,
// robots.txt, llms.txt and llms-full.txt. A hash fragment (#/math/logarithms) is never sent to a server, so no
// crawler can be shown a distinct document per route on the hash-routed app alone. This script reads
// content.json and content/<id>.json (written by build-content.mjs) and writes plain HTML pages at real paths
// (.site/math/logarithms/index.html, served at /math/logarithms/) next to the app at .site/index.html.
// The pages come from the same templates as the app (views.js), so they look the same; they carry the lesson
// text itself, structured data, and a link into the app for progress tracking and the live bench.
// Run: `npm run content` (runs this after build-content.mjs) or `node scripts/build-static.mjs` alone.
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createViews, siteHeader, siteFooter, esc } from "../views.js";

const SITE = join(dirname(fileURLToPath(import.meta.url)), "..");
const VAULT = join(SITE, "..");
const SITE_URL = "https://ai.saranmahadev.in";

if (!existsSync(join(SITE, "content.json"))) { console.error("Run `node scripts/build-content.mjs` first."); process.exit(1); }
const content = JSON.parse(readFileSync(join(SITE, "content.json"), "utf8"));
const courses = content.courses.filter((c) => !c.planned);
// Top-level generated output directories, cleaned and rebuilt each run: one per course, plus the fixed pages.
const GENERATED_DIRS = ["ai", "explore", "glossary", ...courses.map((c) => c.id)];
const bodyOf = (id) => JSON.parse(readFileSync(join(SITE, "content", `${id}.json`), "utf8"));

const decode = (t) => t.replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
// A lesson or course link in the stored HTML points at a hash route; the static page needs a real,
// crawlable path instead so search engines can follow the site's internal links between pages.
const toPaths = (html) => html.replace(/href="#\/([a-z0-9-]+(?:\/[a-z0-9-]+)?)"/g, 'href="/$1/"');
const views = createViews({
  content,
  link: (id) => (id ? `/${id}/` : "/"),
  anchor: (id, heading) => `#${heading}`,
  prose: toPaths
});

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

function page({ title, description, url, body, extraHead = "", section = "curriculum" }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<meta name="theme-color" content="#fbf6ec">
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
<link rel="alternate" type="application/atom+xml" title="AI Base: recently updated lessons" href="/feed.xml">
<script src="/theme.js"></script>
<link rel="stylesheet" href="/styles.css">
${extraHead}
</head>
<body data-section="${section}">
<a class="skip" href="#view">Skip to content</a>
${siteHeader({ home: "/", glossary: "/glossary/", progress: "/#/progress", search: { href: "/#/search" } })}
<main id="view">${body}</main>
${siteFooter()}
</body>
</html>`;
}

const crumbsOf = (...items) => [{ name: "Curriculum", url: `${SITE_URL}/` }, ...items];

function lessonPage(id) {
  const t = { ...content.topics[id], ...bodyOf(id) };
  const course = views.courseOf(id), chapter = views.chapterOf(course, id);
  const url = `${SITE_URL}/${id}/`;
  const trail = crumbsOf();
  if (course) trail.push({ name: course.title, url: `${SITE_URL}/${course.id}/` });
  if (chapter && chapter.title !== course.title && chapter.intro !== id) trail.push(chapter.intro ? { name: chapter.title, url: `${SITE_URL}/${chapter.intro}/` } : { name: chapter.title });
  trail.push({ name: t.title, url });
  const qc = quickCheckOf(t.html);
  const ld = [
    breadcrumb(trail),
    jsonLd({
      "@context": "https://schema.org", "@type": "Article", headline: t.title, description: t.summary || t.title, url,
      ...(course ? { isPartOf: { "@type": "Course", name: course.title, url: `${SITE_URL}/${course.id}/` } } : {}),
      publisher: { "@type": "Organization", name: "AI Base", url: SITE_URL }
    }),
    ...(qc.length ? [jsonLd({
      "@context": "https://schema.org", "@type": "FAQPage",
      mainEntity: qc.map((x) => ({ "@type": "Question", name: x.q, acceptedAnswer: { "@type": "Answer", text: x.a } }))
    })] : [])
  ].join("\n");
  return page({ title: `${t.title} — AI Base`, description: t.summary || t.title, url, body: views.lessonView(t), extraHead: ld });
}

function coursePage(c) {
  const url = `${SITE_URL}/${c.id}/`;
  const ld = [
    breadcrumb(crumbsOf({ name: c.title, url })),
    jsonLd({ "@context": "https://schema.org", "@type": "Course", name: c.title, description: c.blurb, url, provider: { "@type": "Organization", name: "AI Base", url: SITE_URL } })
  ].join("\n");
  return page({ title: `${c.title} — AI Base`, description: c.blurb, url, body: views.courseView(c), extraHead: ld });
}

function glossaryPage(c) {
  const url = `${SITE_URL}/${c.id}/glossary/`;
  const terms = views.glossaryData(c);
  const ld = [
    breadcrumb(crumbsOf({ name: c.title, url: `${SITE_URL}/${c.id}/` }, { name: "Glossary", url })),
    ...(terms.length ? [jsonLd({
      "@context": "https://schema.org", "@type": "DefinedTermSet", name: `${c.title} glossary`, url,
      hasDefinedTerm: terms.map((g) => ({ "@type": "DefinedTerm", name: g.term, description: g.entries[0].def }))
    })] : [])
  ].join("\n");
  return page({ title: `${c.title} glossary — AI Base`, description: `${terms.length} key terms from ${c.title}, each defined in one sentence with the lesson that teaches it.`, url, body: views.glossaryView(c), extraHead: ld, section: "glossary" });
}

function glossaryIndexPage() {
  const url = `${SITE_URL}/glossary/`;
  return page({ title: "Glossary — AI Base", description: "Every key term from every AI Base course, each defined in one sentence with the lesson that teaches it.", url, body: views.glossaryIndexView(), extraHead: breadcrumb([{ name: "Glossary", url }]), section: "glossary" });
}

function curriculumPage() {
  const url = `${SITE_URL}/explore/`;
  const s = content.stats;
  const description = `${s.courses} courses, ${s.chapters} chapters and ${s.lessons} lessons for learning AI in order, each with a worked example and an interactive bench.`;
  return page({ title: "Curriculum — AI Base", description, url, body: views.curriculumView(), extraHead: breadcrumb([{ name: "Curriculum", url }]) });
}

// ---- generate everything

for (const d of GENERATED_DIRS) rmSync(join(SITE, d), { recursive: true, force: true });

function writePage(relDir, html) {
  const dir = join(SITE, relDir);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), html);
}

const lastmod = (content.generated || new Date().toISOString()).slice(0, 10);
const urls = [{ loc: `${SITE_URL}/`, lastmod }, { loc: `${SITE_URL}/explore/`, lastmod }, { loc: `${SITE_URL}/glossary/`, lastmod }];

writePage("explore", curriculumPage());
writePage("glossary", glossaryIndexPage());

let courseCount = 0;
for (const c of courses) {
  courseCount++;
  writePage(c.id, coursePage(c));
  urls.push({ loc: `${SITE_URL}/${c.id}/`, lastmod });
  writePage(`${c.id}/glossary`, glossaryPage(c));
  urls.push({ loc: `${SITE_URL}/${c.id}/glossary/`, lastmod });
}

let lessonCount = 0;
for (const [id, t] of Object.entries(content.topics)) {
  if (t.status !== "written") continue;
  writePage(id, lessonPage(id));
  urls.push({ loc: `${SITE_URL}/${id}/`, lastmod });
  lessonCount++;
}

writeFileSync(join(SITE, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((u) => `  <url><loc>${u.loc}</loc><lastmod>${u.lastmod}</lastmod></url>`).join("\n")}\n</urlset>\n`);

writeFileSync(join(SITE, "robots.txt"), `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`);

writeFileSync(join(SITE, "llms.txt"), `# AI Base

> A free, open curriculum for learning AI in order: ${content.stats.courses} courses, ${content.stats.chapters} chapters and ${content.stats.lessons} lessons, read in order, each with a worked example and a running interactive bench. MIT licensed, no tracking, no ads.

${courses.map((p) => `- [${p.title}](${SITE_URL}/${p.id}/): ${p.blurb}`).join("\n")}

## Reference

- [The whole curriculum](${SITE_URL}/explore/)\n- [Glossaries](${SITE_URL}/glossary/)
- [The full corpus, concatenated](${SITE_URL}/llms-full.txt)
- [Source](https://github.com/saranmahadev/ai)
`);

// llms-full.txt: every written lesson's source note, concatenated in course order. Reads the vault files
// directly (content.topics[id].path) rather than converting the rendered HTML back to text, so it is
// byte-faithful to the notes rather than a lossy round trip.
const stripFrontmatter = (src) => src.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, "");
const llmsFull = [`# AI Base — full corpus\n\nEvery written lesson's source note, concatenated in course order. See llms.txt for a shorter index.\n`];
const ai = content.topics.ai;
if (ai && ai.status === "written") llmsFull.push(`\n# Overview\n\n${stripFrontmatter(readFileSync(join(VAULT, ai.path), "utf8")).trim()}\n`);
let fullCount = ai && ai.status === "written" ? 1 : 0;
for (const p of courses) {
  llmsFull.push(`\n# ${p.title}\n`);
  const order = [p.index, ...views.orderOf(p)].filter(Boolean); // p.index (the course's own landing note) is not part of any chapter
  for (const id of order) {
    const t = content.topics[id];
    if (!t || t.status !== "written") continue;
    llmsFull.push(`\n## ${t.title}\n\n${stripFrontmatter(readFileSync(join(VAULT, t.path), "utf8")).trim()}\n`);
    fullCount++;
  }
}
writeFileSync(join(SITE, "llms-full.txt"), llmsFull.join(""));

console.log(`prerender: ${lessonCount} lesson pages, ${courseCount} course pages (+ glossaries), sitemap.xml, robots.txt, llms.txt, llms-full.txt (${fullCount} notes)`);
