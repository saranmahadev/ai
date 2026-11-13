import * as benchKit from "./benches/kit.js";
import { createViews, esc } from "./views.js";
import { mountReader, applyPrefs, readSet, progressMap, markRead, markUnread } from "./reader.js";
import { mountSearch } from "./search.js";

// The app: a hash router over the page templates in views.js. Routes:
//   #/                      home (the curriculum)
//   #/<course>              a course: its chapters and lessons
//   #/<course>/<lesson>     a lesson (also a chapter's or a course's overview page)
//   #/<course>/glossary     that course's glossary       #/glossary   the list of glossaries
//   #/progress              my progress                  #/ai         the big-picture overview
// A hash route keeps working on plain static hosting; scripts/build-static.mjs writes a crawlable page at a
// real path for each of these from the same templates.
const $ = (s) => document.querySelector(s);
const view = $("#view");
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
// old links from earlier versions of the site still land somewhere sensible
const HOME_ALIASES = new Set(["", "explore", "list", "galaxy", "curriculum", "search"]);
const PROGRESS_ALIASES = new Set(["progress", "path"]);

applyPrefs();
let content = null, views = null, search = null, currentLesson = null;

const bodies = new Map();
// a lesson's body (html and table of contents) lives in its own file; fetched once, then kept on the topic
function loadBody(t) {
  if (t.html !== undefined) return Promise.resolve(t);
  if (!bodies.has(t.id)) bodies.set(t.id, fetch(`content/${t.id}.json`).then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); }).then((b) => Object.assign(t, b)).catch((e) => { bodies.delete(t.id); throw e; }));
  return bodies.get(t.id);
}
const loading = fetch("content.json").then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); }).then((c) => (content = c));

function setTitle(t) { document.title = t; $("#announce").textContent = t; }

// ---------- benches: interactive demos embedded in lessons (see benches/kit.js), loaded when scrolled near
function mountBenches(root) {
  const roots = [...root.querySelectorAll(".bench[data-bench]")];
  if (!roots.length) return () => {};
  const cleanups = [];
  let gone = false;
  const load = async (el) => {
    try {
      const mod = await import(`./benches/${el.dataset.bench}.js`);
      if (gone) return;
      const stop = mod.default(el, benchKit);
      if (typeof stop === "function") cleanups.push(stop);
    } catch (err) {
      console.error(`bench ${el.dataset.bench} failed`, err);
      el.classList.add("failed");
    }
  };
  const io = "IntersectionObserver" in window
    ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { io.unobserve(e.target); load(e.target); } }), { rootMargin: "300px 0px" })
    : null;
  roots.forEach((r) => (io ? io.observe(r) : load(r)));
  return () => { gone = true; if (io) io.disconnect(); cleanups.forEach((c) => c()); };
}

// ---------- lesson behaviour
let cleanupLesson = null;
function syncRead(id) {
  const done = readSet().has(id);
  const barEl = view.querySelector("[data-markbar]");
  if (barEl) {
    barEl.querySelector("span").textContent = done ? "You have read this lesson." : "Finished? Mark it and keep your place in the course.";
    const b = barEl.querySelector("[data-mark-read]");
    b.textContent = done ? "Mark as unread" : "Mark as read";
    b.setAttribute("aria-pressed", String(done));
    b.classList.toggle("primary", !done);
  }
  const side = view.querySelector(`.lesson-side a[href="#/${CSS.escape(id)}"]`);
  if (side) side.classList.toggle("read", done);
  const count = view.querySelector(".side-count"), links = [...view.querySelectorAll(".lesson-side ol a")];
  if (count && links.length) count.textContent = `${links.filter((a) => a.classList.contains("read")).length} of ${links.length} read`;
}
function enhanceLesson(topic) {
  const page = view.querySelector(".page.lesson");
  if (!page) return;
  $(".readline").hidden = false;
  // warm the next lesson so "Next" opens at once
  const nx = page.querySelector(".step.next[data-topic]"), nt = nx && content.topics[nx.dataset.topic];
  if (nt && nt.status !== "outlined") (window.requestIdleCallback || setTimeout)(() => loadBody(nt).catch(() => {}));
  const stopBenches = mountBenches(page);
  const stopReader = mountReader({ page, topic, content, reduce: reduceMotion, onRead: syncRead });
  cleanupLesson = () => { stopReader(); stopBenches(); $(".readline").hidden = true; };
}

function wireGlossaryFilter() {
  const input = $("#gfilter"), count = $("#gcount"), empty = $("#gempty");
  if (!input) return;
  const entries = [...view.querySelectorAll(".gl-entry")], groups = [...view.querySelectorAll(".gl-group")];
  const total = entries.length;
  input.addEventListener("input", () => {
    const q = input.value.trim().toLowerCase();
    let shown = 0;
    for (const el of entries) { const hit = !q || el.dataset.term.includes(q) || el.textContent.toLowerCase().includes(q); el.hidden = !hit; if (hit) shown++; }
    for (const g of groups) g.hidden = !g.querySelector(".gl-entry:not([hidden])");
    for (const a of view.querySelectorAll(".gl-letters a")) a.classList.toggle("off", !!$(`#${a.dataset.scroll}`).hidden);
    count.textContent = q ? `${shown} of ${total} terms` : `${total} terms`;
    empty.hidden = shown > 0;
  });
}

