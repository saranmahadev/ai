// Bench: place two Gaussian RBF centres, solve the linear output layer, and see how well it fits XOR.
import { gaussianRBF, leastSquares } from "./nnkit.js";

const POINTS = [[0, 0], [0, 1], [1, 0], [1, 1]];
const TARGETS = [0, 1, 1, 0];

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Solving XOR with two Gaussian bumps" });
  const say = live(body);
  let c1 = [0, 0], c2 = [1, 1], sigma = 0.5;

  const cv = canvas(body, { aspect: 1, label: "The four XOR points, the two centres, and the fitted function's contours" });
  const st = stats([["w", "output weights (w1, w2, b)"], ["err", "max prediction error"]]);
  const s1x = slider({ label: "centre 1, x", min: -0.5, max: 1.5, step: 0.05, value: c1[0], format: (v) => v.toFixed(2), onInput: (v) => { c1[0] = v; update(); } });
  const s1y = slider({ label: "centre 1, y", min: -0.5, max: 1.5, step: 0.05, value: c1[1], format: (v) => v.toFixed(2), onInput: (v) => { c1[1] = v; update(); } });
  const s2x = slider({ label: "centre 2, x", min: -0.5, max: 1.5, step: 0.05, value: c2[0], format: (v) => v.toFixed(2), onInput: (v) => { c2[0] = v; update(); } });
  const s2y = slider({ label: "centre 2, y", min: -0.5, max: 1.5, step: 0.05, value: c2[1], format: (v) => v.toFixed(2), onInput: (v) => { c2[1] = v; update(); } });
  const sS = slider({ label: "width σ", min: 0.1, max: 1.2, step: 0.05, value: sigma, format: (v) => v.toFixed(2), onInput: (v) => { sigma = v; update(); } });
  body.append(cv.box, st.el, s1x.el, s1y.el, s2x.el, s2y.el, sS.el);

  function fit() {
    const Phi = POINTS.map((x) => [gaussianRBF(x, c1, sigma), gaussianRBF(x, c2, sigma), 1]);
    const w = leastSquares(Phi, TARGETS);
    const preds = Phi.map((row) => row.reduce((s, v, i) => s + v * w[i], 0));
    return { w, preds };
  }

  cv.onDraw((ctx, w, hh, p) => {
    const X = (x) => 30 + x * (w - 60), Y = (y) => hh - 30 - y * (hh - 60);
    const N = 40;
    const { w: coef } = fit();
    for (let i = 0; i <= N; i++) for (let j = 0; j <= N; j++) {
      const x = i / N, y = j / N;
      const val = coef[0] * gaussianRBF([x, y], c1, sigma) + coef[1] * gaussianRBF([x, y], c2, sigma) + coef[2];
      const shade = Math.max(0, Math.min(1, val));
      ctx.fillStyle = shade > 0.5 ? p.good : p.soft;
      ctx.globalAlpha = 0.5;
      ctx.fillRect(X(x) - 4, Y(y) - 4, 8, 8);
    }
    ctx.globalAlpha = 1;
    POINTS.forEach(([x, y], i) => {
      ctx.fillStyle = TARGETS[i] ? p.good : p.warm;
      ctx.beginPath(); ctx.arc(X(x), Y(y), 8, 0, 7); ctx.fill();
    });
    [c1, c2].forEach(([x, y]) => { ctx.strokeStyle = p.accent; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(X(x), Y(y), 6, 0, 7); ctx.stroke(); });
  });

  function update() {
    const { w, preds } = fit();
    st.set("w", w.map((v) => v.toFixed(3)).join(", "));
    const err = Math.max(...preds.map((p, i) => Math.abs(p - TARGETS[i])));
    st.set("err", err.toFixed(4));
    say(`max prediction error ${err.toFixed(3)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
