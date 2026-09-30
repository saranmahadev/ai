import { theme } from "./theme.js";
import { navFor } from "./nav.js";
import * as benchKit from "./benches/kit.js";

// Router + views. The 3D scenes plug in per route; the text views below are also the permanent accessible fallback.
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const STATUS = { written: "Written", outlined: "Outlined", index: "Index", planned: "Undiscovered", explored: "Explored" };
const REPO = "https://github.com/saranmahadev/ai/blob/main/";

const view = $("#view");
const home = $("#home");
let content = null;
let stage = null, homeScene = null, galaxy = null, planetScene = null, planetKey = null;
let launching = false, flying = false;
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

const loading = fetch("content.json").then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); }).then((c) => (content = c));

function setTitle(t) { document.title = t; $("#announce").textContent = t; }

const badge = (s) => `<span class="badge ${s}">${STATUS[s] || s}</span>`;
const planetDot = (p) => `<span class="orb" style="--c:${p.color}" aria-hidden="true"></span>`;

// ---------- views
function galaxyView() {
  const ai = content.topics.ai;
  return `
    <header class="page-head"><p class="kicker">The galaxy</p><h2>Choose a planet</h2>
    <p class="blurb">${content.stats.explored} of ${content.stats.planets} planets explored · ${content.stats.written} topics written.</p></header>
    <div class="planet-grid">
      ${content.planets.map((p) => `
        <a class="card planet-card ${p.planned ? "planned" : ""}" href="#/${p.id}" style="--c:${p.color}">
          ${planetDot(p)}
          <div><h3>${esc(p.title)}</h3><p>${esc(p.blurb)}</p>
          <div class="meta">${badge(p.status)}${p.topicCount ? `<span>${p.topicCount} topic${p.topicCount > 1 ? "s" : ""}</span>` : ""}</div></div>
        </a>`).join("")}
    </div>
    ${ai ? `<p class="big-picture"><a class="clay-pill" href="#/ai">Read “${esc(ai.title)}” →</a></p>` : ""}`;
}

function planetView(p) {
  const body = p.planned
    ? `<p class="notice">This planet hasn’t been explored yet. When notes are added to the vault and assigned to it in <code>.site/planets.json</code>, its road appears here.</p>`
    : p.districts.map((d) => `
        <section class="district"><h3>${esc(d.title)}</h3>
          <ul class="chips">${d.topics.map((id) => { const t = content.topics[id]; return `<li><a class="chip ${t.status}" href="#/${id}">${esc(t.title)}</a></li>`; }).join("")}</ul>
        </section>`).join("");
  return `
    <header class="page-head" style="--c:${p.color}">${planetDot(p)}<div><p class="kicker">${STATUS[p.status]}</p><h2>${esc(p.title)}</h2><p class="blurb">${esc(p.blurb)}</p></div></header>
    ${body}`;
}

function topicView(t) {
  const p = t.planet && content.planets.find((x) => x.id === t.planet);
  const d = p && p.districts.find((x) => x.id === t.district);
  const link = (id) => { const o = content.topics[id]; return o ? `<li><a class="chip ${o.status}" href="#/${id}">${esc(o.title)}</a></li>` : ""; };
  const flat = p ? p.districts.flatMap((x) => x.topics) : [];
  const at = flat.indexOf(t.id);
  const prev = at > 0 ? content.topics[flat[at - 1]] : null;
  const next = at >= 0 && at < flat.length - 1 ? content.topics[flat[at + 1]] : null;
  const mins = Math.max(1, Math.round(t.words / 200));
  const card = (o, dir) => o ? `<a class="pager-card ${dir}" href="#/${o.id}"><small>${dir === "prev" ? "Previous" : "Next"}</small><b>${esc(o.title)}</b></a>` : "<span></span>";
  const hasToc = t.toc.length > 2;
  const tocLinks = t.toc.map((h) => `<a class="d${h.depth}" href="#/${t.id}" data-scroll="${h.id}">${esc(h.text)}</a>`).join("");
  return `
    <article class="doc topic" style="--c:${p ? p.color : "#b39cf5"}">
      <header class="doc-head">
        <p class="doc-kicker">${p ? esc(p.title) : "Overview"}${d && d.title !== p.title ? ` · ${esc(d.title)}` : ""}</p>
        <h1 class="doc-title">${esc(t.title)}</h1>
        <p class="doc-meta"><span>${mins} min read</span>${at >= 0 ? `<span>Topic ${at + 1} of ${flat.length}</span>` : ""}${t.status !== "written" ? badge(t.status) : ""}</p>
      </header>
      ${hasToc ? `<details class="toc toc-inline"><summary>On this page</summary><nav aria-label="On this page">${tocLinks}</nav></details>` : ""}
      <div class="doc-body ${hasToc ? "has-toc" : ""}">
        ${t.status === "outlined" ? `<p class="notice">This note exists in the vault but is still empty. It will fill in as the knowledge base grows.</p>` : `<div class="prose">${t.html}</div>`}
        ${hasToc ? `<aside class="toc toc-side" aria-label="On this page"><b>On this page</b>${tocLinks}</aside>` : ""}
      </div>
      ${t.links.length ? `<section class="related"><h3>Related topics</h3><ul class="chips">${t.links.map(link).join("")}</ul></section>` : ""}
      ${t.backlinks.length ? `<section class="related"><h3>Mentioned in</h3><ul class="chips">${t.backlinks.map(link).join("")}</ul></section>` : ""}
      ${prev || next ? `<nav class="pager" aria-label="Neighbouring topics">${card(prev, "prev")}${card(next, "next")}</nav>` : ""}
      <p class="source"><a href="${REPO}${encodeURI(t.path)}" target="_blank" rel="noopener">View source note ↗</a></p>
    </article>`;
}

