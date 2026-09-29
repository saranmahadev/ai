import { stages, REPO, statusLabel } from "./data.js";

const $ = (s, r = document) => r.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

function stageHTML(s, headingId) {
  const groups = s.groups.map((g) =>
    `<section class="group"><h3>${esc(g.name)}</h3><ul>${g.items.map((i) => `<li>${esc(i)}</li>`).join("")}</ul></section>`
  ).join("");
  const link = s.note
    ? `<a class="note-link" href="${REPO}${encodeURI(s.note)}" target="_blank" rel="noopener">Open note ↗</a>`
    : "";
  return `
    <p class="kicker" style="--c:${s.color}">${s.id} · ${esc(s.kicker)}</p>
    <h2 id="${headingId}">${esc(s.title)}</h2>
    <p class="status ${s.status}">${statusLabel[s.status]}</p>
    <p class="blurb">${esc(s.blurb)}</p>
    ${groups}
    ${link}`;
}

// Stage nav
$("#stages ol").innerHTML = stages.map((s, i) =>
  `<li><button data-i="${i}" style="--c:${s.color}" aria-label="${esc(s.title)}"><span>${s.id}</span><b>${esc(s.title)}</b></button></li>`
).join("");

// Text version (screen readers, no-WebGL fallback)
$("#list").innerHTML = stages.map((s, i) =>
  `<article id="stage-${i}" class="card" style="--c:${s.color}">${stageHTML(s, `list-title-${i}`)}</article>`
).join("");

const panel = $("#panel");
const panelBody = $("#panel-body");
let openIndex = -1;

function openStage(i) {
  openIndex = i;
  const s = stages[i];
  panel.style.setProperty("--c", s.color);
  panelBody.innerHTML = stageHTML(s, "panel-title");
  panel.hidden = false;
  requestAnimationFrame(() => panel.classList.add("open"));
}
function closeStage() {
  openIndex = -1;
  panel.classList.remove("open");
  setTimeout(() => { if (openIndex < 0) panel.hidden = true; }, 250);
}
$("#close").addEventListener("click", closeStage);
addEventListener("keydown", (e) => { if (e.key === "Escape") closeStage(); });

let scene = null;
function setActive(i) {
  document.querySelectorAll("#stages button").forEach((b, n) => {
    if (n === i) b.setAttribute("aria-current", "step"); else b.removeAttribute("aria-current");
  });
  $("#where").textContent = i < 0 ? "Start" : `${stages[i].id} · ${stages[i].title}`;
}
setActive(-1);

$("#stages").addEventListener("click", (e) => {
  const b = e.target.closest("button");
  if (!b) return;
  const i = +b.dataset.i;
  if (scene) { scene.jumpTo(i); openStage(i); }
  else document.getElementById(`stage-${i}`).scrollIntoView({ behavior: "smooth" });
});
$("#start").addEventListener("click", () => scene ? scene.jumpTo(0) : $("#list").scrollIntoView({ behavior: "smooth" }));

const hero = $("#hero");
const bar = $("#bar");

try {
  const mod = await import("./scene.js");
  scene = mod.start({
    stages,
    onSelect: openStage,
    onActive: setActive,
    onProgress: (p) => {
      bar.style.transform = `scaleX(${p})`;
      hero.style.opacity = String(Math.max(0, 1 - p * 14));
      hero.style.pointerEvents = p > 0.05 ? "none" : "auto";
    }
  });
  document.body.classList.add("gl");
} catch (err) {
  console.warn("3D scene unavailable, showing text roadmap.", err);
  document.body.classList.add("no-gl");
}
