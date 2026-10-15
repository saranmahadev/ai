// Bench: integrated gradients on f(x) = x^2, approximated with a Riemann sum of m path steps.
import { curve, clip, dot } from "./mathkit.js";

const f = (x) => x * x;
const fprime = (x) => 2 * x;

export default function mount(root, kit) {
  const { frame, canvas, plot, slider, stats, live } = kit;
  const body = frame(root, { title: "Walking the path from a baseline to the input" });
  const say = live(body);
  let x0 = 0, x = 2, steps = 10;

  const cv = canvas(body, { aspect: 0.55, label: "f(x) = x², with the baseline, input, and path between them" });
  const st = stats([["approx", "approximated attribution"], ["exact", "exact (f(x) − f(x₀))"]]);
  const s0 = slider({ label: "baseline x₀", min: -3, max: 3, step: 0.5, value: x0, format: (v) => v.toFixed(1), onInput: (v) => { x0 = v; update(); } });
  const sx = slider({ label: "input x", min: -3, max: 3, step: 0.5, value: x, format: (v) => v.toFixed(1), onInput: (v) => { x = v; update(); } });
  const ss = slider({ label: "path steps (m)", min: 1, max: 100, step: 1, value: steps, onInput: (v) => { steps = v; update(); } });
  body.append(cv.box, st.el, s0.el, sx.el, ss.el);

  function approxIG() {
    let sum = 0;
    for (let k = 1; k <= steps; k++) { const t = k / steps; sum += fprime(x0 + t * (x - x0)); }
    return (x - x0) * (sum / steps);
  }

  cv.onDraw((ctx, w, hh, p) => {
    const m = plot(w, hh, [-3, 3], [-1, 9]);
    m.axes(ctx, p, { xlabel: "x", ylabel: "f(x)" });
    curve(ctx, m, f, -3, 3, { color: p.muted, width: 2.5, clip: clip(m) });
    dot(ctx, m.X(x0), m.Y(f(x0)), 6, p.good);
    dot(ctx, m.X(x), m.Y(f(x)), 6, p.warm);
  });

  function update() {
    const approx = approxIG();
    const exact = f(x) - f(x0);
    st.set("approx", approx.toFixed(4));
    st.set("exact", exact.toFixed(4));
    say(`approximated attribution ${approx.toFixed(3)}, exact ${exact.toFixed(3)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
