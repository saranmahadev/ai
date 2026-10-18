// Bench: compare a base model's loss on an assistant-formatted response against an SFT-trained model's.
import { clmLoss } from "./llmkit.js";

const MODELS = {
  "base (pretrained only)": [
    { logits: [0.3, 0.2, 2.0, 0.1], trueNext: 0 }, { logits: [1.8, 0.2, 0.3, 0.1], trueNext: 1 },
    { logits: [0.2, 2.1, 0.3, 0.1], trueNext: 2 }, { logits: [0.4, 0.3, 0.2, 0.3], trueNext: 3 },
  ],
  "after SFT": [
    { logits: [2.5, 0.2, 0.1, 0.1], trueNext: 0 }, { logits: [0.2, 2.3, 0.3, 0.1], trueNext: 1 },
    { logits: [0.1, 0.2, 2.6, 0.1], trueNext: 2 }, { logits: [0.2, 0.1, 0.2, 2.4], trueNext: 3 },
  ],
};

export default function mount(root, kit) {
  const { frame, canvas, choice, stats, live } = kit;
  const body = frame(root, { title: "Learning to produce the assistant's own words" });
  const say = live(body);
  let key = Object.keys(MODELS)[0];

  const cv = canvas(body, { aspect: 0.4, label: "Probability assigned to the true next token" });
  const st = stats([["meanLoss", "mean loss"]]);
  const ch = choice("Model", Object.keys(MODELS).map((k) => [k, k]), key, (v) => { key = v; update(); });
  body.append(cv.box, st.el, ch.el);

  let result;
  cv.onDraw((ctx, w, hh, p) => {
    const bw = w / (result.perPosition.length + 1);
    result.perPosition.forEach((pos, i) => {
      const bh = pos.probTrue * (hh - 30);
      ctx.fillStyle = p.accent;
      ctx.fillRect(bw * (i + 0.5), hh - 15 - bh, bw * 0.6, bh);
    });
  });

  function update() {
    result = clmLoss(MODELS[key]);
    st.set("meanLoss", result.meanLoss.toFixed(4));
    say(`"${key}": mean loss ${result.meanLoss.toFixed(4)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
