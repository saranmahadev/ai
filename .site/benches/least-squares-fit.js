// Bench: the least-squares line minimises the total of the squared errors.
import { curve, clip, dot } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, canvas, slider, stats, plot, dragHandles, fmt, live } = kit;
  const body = frame(root, { title: "The line with the smallest squared error" });
  const say = live(body);
  const P = [[1, 1.5], [2, 3], [3.2, 2.8], [4.5, 5], [6, 4.6], [7.5, 7], [8.5, 6.8]];
  let tilt = 0.4, M = plot(300, 200, [0, 10], [0, 10]);
  const cv = canvas(body, { aspect: 0.66, label: "Points, the least-squares line, and your tilted line with squared errors" });
  const st = stats([["best", "best line"], ["sse0", "smallest total squared error"], ["mine", "your line's total"]]);
  const sl = slider({ label: "tilt away from the best slope", min: -1, max: 1, step: 0.05, value: tilt, format: (v) => fmt(v, 2), onInput: (v) => { tilt = v; update(); } });
  body.append(cv.box, st.el, h("div", { class: "bench-controls" }, sl.el));
  const fit = () => { const n = P.length, mx = P.reduce((s, q) => s + q[0], 0) / n, my = P.reduce((s, q) => s + q[1], 0) / n, m = P.reduce((s, q) => s + (q[0] - mx) * (q[1] - my), 0) / P.reduce((s, q) => s + (q[0] - mx) ** 2, 0); return { m, b: my - m * mx, mx, my }; };
  cv.onDraw((ctx, w, hh, p) => {
    M = plot(w, hh, [0, 10], [0, 10]); M.axes(ctx, p, { xlabel: "x", ylabel: "y" });
    const f = fit(), m2 = f.m + tilt, b2 = f.my - m2 * f.mx, L = (x) => m2 * x + b2;
    ctx.fillStyle = p.warm; ctx.globalAlpha = 0.22; ctx.strokeStyle = p.warm; ctx.lineWidth = 1.2;
    for (const [x, y] of P) { const e = Math.abs(L(x) - y) * (M.ih / 10), X = M.X(x), Y1 = M.Y(y), Y2 = M.Y(L(x)); ctx.fillRect(X, Math.min(Y1, Y2), e, Math.abs(Y2 - Y1)); }
    ctx.globalAlpha = 1;
    curve(ctx, M, (x) => f.m * x + f.b, 0, 10, { color: p.good, width: 3, clip: clip(M), steps: 2 });
    curve(ctx, M, L, 0, 10, { color: p.accent, width: 3.5, dash: [7, 5], clip: clip(M), steps: 2 });
    for (const [x, y] of P) dot(ctx, M.X(x), M.Y(y), 6, p.ink);
  });
  dragHandles(cv.cv, () => P.map(([x, y]) => ({ x: M.X(x), y: M.Y(y) })), (i, px, py) => { P[i][0] = Math.max(0.2, Math.min(9.8, Math.round(M.x(px) * 4) / 4)); P[i][1] = Math.max(0.2, Math.min(9.8, Math.round(M.y(py) * 4) / 4)); update(); });
  function update() { const f = fit(), sse = (m, b) => P.reduce((s, [x, y]) => s + (m * x + b - y) ** 2, 0), m2 = f.m + tilt, b2 = f.my - m2 * f.mx; st.set("best", `y = ${fmt(f.m, 3)}x + ${fmt(f.b, 3)}  (green)`); st.set("sse0", fmt(sse(f.m, f.b), 3)); st.set("mine", fmt(sse(m2, b2), 3) + "  (dashed blue)"); say(`Total squared error ${fmt(sse(m2, b2), 2)}`); cv.redraw(); }
  update();
  return () => cv.destroy();
}
