// Bench: fit a wavy target with random sigmoid hidden units and one least-squares solve for the output layer.
import { leastSquares, sigmoid } from "./nnkit.js";
import { rng, plot } from "./kit.js";

const XS = Array.from({ length: 50 }, (_, i) => i / 49);
const YS = XS.map((x) => Math.sin(3 * Math.PI * x));

function fitELM(H, seed) {
  const rand = rng(seed);
  const Win = Array.from({ length: H }, () => (rand() * 2 - 1) * 5);
  const Bin = Array.from({ length: H }, () => (rand() * 2 - 1) * 5);
  const Phi = XS.map((x) => [...Win.map((w, j) => sigmoid(w * x + Bin[j])), 1]);
  const w = leastSquares(Phi, YS);
  const preds = Phi.map((row) => row.reduce((s, v, i) => s + v * w[i], 0));
  const mse = preds.reduce((s, p, i) => s + (p - YS[i]) ** 2, 0) / preds.length;
  return { preds, mse };
}

export default function mount(root, kit) {
  const { frame, canvas, slider, button, stats, live } = kit;
  const body = frame(root, { title: "Random features, one linear solve" });
  const say = live(body);
  let H = 5, seed = 1;

  const cv = canvas(body, { aspect: 0.55, label: "Target curve and the ELM's fitted curve" });
  const st = stats([["h", "hidden units"], ["mse", "mean squared error"]]);
  const sl = slider({ label: "hidden units (H)", min: 1, max: 50, step: 1, value: H, format: (v) => String(v), onInput: (v) => { H = v; update(); } });
  const re = button("Re-roll random weights", () => { seed++; update(); });
  body.append(cv.box, st.el, sl.el, re);

  let last = fitELM(H, seed);
  cv.onDraw((ctx, w, hh, p) => {
    const m = plot(w, hh, [0, 1], [-1.3, 1.3]);
    m.axes(ctx, p, { xlabel: "x", ylabel: "y" });
    ctx.strokeStyle = p.muted; ctx.lineWidth = 2; ctx.beginPath();
    YS.forEach((y, i) => { const x = m.X(XS[i]), yy = m.Y(y); i === 0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); });
    ctx.stroke();
    ctx.strokeStyle = p.accent; ctx.lineWidth = 2; ctx.beginPath();
    last.preds.forEach((pval, i) => { const x = m.X(XS[i]), yy = m.Y(pval); i === 0 ? ctx.moveTo(x, yy) : ctx.lineTo(x, yy); });
    ctx.stroke();
  });

  function update() {
    last = fitELM(H, seed);
    st.set("h", String(H));
    st.set("mse", last.mse.toFixed(5));
    say(`${H} hidden units, mean squared error ${last.mse.toFixed(4)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
