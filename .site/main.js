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
    <nav class="crumbs"><a href="#/galaxy">Galaxy</a> / ${esc(p.title)}${planetScene && !p.planned ? ` · <a href="#/${p.id}">Walk the road →</a>` : ""}</nav>
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
const galaxyEl = $("#galaxy");
const planetEl = $("#planet");

function setPlanetUi(p) {
  $("#pmeta").textContent = p.title;
  $("#plist").href = `#/${p.id}?text`;
  $("#pprompt").hidden = true;
}
function showPrompt(info) {
  const el = $("#pprompt");
  if (!info) { el.hidden = true; return; }
  el.hidden = false;
  el.innerHTML = info.kind === "rocket"
    ? `<p class="kicker">Your rocket</p><h3>${esc(info.title)}</h3><p class="blurb">${esc(info.sub)}</p><button class="cta small" data-act="interact">Take off 🚀 <kbd>E</kbd></button>`
    : `<p class="kicker">${esc(info.district)} ${badge(info.status)}</p><h3>${esc(info.title)}</h3><button class="cta small" data-act="interact">Open topic <kbd>E</kbd></button>`;
}
async function openTopic(id) {
  if (flying) return;
  flying = true;
  $("#white").classList.add("on");
  await new Promise((r) => setTimeout(r, reduceMotion ? 0 : 650));
  flying = false;
  location.hash = `#/${id}`;
  $("#white").classList.remove("on");
}
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
  if (isPlanet) { document.title = `${planetObj.title} · AI Knowledge Brain`; return; }
  if (isHome) { document.title = "AI Knowledge Brain"; return; }
  if (isGalaxy) { document.title = "Galaxy · AI Knowledge Brain"; return; }

  let html, title;
  if (key === "galaxy" || key === "list") { html = galaxyView(); title = "Planets"; }
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
      onProgress: (i, n) => { $("#pmeta").textContent = `${content.planets.find((p) => p.id === planetKey).title} · ${i} / ${n}`; },
      onOpen: openTopic,
      onBack: backToGalaxy
    });
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
