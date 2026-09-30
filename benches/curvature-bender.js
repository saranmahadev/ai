// Bench: slope, curvature and flat spots.
import { curve, clip, dot, numDiff } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, choice, canvas, stats, plot, fmt, live } = kit;
  const body = frame(root, { title: "Slope, curvature and flat spots" });
  const say = live(body);
  const F = { cub: ["x³ − 3x", (x) => x ** 3 - 3 * x, [-3, 3], [-6, 6]], sq: ["2x²", (x) => 2 * x * x, [-3, 3], [-1, 12]], wide: ["0.5x²", (x) => 0.5 * x * x, [-3, 3], [-1, 6]], neg: ["−x²", (x) => -x * x, [-3, 3], [-9, 1]], sin: ["sin x", Math.sin, [-6, 6], [-2, 2]] };
  let key = "cub", x = 1;
  const sx = slider({ label: "input x", min: -3, max: 3, step: 0.05, value: x, format: (v) => fmt(v, 2), onInput: (v) => { x = v; update(); } });
  const ch = choice("Function", Object.entries(F).map(([k, v]) => [k, v[0]]), key, (k) => { key = k; update(); });
  const cv = canvas(body, { aspect: 0.62, label: "A curve with a marker; its slope and curvature are listed" });
  const st = stats([["y", "f(x)"], ["d1", "slope f′(x)"], ["d2", "curvature f″(x)"], ["what", "at this point"]]);
  body.append(cv.box, st.el, ch.el, h("div", { class: "bench-controls" }, sx.el));
  const d2 = (f, t) => (f(t + 1e-3) - 2 * f(t) + f(t - 1e-3)) / 1e-6;
  cv.onDraw((ctx, w, hh, p) => {
    const [, f, rx, ry] = F[key], m = plot(w, hh, rx, ry), c = clip(m); m.axes(ctx, p, { xlabel: "x", ylabel: "f(x)" });
    curve(ctx, m, f, rx[0], rx[1], { color: p.accent, width: 4, clip: c, steps: 400 });
    for (let t = rx[0]; t < rx[1]; t += 0.01) if (numDiff(f, t) * numDiff(f, t + 0.01) < 0) dot(ctx, m.X(t + 0.005), m.Y(f(t + 0.005)), 5, p.good);
    const s = numDiff(f, x); curve(ctx, m, (t) => f(x) + s * (t - x), rx[0], rx[1], { color: p.muted, width: 1.8, dash: [5, 4], clip: c, steps: 2 }); dot(ctx, m.X(x), m.Y(f(x)), 7, p.warm);
  });
  function update() { const f = F[key][1], s = numDiff(f, x), c = d2(f, x); st.set("y", fmt(f(x), 3)); st.set("d1", fmt(s, 3)); st.set("d2", fmt(c, 3));
    st.set("what", Math.abs(s) < 0.06 ? (c > 0.05 ? "a flat spot with positive curvature: a minimum" : c < -0.05 ? "a flat spot with negative curvature: a maximum" : "a flat spot with no curvature") : `${s > 0 ? "rising" : "falling"}, bending ${c > 0.05 ? "upward (bowl)" : c < -0.05 ? "downward (hill)" : "hardly at all"}`);
    say(`Slope ${fmt(s, 2)}, curvature ${fmt(c, 2)}`); cv.redraw(); }
  update();
  return () => cv.destroy();
}
