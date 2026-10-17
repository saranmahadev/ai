// Bench: step the DPO loss directly and watch the preferred response's probability rise relative to the dispreferred one.
import { dpoStep, softmax } from "./llmkit.js";

const REF_LOGITS = [0.2, 0.5, 0.1, 0.3];
const PREF = 1, DISPREF = 3;
const LABELS = ["A", "B (preferred)", "C", "D (dispreferred)"];

export default function mount(root, kit) {
  const { frame, canvas, stepper, stats, live } = kit;
  const body = frame(root, { title: "No reward model, no RL loop" });
  const say = live(body);
  const refProbs = softmax(REF_LOGITS);
  let policyLogits = [...REF_LOGITS], step = 0;

  const cv = canvas(body, { aspect: 0.4, label: "Policy probability per candidate" });
  const st = stats([["step", "update step"], ["loss", "DPO loss"]]);

  function dpoLoss() {
    const p = softmax(policyLogits);
    const z = Math.log(p[PREF] / refProbs[PREF]) - Math.log(p[DISPREF] / refProbs[DISPREF]);
    return -Math.log(1 / (1 + Math.exp(-z)));
  }
  function report() {
    st.set("step", String(step));
    st.set("loss", dpoLoss().toFixed(4));
    const probs = softmax(policyLogits);
    say(`step ${step}: P(preferred)=${probs[PREF].toFixed(3)}, P(dispreferred)=${probs[DISPREF].toFixed(3)}`);
    cv.redraw();
  }
  cv.onDraw((ctx, w, hh, p) => {
    const probs = softmax(policyLogits), bw = w / (probs.length + 1);
    probs.forEach((pr, i) => {
      const bh = pr * (hh - 30);
      ctx.fillStyle = i === PREF ? p.accent : i === DISPREF ? p.warm : p.soft;
      ctx.fillRect(bw * (i + 0.5), hh - 15 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 9px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(LABELS[i], bw * (i + 0.5) + bw * 0.3, hh - 2);
    });
  });
  const sp = stepper({
    stepLabel: "DPO gradient step",
    onStep: () => { if (step >= 8) return false; policyLogits = dpoStep(policyLogits, refProbs, PREF, DISPREF); step++; report(); },
    onReset: () => { policyLogits = [...REF_LOGITS]; step = 0; report(); },
  });
  body.append(cv.box, st.el, sp.el);
  report();
  return () => cv.destroy();
}
