// Bench: a decoder hidden state attends over three fixed encoder hidden states, producing a fresh context.
import { softmax } from "./dlkit.js";

const H_ENC = [0.5370, 0.4851, 0.7565];

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "A fresh context at every decoding step" });
  const say = live(body);
  let hd = 0.6;

  const cv = canvas(body, { aspect: 0.5, label: "Attention weights over the three encoder states, and the resulting context" });
  const st = stats([["weights", "attention weights"], ["context", "context vector"]]);
  const sl = slider({ label: "decoder hidden state", min: -1, max: 1, step: 0.05, value: hd, format: (v) => v.toFixed(2), onInput: (v) => { hd = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  function compute() {
    const scores = H_ENC.map((v) => hd * v);
    const weights = softmax(scores);
    const context = weights.reduce((s, w, i) => s + w * H_ENC[i], 0);
    return { scores, weights, context };
  }

  cv.onDraw((ctx, w, hh, p) => {
    const { weights } = compute();
    const n = H_ENC.length, groupW = w / n;
    weights.forEach((wv, i) => {
      const bh = wv * (hh - 30);
      ctx.fillStyle = p.accent;
      ctx.fillRect(i * groupW + groupW * 0.25, hh - 20 - bh, groupW * 0.5, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 12px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(`step ${i + 1}`, i * groupW + groupW / 2, hh - 4);
      ctx.fillText(wv.toFixed(2), i * groupW + groupW / 2, hh - 24 - bh);
    });
  });

  function update() {
    const { weights, context } = compute();
    st.set("weights", weights.map((v) => v.toFixed(3)).join(", "));
    st.set("context", context.toFixed(4));
    say(`context vector ${context.toFixed(3)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
