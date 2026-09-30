// Bench: the gradient is perpendicular to contours and points uphill.
import { view, heatmap, arrow, dot, numDiff } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, choice, canvas, stats, dragHandles, fmt, live } = kit;
  const body = frame(root, { title: "Follow the gradient on a contour map" });
  const say = live(body);
  const F = { bowl: ["bowl x² + y²", (x, y) => x * x + y * y], saddle: ["saddle x² − y²", (x, y) => x * x - y * y], bumpy: ["bumpy terrain", (x, y) => Math.sin(1.4 * x) + Math.cos(1.2 * y) + 0.15 * (x * x + y * y)] };
  let key = "bowl", P = [1.5, 1];
  const sx = slider({ label: "point x", min: -3, max: 3, step: 0.1, value: P[0], format: (v) => fmt(v, 1), onInput: (v) => { P[0] = v; update(); } });
  const sy = slider({ label: "point y", min: -3, max: 3, step: 0.1, value: P[1], format: (v) => fmt(v, 1), onInput: (v) => { P[1] = v; update(); } });
  const ch = choice("Function", Object.entries(F).map(([k, v]) => [k, v[0]]), key, (k) => { key = k; update(); });
  const cv = canvas(body, { aspect: 0.7, label: "A shaded contour map with a draggable point and its gradient arrow" });
  const st = stats([["g", "gradient (∂f/∂x, ∂f/∂y)"], ["len", "steepness ‖∇f‖"], ["z", "height f"]]);
  body.append(cv.box, st.el, ch.el, h("div", { class: "bench-controls" }, sx.el, sy.el));
  let V = view(300, 200);
  const grad = () => { const f = F[key][1]; return [numDiff((t) => f(t, P[1]), P[0]), numDiff((t) => f(P[0], t), P[1])]; };
  cv.onDraw((ctx, w, hh, p) => {
    V = view(w, hh, { scale: Math.min(w, hh) / 7 }); heatmap(ctx, w, hh, V, F[key][1], { block: 6 });
    const g = grad(), n = Math.hypot(...g) || 1, k = Math.min(1.2, n * 0.3) / n;
    arrow(ctx, V.X(P[0]), V.Y(P[1]), V.X(P[0] + g[0] * k), V.Y(P[1] + g[1] * k), p.ink, 4); arrow(ctx, V.X(P[0]), V.Y(P[1]), V.X(P[0] - g[0] * k), V.Y(P[1] - g[1] * k), p.white, 4); dot(ctx, V.X(P[0]), V.Y(P[1]), 7, p.warm);
  });
  dragHandles(cv.cv, () => [{ x: V.X(P[0]), y: V.Y(P[1]) }], (_, px, py) => { P[0] = Math.max(-3, Math.min(3, Math.round(V.x(px) * 10) / 10)); P[1] = Math.max(-3, Math.min(3, Math.round(V.y(py) * 10) / 10)); sx.set(P[0], true); sy.set(P[1], true); update(); });
  function update() { const g = grad(); st.set("g", `(${fmt(g[0], 3)}, ${fmt(g[1], 3)})`); st.set("len", fmt(Math.hypot(...g), 3)); st.set("z", fmt(F[key][1](...P), 3)); say(`Gradient ${fmt(g[0], 2)}, ${fmt(g[1], 2)}. Dark arrow uphill, light arrow downhill`); cv.redraw(); }
  update();
  return () => cv.destroy();
}
