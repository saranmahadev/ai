// Bench: compare a raw toy model's output against the same model with a grammar mask applied.
import { argmax, grammarMask } from "./gakit.js";

const VOCAB = ["1", "2", "3", "+", "-", "*", "<eos>"];
const NUM = [0, 1, 2], OP = [3, 4, 5], EOS = 6;
const START = [0.2, 0.1, 0.0, 1.5, 0.3, 0.1, -5];
const AFTER_NUM = [0.1, 0.1, 0.1, 1.2, 0.3, 0.2, 0.9];
const AFTER_OP = [1.0, 0.3, 0.2, 0.1, 0.1, 0.1, -5];
function logitsFor(state) { return state === "start" ? START : state === "after_num" ? AFTER_NUM : AFTER_OP; }

export default function mount(root, kit) {
  const { frame, h, toggles, stats, live } = kit;
  const body = frame(root, { title: "Masking out invalid tokens as you generate" });
  const say = live(body);
  let constrained = true;

  const out = h("p", { class: "isai-readout" });
  const st = stats([["valid", "is the output valid arithmetic?"]]);
  const tg = toggles([["constrained", "apply grammar mask", constrained]], (values) => { constrained = values.constrained; update(); });
  body.append(out, st.el, tg.el);

  function isValidArithmetic(tokens) {
    if (tokens.length === 0 || tokens.length % 2 === 0) return false;
    return tokens.every((tok, i) => {
      const id = VOCAB.indexOf(tok);
      return i % 2 === 0 ? NUM.includes(id) : OP.includes(id);
    });
  }

  function generate() {
    let state = "start"; const seq = [];
    for (let step = 0; step < 5; step++) {
      let logits = logitsFor(state);
      if (constrained) logits = grammarMask(logits, state === "after_op" || state === "start" ? NUM : [...OP, EOS]);
      const next = argmax(logits);
      seq.push(VOCAB[next]);
      if (next === EOS) break;
      state = NUM.includes(next) ? "after_num" : "after_op";
    }
    return seq;
  }

  function update() {
    const seq = generate();
    out.textContent = seq.join(" ");
    const valid = isValidArithmetic(seq.filter((t) => t !== "<eos>"));
    st.set("valid", valid ? "yes" : "no");
    say(`${constrained ? "constrained" : "unconstrained"} output: ${seq.join(" ")} — ${valid ? "valid" : "invalid"} arithmetic`);
  }
  update();
  return () => {};
}
