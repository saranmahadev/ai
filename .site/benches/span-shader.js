// Bench: what two vectors can reach.
import { view, grid, arrow, dot } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, canvas, slider, stats, fmt, live } = kit;
  const body = frame(root, { title: "What can these vectors reach?" });
  const say = live(body);
  const v1 = [1, 0], v2 = [1, 1]; let c1 = 1, c2 = 1;
  const cv = canvas(body, { aspect: 0.72, label: "Two vectors and the region they can reach" });
  const st = stats([["span", "span of v₁ and v₂"], ["pt", "c₁v₁ + c₂v₂"]]);
  const mk = (n, arr, i) => slider({ label: `${n} ${i ? "y" : "x"}`, min: -3, max: 3, step: 0.5, value: arr[i], format: (x) => fmt(x, 1), onInput: (x) => { arr[i] = x; update(); } });
  const sl = [mk("v₁", v1, 0), mk("v₁", v1, 1), mk("v₂", v2, 0), mk("v₂", v2, 1)];
  const s1 = slider({ label: "c₁", min: -3, max: 3, step: 0.25, value: c1, format: (x) => fmt(x, 2), onInput: (x) => { c1 = x; update(); } });
  const s2 = slider({ label: "c₂", min: -3, max: 3, step: 0.25, value: c2, format: (x) => fmt(x, 2), onInput: (x) => { c2 = x; update(); } });
  body.append(cv.box, st.el, h("div", { class: "bench-controls" }, sl.map((s) => s.el), s1.el, s2.el));
  const kind = () => { const det = v1[0] * v2[1] - v1[1] * v2[0]; if (Math.abs(det) > 1e-9) return "plane"; return v1.some((x) => x) || v2.some((x) => x) ? "line" : "point"; };
  cv.onDraw((ctx, w, hh, p) => {
    const V = view(w, hh, { scale: Math.min(w, hh) / 12 }), k = kind();
    if (k === "plane") { ctx.fillStyle = p.accent; ctx.globalAlpha = 0.12; ctx.fillRect(0, 0, w, hh); ctx.globalAlpha = 1; }
    grid(ctx, V, w, hh, p);
    if (k === "line") { const d = v1.some((x) => x) ? v1 : v2; ctx.strokeStyle = p.accent; ctx.globalAlpha = 0.5; ctx.lineWidth = 12; ctx.beginPath(); ctx.moveTo(V.X(-30 * d[0]), V.Y(-30 * d[1])); ctx.lineTo(V.X(30 * d[0]), V.Y(30 * d[1])); ctx.stroke(); ctx.globalAlpha = 1; }
    const O = [V.X(0), V.Y(0)], p1 = [c1 * v1[0], c1 * v1[1]], tip = [p1[0] + c2 * v2[0], p1[1] + c2 * v2[1]];
    arrow(ctx, ...O, V.X(p1[0]), V.Y(p1[1]), p.warm, 3.5); arrow(ctx, V.X(p1[0]), V.Y(p1[1]), V.X(tip[0]), V.Y(tip[1]), p.good, 3.5); dot(ctx, V.X(tip[0]), V.Y(tip[1]), 7, p.ink);
  });
  function update() { const k = kind(); st.set("span", k === "plane" ? "the whole plane" : k === "line" ? "only a line" : "only the origin"); st.set("pt", `(${fmt(c1 * v1[0] + c2 * v2[0], 2)}, ${fmt(c1 * v1[1] + c2 * v2[1], 2)})`); say(`These vectors reach ${k === "plane" ? "the whole plane" : k === "line" ? "only a line" : "only a point"}`); cv.redraw(); }
  update();
  return () => cv.destroy();
}
