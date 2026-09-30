// Bench: a vector as an arrow and as a list of components.
import { view, grid, arrow, dot } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, canvas, slider, stats, dragHandles, fmt, live } = kit;
  const body = frame(root, { title: "A vector as an arrow and as a list" });
  const say = live(body);
  const v = [3, 2];
  const cv = canvas(body, { aspect: 0.72, label: "A grid with a draggable arrow from the origin" });
  const st = stats([["c", "components (x, y)"], ["len", "length"], ["ang", "direction"]]);
  const sx = slider({ label: "x component", min: -6, max: 6, step: 0.5, value: v[0], format: (n) => fmt(n, 1), onInput: (n) => { v[0] = n; update(); } });
  const sy = slider({ label: "y component", min: -6, max: 6, step: 0.5, value: v[1], format: (n) => fmt(n, 1), onInput: (n) => { v[1] = n; update(); } });
  body.append(cv.box, st.el, h("div", { class: "bench-controls" }, sx.el, sy.el));
  let V = view(300, 200);
  cv.onDraw((ctx, w, hh, p) => { V = view(w, hh, { scale: Math.min(w, hh) / 14 }); grid(ctx, V, w, hh, p); ctx.strokeStyle = p.muted; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(V.X(0), V.Y(0)); ctx.lineTo(V.X(v[0]), V.Y(0)); ctx.lineTo(V.X(v[0]), V.Y(v[1])); ctx.stroke(); ctx.setLineDash([]); arrow(ctx, V.X(0), V.Y(0), V.X(v[0]), V.Y(v[1]), p.accent, 4); dot(ctx, V.X(v[0]), V.Y(v[1]), 8, p.warm); });
  dragHandles(cv.cv, () => [{ x: V.X(v[0]), y: V.Y(v[1]) }], (_, px, py) => { v[0] = Math.max(-6, Math.min(6, Math.round(V.x(px) * 2) / 2)); v[1] = Math.max(-6, Math.min(6, Math.round(V.y(py) * 2) / 2)); sx.set(v[0], true); sy.set(v[1], true); update(); });
  function update() { st.set("c", `(${fmt(v[0], 1)}, ${fmt(v[1], 1)})`); st.set("len", fmt(Math.hypot(v[0], v[1]), 3)); st.set("ang", Math.hypot(v[0], v[1]) ? fmt((Math.atan2(v[1], v[0]) * 180) / Math.PI, 1) + "°" : "none (zero vector)"); say(`Vector ${fmt(v[0], 1)}, ${fmt(v[1], 1)}`); cv.redraw(); }
  update();
  return () => cv.destroy();
}
