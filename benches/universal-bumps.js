// Bench: fit a sum of sigmoid units to a target curve by least squares, as the number of units grows.
import { curve, clip } from "./mathkit.js";
import { lstsq, predictLinear } from "./mlkit.js";
import { sigmoid } from "./dlkit.js";

const target = (x) => Math.sin(3 * x);
const XS = Array.from({ length: 60 }, (_, i) => -1 + (2 * i) / 59);
const K = 8;

function fit(n) {
  const centers = Array.from({ length: n }, (_, i) => -1 + (2 * (i + 0.5)) / n);
  const X = XS.map((x) => centers.map((c) => sigmoid(K * (x - c))));
  const y = XS.map(target);
  const w = lstsq(X, y, 1e-3);
  const f = (x) => predictLinear(w, centers.map((c) => sigmoid(K * (x - c))));
  const mse = XS.reduce((s, x, i) => s + (f(x) - y[i]) ** 2, 0) / XS.length;
  return { f, mse };
}

export default function mount(root, kit) {
  const { frame, canvas, plot, slider, stats, live } = kit;
  const body = frame(root, { title: "Approximating a curve with sigmoid bumps" });
  const say = live(body);
  let n = 2, R = fit(n);

  const cv = canvas(body, { aspect: 0.55, label: "Target curve and the fitted sum of sigmoid units" });
  const st = stats([["mse", "mean squared error"]]);
  const sl = slider({ label: "hidden units", min: 1, max: 32, step: 1, value: n, onInput: (v) => { n = v; R = fit(n); update(); } });
  body.append(cv.box, st.el, sl.el);

  cv.onDraw((ctx, w, hh, p) => {
    const m = plot(w, hh, [-1, 1], [-1.3, 1.3]);
    m.axes(ctx, p, { xlabel: "x", ylabel: "f(x)" });
    curve(ctx, m, target, -1, 1, { color: p.good, width: 2.5, dash: [6, 4], clip: clip(m), steps: 160 });
    curve(ctx, m, R.f, -1, 1, { color: p.accent, width: 3.5, clip: clip(m), steps: 160 });
  });

  function update() {
    st.set("mse", R.mse.toFixed(5));
    say(`${n} hidden units, mean squared error ${R.mse.toFixed(5)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
