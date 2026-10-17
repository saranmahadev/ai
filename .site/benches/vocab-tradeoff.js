// Bench: train BPE to a chosen number of merges, and show vocabulary size, average tokens per word, and embedding parameter cost.
import { bpeTrain, bpeApply } from "./tfkit.js";

const CORPUS = { low: 5, lower: 2, newest: 6, widest: 3, newer: 2, lowest: 1 };
const TEST_WORDS = ["low", "lower", "newest", "widest", "newer", "lowest", "slowest"];

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Vocabulary size, sequence length and parameter cost" });
  const say = live(body);
  let merges = 8, dModel = 768;

  const cv = canvas(body, { aspect: 0.5, label: "Tokens needed for each test word at the chosen vocabulary size" });
  const st = stats([["vocab", "vocabulary size"], ["avg", "avg tokens per word"], ["params", "embedding parameters"]]);
  const slM = slider({ label: "BPE merges", min: 0, max: 16, step: 1, value: merges, format: (v) => String(v), onInput: (v) => { merges = v; update(); } });
  const slD = slider({ label: "model width (d_model)", min: 64, max: 1024, step: 64, value: dModel, format: (v) => String(v), onInput: (v) => { dModel = v; update(); } });
  body.append(cv.box, st.el, slM.el, slD.el);

  let counts = [];
  cv.onDraw((ctx, w, hh, p) => {
    const bw = w / (TEST_WORDS.length + 1);
    const maxC = Math.max(...counts, 1);
    TEST_WORDS.forEach((word, i) => {
      const c = counts[i];
      const bh = (c / maxC) * (hh - 50);
      ctx.fillStyle = p.accent;
      ctx.fillRect(bw * (i + 0.5), hh - 24 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 10px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(word, bw * (i + 0.5) + bw * 0.3, hh - 10);
      ctx.fillText(String(c), bw * (i + 0.5) + bw * 0.3, hh - 28 - bh);
    });
  });

  function update() {
    const { vocab, merges: list } = bpeTrain(CORPUS, merges);
    const vocabSize = new Set(Object.keys(vocab).flatMap((wform) => wform.split(" "))).size;
    counts = TEST_WORDS.map((w) => bpeApply(w, list).length);
    const avg = counts.reduce((a, b) => a + b, 0) / counts.length;
    const params = vocabSize * dModel;
    st.set("vocab", String(vocabSize));
    st.set("avg", avg.toFixed(2));
    st.set("params", params.toLocaleString());
    say(`vocabulary ${vocabSize}, average ${avg.toFixed(2)} tokens per word, ${params.toLocaleString()} embedding parameters`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
