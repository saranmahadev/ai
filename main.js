// Router + views. The 3D scenes plug in per route; the text views below are also the permanent accessible fallback.
const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const STATUS = { written: "Written", outlined: "Outlined", index: "Index", planned: "Undiscovered", explored: "Explored" };
const REPO = "https://github.com/saranmahadev/ai/blob/main/";

const view = $("#view");
const home = $("#home");
let content = null;
let homeScene = null;
let launching = false;

const loading = fetch("content.json").then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); }).then((c) => (content = c));

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
    <nav class="crumbs"><a href="#/galaxy">Galaxy</a> / ${esc(p.title)}</nav>
    <header class="page-head" style="--c:${p.color}">${planetDot(p)}<div><p class="kicker">${STATUS[p.status]}</p><h2>${esc(p.title)}</h2><p class="blurb">${esc(p.blurb)}</p></div></header>
    ${body}`;
}

function topicView(t) {
  const p = t.planet && content.planets.find((x) => x.id === t.planet);
  const d = p && p.districts.find((x) => x.id === t.district);
  const chip = (id) => { const o = content.topics[id]; return o ? `<li><a class="chip ${o.status}" href="#/${id}">${esc(o.title)}</a></li>` : ""; };
  return `
    <nav class="crumbs"><a href="#/galaxy">Galaxy</a>${p ? ` / <a href="#/${p.id}">${esc(p.title)}</a>` : ""}${d && d.title !== p.title ? ` / ${esc(d.title)}` : ""} / ${esc(t.title)}</nav>
    <article class="article" style="--c:${p ? p.color : "#b39cf5"}">
      <header><p class="kicker">${p ? esc(p.title) : "Overview"} ${badge(t.status)}</p><h2>${esc(t.title)}</h2></header>
      ${t.toc.length > 2 ? `<aside class="toc"><b>On this page</b>${t.toc.map((h) => `<a class="d${h.depth}" href="#/${t.id}" data-scroll="${h.id}">${esc(h.text)}</a>`).join("")}</aside>` : ""}
      ${t.status === "outlined" ? `<p class="notice">This note exists in the vault but is still empty. It will fill in as the knowledge base grows.</p>` : `<div class="prose">${t.html}</div>`}
      ${t.links.length ? `<section class="related"><h3>Related topics</h3><ul class="chips">${t.links.map(chip).join("")}</ul></section>` : ""}
      ${t.backlinks.length ? `<section class="related"><h3>Mentioned in</h3><ul class="chips">${t.backlinks.map(chip).join("")}</ul></section>` : ""}
      <p class="source"><a href="${REPO}${encodeURI(t.path)}" target="_blank" rel="noopener">View source note ↗</a></p>
    </article>`;
}

// ---------- router
function route() {
  if (!content) return;
  const parts = decodeURIComponent(location.hash.replace(/^#\/?/, "")).split("/").filter(Boolean);
  const key = parts.join("/");
  const isHome = parts.length === 0;
  document.body.classList.toggle("route-home", isHome);
  home.hidden = !isHome;
  view.hidden = isHome;
  if (homeScene) homeScene.setActive(isHome && !launching);
  if (isHome) { document.title = "AI Knowledge Brain"; return; }

  let html, title;
  if (key === "galaxy") { html = galaxyView(); title = "Galaxy"; }
  else if (content.topics[key]) { html = topicView(content.topics[key]); title = content.topics[key].title; }
  else if (content.planets.find((p) => p.id === key)) { const p = content.planets.find((x) => x.id === key); html = planetView(p); title = p.title; }
  else { html = `<p class="notice">Nothing here. <a href="#/galaxy">Back to the galaxy</a></p>`; title = "Not found"; }
  view.innerHTML = html;
  document.title = `${title} · AI Knowledge Brain`;
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
  home.innerHTML = `<h1>Almost there</h1><p class="lede">The content index hasn’t been built. Run <code>npm run content</code> in <code>.site/</code>.</p>`;
}
if (content) {
  route();
  try {
    const mod = await import("./scenes/home.js");
    homeScene = mod.start({ canvas: $("#scene"), onWhiteout: () => $("#white").classList.add("on") });
    homeScene.setActive(!location.hash.replace(/^#\/?/, ""));
    document.body.classList.add("gl");
  } catch (err) {
    console.warn("3D unavailable, using the text version.", err);
    document.body.classList.add("no-gl");
  }
}
