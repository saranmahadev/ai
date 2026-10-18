// Capstone: step through pretraining, SFT, DPO alignment and deployment, reusing this planet's own verified functions at each stage.
import { clmLoss, dpoStep, softmax, apiCostLatency } from "./llmkit.js";

const PRETRAIN_STEPS = [
  { logits: [0.3, 0.2, 2.0, 0.1], trueNext: 0 }, { logits: [1.8, 0.2, 0.3, 0.1], trueNext: 1 },
  { logits: [0.2, 2.1, 0.3, 0.1], trueNext: 2 }, { logits: [0.4, 0.3, 0.2, 0.3], trueNext: 3 },
];
const SFT_STEPS = [
  { logits: [2.5, 0.2, 0.1, 0.1], trueNext: 0 }, { logits: [0.2, 2.3, 0.3, 0.1], trueNext: 1 },
  { logits: [0.1, 0.2, 2.6, 0.1], trueNext: 2 }, { logits: [0.2, 0.1, 0.2, 2.4], trueNext: 3 },
];
const REF_LOGITS = [0.2, 0.5, 0.1, 0.3], PREF = 1, DISPREF = 3;
const PRICE = { priceIn: 0.003, priceOut: 0.015, prefillPerTok: 0.0005, decodePerTok: 0.02, fixedOverhead: 0.1 };
const STAGES = ["pretraining", "supervised fine-tuning", "preference alignment (DPO)", "deployment"];

export default function mount(root, kit) {
  const { frame, h, stepper, stats, live } = kit;
  const body = frame(root, { title: "One model, through every stage of this road" });
  const say = live(body);
  let stage = 0;
  const refProbs = softmax(REF_LOGITS);

  const list = h("ol", { class: "isai-list" });
  const st = stats([["stage", "current stage"]]);
  body.append(list, st.el);

  function computeStageText(i) {
    if (i === 0) {
      const { meanLoss } = clmLoss(PRETRAIN_STEPS);
      return `Pretraining on raw text (causal LM): mean loss ${meanLoss.toFixed(4)} — the model only predicts the next token, nothing more.`;
    }
    if (i === 1) {
      const { meanLoss } = clmLoss(SFT_STEPS);
      return `Supervised fine-tuning on assistant-formatted demonstrations: mean loss drops to ${meanLoss.toFixed(4)} — same objective, now on the assistant's own words.`;
    }
    if (i === 2) {
      let policyLogits = [...REF_LOGITS];
      for (let s = 0; s < 5; s++) policyLogits = dpoStep(policyLogits, refProbs, PREF, DISPREF);
      const p = softmax(policyLogits)[PREF];
      return `Direct preference optimization over 5 steps: P(preferred response) rises from ${refProbs[PREF].toFixed(3)} to ${p.toFixed(3)} — no separate reward model, no RL loop.`;
    }
    const { cost, latency } = apiCostLatency(80, 120, PRICE);
    return `Deployed behind an API: an 80-token prompt and 120-token reply cost $${cost.toFixed(5)} and take ${latency.toFixed(2)}s — the same model, now priced and timed per request.`;
  }
  const stageText = STAGES.map((_, i) => computeStageText(i));

  function render() {
    list.textContent = "";
    for (let i = 0; i <= stage; i++) list.append(h("li", {}, `${STAGES[i]}: ${stageText[i]}`));
    st.set("stage", `${stage + 1} / ${STAGES.length} — ${STAGES[stage]}`);
    say(stageText[stage]);
  }
  const sp = stepper({
    stepLabel: "pipeline stage",
    onStep: () => {
      if (stage >= STAGES.length - 1) return false;
      stage++;
      render();
      return stage < STAGES.length - 1;
    },
    onReset: () => { stage = 0; render(); },
  });
  body.append(sp.el);
  render();
  return () => {};
}
