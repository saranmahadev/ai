// Bench: L1, L2 and L-infinity norms, and their unit balls.
import { view, grid, arrow, dot } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, canvas, slider, toggles, stats, dragHandles, fmt, live } = kit;
  const body = frame(root, { title: "Three ways to measure size" });
  const say = live(body);
  const v = [3, 4]; let show = { l1: true, l2: true, linf: true };
  const cv = canvas(body, { aspect: 0.72, label: "A draggable vector with the unit balls of three norms" });
  const st = stats([["l1", "L1 (sum of |components|)"], ["l2", "L2 (straight length)"], ["li", "L∞ (largest component)"]]);
  const sx = slider({ label: "x", min: -6, max: 6, step: 0.5, value: v[0], format: (n) => fmt(n, 1), onInput: (n) => { v[0] = n; update(); } });
  const sy = slider({ label: "y", min: -6, max: 6, step: 0.5, value: v[1], format: (n) => fmt(n, 1), onInput: (n) => { v[1] = n; update(); } });
  const tg = toggles([["l1", "unit ball of L1 (diamond)", true], ["l2", "unit ball of L2 (circle)", true], ["linf", "unit ball of L∞ (square)", true]], (x) => { show = x; update(); });
  body.append(cv.box, st.el, h("div", { class: "bench-controls" }, sx.el, sy.el), tg.el);
  let V = view(300, 200);
  cv.onDraw((ctx, w, hh, p) => {
    V = view(w, hh, { scale: Math.min(w, hh) / 14 }); grid(ctx, V, w, hh, p);
    const R = (r) => r * V.scale, cx = V.X(0), cy = V.Y(0);
    ctx.lineWidth = 3;
    if (show.l1) { ctx.strokeStyle = p.warm; ctx.beginPath(); ctx.moveTo(cx + R(1), cy); ctx.lineTo(cx, cy - R(1)); ctx.lineTo(cx - R(1), cy); ctx.lineTo(cx, cy + R(1)); ctx.closePath(); ctx.stroke(); }
    if (show.l2) { ctx.strokeStyle = p.accent; ctx.beginPath(); ctx.arc(cx, cy, R(1), 0, 7); ctx.stroke(); }
    if (show.linf) { ctx.strokeStyle = p.good; ctx.strokeRect(cx - R(1), cy - R(1), R(2), R(2)); }
    arrow(ctx, cx, cy, V.X(v[0]), V.Y(v[1]), p.ink, 4); dot(ctx, V.X(v[0]), V.Y(v[1]), 8, p.ink);
  });
  dragHandles(cv.cv, () => [{ x: V.X(v[0]), y: V.Y(v[1]) }], (_, px, py) => { v[0] = Math.max(-6, Math.min(6, Math.round(V.x(px) * 2) / 2)); v[1] = Math.max(-6, Math.min(6, Math.round(V.y(py) * 2) / 2)); sx.set(v[0], true); sy.set(v[1], true); update(); });
  function update() { st.set("l1", fmt(Math.abs(v[0]) + Math.abs(v[1]), 2)); st.set("l2", fmt(Math.hypot(v[0], v[1]), 3)); st.set("li", fmt(Math.max(Math.abs(v[0]), Math.abs(v[1])), 2)); say(`L2 norm ${fmt(Math.hypot(v[0], v[1]), 2)}`); cv.redraw(); }
  update();
  return () => cv.destroy();
}
