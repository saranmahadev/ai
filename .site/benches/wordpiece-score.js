// Bench: compare BPE's frequency-based merges against WordPiece's co-occurrence-score merges, then show SentencePiece-style reconstruction.
import { bpeInit, bpePairStats, bpeBestPair, bpeMerge, wordpieceBestPair, streamInit } from "./tfkit.js";

const CORPUS = { low: 5, lower: 2, newest: 6, widest: 3 };
const PHRASES = { "▁low▁tide": 4, "▁low▁sun": 2, "▁new▁tide": 3 };

export default function mount(root, kit) {
  const { frame, h, stepper, choice, stats, live } = kit;
  const body = frame(root, { title: "Frequency vs co-occurrence score" });
  const say = live(body);
  let mode = "BPE", vocab, step;

  function reset() { vocab = bpeInit(CORPUS); step = 0; }
  reset();

  const vocabList = h("ul", { class: "isai-list" });
  const st = stats([["pick", "this step's merge"], ["score", mode === "BPE" ? "count" : "score"]]);
  const ch = choice("Scoring rule", [["BPE", "BPE"], ["WordPiece", "WordPiece"]], mode, (v) => { mode = v; reset(); draw(); });
  const sp = stepper({
    stepLabel: "Merge next pair",
    onStep: () => {
      const best = mode === "BPE" ? bpeBestPair(bpePairStats(vocab)) : wordpieceBestPair(vocab);
      if (!best) return false;
      vocab = bpeMerge(best.pair, vocab);
      step++;
      draw(best);
      return true;
    },
    onReset: () => { reset(); draw(); }
  });

  // SentencePiece-style phrase reconstruction, shown as a fixed worked demo alongside the stepper.
  let phraseVocab = streamInit(PHRASES);
  for (let i = 0; i < 6; i++) {
    const best = bpeBestPair(bpePairStats(phraseVocab));
    if (!best) break;
    phraseVocab = bpeMerge(best.pair, phraseVocab);
  }
  const pieces = Object.keys(phraseVocab)[0].split(" ");
  const reconstructed = pieces.join("").split("▁").join(" ").trim();
  const spBlock = h("div", {}, h("p", {}, h("b", {}, "SentencePiece-style: "), `pieces for "▁low▁tide" → ${pieces.join(" · ")}`), h("p", {}, h("b", {}, "reconstructed: "), `"${reconstructed}"`));

  body.append(vocabList, st.el, ch.el, sp.el, spBlock);

  function draw(best) {
    vocabList.textContent = "";
    for (const [word, freq] of Object.entries(vocab)) vocabList.append(h("li", {}, h("b", {}, word), ` × ${freq}`));
    if (best) {
      st.set("pick", best.pair.replace(",", " + "));
      st.set("score", mode === "BPE" ? String(best.count) : best.score.toFixed(4));
    } else {
      st.set("pick", "—");
      st.set("score", "—");
    }
    say(`${mode}: ${step} merge${step === 1 ? "" : "s"} so far`);
  }
  draw();
  return () => {};
}
