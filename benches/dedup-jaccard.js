// Bench: compare n-gram Jaccard similarity between document pairs to flag near-duplicates.
import { ngramSet, jaccardSimilarity } from "./llmkit.js";

const DOC_A = "the quick brown fox jumps over the lazy dog";
const PAIRS = {
  "near-duplicate": "the quick brown fox jumps over a lazy dog",
  "unrelated": "completely different content about something else entirely",
};

export default function mount(root, kit) {
  const { frame, slider, choice, stats, live } = kit;
  const body = frame(root, { title: "Flagging near-duplicates before training" });
  const say = live(body);
  let key = "near-duplicate", n = 3, threshold = 0.3;

  const st = stats([["similarity", "n-gram Jaccard similarity"], ["flagged", "flagged as duplicate?"]]);
  const ch = choice("Compare against", Object.keys(PAIRS).map((k) => [k, k]), key, (v) => { key = v; update(); });
  const sl = slider({ label: "duplicate threshold", min: 0.1, max: 0.8, step: 0.05, value: threshold, format: (v) => v.toFixed(2), onInput: (v) => { threshold = v; update(); } });
  body.append(st.el, ch.el, sl.el);

  function update() {
    const setA = ngramSet(DOC_A.split(" "), n), setB = ngramSet(PAIRS[key].split(" "), n);
    const sim = jaccardSimilarity(setA, setB);
    const flagged = sim >= threshold;
    st.set("similarity", sim.toFixed(3));
    st.set("flagged", flagged ? "yes" : "no");
    say(`similarity to "${key}" is ${sim.toFixed(3)}; ${flagged ? "flagged" : "not flagged"} as a duplicate at threshold ${threshold.toFixed(2)}`);
  }
  update();
  return () => {};
}