// ---------- article behaviour: reveal on scroll, scroll-spy TOC, reading bar, parallax blobs
let cleanupArticle = null;
function enhanceArticle() {
  if (cleanupArticle) { cleanupArticle(); cleanupArticle = null; }
  const art = view.querySelector(".topic");
  if (!art) return;
  const bar = $("#readbar");
  bar.style.setProperty("--c", art.style.getPropertyValue("--c"));
  const prose = art.querySelector(".prose");
  const heads = prose ? [...prose.querySelectorAll("h1,h2,h3")].filter((h) => h.id) : [];
  const links = [...art.querySelectorAll(".toc a[data-scroll]")];
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
    let cur = null;
    for (const h of heads) if (h.getBoundingClientRect().top < 150) cur = h.id;
    links.forEach((a) => a.classList.toggle("active", a.dataset.scroll === cur));
  };
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();
  const stopBenches = mountBenches(art);
  cleanupArticle = () => { removeEventListener("scroll", onScroll); stopBenches(); bar.style.transform = "scaleX(0)"; };
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
  el.innerHTML = `
    ${a({ ...info.back, label: "‹ " + info.back.label }, "nb-back clay-pill")}
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
  const planetObj = parts.length === 1 && content.planets.find((p) => p.id === key);
  const isPlanet = !!(planetScene && planetObj && !planetObj.planned && query !== "text");
  const isHome = parts.length === 0;
  const isGalaxy = key === "galaxy" && !!galaxy;
  document.body.classList.toggle("route-home", isHome);
  document.body.classList.toggle("route-galaxy", isGalaxy);
  document.body.classList.toggle("route-planet", isPlanet);
  document.body.classList.toggle("route-topic", !isHome && !isGalaxy && !isPlanet && !!content.topics[key]);
  document.body.classList.toggle("reading", !isHome && !isGalaxy && !isPlanet);
  planetEl.hidden = !isPlanet;
  home.hidden = !isHome;
  galaxyEl.hidden = !isGalaxy;
  view.hidden = isHome || isGalaxy || isPlanet;
  if (stage) stage.setActive(isHome ? homeScene : isGalaxy ? galaxy : isPlanet ? planetScene : null);
  if (galaxy) { if (isGalaxy) galaxy.enter(); else galaxy.leave(); }
  if (planetScene) {
    if (isPlanet) {
      if (planetKey !== key) { planetKey = key; setPlanetUi(planetObj); planetScene.enter(planetObj); }
    } else { planetScene.leave(); planetKey = null; }
  }
  renderNav(navFor({ key, query, content, has3d: !!galaxy }));
  if (isPlanet) { setTitle(`${planetObj.title} · AI Base`); return; }
  if (isHome) { setTitle("AI Base"); return; }
  if (isGalaxy) { setTitle("Galaxy · AI Base"); return; }

  let html, title;
  if (key === "galaxy" || key === "list") { html = galaxyView(); title = "Planets"; }
  else if (content.topics[key]) { html = topicView(content.topics[key]); title = content.topics[key].title; }
  else if (content.planets.find((p) => p.id === key)) { const p = content.planets.find((x) => x.id === key); html = planetView(p); title = p.title; }
  else { html = `<p class="notice">Nothing here. <a href="#/galaxy">Back to the galaxy</a></p>`; title = "Not found"; }
  view.innerHTML = html;
  { const h = view.querySelector("h1, h2"); if (h) { h.tabIndex = -1; h.focus({ preventScroll: true }); } }
  if (content.topics[key]) { enhanceArticle(); if (planetScene && content.topics[key].planet) planetScene.remember(content.topics[key].planet, key); }
  else if (cleanupArticle) { cleanupArticle(); cleanupArticle = null; }
  setTitle(`${title} · AI Base`);
  scrollTo(0, 0);
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
// ---------- launch
$("#launch").addEventListener("click", async () => {
  if (launching) return;
  if (!homeScene) { location.hash = "#/galaxy"; return; }
  launching = true;
  $("#launch").disabled = true;
  home.classList.add("away");
  await homeScene.launch();
  launching = false;
  location.hash = "#/galaxy";
  $("#white").classList.remove("on");
  home.classList.remove("away");
  $("#launch").disabled = false;
  homeScene.reset();
});

// ---------- boot
try {
  await loading;
} catch (err) {
  console.warn("content.json missing; run `npm run content` in .site/", err);
  document.body.classList.add("no-gl");
  home.innerHTML = `<h1>Almost there</h1><p class="lede">The content index hasn’t been built. Run <code>npm run content</code> in <code>.site/</code>.</p>`;
}
if (content) {
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
      onNear: showPrompt,
      onProgress: setProgress,
      onOpen: openTopic,
      onBack: backToGalaxy
    });
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
