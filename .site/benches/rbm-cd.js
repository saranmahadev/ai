// Bench: step through one contrastive-divergence (CD-1) cycle on a small restricted Boltzmann machine.
import { sigmoid } from "./nnkit.js";
import { rng } from "./kit.js";

const W = [[0.8, -0.6], [-0.4, 0.7]]; // visible x hidden
const V0 = [1, 1];
const STAGES = ["Start: v⁰ (data)", "Sample h⁰ from v⁰", "Reconstruct v¹ from h⁰", "Recompute h¹ probabilities from v¹", "Weight update ΔW"];

export default function mount(root, kit) {
  const { frame, canvas, slider, stepper, stats, live } = kit;
  const body = frame(root, { title: "One contrastive-divergence cycle" });
  const say = live(body);
  let lr = 0.1;
  let rand = rng(1);
  let stage = 0;
  let hProb, h0, vProb, v1, h1Prob, dW;

  const cv = canvas(body, { aspect: 0.55, label: "Visible and hidden units, with the current stage's values" });
  const st = stats([["stage", "stage"], ["dw00", "ΔW[0][0]"], ["dw01", "ΔW[0][1]"]]);
  const sl = slider({ label: "learning rate η", min: 0.02, max: 0.3, step: 0.02, value: lr, format: (v) => v.toFixed(2), onInput: (v) => { lr = v; if (stage >= 4) compute4(); draw(); } });

  function reset() { rand = rng(1); stage = 0; hProb = h0 = vProb = v1 = h1Prob = dW = null; }
  function compute1() { hProb = V0.map((_, j) => sigmoid(V0[0] * W[0][j] + V0[1] * W[1][j])); h0 = hProb.map((p) => (rand() < p ? 1 : 0)); }
  function compute2() { vProb = [0, 1].map((i) => sigmoid(h0[0] * W[i][0] + h0[1] * W[i][1])); v1 = vProb.map((p) => (rand() < p ? 1 : 0)); }
  function compute3() { h1Prob = [0, 1].map((j) => sigmoid(v1[0] * W[0][j] + v1[1] * W[1][j])); }
  function compute4() {
    dW = [[0, 0], [0, 0]];
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) dW[i][j] = lr * (V0[i] * hProb[j] - v1[i] * h1Prob[j]);
  }

  const sp = stepper({
    onStep: () => {
      stage++;
      if (stage === 1) compute1();
      else if (stage === 2) compute2();
      else if (stage === 3) compute3();
      else if (stage === 4) compute4();
      draw();
      return stage < 4;
    },
    onReset: () => { reset(); draw(); }
  });
  body.append(cv.box, st.el, sl.el, sp.el);

  cv.onDraw((ctx, w, hh, p) => {
    const vx = [w * 0.3, w * 0.7], vy = hh * 0.78, hx = [w * 0.3, w * 0.7], hy = hh * 0.22;
    ctx.strokeStyle = p.muted; ctx.lineWidth = 1.5;
    for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) { ctx.beginPath(); ctx.moveTo(vx[i], vy); ctx.lineTo(hx[j], hy); ctx.stroke(); }
    ctx.font = "700 12px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
    const vState = stage >= 2 ? v1 : V0;
    const hState = stage >= 1 ? h0 : null;
    vState.forEach((v, i) => { ctx.fillStyle = v ? p.good : p.soft; ctx.beginPath(); ctx.arc(vx[i], vy, 20, 0, 7); ctx.fill(); ctx.fillStyle = p.ink; ctx.fillText(`v${i}=${v}`, vx[i], vy + 35); });
    if (hState) hState.forEach((v, j) => { ctx.fillStyle = v ? p.good : p.soft; ctx.beginPath(); ctx.arc(hx[j], hy, 20, 0, 7); ctx.fill(); ctx.fillStyle = p.ink; ctx.fillText(`h${j}=${v}`, hx[j], hy - 28); });
    else [0, 1].forEach((j) => { ctx.fillStyle = p.soft2; ctx.beginPath(); ctx.arc(hx[j], hy, 20, 0, 7); ctx.fill(); });
  });

  function draw() {
    st.set("stage", STAGES[stage]);
    st.set("dw00", dW ? dW[0][0].toFixed(4) : "—");
    st.set("dw01", dW ? dW[0][1].toFixed(4) : "—");
    say(STAGES[stage]);
    cv.redraw();
  }
  reset();
  draw();
  return () => cv.destroy();
}
