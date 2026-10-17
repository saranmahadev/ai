// Bench: run repeated contrastive-divergence updates on a tiny RBM and track mean-field reconstruction error over epochs.
import { sigmoid } from "./nnkit.js";
import { rng, plot } from "./kit.js";

const DATA = [[1, 1], [0, 1], [1, 0]];
const LR = 0.3;

function hProbOf(W, v) { return [0, 1].map((j) => sigmoid(v[0] * W[0][j] + v[1] * W[1][j])); }
function vProbOf(W, h) { return [0, 1].map((i) => sigmoid(h[0] * W[i][0] + h[1] * W[i][1])); }
function sampleAll(p, rand) { return p.map((x) => (rand() < x ? 1 : 0)); }

function cdKUpdate(W, v0, k, rand) {
  const hProb0 = hProbOf(W, v0);
  let h = sampleAll(hProb0, rand), v = v0, hProb = hProb0;
  for (let step = 0; step < k; step++) {
    const vProb = vProbOf(W, h);
    v = sampleAll(vProb, rand);
    hProb = hProbOf(W, v);
    h = sampleAll(hProb, rand);
  }
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) W[i][j] += LR * (v0[i] * hProb0[j] - v[i] * hProb[j]);
}

function meanFieldError(W) {
  let err = 0;
  for (const v0 of DATA) {
    const hp = hProbOf(W, v0);
    const vp = vProbOf(W, hp);
    err += v0.reduce((s, vi, i) => s + (vi - vp[i]) ** 2, 0);
  }
  return err / DATA.length;
}

export default function mount(root, kit) {
  const { frame, canvas, choice, stepper, stats, live } = kit;
  const body = frame(root, { title: "Training an RBM with contrastive divergence" });
  const say = live(body);
  let k = 1, rand, W, epoch, history;

  function reset() {
    rand = rng(2);
    W = [[0.3, -0.1], [-0.1, 0.3]];
    epoch = 0;
    history = [meanFieldError(W)];
  }
  reset();

  const cv = canvas(body, { aspect: 0.55, label: "Mean-field reconstruction error over training epochs" });
  const st = stats([["epoch", "epoch"], ["error", "reconstruction error"], ["k", "Gibbs steps per update (k)"]]);
  const ch = choice("Gibbs steps k", [["1", 1], ["5", 5]], k, (v) => { k = +v; reset(); draw(); });
  const sp = stepper({
    stepLabel: "Run 10 epochs",
    onStep: () => {
      for (let e = 0; e < 10; e++) { for (const v0 of DATA) cdKUpdate(W, v0, k, rand); epoch++; history.push(meanFieldError(W)); }
      draw();
      return epoch < 200;
    },
    onReset: () => { reset(); draw(); }
  });
  body.append(cv.box, st.el, ch.el, sp.el);

  cv.onDraw((ctx, w, hh, p) => {
    const m = plot(w, hh, [0, Math.max(20, history.length - 1)], [0, Math.max(0.6, Math.max(...history))]);
    m.axes(ctx, p, { xlabel: "epoch", ylabel: "error" });
    ctx.strokeStyle = p.accent; ctx.lineWidth = 2; ctx.beginPath();
    history.forEach((e, i) => { const x = m.X(i), y = m.Y(e); i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y); });
    ctx.stroke();
  });

  function draw() {
    const e = history[history.length - 1];
    st.set("epoch", String(epoch));
    st.set("error", e.toFixed(4));
    st.set("k", String(k));
    say(`epoch ${epoch}, reconstruction error ${e.toFixed(3)}`);
    cv.redraw();
  }
  draw();
  return () => cv.destroy();
}
