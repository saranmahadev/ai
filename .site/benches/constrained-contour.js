// Bench: the best point on a constraint line is where the gradients are parallel.
import { view, heatmap, arrow, dot } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, canvas, stats, fmt, live } = kit;
  const body = frame(root, { title: "The best point on a line" });
  const say = live(body);
  let c = 2, t = 1;
  const sc = slider({ label: "constraint x + y = c", min: 0.5, max: 4, step: 0.5, value: c, format: (v) => fmt(v, 1), onInput: (v) => { c = v; update(); } });
  const stt = slider({ label: "position along the line", min: -3, max: 3, step: 0.05, value: t, format: (v) => fmt(v, 2), onInput: (v) => { t = v; update(); } });
  const cv = canvas(body, { aspect: 0.7, label: "Contours of x squared plus y squared, the constraint line and the two gradient arrows" });
  const st = stats([["f", "objective x² + y² at the point"], ["gf", "∇f"], ["gg", "∇g = (1, 1)"], ["ang", "angle between them"], ["best", "the best point on the line"]]);
  body.append(cv.box, st.el, h("div", { class: "bench-controls" }, sc.el, stt.el));
  const P = () => [c / 2 + t, c / 2 - t];
  cv.onDraw((ctx, w, hh, p) => {
    const V = view(w, hh, { scale: Math.min(w, hh) / 8.5, cx: 1, cy: 1 }); heatmap(ctx, w, hh, V, (x, y) => x * x + y * y, { block: 6, lo: 0, hi: 20 });
    ctx.strokeStyle = p.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(V.X(-10), V.Y(c + 10)); ctx.lineTo(V.X(c + 10), V.Y(-10)); ctx.stroke();
    const q = P(), gf = [2 * q[0], 2 * q[1]], k = 0.35; arrow(ctx, V.X(q[0]), V.Y(q[1]), V.X(q[0] + gf[0] * k), V.Y(q[1] + gf[1] * k), p.warm, 4); arrow(ctx, V.X(q[0]), V.Y(q[1]), V.X(q[0] + 1.2), V.Y(q[1] + 1.2), p.white, 3);
    dot(ctx, V.X(q[0]), V.Y(q[1]), 7, p.ink); dot(ctx, V.X(c / 2), V.Y(c / 2), 5, p.good);
  });
  function update() { const q = P(), gf = [2 * q[0], 2 * q[1]], ang = (Math.acos(Math.max(-1, Math.min(1, (gf[0] + gf[1]) / (Math.hypot(...gf) * Math.SQRT2 || 1)))) * 180) / Math.PI; st.set("f", fmt(q[0] ** 2 + q[1] ** 2, 3)); st.set("gf", `(${fmt(gf[0], 2)}, ${fmt(gf[1], 2)})`); st.set("gg", "(1, 1)"); st.set("ang", fmt(ang, 1) + "°" + (ang < 0.5 ? "  (parallel: the best point)" : "")); st.set("best", `(${fmt(c / 2, 2)}, ${fmt(c / 2, 2)}) with value ${fmt(c * c / 2, 3)} and λ = ${fmt(c, 2)}`); say(`Objective ${fmt(q[0] ** 2 + q[1] ** 2, 2)}`); cv.redraw(); }
  update();
  return () => cv.destroy();
}
