// Bench: a partial derivative is the slope of a one-variable slice.
import { view, heatmap, dot, numDiff } from "./mathkit.js";
import { curve, clip } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, choice, canvas, stats, plot, fmt, live } = kit;
  const body = frame(root, { title: "Slice a surface" });
  const say = live(body);
  const F = { a: ["x² + 3xy", (x, y) => x * x + 3 * x * y], b: ["x² + y²", (x, y) => x * x + y * y], c: ["sin(x)·cos(y)·3", (x, y) => 3 * Math.sin(x) * Math.cos(y)] };
  let key = "a", px = 1, py = 1, dir = "x";
  const sx = slider({ label: "point x", min: -2, max: 2, step: 0.1, value: px, format: (v) => fmt(v, 1), onInput: (v) => { px = v; update(); } });
  const sy = slider({ label: "point y", min: -2, max: 2, step: 0.1, value: py, format: (v) => fmt(v, 1), onInput: (v) => { py = v; update(); } });
  const ch = choice("Function", Object.entries(F).map(([k, v]) => [k, v[0]]), key, (k) => { key = k; update(); });
  const cd = choice("Slice along", [["x", "x (hold y fixed)"], ["y", "y (hold x fixed)"]], dir, (d) => { dir = d; update(); });
  const cv = canvas(body, { aspect: 0.5, label: "A shaded map of the function on the left and the slice curve with its slope on the right" });
  const st = stats([["z", "f at the point"], ["fx", "∂f/∂x"], ["fy", "∂f/∂y"]]);
  body.append(cv.box, st.el, ch.el, cd.el, h("div", { class: "bench-controls" }, sx.el, sy.el));
  cv.onDraw((ctx, w, hh, p) => {
    const f = F[key][1], half = Math.floor(w / 2) - 6, V = view(half, hh, { scale: Math.min(half, hh) / 4.4 });
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, half, hh); ctx.clip(); heatmap(ctx, half, hh, V, f, { block: 6 });
    ctx.strokeStyle = p.ink; ctx.lineWidth = 2.5; ctx.beginPath(); if (dir === "x") { ctx.moveTo(0, V.Y(py)); ctx.lineTo(half, V.Y(py)); } else { ctx.moveTo(V.X(px), 0); ctx.lineTo(V.X(px), hh); } ctx.stroke(); dot(ctx, V.X(px), V.Y(py), 7, p.warm); ctx.restore();
    ctx.save(); ctx.translate(half + 12, 0);
    const g = dir === "x" ? (t) => f(t, py) : (t) => f(px, t), vals = []; for (let t = -2; t <= 2; t += 0.1) vals.push(g(t));
    const lo = Math.min(...vals) - 0.5, hi = Math.max(...vals) + 0.5, m = plot(w - half - 12, hh, [-2, 2], [lo, hi], { l: 34, r: 8, t: 10, b: 26 }); m.axes(ctx, p, { xlabel: dir, ticks: 4 });
    curve(ctx, m, g, -2, 2, { color: p.accent, width: 3.5, clip: clip(m) }); const t0 = dir === "x" ? px : py, s = numDiff(g, t0);
    curve(ctx, m, (t) => g(t0) + s * (t - t0), -2, 2, { color: p.warm, width: 2, dash: [5, 4], clip: clip(m), steps: 2 }); dot(ctx, m.X(t0), m.Y(g(t0)), 6, p.warm); ctx.restore();
  });
  function update() { const f = F[key][1]; st.set("z", fmt(f(px, py), 3)); st.set("fx", fmt(numDiff((t) => f(t, py), px), 3)); st.set("fy", fmt(numDiff((t) => f(px, t), py), 3)); say("Partial derivatives updated"); cv.redraw(); }
  update();
  return () => cv.destroy();
}
