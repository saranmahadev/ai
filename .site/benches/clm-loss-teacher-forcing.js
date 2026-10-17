// Bench: step through a sequence and watch the causal-LM loss at each position under teacher forcing.
import { clmLoss } from "./llmkit.js";

const STEPS = [
  { logits: [2, 0.5, 0.1, 0.1], trueNext: 0, label: "the" },
  { logits: [0.2, 1.8, 0.3, 0.1], trueNext: 1, label: "cat" },
  { logits: [0.1, 0.2, 2.5, 0.1], trueNext: 2, label: "sat" },
  { logits: [0.5, 0.5, 0.5, 0.5], trueNext: 3, label: "down" },
];

export default function mount(root, kit) {
  const { frame, h, stepper, stats, live } = kit;
  const body = frame(root, { title: "Scoring the token that actually comes next" });
  const say = live(body);
  let shown = 0;
  const { perPosition, meanLoss } = clmLoss(STEPS);

  const list = h("ol", { class: "isai-list" });
  const st = stats([["mean", "mean loss so far"]]);

  function render() {
    list.textContent = "";
    let sum = 0;
    perPosition.slice(0, shown).forEach((p, i) => {
      sum += p.loss;
      list.append(h("li", {}, `"${STEPS[i].label}": P(true) = ${p.probTrue.toFixed(3)}, loss = ${p.loss.toFixed(3)}`));
    });
    st.set("mean", shown ? (sum / shown).toFixed(4) : "—");
    if (shown > 0) say(`"${STEPS[shown - 1].label}": probability ${perPosition[shown - 1].probTrue.toFixed(3)}, loss ${perPosition[shown - 1].loss.toFixed(3)}`);
  }
  const sp = stepper({
    stepLabel: "Next position",
    onStep: () => { if (shown >= STEPS.length) return false; shown++; render(); },
    onReset: () => { shown = 0; render(); },
  });
  body.append(list, st.el, sp.el);
  render();
  return () => {};
}
