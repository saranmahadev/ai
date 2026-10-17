// Bench: score a candidate sentence against a reference with BLEU (precision) and ROUGE (recall).
import { bleuScore, rougeRecall } from "./gakit.js";

const REFERENCE = "the cat sat on the mat";
const CANDIDATES = {
  "exact match": "the cat sat on the mat",
  "paraphrase": "a cat sat on a mat",
  "unrelated": "a dog ran in the park",
};

export default function mount(root, kit) {
  const { frame, choice, stats, live } = kit;
  const body = frame(root, { title: "Precision (BLEU) vs. recall (ROUGE)" });
  const say = live(body);
  let key = Object.keys(CANDIDATES)[0];

  const st = stats([["candidate", "candidate"], ["bleu", "BLEU"], ["rouge", "ROUGE-1 recall"]]);
  const ch = choice("Candidate", Object.keys(CANDIDATES).map((k) => [k, k]), key, (v) => { key = v; update(); });
  body.append(st.el, ch.el);

  function update() {
    const cand = CANDIDATES[key];
    const bleu = bleuScore(cand, REFERENCE);
    const rouge = rougeRecall(cand, REFERENCE);
    st.set("candidate", `"${cand}"`);
    st.set("bleu", bleu.toFixed(4));
    st.set("rouge", rouge.toFixed(4));
    say(`"${cand}": BLEU ${bleu.toFixed(3)}, ROUGE-1 recall ${rouge.toFixed(3)}`);
  }
  update();
  return () => {};
}
