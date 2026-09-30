// Bench: thin bars under a curve add up to the integral.
import { curve, clip } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, choice, canvas, stats, plot, fmt, live } = kit;
  const body = frame(root, { title: "Add up thin bars under a curve" });
  const say = live(body);
  const F = { sq: ["x² from 0 to 2", (x) => x * x, 0, 2, 8 / 3, [-0.5, 4.5]], sin: ["sin x from 0 to π", Math.sin, 0, Math.PI, 2, [-0.3, 1.3]], lin: ["x from 0 to 3", (x) => x, 0, 3, 4.5, [-0.3, 3.3]], neg: ["x² − 2 from 0 to 2", (x) => x * x - 2, 0, 2, 8 / 3 - 4, [-2.5, 2.5]] };
  let key = "sq", n = 4, rule = "mid";
  const sn = slider({ label: "number of bars", min: 1, max: 60, step: 1, value: n, onInput: (v) => { n = v; update(); } });
  const ch = choice("Function", Object.entries(F).map(([k, v]) => [k, v[0]]), key, (k) => { key = k; update(); });
  const cr = choice("Bar height taken at", [["left", "left end"], ["mid", "midpoint"], ["right", "right end"]], rule, (v) => { rule = v; update(); });
  const cv = canvas(body, { aspect: 0.6, label: "A curve with thin bars under it" });
  const st = stats([["s", "sum of the bars"], ["ex", "exact area"], ["err", "error"]]);
  body.append(cv.box, st.el, ch.el, cr.el, h("div", { class: "bench-controls" }, sn.el));
  const bars = () => { const [, f, a, b] = F[key], dx = (b - a) / n; return Array.from({ length: n }, (_, i) => { const x0 = a + i * dx, xs = rule === "left" ? x0 : rule === "right" ? x0 + dx : x0 + dx / 2; return { x0, dx, y: f(xs) }; }); };
  cv.onDraw((ctx, w, hh, p) => {
    const [, f, a, b, , yr] = F[key], m = plot(w, hh, [a - 0.2, b + 0.2], yr); m.axes(ctx, p, { xlabel: "x", ylabel: "f(x)" });
    for (const bar of bars()) { ctx.fillStyle = bar.y >= 0 ? p.accent : p.warm; ctx.globalAlpha = 0.4; const y0 = m.Y(0), y1 = m.Y(bar.y); ctx.fillRect(m.X(bar.x0), Math.min(y0, y1), m.X(bar.x0 + bar.dx) - m.X(bar.x0) - (n > 30 ? 0 : 1), Math.abs(y1 - y0)); ctx.globalAlpha = 1; }
    curve(ctx, m, f, a - 0.2, b + 0.2, { color: p.ink, width: 3, clip: clip(m) });
  });
  function update() { const s = bars().reduce((t, x) => t + x.y * x.dx, 0), ex = F[key][4]; st.set("s", fmt(s, 4)); st.set("ex", fmt(ex, 4)); st.set("err", fmt(s - ex, 4)); say(`Sum ${fmt(s, 3)}, exact ${fmt(ex, 3)}`); cv.redraw(); }
  update();
  return () => cv.destroy();
}
