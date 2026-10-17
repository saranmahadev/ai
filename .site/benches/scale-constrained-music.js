// Bench: generate a toy melody with and without masking notes to a musical scale.
import { softmax, sampleFromProbs, grammarMask } from "./gakit.js";
import { rng } from "./kit.js";

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
const SCALE = [0, 2, 4, 5, 7, 9, 11]; // C major

function nextNoteLogits(prev) {
  return NOTE_NAMES.map((_, n) => -Math.abs(n - prev) * 0.5);
}

export default function mount(root, kit) {
  const { frame, h, toggles, stats, live } = kit;
  const body = frame(root, { title: "Keeping a melody in key" });
  const say = live(body);
  let constrained = true;

  const out = h("p", { class: "isai-readout" });
  const st = stats([["offscale", "notes outside the scale"]]);
  const tg = toggles([["constrained", "mask to C major scale", constrained]], (v) => { constrained = v.constrained; update(); });
  body.append(out, st.el, tg.el);

  function generate() {
    const rand = rng(5);
    let prev = 0;
    const seq = [prev];
    for (let i = 0; i < 10; i++) {
      let logits = nextNoteLogits(prev);
      if (constrained) logits = grammarMask(logits, SCALE);
      const probs = softmax(logits);
      const next = sampleFromProbs(probs, rand);
      seq.push(next);
      prev = next;
    }
    return seq;
  }

  function update() {
    const seq = generate();
    out.textContent = seq.map((n) => NOTE_NAMES[n]).join(" - ");
    const offscale = seq.filter((n) => !SCALE.includes(n));
    st.set("offscale", String(offscale.length));
    say(`${constrained ? "scale-masked" : "unconstrained"} melody: ${offscale.length} notes outside the scale`);
  }
  update();
  return () => {};
}