// ---------- router
function route() {
  if (!content) return;
  const [pathPart, query = ""] = decodeURIComponent(location.hash.replace(/^#\/?/, "")).split("?");
  const parts = pathPart.split("/").filter(Boolean);
  const key = parts.join("/");
  const at = query.startsWith("at=") ? query.slice(3) : null;
  const course = parts.length === 1 && content.courses.find((c) => c.id === key && !c.planned);
  // checked ahead of any lesson lookup: a lesson id is also <course>/<slug>-shaped, so a sub-route wins
  const glossaryCourse = parts.length === 2 && parts[1] === "glossary" && content.courses.find((c) => c.id === parts[0] && !c.planned);
  const topic = !glossaryCourse && content.topics[key];
  if (cleanupLesson) { cleanupLesson(); cleanupLesson = null; }

  if (topic && topic.html === undefined && topic.status !== "outlined") {
    const here = location.hash;
    view.innerHTML = `<div class="page"><p class="notice" role="status">Loading…</p></div>`;
    setTitle(`${topic.title} · AI Base`);
    loadBody(topic).then(() => { if (location.hash === here) route(); }, () => { if (location.hash === here) view.innerHTML = `<div class="page"><p class="notice">This lesson could not be loaded. <a href="${esc(here)}">Try again</a></p></div>`; });
    return;
  }

  let html, title, section = "curriculum";
  if (HOME_ALIASES.has(key)) { html = views.homeView(); title = ""; }
  else if (PROGRESS_ALIASES.has(key)) { html = views.progressView(); title = "My progress"; section = "progress"; }
  else if (key === "glossary") { html = views.glossaryIndexView(); title = "Glossary"; section = "glossary"; }
  else if (glossaryCourse) { html = views.glossaryView(glossaryCourse); title = `${glossaryCourse.title} glossary`; section = "glossary"; }
  else if (course) { html = views.courseView(course); title = course.title; }
  else if (topic) { html = views.lessonView(topic); title = topic.title; }
  else { html = views.notFoundView(); title = "Not found"; section = ""; }

  currentLesson = topic ? topic.id : null;
  document.body.dataset.section = section;
  view.innerHTML = html;
  setTitle(title ? `${title} · AI Base` : "AI Base");
  if (topic) enhanceLesson(topic);
  if (glossaryCourse) wireGlossaryFilter();
  { const h = view.querySelector("h1"); if (h && !document.body.classList.contains("searching")) { h.tabIndex = -1; h.focus({ preventScroll: true }); } }
  scrollTo(0, 0);
  if (at) { const target = document.getElementById(at); if (target) requestAnimationFrame(() => target.scrollIntoView()); }
  if (key === "search" && search) search.open();
}
addEventListener("hashchange", route);

// in-page anchors (On this page, glossary letters, "See the whole path") scroll without changing the route
document.addEventListener("click", (e) => {
  const a = e.target.closest("a[data-scroll]");
  if (!a || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  e.preventDefault();
  const el = document.getElementById(a.dataset.scroll);
  if (el) el.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth" });
});

view.addEventListener("click", (e) => {
  const mark = e.target.closest("[data-mark-read]");
  if (mark) {
    const id = mark.dataset.markRead;
    if (readSet().has(id)) markUnread(id); else markRead(id);
    syncRead(id);
    return;
  }
  if (e.target.closest("[data-reset-progress]")) {
    if (!confirm("Reset your reading progress on this device?")) return;
    try {
      localStorage.removeItem("ai-base-read");
      localStorage.removeItem("ai-base-progress");
      for (const k of Object.keys(localStorage)) if (k.startsWith("ai-base-pos:")) localStorage.removeItem(k);
    } catch { /* ignore */ }
    route();
  }
});

// ---------- PWA: app-shell + visited-content offline caching (sw.js); never blocks the page.
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("/sw.js").catch(() => {});
  // On a first visit the lesson on screen was fetched before the service worker took control, so it never
  // passed through the worker's cache. Ask for it again once the worker is in charge, so it reads offline.
  navigator.serviceWorker.addEventListener("controllerchange", () => { if (currentLesson) fetch(`content/${currentLesson}.json`).catch(() => {}); });
}

// ---------- boot
try {
  await loading;
} catch (err) {
  console.warn("content.json failed to load; in development, run `npm run content` in .site/", err);
  view.innerHTML = `<div class="page"><header class="page-head"><h1>Something went wrong</h1><p class="lede">The site could not load just now. Please <a href="${esc(location.pathname)}">refresh the page</a>.</p></header></div>`;
}
if (content) {
  views = createViews({
    content, app: true,
    link: (id) => `#/${id}`,
    anchor: (id, heading) => `#/${id}?at=${heading}`,
    read: readSet, progress: progressMap
  });
  search = mountSearch({ content, onGo: (d) => { location.hash = `#/${d.id}`; } });
  route();
}
