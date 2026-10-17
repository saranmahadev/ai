// Bench: trace a small sequence through one complete pre-norm transformer block, step by step.
import { selfAttention, layerNorm, feedForward, relu, vecAdd, vecNorm } from "./tfkit.js";
import { rng } from "./kit.js";

const D_MODEL = 4, D_FF = 8, SEQ_LEN = 3;

function buildWeights(rand) {
  const randMat = (a, b, scale) => Array.from({ length: a }, () => Array.from({ length: b }, () => (rand() * 2 - 1) * scale));
  return {
    Wq: randMat(D_MODEL, D_MODEL, 0.5), Wk: randMat(D_MODEL, D_MODEL, 0.5), Wv: randMat(D_MODEL, D_MODEL, 0.5),
    W1: randMat(D_FF, D_MODEL, 0.4), b1: Array.from({ length: D_FF }, () => (rand() * 2 - 1) * 0.1),
    W2: randMat(D_MODEL, D_FF, 0.4), b2: Array.from({ length: D_MODEL }, () => (rand() * 2 - 1) * 0.1)
  };
}

export default function mount(root, kit) {
  const { frame, canvas, stepper, stats, live } = kit;
  const body = frame(root, { title: "One block, start to finish" });
  const say = live(body);
  const STAGES = ["input X", "after attention + residual (X₁)", "after feed-forward + residual (X₂)"];

  let rand, weights, X, stage, norms;
  function reset() {
    rand = rng(13);
    weights = buildWeights(rand);
    X = Array.from({ length: SEQ_LEN }, () => Array.from({ length: D_MODEL }, () => (rand() * 2 - 1)));
    stage = 0;
    norms = [X.map(vecNorm)];
  }
  reset();

  const cv = canvas(body, { aspect: 0.5, label: "Each position's vector norm, at each stage of the block" });
  const st = stats([["stage", "stage"]]);
  const sp = stepper({
    stepLabel: "Next step",
    onStep: () => {
      if (stage === 0) {
        const Xnorm = X.map((x) => layerNorm(x));
        const { out: attnOut } = selfAttention(Xnorm, { Wq: weights.Wq, Wk: weights.Wk, Wv: weights.Wv });
        X = X.map((x, i) => vecAdd(x, attnOut[i]));
        stage = 1;
      } else if (stage === 1) {
        const X1norm = X.map((x) => layerNorm(x));
        const ffnOut = X1norm.map((x) => feedForward(x, { W1: weights.W1, b1: weights.b1, W2: weights.W2, b2: weights.b2, activation: relu }));
        X = X.map((x, i) => vecAdd(x, ffnOut[i]));
        stage = 2;
      }
      norms.push(X.map(vecNorm));
      draw();
      return stage < 2;
    },
    onReset: () => { reset(); draw(); }
  });
  body.append(cv.box, st.el, sp.el);

  cv.onDraw((ctx, w, hh, p) => {
    const bw = w / (SEQ_LEN + 1);
    const maxV = Math.max(...norms.flat(), 1);
    norms[norms.length - 1].forEach((v, i) => {
      const bh = (v / maxV) * (hh - 40);
      ctx.fillStyle = p.accent;
      ctx.fillRect(bw * (i + 0.5), hh - 24 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 11px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(`pos ${i}`, bw * (i + 0.5) + bw * 0.3, hh - 6);
      ctx.fillText(v.toFixed(3), bw * (i + 0.5) + bw * 0.3, hh - 28 - bh);
    });
  });

  function draw() {
    st.set("stage", STAGES[stage]);
    say(`${STAGES[stage]}: norms ${norms[norms.length - 1].map((v) => v.toFixed(2)).join(", ")}`);
    cv.redraw();
  }
  draw();
  return () => cv.destroy();
}
