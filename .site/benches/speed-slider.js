// Bench: average rate over a gap, and how it settles on the instantaneous rate.
import { curve, clip, dot, numDiff } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, choice, canvas, stats, plot, fmt, live } = kit;
  const body = frame(root, { title: "Average versus instantaneous rate" });
  const say = live(body);
  const F = { sq: ["t²", (t) => t * t, [0, 4], [0, 16]], sin: ["sin t", Math.sin, [0, 6.3], [-1.3, 1.3]], cube: ["t³ / 4", (t) => (t * t * t) / 4, [0, 4], [0, 16]] };
  let key = "sq", t0 = 1, gap = 1.5;
  const st0 = slider({ label: "first point t", min: 0.2, max: 3.5, step: 0.05, value: t0, format: (v) => fmt(v, 2), onInput: (v) => { t0 = v; update(); } });
  const sg = slider({ label: "gap to the second point", min: 0.02, max: 2, step: 0.02, value: gap, format: (v) => fmt(v, 2), onInput: (v) => { gap = v; update(); } });
  const ch = choice("Function s(t)", Object.entries(F).map(([k, v]) => [k, v[0]]), key, (k) => { key = k; update(); });
  const cv = canvas(body, { aspect: 0.62, label: "A curve with a secant line through two points and the tangent" });
  const st = stats([["avg", "average rate (secant slope)"], ["ins", "instantaneous rate (tangent slope)"], ["diff", "difference"]]);
  body.append(cv.box, st.el, ch.el, h("div", { class: "bench-controls" }, st0.el, sg.el));
  cv.onDraw((ctx, w, hh, p) => {
    const [, f, rx, ry] = F[key], m = plot(w, hh, rx, ry); m.axes(ctx, p, { xlabel: "t", ylabel: "s(t)" }); const c = clip(m), t1 = t0 + gap, s = numDiff(f, t0);
    curve(ctx, m, f, rx[0], rx[1], { color: p.accent, width: 3.5, clip: c });
    curve(ctx, m, (t) => f(t0) + s * (t - t0), rx[0], rx[1], { color: p.muted, width: 2, dash: [6, 5], clip: c, steps: 2 });
    const k = (f(t1) - f(t0)) / gap; curve(ctx, m, (t) => f(t0) + k * (t - t0), rx[0], rx[1], { color: p.warm, width: 3, clip: c, steps: 2 });
    dot(ctx, m.X(t0), m.Y(f(t0)), 7, p.ink); dot(ctx, m.X(t1), m.Y(f(t1)), 7, p.warm);
  });
  function update() { const f = F[key][1], k = (f(t0 + gap) - f(t0)) / gap, s = numDiff(f, t0); st.set("avg", fmt(k, 4)); st.set("ins", fmt(s, 4)); st.set("diff", fmt(k - s, 4)); say(`Average rate ${fmt(k, 3)}, instantaneous ${fmt(s, 3)}`); cv.redraw(); }
  update();
  return () => cv.destroy();
}
