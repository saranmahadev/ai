// Bench: how a line and a circle meet, decided by one distance.
import { view, grid, dot } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, canvas, stats, fmt, live } = kit;
  const body = frame(root, { title: "A line and a circle" });
  const say = live(body);
  let a = 1, b = 1, c = 2, r = 3;
  const mk = (label, min, max, step, val, set) => slider({ label, min, max, step, value: val, format: (v) => fmt(v, 1), onInput: (v) => { set(v); update(); } });
  const sa = mk("line a (a·x + b·y = c)", -3, 3, 0.5, a, (v) => (a = v)), sb = mk("line b", -3, 3, 0.5, b, (v) => (b = v)), sc = mk("line c", -8, 8, 0.5, c, (v) => (c = v)), sr = mk("circle radius", 0.5, 5, 0.5, r, (v) => (r = v));
  const cv = canvas(body, { aspect: 0.72, label: "A circle centred at the origin and a line" });
  const st = stats([["d", "distance from centre to line"], ["n", "shared points"], ["pts", "intersection points"]]);
  body.append(cv.box, st.el, h("div", { class: "bench-controls" }, sa.el, sb.el, sc.el, sr.el));
  const solve = () => { const n2 = a * a + b * b; if (n2 < 1e-9) return null; const d = Math.abs(c) / Math.sqrt(n2); const fx = (a * c) / n2, fy = (b * c) / n2; if (d > r + 1e-9) return { d, pts: [] }; if (Math.abs(d - r) < 1e-9) return { d, pts: [[fx, fy]] }; const t = Math.sqrt(r * r - d * d) / Math.sqrt(n2); return { d, pts: [[fx - b * t, fy + a * t], [fx + b * t, fy - a * t]] }; };
  cv.onDraw((ctx, w, hh, p) => {
    const V = view(w, hh, { scale: Math.min(w, hh) / 13 }); grid(ctx, V, w, hh, p, { step: 1 });
    ctx.strokeStyle = p.accent; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.arc(V.X(0), V.Y(0), r * V.scale, 0, 7); ctx.stroke();
    if (Math.hypot(a, b) > 1e-9) { const n2 = a * a + b * b, fx = (a * c) / n2, fy = (b * c) / n2, dx = -b, dy = a; ctx.strokeStyle = p.warm; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(V.X(fx - dx * 20), V.Y(fy - dy * 20)); ctx.lineTo(V.X(fx + dx * 20), V.Y(fy + dy * 20)); ctx.stroke(); const s = solve(); for (const q of s.pts) dot(ctx, V.X(q[0]), V.Y(q[1]), 7, p.good); }
    dot(ctx, V.X(0), V.Y(0), 5, p.ink);
  });
  function update() { const s = solve(); if (!s) { st.set("d", "—"); st.set("n", "not a line (a = b = 0)"); st.set("pts", "—"); } else { st.set("d", `${fmt(s.d, 3)}  (radius ${fmt(r, 1)})`); st.set("n", String(s.pts.length)); st.set("pts", s.pts.map((q) => `(${fmt(q[0], 2)}, ${fmt(q[1], 2)})`).join("  ") || "none"); say(`${s.pts.length} shared points`); } cv.redraw(); }
  update();
  return () => cv.destroy();
}
