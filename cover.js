// Generated cover art for articles: a flat abstract composition of a few seeded shapes, coloured from
// the topic's subject. Pure SVG, no images and no external requests. Deliberately plain — no
// planet/ring/moon imagery — to match Standard Mode's flat design; the subject colour is still what
// gives each cover its own identity and quick visual recognition on a subject's topic list.

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

export function cover(title, color = "#6d4aed") {
  const r = rng(hash(title));
  const W = 1200, H = 420;
  const wash = mix(color, "#ffffff", 0.9), soft = mix(color, "#ffffff", 0.6);
  // one bold focal circle (always full strength) plus two or three soft, lower-opacity ones behind it —
  // a calm, flat composition rather than a painterly scene.
  const focal = { cx: 160 + r() * 260, cy: 90 + r() * 240, rad: 90 + r() * 70 };
  const softCircles = Array.from({ length: 2 + Math.floor(r() * 2) }, () => {
    const cx = focal.cx + 220 + r() * (W - focal.cx - 320), cy = 40 + r() * (H - 80), rad = 60 + r() * 130;
    return `<circle cx="${cx.toFixed(0)}" cy="${cy.toFixed(0)}" r="${rad.toFixed(0)}" fill="${soft}" opacity="${(0.3 + r() * 0.3).toFixed(2)}"/>`;
  }).join("");
  const lineY = (H * (0.28 + r() * 0.46)).toFixed(0);
  return `<svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" role="presentation" focusable="false" preserveAspectRatio="xMidYMid slice">
  <rect width="${W}" height="${H}" fill="${wash}"/>
  ${softCircles}
  <circle cx="${focal.cx.toFixed(0)}" cy="${focal.cy.toFixed(0)}" r="${focal.rad.toFixed(0)}" fill="${color}"/>
  <line x1="0" y1="${lineY}" x2="${W}" y2="${lineY}" stroke="${color}" stroke-opacity=".16" stroke-width="2"/>
</svg>`;
}
