// Bench: toggle which model-card sections are filled in and watch the completeness score change.
import { modelCardCompleteness } from "./llmkit.js";

const SECTIONS = [
  ["intended_use", "Intended use"],
  ["limitations", "Known limitations"],
  ["training_data", "Training data summary"],
  ["evaluation_results", "Evaluation results"],
  ["known_biases", "Known biases"],
];

export default function mount(root, kit) {
  const { frame, toggles, stats, live } = kit;
  const body = frame(root, { title: "A model card is only as good as what's filled in" });
  const say = live(body);
  let filled = { intended_use: true, limitations: true, training_data: false, evaluation_results: false, known_biases: false };

  const st = stats([["completeness", "completeness score"]]);
  const tg = toggles(SECTIONS.map(([key, label]) => [key, label, filled[key]]), (values) => { filled = values; update(); });
  body.append(st.el, tg.el);

  function update() {
    const filledKeys = Object.keys(filled).filter((k) => filled[k]);
    const score = modelCardCompleteness(filledKeys, SECTIONS.map(([k]) => k));
    st.set("completeness", `${(score * 100).toFixed(0)}%`);
    say(`${filledKeys.length} of ${SECTIONS.length} sections filled: ${(score * 100).toFixed(0)} percent complete`);
  }
  update();
  return () => {};
}
