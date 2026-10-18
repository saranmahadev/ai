// Bench: check a benchmark question for n-gram overlap against a training document to detect contamination.
import { overlapFraction } from "./gakit.js";

const BENCHMARK_QUESTION = "what is the capital of australia and what is its population".split(" ");
const DOCS = {
  "contaminated (contains the question)": "the quiz asks what is the capital of australia and what is its population exactly".split(" "),
  "clean (unrelated phrasing)": "canberra became the capital in 1927 after a long design competition".split(" "),
};

export default function mount(root, kit) {
  const { frame, h, choice, slider, stats, live } = kit;
  const body = frame(root, { title: "Did the model already see the test?" });
  const say = live(body);
  let key = Object.keys(DOCS)[0], n = 5;

  const out = h("p", { class: "isai-readout" });
  const st = stats([["overlap", "n-gram overlap"], ["flagged", "flagged as contaminated?"]]);
  const ch = choice("Training document", Object.keys(DOCS).map((k) => [k, k]), key, (v) => { key = v; update(); });
  const sl = slider({ label: "n-gram length", min: 3, max: 8, step: 1, value: n, format: (v) => String(v), onInput: (v) => { n = v; update(); } });
  body.append(out, st.el, ch.el, sl.el);

  function update() {
    const overlap = overlapFraction(BENCHMARK_QUESTION, DOCS[key], n);
    out.textContent = DOCS[key].join(" ");
    st.set("overlap", `${(overlap * 100).toFixed(0)}%`);
    st.set("flagged", overlap >= 0.3 ? "yes" : "no");
    say(`"${key}": ${(overlap * 100).toFixed(0)} percent overlap with the benchmark question`);
  }
  update();
  return () => {};
}
