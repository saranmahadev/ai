import { theme } from "./theme.js";
import { navFor } from "./nav.js";
import * as benchKit from "./benches/kit.js";
import { cover } from "./cover.js";
import { mountReader, applyPrefs, readSet, progressFor } from "./reader.js";
import { mountSearch } from "./search.js";

// Router + views. The 3D scenes plug in per route; the text views below are also the permanent accessible fallback.
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
// "explored" here means the subject has at least one written topic (content-complete), distinct from
// the reader's own progress shown right beside it — labelled "Written" to avoid reading as a false claim.
const STATUS = { written: "Written", outlined: "Outlined", index: "Index", planned: "Undiscovered", explored: "Written" };
const REPO = "https://github.com/saranmahadev/ai/blob/main/";

applyPrefs();
// Three modes: Read (the default, every route is a plain document), Explorer (unlocks the rocket and
// the walkable 3D planets), and AI (reads like Read Mode, but surfaces the AI tutor on topic pages — see
// AI_MODE_READY below). The choice is remembered in this browser only, same as the other ai-base-* prefs.
const MODES = ["read", "explore", "ai"];
function getMode() {
  const q = new URLSearchParams(location.search).get("mode");
  if (MODES.includes(q)) return q; // ?mode= forces it for this pageload (used by the test suite and shareable 3D links)
  try { const m = localStorage.getItem("ai-base-mode"); return MODES.includes(m) ? m : "read"; } catch { return "read"; }
}
function setMode(m) { try { localStorage.setItem("ai-base-mode", m); } catch { /* ignore */ } }
// The AI tutor itself (BYOK panel, provider calls) isn't built yet; AI Mode exists as a real, selectable
// mode so it's discoverable, and shows an honest "coming soon" notice on topic pages until it lands.
const AI_MODE_READY = false;
const view = $("#view");
const home = $("#home");
let content = null;
let stage = null, homeScene = null, galaxy = null, planetScene = null, planetKey = null;
let launching = false, flying = false;
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

const bodies = new Map();
// an article's body (html and table of contents) lives in its own file; fetched once, then cached on the topic
function loadBody(t) {
  if (t.html !== undefined) return Promise.resolve(t);
  if (!bodies.has(t.id)) bodies.set(t.id, fetch(`content/${t.id}.json`).then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); }).then((b) => Object.assign(t, b)).catch((e) => { bodies.delete(t.id); throw e; }));
  return bodies.get(t.id);
}
const loading = fetch("content.json").then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); }).then((c) => (content = c));

function setTitle(t) { document.title = t; $("#announce").textContent = t; }

const badge = (s) => `<span class="badge ${s}">${STATUS[s] || s}</span>`;
const planetDot = (p) => `<span class="orb" style="--c:${p.color}" aria-hidden="true"></span>`;

// ---------- views
function subjectProgress(p) {
  if (p.planned) return null;
  const read = readSet();
  const ids = p.districts.flatMap((d) => d.topics).filter((id) => content.topics[id] && content.topics[id].status === "written");
  if (!ids.length) return null;
  const n = ids.filter((id) => read.has(id)).length;
  return { n, total: ids.length, pct: Math.round((100 * n) / ids.length) };
}

function planetCard(p) {
  const prog = subjectProgress(p);
  return `
    <a class="card planet-card ${p.planned ? "planned" : ""}" href="#/${p.id}" style="--c:${p.color}">
      ${planetDot(p)}
      <div><h3>${esc(p.title)}</h3><p>${esc(p.blurb)}</p>
      <div class="meta">${badge(p.status)}${p.topicCount ? `<span>${p.topicCount} topic${p.topicCount > 1 ? "s" : ""}</span>` : ""}</div>
      ${prog ? `<div class="pbar" role="progressbar" aria-label="${esc(p.title)} progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${prog.pct}"><i style="width:${prog.pct}%"></i></div><p class="meta"><span>${prog.n} of ${prog.total} read</span></p>` : ""}</div>
    </a>`;
}

function galaxyView() {
  const ai = content.topics.ai;
  return `
    <header class="page-head"><p class="kicker">The knowledge base</p><h2>Browse subjects</h2>
    <p class="blurb">${content.stats.planets} subjects, ${content.stats.written} topics written, each with a worked example and an interactive demo. ${content.stats.explored} subjects explored so far on this device.</p></header>
    <div class="planet-grid">${content.planets.map(planetCard).join("")}</div>
    ${ai ? `<p class="big-picture"><a class="clay-pill" href="#/ai">Read “${esc(ai.title)}” →</a></p>` : ""}`;
}

