// Generated cover art for articles: an abstract "planet and orbits" composition, seeded from the title so every
// topic has its own, and coloured from its planet. Pure SVG, no images and no external requests.

function hash(str) {
  let h = 2166136261;
  for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const toRgb = (hex) => { const n = parseInt(hex.replace("#", ""), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; };
const mix = (a, b, t) => { const A = toRgb(a), B = toRgb(b); return "#" + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, "0")).join(""); };

export function cover(title, color = "#b39cf5") {
  const r = rng(hash(title));
  const W = 1200, H = 420;
  const light = mix(color, "#ffffff", 0.78), mid = mix(color, "#ffffff", 0.35), deep = mix(color, "#2a2350", 0.55), warm = mix(color, "#ffd9a8", 0.55);
  const id = "c" + hash(title).toString(36);
  const blobs = Array.from({ length: 5 + Math.floor(r() * 3) }, (_, i) => {
    const cx = r() * W, cy = r() * H, rad = 60 + r() * 170, fill = [light, mid, warm, deep][Math.floor(r() * 4)], op = 0.22 + r() * 0.4;
    return `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${rad.toFixed(0)}" fill="${fill}" opacity="${op.toFixed(2)}"/>`;
  }).join("");
  const px = 620 + r() * 380, py = 120 + r() * 170, pr = 58 + r() * 46, tilt = -25 + r() * 50;
  const rings = [1.7, 2.35].map((k, i) => `<ellipse cx="${px.toFixed(0)}" cy="${py.toFixed(0)}" rx="${(pr * k * 1.5).toFixed(0)}" ry="${(pr * k * 0.42).toFixed(0)}" fill="none" stroke="#ffffff" stroke-opacity="${(0.55 - i * 0.2).toFixed(2)}" stroke-width="${2 - i * 0.5}" transform="rotate(${(tilt + i * 6).toFixed(1)} ${px.toFixed(0)} ${py.toFixed(0)})"/>`).join("");
  const moons = Array.from({ length: 2 + Math.floor(r() * 3) }, () => {
    const a = r() * Math.PI * 2, d = pr * (1.9 + r() * 1.2);
    return `<circle cx="${(px + Math.cos(a) * d * 1.4).toFixed(0)}" cy="${(py + Math.sin(a) * d * 0.5).toFixed(0)}" r="${(7 + r() * 12).toFixed(0)}" fill="#ffffff" opacity="${(0.6 + r() * 0.3).toFixed(2)}"/>`;
  }).join("");
  const wave = (yy, amp, op, fill) => {
    const k = 2 + Math.floor(r() * 3), ph = r() * 6, pts = [];
    for (let x = 0; x <= W; x += 30) pts.push(`${x},${(yy + Math.sin(x / W * Math.PI * k + ph) * amp).toFixed(0)}`);
    return `<path d="M0,${H} L${pts.join(" L")} L${W},${H} Z" fill="${fill}" opacity="${op}"/>`;
  };
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="presentation" focusable="false" preserveAspectRatio="xMidYMid slice">
  <defs>
    <linearGradient id="${id}bg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${light}"/><stop offset="1" stop-color="${mid}"/></linearGradient>
    <radialGradient id="${id}pl" cx="32%" cy="28%" r="75%"><stop offset="0" stop-color="#ffffff"/><stop offset="0.45" stop-color="${color}"/><stop offset="1" stop-color="${deep}"/></radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="url(#${id}bg)"/>
  ${blobs}
  ${wave(H * 0.78, 22, 0.35, mid)}
  ${wave(H * 0.9, 16, 0.5, deep)}
  ${rings}
  <circle cx="${px.toFixed(0)}" cy="${py.toFixed(0)}" r="${pr.toFixed(0)}" fill="url(#${id}pl)"/>
  ${moons}
</svg>`;
}
