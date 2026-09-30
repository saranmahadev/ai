// Bench: choose slope and intercept to fit a line to noisy points.
import { curve, clip, dot } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, button, canvas, stats, plot, rng, fmt, live } = kit;
  const body = frame(root, { title: "Fit a line to the points" });
  const say = live(body);
  const r = rng(11), pts = Array.from({ length: 10 }, (_, i) => { const x = 0.5 + i; return { x, y: 1.5 * x + 2 + (r() - 0.5) * 5 }; });
  let m = 0.5, b = 8;
  const sm = slider({ label: "slope m", min: -1, max: 4, step: 0.05, value: m, format: (v) => fmt(v, 2), onInput: (v) => { m = v; update(); } });
  const sb = slider({ label: "intercept b", min: -5, max: 15, step: 0.25, value: b, format: (v) => fmt(v, 2), onInput: (v) => { b = v; update(); } });
  const best = button("Reveal the best fit", () => { const n = pts.length, mx = pts.reduce((s, p) => s + p.x, 0) / n, my = pts.reduce((s, p) => s + p.y, 0) / n; m = pts.reduce((s, p) => s + (p.x - mx) * (p.y - my), 0) / pts.reduce((s, p) => s + (p.x - mx) ** 2, 0); b = my - m * mx; sm.set(Math.round(m * 20) / 20, true); sb.set(Math.round(b * 4) / 4, true); m = sm.get(); b = sb.get(); update(); });
  const cv = canvas(body, { aspect: 0.62, label: "Scatter plot of points with an adjustable line and error segments" });
  const st = stats([["eq", "line"], ["mae", "average miss"], ["mse", "average squared miss"]]);
  body.append(cv.box, st.el, h("div", { class: "bench-controls" }, sm.el, sb.el), h("div", { class: "bench-row" }, best));
  cv.onDraw((ctx, w, hh, p) => {
    const M = plot(w, hh, [0, 11], [-2, 24]); M.axes(ctx, p, { xlabel: "x", ylabel: "y" });
    ctx.strokeStyle = p.warm; ctx.lineWidth = 1.6; for (const q of pts) { ctx.beginPath(); ctx.moveTo(M.X(q.x), M.Y(q.y)); ctx.lineTo(M.X(q.x), M.Y(m * q.x + b)); ctx.stroke(); }
    curve(ctx, M, (x) => m * x + b, 0, 11, { color: p.accent, width: 4, clip: clip(M), steps: 2 });
    for (const q of pts) dot(ctx, M.X(q.x), M.Y(q.y), 5, p.ink);
  });
  function update() { const e = pts.map((q) => m * q.x + b - q.y); st.set("eq", `y = ${fmt(m, 2)}x + ${fmt(b, 2)}`); st.set("mae", fmt(e.reduce((s, v) => s + Math.abs(v), 0) / e.length, 2)); st.set("mse", fmt(e.reduce((s, v) => s + v * v, 0) / e.length, 2)); say(`Average miss ${fmt(e.reduce((s, v) => s + Math.abs(v), 0) / e.length, 2)}`); cv.redraw(); }
  update();
  return () => cv.destroy();
}