// ---------- home page: dynamic stats, subject grid, continue-reading teaser, scroll reveal
function renderHomeStatic() {
  const grid = $("#home-subjects");
  if (grid) grid.innerHTML = content.planets.map(planetCard).join("");
  const sections = document.querySelectorAll("#home .reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -10% 0px" });
    sections.forEach((el) => io.observe(el));
  } else sections.forEach((el) => el.classList.add("in"));
  const statsEl = $("#home-stats");
  if (!statsEl) return;
  const animateStats = () => {
    statsEl.querySelectorAll("[data-stat]").forEach((b) => {
      const target = content.stats[b.dataset.stat] || 0;
      if (reduceMotion) { b.textContent = target; return; }
      const start = performance.now(), dur = 900;
      const tick = (now) => {
        const p = Math.min(1, (now - start) / dur), eased = 1 - Math.pow(1 - p, 3);
        b.textContent = Math.round(target * eased);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  };
  if ("IntersectionObserver" in window) {
    const sio = new IntersectionObserver((es) => { if (es[0].isIntersecting) { animateStats(); sio.disconnect(); } });
    sio.observe(statsEl);
  } else animateStats();
}
function renderHomeContinue() {
  const el = $("#home-continue");
  if (!el) return;
  const read = readSet();
  if (!read.size) { el.hidden = true; return; }
  const writtenIds = (p) => p.districts.flatMap((d) => d.topics).filter((id) => content.topics[id] && content.topics[id].status === "written");
  const lastId = [...read].reverse().find((id) => content.topics[id]);
  const lastPlanet = lastId && content.topics[lastId].planet;
  let next = null;
  if (lastPlanet) {
    const p = content.planets.find((x) => x.id === lastPlanet);
    if (p) { const ids = writtenIds(p), at = ids.indexOf(lastId); next = ids.slice(at + 1).find((id) => !read.has(id)) || ids.find((id) => !read.has(id)); }
  }
  if (!next) for (const p of content.planets) { if (p.planned) continue; next = writtenIds(p).find((id) => !read.has(id)); if (next) break; }
  if (!next) { el.hidden = true; return; }
  const t = content.topics[next], p = t.planet && content.planets.find((x) => x.id === t.planet);
  el.hidden = false;
  el.innerHTML = `<h2>Continue where you left off</h2>
    <a class="read-next home-continue-card" href="#/${t.id}"><small>${esc(p ? p.title : "")}</small><b>${esc(t.title)}</b><p>${esc(t.summary || "")}</p><span aria-hidden="true">→</span></a>`;
}
function refreshHomeProgress() {
  const grid = $("#home-subjects");
  if (grid) grid.innerHTML = content.planets.map(planetCard).join("");
  renderHomeContinue();
}

function notFoundView() {
  return `
    <header class="page-head"><p class="kicker">404</p><h2>Nothing here</h2>
    <p class="blurb">That page doesn't exist, or the link is out of date.</p></header>
    <p><a class="chip" href="#/explore">← Browse the knowledge base</a></p>`;
}

// ---------- My path: progress across planets, from the topics you have read to the end (localStorage, this device only)
function pathView() {
  const read = readSet(), explored = content.planets.filter((p) => !p.planned && p.districts.some((d) => d.topics.some((id) => content.topics[id] && content.topics[id].status === "written")));
  const written = (p) => p.districts.flatMap((d) => d.topics).filter((id) => content.topics[id] && content.topics[id].status === "written");
  const total = explored.reduce((n, p) => n + written(p).length, 0), done = explored.reduce((n, p) => n + written(p).filter((id) => read.has(id)).length, 0);
  const lastId = [...read].reverse().find((id) => content.topics[id]), lastPlanet = lastId && content.topics[lastId].planet;
  let next = null;
  if (lastPlanet) { const ids = written(content.planets.find((p) => p.id === lastPlanet)); const at = ids.indexOf(lastId); next = ids.slice(at + 1).find((id) => !read.has(id)) || ids.find((id) => !read.has(id)); }
  if (!next) for (const p of explored) { next = written(p).find((id) => !read.has(id)); if (next) break; }
  const pct = (a, b) => (b ? Math.round((100 * a) / b) : 0);
  const cont = next ? content.topics[next] : null;
  const planetBlock = (p) => {
    const ids = written(p), n = ids.filter((id) => read.has(id)).length;
    return `<section class="path-planet" style="--c:${p.color}">
      <h3>${planetDot(p)}<a href="#/${p.id}">${esc(p.title)}</a><span>${n} of ${ids.length} read</span></h3>
      <div class="pbar" role="progressbar" aria-label="${esc(p.title)} progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct(n, ids.length)}"><i style="width:${pct(n, ids.length)}%"></i></div>
      <details ${n && n < ids.length ? "open" : ""}><summary>Districts</summary>
      ${p.districts.map((d) => { const dids = d.topics.filter((id) => content.topics[id] && content.topics[id].status === "written"), dn = dids.filter((id) => read.has(id)).length; return `<div class="path-district"><h4>${esc(d.title)} <small>${dn}/${dids.length}</small></h4><ul class="chips">${dids.map((id) => `<li><a class="chip ${read.has(id) ? "read" : ""}" href="#/${id}"${read.has(id) ? ' aria-label="' + esc(content.topics[id].title) + ' (read)"' : ""}>${esc(content.topics[id].title)}</a></li>`).join("")}</ul></div>`; }).join("")}
      </details></section>`;
  };
  return `
    <header class="page-head"><p class="kicker">Your progress</p><h2>My path</h2>
    <p class="blurb">${done} of ${total} topics read across ${explored.length} planets. A topic counts as read when you reach the end of it. Progress is kept in this browser only.</p></header>
    <div class="pbar big" role="progressbar" aria-label="Overall progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct(done, total)}"><i style="width:${pct(done, total)}%"></i></div>
    ${cont ? `<a class="read-next path-continue" href="#/${cont.id}"><small>${done ? "Continue where you left off" : "Start here"}</small><b>${esc(cont.title)}</b><p>${esc(cont.summary || "")}</p><span aria-hidden="true">→</span></a>` : `<p class="notice">Every written topic is read. New ones appear here as they are added.</p>`}
    ${explored.map(planetBlock).join("")}
    ${done ? `<p class="source"><button type="button" class="linklike" data-reset-progress>Reset my progress</button></p>` : ""}`;
}

function planetView(p) {
  const read = readSet();
  const prog = subjectProgress(p);
  const mins = (t) => Math.max(1, Math.round((t.words || 0) / 200));
  const topicRow = (id) => {
    const t = content.topics[id], isRead = read.has(id), pct = !isRead ? Math.round(progressFor(id) * 100) : 0;
    return `<li class="topic-row ${t.status}${isRead ? " read" : ""}">
      <a href="#/${id}">
        <span class="tr-icon" aria-hidden="true"></span>
        <span class="tr-title">${esc(t.title)}</span>
        <span class="tr-meta">
          ${t.status === "written" ? `<span class="tr-time">${mins(t)} min</span>` : ""}
          ${isRead ? `<span class="tr-read" aria-label="Read">✓</span>` : pct > 0 ? `<span class="tr-pct">${pct}%</span>` : ""}
        </span>
      </a>
    </li>`;
  };
  const body = p.planned
    ? `<p class="notice">This subject hasn’t been written yet. When notes are added to the vault and assigned to it in <code>.site/planets.json</code>, its topics appear here.</p>`
    : p.districts.map((d) => `
        <section class="district"><h3>${esc(d.title)}</h3>
          <ul class="topic-rows">${d.topics.map(topicRow).join("")}</ul>
        </section>`).join("");
  return `
    <header class="page-head" style="--c:${p.color}">${planetDot(p)}<div><p class="kicker">${STATUS[p.status]}</p><h2>${esc(p.title)}</h2><p class="blurb">${esc(p.blurb)}</p>
    ${prog ? `<div class="pbar" role="progressbar" aria-label="${esc(p.title)} progress" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${prog.pct}"><i style="width:${prog.pct}%"></i></div><p class="meta"><span>${prog.n} of ${prog.total} read</span></p>` : ""}
    </div></header>
    ${body}`;
}

// ---------- subject glossary: every Key term from every written topic in a subject, aggregated client-side
// (the data already lives in content.topics[id].glossary — no build-script change needed).
function subjectGlossaryData(p) {
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

function subjectGlossaryView(p) {
  const terms = subjectGlossaryData(p);
  const topicCount = p.districts.flatMap((d) => d.topics).filter((id) => content.topics[id] && content.topics[id].status === "written").length;
  const body = p.planned
    ? `<p class="notice">This subject hasn’t been written yet. When notes are added to the vault and assigned to it in <code>.site/planets.json</code>, its glossary appears here.</p>`
    : !terms.length
      ? `<p class="notice">No key terms yet.</p>`
      : `<label class="sr-only" for="gfilter">Filter glossary terms</label>
         <input id="gfilter" class="glossary-filter" type="search" placeholder="Filter ${terms.length} terms…" autocomplete="off">
         <p class="glossary-letters" aria-hidden="true">${[...new Set(terms.map((g) => g.term[0].toUpperCase()))].map((l) => `<a href="#gl-${l}">${l}</a>`).join("")}</p>
         <p class="glossary-count" aria-live="polite" id="gcount"></p>
         <dl class="glossary-list" id="glist">
           ${terms.map((g, i) => {
             const letter = g.term[0].toUpperCase();
             const showLetter = i === 0 || terms[i - 1].term[0].toUpperCase() !== letter;
             return `${showLetter ? `<div class="glossary-letter" id="gl-${letter}">${letter}</div>` : ""}
               <div class="glossary-entry" data-term="${esc(g.term.toLowerCase())}">
                 <dt>${esc(g.term)}</dt>
                 ${g.entries.map((e) => `<dd>${esc(e.def)} <a class="glossary-source" href="#/${e.topicId}">from ${esc(e.topicTitle)}</a></dd>`).join("")}
               </div>`;
           }).join("")}
         </dl>`;
  return `
    <header class="page-head" style="--c:${p.color}">${planetDot(p)}<div><p class="kicker">Glossary</p><h2>${esc(p.title)} Glossary</h2>
    <p class="blurb">${terms.length} term${terms.length === 1 ? "" : "s"} across ${topicCount} written topic${topicCount === 1 ? "" : "s"}.</p></div></header>
    ${body}`;
}
function wireGlossaryFilter() {
  const input = $("#gfilter"), list = $("#glist"), count = $("#gcount");
  if (!input || !list) return;
  const entries = [...list.querySelectorAll(".glossary-entry")];
  const letters = [...document.querySelectorAll(".glossary-letter")];
  const apply = () => {
    const q = input.value.trim().toLowerCase();
    let shown = 0;
    for (const el of entries) { const hit = !q || el.dataset.term.includes(q); el.hidden = !hit; if (hit) shown++; }
    for (const l of letters) { const next = l.nextElementSibling; let has = false, el = next; while (el && !el.classList.contains("glossary-letter")) { if (!el.hidden) has = true; el = el.nextElementSibling; } l.hidden = !has; }
    count.textContent = q ? `${shown} of ${entries.length} terms` : "";
  };
  input.addEventListener("input", apply);
}

function topicView(t) {
  const p = t.planet && content.planets.find((x) => x.id === t.planet);
  const flat = p ? p.districts.flatMap((x) => x.topics) : [];
  const at = flat.indexOf(t.id);
  const prev = at > 0 ? content.topics[flat[at - 1]] : null;
  const next = at >= 0 && at < flat.length - 1 ? content.topics[flat[at + 1]] : null;
  const mins = Math.max(1, Math.round(t.words / 200));
  const color = p ? p.color : "#b39cf5";
  const card = (o, cls = "") => `<a class="rc-card ${cls}" href="#/${o.id}" data-topic="${o.id}"><small>${esc(o.district && content.topics[o.id] ? districtTitle(o) : "")}</small><b>${esc(o.title)}</b><p>${esc(o.summary || "Not written yet.")}</p></a>`;
  const more = [...new Set([...t.links, ...t.backlinks])].map((id) => content.topics[id]).filter((o) => o && o.id !== (next && next.id)).slice(0, 6);
  const aiNotice = getMode() === "ai" && !AI_MODE_READY
    ? `<p class="notice">✨ AI Mode is coming soon — ask questions about this topic using your own API key (Anthropic, OpenAI or a local model). <a href="#" data-mode-btn="read">Switch back to Read Mode</a> for now.</p>` : "";
  return `
    <article class="doc topic" style="--c:${color}">
      <header class="doc-head">
        <h1 class="doc-title">${esc(t.title)}</h1>
        <div class="doc-by"><span class="doc-orb" aria-hidden="true"></span><div><b>${p ? esc(p.title) : "AI Base"}</b><span>${mins} min read${at >= 0 ? ` · Topic ${at + 1} of ${flat.length}` : ""}${t.status !== "written" ? ` · ${STATUS[t.status] || t.status}` : ""}</span></div></div>
      </header>
      <figure class="doc-cover" aria-hidden="true">${cover(t.title, color)}</figure>
      <div class="doc-body">
        ${aiNotice}
        ${t.status === "outlined" ? `<p class="notice">This note exists in the vault but is still empty. It will fill in as the knowledge base grows.</p>` : `<div class="prose">${t.html || ""}</div>`}
      </div>
      <footer class="doc-end">
        ${next ? `<a class="read-next" href="#/${next.id}" data-topic="${next.id}"><small>Read next</small><b>${esc(next.title)}</b><p>${esc(next.summary || "")}</p><span aria-hidden="true">→</span></a>` : ""}
        ${more.length ? `<section class="more"><h3>Keep exploring</h3><div class="rc-grid">${more.map((o) => card(o)).join("")}</div></section>` : ""}
        ${prev ? `<p class="doc-prev"><a href="#/${prev.id}">← Previous: ${esc(prev.title)}</a></p>` : ""}
        <p class="source"><a href="${REPO}${encodeURI(t.path)}" target="_blank" rel="noopener">View source note ↗</a></p>
      </footer>
    </article>`;
}
const districtTitle = (o) => { const p = content.planets.find((x) => x.id === o.planet); const d = p && p.districts.find((x) => x.id === o.district); return d && d.title; };

// ---------- article behaviour: reveal on scroll, scroll-spy TOC, reading bar, parallax blobs
let cleanupArticle = null;
function enhanceArticle(topic) {
  if (cleanupArticle) { cleanupArticle(); cleanupArticle = null; }
  const art = view.querySelector(".topic");
  if (!art) return;
  // the end-of-article cards replace the note's own trailing "Related" list (the vault note keeps it)
  const rel = art.querySelector(".prose > h2#related");
  if (rel && art.querySelector(".doc-end .read-next, .doc-end .more")) { while (rel.nextSibling) rel.nextSibling.remove(); rel.remove(); }
  // prerequisites that live on another planet get a small planet tag
  for (const p of art.querySelectorAll(".prose > p")) {
    if (!/^You need:/i.test(p.textContent.trim())) continue;
    p.querySelectorAll('a[href^="#/"]').forEach((a) => {
      const t = content.topics[decodeURIComponent(a.getAttribute("href").slice(2))];
      const pl = t && t.planet && t.planet !== topic.planet && content.planets.find((x) => x.id === t.planet);
      if (pl && !a.nextElementSibling?.classList?.contains("xp")) a.insertAdjacentHTML("afterend", `<span class="xp" title="This prerequisite is on the ${esc(pl.title)} planet">${esc(pl.title)}</span>`);
    });
    break;
  }
  { const nx = art.querySelector(".read-next[data-topic]") || document.querySelector(".read-next[data-topic]"); const nt = nx && content.topics[nx.dataset.topic]; if (nt && nt.status !== "outlined") (window.requestIdleCallback || setTimeout)(() => loadBody(nt).catch(() => {})); }
  const stopBenches = mountBenches(art);
  const stopReader = mountReader({ art, topic: { ...topic, toc: (topic.toc || []).filter((t) => t.id !== "related") }, content, reduce: reduceMotion });
  cleanupArticle = () => { stopReader(); stopBenches(); };
}

// ---------- benches: interactive demos embedded in articles (see benches/kit.js), loaded when scrolled near
function mountBenches(art) {
  const roots = [...art.querySelectorAll(".bench[data-bench]")];
  if (!roots.length) return () => {};
  const cleanups = [];
  let gone = false;
  const load = async (root) => {
    try {
      const mod = await import(`./benches/${root.dataset.bench}.js`);
      if (gone) return;
      const stop = mod.default(root, benchKit);
      if (typeof stop === "function") cleanups.push(stop);
    } catch (err) {
      console.error(`bench ${root.dataset.bench} failed`, err);
      root.classList.add("failed");
    }
  };
  const io = "IntersectionObserver" in window
    ? new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { io.unobserve(e.target); load(e.target); } }), { rootMargin: "300px 0px" })
    : null;
  roots.forEach((r) => (io ? io.observe(r) : load(r)));
  return () => { gone = true; if (io) io.disconnect(); cleanups.forEach((c) => c()); };
}

// ---------- router
const galaxyEl = $("#galaxy");
const planetEl = $("#planet");

function setPlanetUi(p) {
  setProgress(0, p.districts.reduce((n, d) => n + d.topics.length, 0));
  $("#pprompt").hidden = true;
}
let lastProgress = [0, 0];
function setProgress(n, total) {
  lastProgress = [n, total];
  const el = $("#pmeta");
  if (el) el.textContent = `${n} / ${total} topics`;
}

// ---------- navigation bar: Home → Galaxy → Planet → Topic (see nav.js)
function renderNav(info) {
  const el = $("#navbar");
  if (!info) { el.hidden = true; return; }
  const a = (c, cls = "") => c.href
    ? `<a class="${cls}" href="${c.href}"${c.warp ? ` data-warp="${c.warp}"` : ""}${c.board ? " data-board" : ""}${c.title ? ` title="${esc(c.title)}"` : ""}>${esc(c.label)}</a>`
    : `<span class="${cls}" aria-current="page">${esc(c.label)}</span>`;
  el.hidden = false;
  const back = info.back;
  // The icon is what reading pages show (CSS hides it elsewhere); the label stays in the DOM for
  // the clay/3D pages' pill button and, in reading pages, as a visually-hidden string for the
  // anchor's accessible name instead of a floating tooltip-only title.
  el.innerHTML = `
    <a class="nb-back clay-pill" href="${back.href}"${back.warp ? ` data-warp="${back.warp}"` : ""}${back.board ? " data-board" : ""} title="${esc(back.title || back.label)}">
      <svg class="nb-back-icon" viewBox="0 0 20 20" aria-hidden="true"><path d="M12.5 4.5l-6 5.5 6 5.5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
      <span class="nb-back-label">‹ ${esc(back.label)}</span>
    </a>
    <ol class="nb-crumbs clay-pill">${info.crumbs.map((c) => `<li>${a(c)}</li>`).join("")}</ol>
    <span class="nb-actions">${info.progress ? `<span class="clay-pill" id="pmeta" aria-live="off"></span>` : ""}${info.actions.map((c) => a(c, "clay-pill")).join("")}</span>`;
  if (info.progress) setProgress(...lastProgress);
}
$("#navbar").addEventListener("click", (e) => {
  const l = e.target.closest("a[href]");
  if (!l || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
  if (l.hasAttribute("data-board")) { e.preventDefault(); backToGalaxy(); }
  else if (l.dataset.warp) {
    e.preventDefault();
    const id = decodeURIComponent(l.getAttribute("href").slice(2));
    warpTo(l.getAttribute("href"));
  }
});
// Esc always means "go back one level"
addEventListener("keydown", (e) => {
  if (e.key !== "Escape" || e.defaultPrevented || fading || flying || launching) return;
  const b = $("#navbar:not([hidden]) .nb-back");
  if (b) b.click();
});
function showPrompt(info) {
  const el = $("#pprompt");
  if (!info) { el.hidden = true; return; }
  el.hidden = false;
  el.innerHTML = info.kind === "rocket"
    ? `<p class="kicker">Your rocket</p><h3>${esc(info.title)}</h3><p class="blurb">${esc(info.sub)}</p><button class="cta small" data-act="interact">Take off 🚀 <kbd>E</kbd></button>`
    : `<p class="kicker">${esc(info.district)} ${badge(info.status)}</p><h3>${esc(info.title)}</h3><button class="cta small" data-act="interact">Open topic <kbd>E</kbd></button>`;
}
// between the road and a topic: a short fade (the planet scene has already glided to the lodge door)
let fading = false;
async function warpTo(hash) {
  if (fading) return;
  fading = true;
  const white = $("#white");
  white.classList.add("on", "door");
  await new Promise((r) => setTimeout(r, reduceMotion ? 0 : 380));
  location.hash = hash;
  white.classList.remove("on");
  setTimeout(() => { white.classList.remove("door"); fading = false; }, reduceMotion ? 0 : 260);
}
function openTopic(id) { return warpTo(`#/${id}`); }
async function backToGalaxy() {
  $("#white").classList.add("on");
  await new Promise((r) => setTimeout(r, reduceMotion ? 0 : 500));
  location.hash = "#/galaxy";
  $("#white").classList.remove("on");
}

function showGalaxyCard(i) {
  const p = content.planets[i];
  if (!p) return;
  $("#gcard").style.setProperty("--c", p.color);
  $("#gcard").innerHTML = `
    <p class="kicker">${String(i + 1).padStart(2, "0")} / ${content.planets.length} · ${badge(p.status)}</p>
    <h3>${esc(p.title)}</h3>
    <p class="blurb">${esc(p.blurb)}</p>
    <div class="meta">${p.topicCount ? `<span>${p.topicCount} topic${p.topicCount > 1 ? "s" : ""}</span>` : "<span>Not explored yet</span>"}
    <button class="cta small" data-fly="${i}">${p.planned ? "Visit" : "Fly to"} ${esc(p.title)} <span aria-hidden="true">🚀</span></button></div>`;
}

async function flyTo(i) {
  if (flying || !galaxy) return;
  flying = true;
  galaxyEl.classList.add("away");
  await galaxy.select(i);
  flying = false;
  location.hash = `#/${content.planets[i].id}`;
  $("#white").classList.remove("on");
  galaxyEl.classList.remove("away");
}

function route() {
  if (!content) return;
  const [pathPart, query] = decodeURIComponent(location.hash.replace(/^#\/?/, "")).split("?");
  const parts = pathPart.split("/").filter(Boolean);
  const key = parts.join("/");
  const explorerMode = getMode() === "explore";
  const planetObj = parts.length === 1 && content.planets.find((p) => p.id === key);
  // checked ahead of any topic lookup: a topic id is also <planet>/<slug>-shaped, so a sub-route always wins
  const glossaryPlanet = parts.length === 2 && parts[1] === "glossary" && content.planets.find((p) => p.id === parts[0]);
  const isPlanet = !!(explorerMode && planetScene && planetObj && !planetObj.planned && query !== "text");
  const isHome = parts.length === 0;
  const isGalaxy = explorerMode && key === "galaxy" && !!galaxy;
  document.body.classList.toggle("route-home", isHome);
  document.body.classList.toggle("route-galaxy", isGalaxy);
  document.body.classList.toggle("route-planet", isPlanet);
  document.body.classList.toggle("route-path", key === "path");
  document.body.classList.toggle("route-topic", !isHome && !isGalaxy && !isPlanet && !!content.topics[key]);
  document.body.classList.toggle("reading", !isHome && !isGalaxy && !isPlanet);
  planetEl.hidden = !isPlanet;
  home.hidden = !isHome;
  galaxyEl.hidden = !isGalaxy;
  view.hidden = isHome || isGalaxy || isPlanet;
  if (stage) stage.setActive(isGalaxy ? galaxy : isPlanet ? planetScene : null);
  if (galaxy) { if (isGalaxy) galaxy.enter(); else galaxy.leave(); }
  if (planetScene) {
    if (isPlanet) {
      if (planetKey !== key) { planetKey = key; setPlanetUi(planetObj); planetScene.enter(planetObj); syncPlanetHud(); }
    } else { planetScene.leave(); planetKey = null; }
  }
  renderNav(navFor({ key, query, content, has3d: !!galaxy && explorerMode }));
  if (isPlanet) { setTitle(`${planetObj.title} · AI Base`); return; }
  if (isHome) { refreshHomeProgress(); setTitle("AI Base"); return; }
  if (isGalaxy) { setTitle("Galaxy · AI Base"); return; }

  const wanted = !glossaryPlanet && content.topics[key];
  if (wanted && wanted.html === undefined && wanted.status !== "outlined") {
    const at = location.hash;
    view.innerHTML = `<p class="notice" role="status">Loading…</p>`;
    setTitle(`${wanted.title} · AI Base`);
    loadBody(wanted).then(() => { if (location.hash === at) route(); }, () => { if (location.hash === at) view.innerHTML = `<p class="notice">This topic could not be loaded. <a href="${at}">Try again</a></p>`; });
    return;
  }
  let html, title;
  if (key === "path") { html = pathView(); title = "My path"; }
  else if (key === "galaxy" || key === "list" || key === "explore") { html = galaxyView(); title = "Explore"; }
  else if (glossaryPlanet) { html = subjectGlossaryView(glossaryPlanet); title = `${glossaryPlanet.title} Glossary`; }
  else if (content.topics[key]) { html = topicView(content.topics[key]); title = content.topics[key].title; }
  else if (content.planets.find((p) => p.id === key)) { const p = content.planets.find((x) => x.id === key); html = planetView(p); title = p.title; }
  else { html = notFoundView(); title = "Not found"; }
  view.innerHTML = html;
  { const h = view.querySelector("h1, h2"); if (h && !document.body.classList.contains("searching")) { h.tabIndex = -1; h.focus({ preventScroll: true }); } }
  if (glossaryPlanet) wireGlossaryFilter();
  if (content.topics[key] && !glossaryPlanet) { enhanceArticle(content.topics[key]); if (planetScene && content.topics[key].planet) planetScene.remember(content.topics[key].planet, key); }
  else if (cleanupArticle) { cleanupArticle(); cleanupArticle = null; }
  setTitle(`${title} · AI Base`);
  scrollTo(0, 0);
  if (content.topics[key] && query && query.startsWith("at=")) { const target = document.getElementById(query.slice(3)); if (target) requestAnimationFrame(() => target.scrollIntoView()); }
  view.classList.remove("enter"); void view.offsetWidth; view.classList.add("enter");
}

// in-page TOC anchors must not change the hash route
document.addEventListener("click", (e) => {
  const a = e.target.closest("a[data-scroll]");
  if (!a) return;
  e.preventDefault();
  const el = document.getElementById(a.dataset.scroll);
  if (el) el.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
});
addEventListener("hashchange", route);
view.addEventListener("click", (e) => {
  if (!e.target.closest("[data-reset-progress]")) return;
  if (!confirm("Reset your reading progress on this device?")) return;
  try {
    localStorage.removeItem("ai-base-read");
    localStorage.removeItem("ai-base-progress");
    for (const k of Object.keys(localStorage)) if (k.startsWith("ai-base-pos:")) localStorage.removeItem(k);
  } catch { /* ignore */ }
  route();
});

// ---------- from a topic back to a planet's road
view.addEventListener("click", (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || !view.querySelector(".topic")) return;
  const a = e.target.closest('a[href^="#/"]');
  if (!a || a.dataset.scroll) return;
  const href = decodeURIComponent(a.getAttribute("href").slice(2));
  const topic = content.topics[href];
  const planet = content.planets.find((p) => p.id === href);
  if (topic) return; // topic to topic is a plain page change
  if (planet && planetScene && !planet.planned) { e.preventDefault(); warpTo(`#/${href}`); }
});
// ---------- mode pill (header): one segmented control for the three modes, replacing the old binary
// Explorer-Mode toggle button. The choice persists via ai-base-mode (see getMode/setMode above).
// Delegated on document (not just the header's own buttons) so an inline "Switch back to Read Mode"
// link, such as the AI Mode "coming soon" notice in topicView(), works the same way.
function syncModePill() {
  const m = getMode();
  for (const b of document.querySelectorAll("[data-mode-btn]")) b.setAttribute("aria-checked", String(b.dataset.modeBtn === m));
}
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-mode-btn]");
  if (!b) return;
  e.preventDefault();
  const next = b.dataset.modeBtn;
  if (next === getMode()) return;
  setMode(next);
  syncModePill();
  const [pathPart] = decodeURIComponent(location.hash.replace(/^#\/?/, "")).split("?");
  const key = pathPart.split("/").filter(Boolean).join("/");
  // leaving the catalog text view while switching on Explorer Mode lands straight in the 3D galaxy
  if (next === "explore" && galaxy && (key === "list" || key === "explore")) { location.hash = "#/galaxy"; return; }
  route();
});
syncModePill();

// ---------- more menu (header): My path + GitHub, tucked behind one button instead of sitting
// permanently in the header row.
{
  const btn = $("[data-more]"), pop = $("[data-more-popover]");
  if (btn && pop) {
    const close = () => { pop.hidden = true; btn.setAttribute("aria-expanded", "false"); };
    btn.addEventListener("click", (e) => {
      e.stopPropagation();
      const open = pop.hidden;
      pop.hidden = !open;
      btn.setAttribute("aria-expanded", String(open));
    });
    document.addEventListener("click", (e) => { if (!pop.hidden && !pop.contains(e.target) && e.target !== btn) close(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !pop.hidden) { close(); btn.focus(); } });
    window.addEventListener("hashchange", close);
  }
}

// ---------- launch: the home page carries no idle 3D render; the rocket only appears for this one
// transient transition, triggered by an explicit click, then the canvas hands off to the galaxy scene.
$("#home-launch").addEventListener("click", async () => {
  if (launching) return;
  setMode("explore");
  syncModeToggle();
  if (!homeScene || !stage) { location.hash = "#/galaxy"; return; }
  launching = true;
  $("#home-launch").disabled = true;
  document.body.classList.add("launching");
  stage.setActive(homeScene);
  home.classList.add("away");
  await homeScene.launch();
  launching = false;
  location.hash = "#/galaxy";
  $("#white").classList.remove("on");
  home.classList.remove("away");
  document.body.classList.remove("launching");
  $("#home-launch").disabled = false;
  homeScene.reset();
});

// ---------- PWA: app-shell + visited-content offline caching (sw.js); never blocks the page.
if ("serviceWorker" in navigator) navigator.serviceWorker.register("/sw.js").catch(() => {});

// ---------- boot
try {
  await loading;
} catch (err) {
  console.warn("content.json failed to load; in development, run `npm run content` in .site/", err);
  document.body.classList.add("no-gl");
  home.innerHTML = `<h1>Something went wrong</h1><p class="lede">The site couldn’t load just now. Please <a href="${location.pathname}">refresh the page</a> — if it keeps happening, let us know.</p>`;
}
if (content) {
  mountSearch({ content, onGo: (d) => { location.hash = `#/${d.id}`; } });
  renderHomeStatic();
  refreshHomeProgress();
  route();
  try {
    const { createStage } = await import("./scenes/stage.js");
    const homeMod = await import("./scenes/home.js");
    const galaxyMod = await import("./scenes/galaxy.js");
    const planetMod = await import("./scenes/planet.js");
    stage = createStage($("#scene"));
    homeScene = homeMod.create({ onWhiteout: () => $("#white").classList.add("on") });
    galaxy = galaxyMod.create({
      planets: content.planets,
      labelsEl: $("#glabels"),
      onFocus: showGalaxyCard,
      onSelect: flyTo,
      onSun: () => { location.hash = "#/ai"; },
      onWhiteout: () => $("#white").classList.add("on")
    });
    planetScene = planetMod.create({
      content,
      labelsEl: $("#tlabels"),
      radarEl: $("#pmap"),
      onDetail: (d) => { $("#pdetail").value = d; planetEl.dataset.detail = d; },
      onNear: showPrompt,
      onProgress: setProgress,
      onOpen: openTopic,
      onBack: backToGalaxy
    });
    setupPlanetHud();
    if (new URLSearchParams(location.search).has("debug")) setupDebug();
    theme.subscribe((t) => { homeScene.applyTheme(t); galaxy.applyTheme(t); planetScene.applyTheme(t); });
    document.body.classList.add("gl");
    route();
  } catch (err) {
    console.warn("3D unavailable, using the text version.", err);
    document.body.classList.add("no-gl");
    stage = homeScene = galaxy = planetScene = null;
    route();
  }
}

// ---------- planet HUD: radar, weather, detail, connections
function syncPlanetHud() {
  if (!planetScene) return;
  const h = planetScene.hud, w = planetScene.weather;
  $("#pweather").value = w.mode; $("#pdetail").value = h.detail; $("#pconn").checked = h.conn; $("#pradar").checked = h.radar;
  $("#pmap").hidden = !h.radar;
  planetEl.dataset.weather = w.resolved; planetEl.dataset.detail = h.detail;
}
function setupPlanetHud() {
  $("#pweather").addEventListener("change", (e) => { planetScene.setWeather(e.target.value); syncPlanetHud(); });
  $("#pdetail").addEventListener("change", (e) => { planetScene.setDetail(e.target.value); syncPlanetHud(); });
  $("#pconn").addEventListener("change", (e) => planetScene.setConnections(e.target.checked));
  $("#pradar").addEventListener("change", (e) => { planetScene.setRadar(e.target.checked); syncPlanetHud(); });
  $("#phudtoggle").addEventListener("click", () => { const o = $("#phud").classList.toggle("open"); $("#phudtoggle").setAttribute("aria-expanded", o); });
  addEventListener("keydown", (e) => {
    if ((e.key === "m" || e.key === "M") && !planetEl.hidden && !e.target.closest("textarea, select, input:not([type=checkbox])") && !e.ctrlKey && !e.metaKey) $("#pradar").click();
  });
  syncPlanetHud();
}
// ?debug: frame rate, draw calls and triangles, and the scene objects for tests
function setupDebug() {
  window.__aiBase = { stage, planetScene };
  const box = document.createElement("pre");
  box.id = "dbg"; box.setAttribute("aria-hidden", "true");
  document.body.append(box);
  let frames = 0, last = performance.now();
  const count = () => { frames++; requestAnimationFrame(count); };
  count();
  setInterval(() => {
    const now = performance.now(), fps = (frames * 1000) / (now - last); frames = 0; last = now;
    const i = stage.renderer.info;
    box.textContent = `${fps.toFixed(0)} fps\n${i.render.calls} draw calls\n${(i.render.triangles / 1000).toFixed(0)}k tris`;
    box.dataset.calls = i.render.calls; box.dataset.fps = fps.toFixed(1);
  }, 500);
}

// ---------- galaxy controls
$("#gprev").addEventListener("click", () => galaxy && galaxy.step(-1));
$("#gnext").addEventListener("click", () => galaxy && galaxy.step(1));
galaxyEl.addEventListener("click", (e) => { const b = e.target.closest("[data-fly]"); if (b) flyTo(+b.dataset.fly); });
addEventListener("keydown", (e) => {
  if (!galaxy || galaxyEl.hidden || flying) return;
  if (e.key === "ArrowRight") galaxy.step(1);
  else if (e.key === "ArrowLeft") galaxy.step(-1);
  else if (e.key === "Enter" && !e.target.closest("button, a")) flyTo(galaxy.focus());
});

// ---------- planet controls
$("#pprev").addEventListener("click", () => planetScene && planetScene.step(-1));
$("#pnext").addEventListener("click", () => planetScene && planetScene.step(1));
$("#pprompt").addEventListener("click", (e) => { if (e.target.closest("[data-act=interact]") && planetScene) planetScene.interact(); });
{
  // touch joystick
  const joy = $("#pjoy"), knob = joy.firstElementChild;
  let id = null;
  const set = (e) => {
    const r = joy.getBoundingClientRect(), R = r.width / 2;
    let dx = e.clientX - (r.left + R), dy = e.clientY - (r.top + R);
    const d = Math.hypot(dx, dy), k = d > R * 0.8 ? (R * 0.8) / d : 1;
    dx *= k; dy *= k;
    knob.style.transform = `translate(${dx}px, ${dy}px)`;
    planetScene && planetScene.setStick(dx / (R * 0.8), dy / (R * 0.8));
  };
  joy.addEventListener("pointerdown", (e) => { id = e.pointerId; joy.setPointerCapture(id); set(e); });
  joy.addEventListener("pointermove", (e) => { if (e.pointerId === id) set(e); });
  const end = (e) => { if (e.pointerId !== id) return; id = null; knob.style.transform = ""; planetScene && planetScene.setStick(0, 0); };
  joy.addEventListener("pointerup", end); joy.addEventListener("pointercancel", end);
}
