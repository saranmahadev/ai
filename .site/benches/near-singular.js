// Bench: nearly parallel lines make the solution extremely sensitive to tiny changes.
import { view, grid, dot } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, canvas, stats, fmt, live } = kit;
  const body = frame(root, { title: "Two almost-parallel lines" });
  const say = live(body);
  let k = 2, dl = 0.05;
  const sk = slider({ label: "how close to parallel: ε = 10^(−k)", min: 0, max: 3.5, step: 0.25, value: k, format: (v) => "10^-" + v, onInput: (v) => { k = v; update(); } });
  const sd = slider({ label: "nudge to the right-hand side of line 2 (δ)", min: 0, max: 0.2, step: 0.005, value: dl, format: (v) => fmt(v, 3), onInput: (v) => { dl = v; update(); } });
  const cv = canvas(body, { aspect: 0.7, label: "Two lines x + y = 2 and x + (1 + ε) y = 2 + ε with a nudged copy of line 2" });
  const st = stats([["k", "condition number κ"], ["a", "solution before the nudge"], ["b", "solution after the nudge"], ["s", "how far the solution moved"]]);
  body.append(cv.box, st.el, h("div", { class: "bench-controls" }, sk.el, sd.el), h("p", { class: "bench-line" }, "Line 1 is x + y = 2. Line 2 is x + (1 + ε)y = 2 + ε. Before the nudge they meet at (1, 1)."));
  const eps = () => 10 ** -k, sol = (d) => { const y = 1 + d / eps(); return [2 - y, y]; };
  cv.onDraw((ctx, w, hh, p) => {
    const V = view(w, hh, { scale: Math.min(w, hh) / 6, cx: 1, cy: 1 }); grid(ctx, V, w, hh, p, { labels: false }); const e = eps();
    const line = (a, b, c, col, dash) => { ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.setLineDash(dash || []); ctx.beginPath(); ctx.moveTo(V.X(-30), V.Y((c + 30 * a) / b)); ctx.lineTo(V.X(30), V.Y((c - 30 * a) / b)); ctx.stroke(); ctx.setLineDash([]); };
    line(1, 1, 2, p.accent); line(1, 1 + e, 2 + e, p.warm); line(1, 1 + e, 2 + e + dl, p.warm, [6, 5]);
    const clampP = (q) => [Math.max(-30, Math.min(30, q[0])), Math.max(-30, Math.min(30, q[1]))]; const a = sol(0), b = clampP(sol(dl)); dot(ctx, V.X(a[0]), V.Y(a[1]), 6, p.ink); dot(ctx, V.X(b[0]), V.Y(b[1]), 6, p.good);
  });
  function update() { const e = eps(), t = 2 + e, d = e, D = Math.sqrt(t * t - 4 * d), kappa = (t + D) / Math.max(1e-300, t - D), a = sol(0), b = sol(dl); st.set("k", kappa < 1e6 ? fmt(kappa, 1) : kappa.toExponential(2)); st.set("a", `(${fmt(a[0], 3)}, ${fmt(a[1], 3)})`); st.set("b", `(${fmt(b[0], 3)}, ${fmt(b[1], 3)})`); st.set("s", `${fmt(Math.hypot(b[0] - a[0], b[1] - a[1]), 3)} for a nudge of ${fmt(dl, 3)}  (${fmt(Math.hypot(b[0] - a[0], b[1] - a[1]) / (dl || 1e-9), 1)} times as big)`); say(`Condition number ${kappa.toExponential(1)}`); cv.redraw(); }
  update();
  return () => cv.destroy();
}
