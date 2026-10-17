// Bench: watch a looping toy model break its loop under a repetition penalty, and stop early under a length bias.
import { argmax, applyRepetitionPenalty, applyLengthBias } from "./gakit.js";

const VOCAB = ["the", "cat", "sat", "again", "<eos>"];
const START = [0.5, 2.5, -1, -1, -3];
const ROW = { 1: [-1, -1, 3.0, -1, -1], 2: [-1, -1, -1, 2.5, 0.3], 3: [-1, -1, 2.8, -1, 0.5], 0: [-1, 1.0, 1.0, -1, -1] };
function nextLogits(prevId) { return prevId === undefined ? START : ROW[prevId]; }

export default function mount(root, kit) {
  const { frame, h, slider, stats, live } = kit;
  const body = frame(root, { title: "Breaking a loop, and stopping on time" });
  const say = live(body);
  let penalty = 1.0, softCap = 20, bias = 0;

  const out = h("p", { class: "isai-readout" });
  const st = stats([["length", "tokens generated"]]);
  const slPen = slider({ label: "repetition penalty", min: 1.0, max: 3.0, step: 0.1, value: penalty, format: (v) => v.toFixed(1), onInput: (v) => { penalty = v; update(); } });
  const slCap = slider({ label: "soft length cap", min: 2, max: 20, step: 1, value: softCap, format: (v) => String(v), onInput: (v) => { softCap = v; bias = v < 20 ? 3 : 0; update(); } });
  body.append(out, st.el, slPen.el, slCap.el);

  function generate() {
    const seq = []; let prev; const counts = {};
    for (let step = 0; step < 20; step++) {
      let logits = nextLogits(prev).slice();
      logits = applyRepetitionPenalty(logits, counts, penalty);
      logits = applyLengthBias(logits, step, { softCapLen: softCap, bias, eosId: 4 });
      const next = argmax(logits);
      seq.push(next);
      counts[next] = (counts[next] || 0) + 1;
      if (next === 4) break;
      prev = next;
    }
    return seq;
  }

  function update() {
    const seq = generate();
    out.textContent = seq.map((i) => VOCAB[i]).join(" ");
    st.set("length", String(seq.length));
    say(`generated ${seq.length} tokens: ${seq.map((i) => VOCAB[i]).join(", ")}`);
  }
  update();
  return () => {};
}
