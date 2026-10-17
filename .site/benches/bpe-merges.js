// Bench: step through BPE training on a small corpus, then tokenize a new word with the learned merges.
import { bpeInit, bpePairStats, bpeBestPair, bpeMerge, bpeApply } from "./tfkit.js";

const CORPUS = { low: 5, lower: 2, newest: 6, widest: 3 };
const WORDS = ["lowest", "slowest", "newer", "xyz"];

export default function mount(root, kit) {
  const { frame, h, stepper, choice, stats, live } = kit;
  const body = frame(root, { title: "Building a vocabulary one merge at a time" });
  const say = live(body);

  let vocab, merges, step;
  function reset() { vocab = bpeInit(CORPUS); merges = []; step = 0; }
  reset();

  const vocabList = h("ul", { class: "isai-list" });
  const st = stats([["merge", "last merge"], ["count", "pair count"]]);
  let pick = WORDS[0];
  const tokenizedOut = h("p", { class: "bench-verdict" });
  const ch = choice("Tokenize", WORDS.map((w) => [w, w]), pick, (v) => { pick = v; drawTokenize(); });
  const sp = stepper({
    stepLabel: "Merge next pair",
    onStep: () => {
      const best = bpeBestPair(bpePairStats(vocab));
      if (!best) return false;
      merges.push(best);
      vocab = bpeMerge(best.pair, vocab);
      step++;
      draw();
      return true;
    },
    onReset: () => { reset(); draw(); }
  });
  body.append(vocabList, st.el, ch.el, tokenizedOut, sp.el);

  function draw() {
    vocabList.textContent = "";
    for (const [word, freq] of Object.entries(vocab)) vocabList.append(h("li", {}, h("b", {}, word), ` × ${freq}`));
    if (merges.length) {
      const last = merges[merges.length - 1];
      st.set("merge", last.pair.replace(",", " + "));
      st.set("count", String(last.count));
    } else {
      st.set("merge", "—");
      st.set("count", "—");
    }
    say(`${step} merge${step === 1 ? "" : "s"} so far`);
    drawTokenize();
  }

  function drawTokenize() {
    const pieces = bpeApply(pick, merges);
    tokenizedOut.textContent = "";
    tokenizedOut.append(`"${pick}" → `, h("b", {}, pieces.join(" · ")));
  }
  draw();
  return () => {};
}
