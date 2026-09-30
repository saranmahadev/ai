// Bench: cosine similarity looks at direction only.
import { view, grid, arrow, dot } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, canvas, slider, stats, dragHandles, fmt, live } = kit;
  const body = frame(root, { title: "Direction versus length" });
  const say = live(body);
  const A = [3, 1]; let len = 3.2, deg = 72;
  const cv = canvas(body, { aspect: 0.72, label: "A fixed vector A and a movable vector B" });
  const st = stats([["cos", "cosine similarity"], ["ang", "angle"], ["dot", "dot product"], ["dist", "distance |A − B|"]]);
  const sd = slider({ label: "direction of B", min: -180, max: 180, step: 1, value: deg, format: (n) => n + "°", onInput: (n) => { deg = n; update(); } });
  const sl = slider({ label: "length of B", min: 0.5, max: 6, step: 0.1, value: len, format: (n) => fmt(n, 1), onInput: (n) => { len = n; update(); } });
  body.append(cv.box, st.el, h("div", { class: "bench-controls" }, sd.el, sl.el));
  const B = () => [len * Math.cos((deg * Math.PI) / 180), len * Math.sin((deg * Math.PI) / 180)];
  let V = view(300, 200);
  cv.onDraw((ctx, w, hh, p) => { V = view(w, hh, { scale: Math.min(w, hh) / 14 }); grid(ctx, V, w, hh, p); const b = B(); arrow(ctx, V.X(0), V.Y(0), V.X(A[0]), V.Y(A[1]), p.accent, 4); arrow(ctx, V.X(0), V.Y(0), V.X(b[0]), V.Y(b[1]), p.warm, 4); dot(ctx, V.X(b[0]), V.Y(b[1]), 8, p.warm); });
  dragHandles(cv.cv, () => { const b = B(); return [{ x: V.X(b[0]), y: V.Y(b[1]) }]; }, (_, px, py) => { const x = V.x(px), y = V.y(py); deg = Math.round((Math.atan2(y, x) * 180) / Math.PI); len = Math.max(0.5, Math.min(6, Math.round(Math.hypot(x, y) * 10) / 10)); sd.set(deg, true); sl.set(len, true); update(); });
  function update() { const b = B(), d = A[0] * b[0] + A[1] * b[1], c = d / (Math.hypot(...A) * Math.hypot(...b)); st.set("cos", fmt(c, 4)); st.set("ang", fmt((Math.acos(Math.max(-1, Math.min(1, c))) * 180) / Math.PI, 1) + "°"); st.set("dot", fmt(d, 3)); st.set("dist", fmt(Math.hypot(A[0] - b[0], A[1] - b[1]), 3)); say(`Cosine similarity ${fmt(c, 3)}`); cv.redraw(); }
  update();
  return () => cv.destroy();
}
