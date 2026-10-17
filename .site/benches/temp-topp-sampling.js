// Bench: shape a toy next-token distribution with temperature and nucleus (top-p) filtering.
import { softmaxTemperature, topPFilter, sampleFromProbs } from "./gakit.js";
import { rng } from "./kit.js";

const VOCAB = ["A", "B", "C", "<eos>"];
const LOGITS = [1.0, 1.3, 0.1, -5];

export default function mount(root, kit) {
  const { frame, canvas, slider, button, stats, live } = kit;
  const body = frame(root, { title: "Temperature and top-p shape a distribution" });
  const say = live(body);
  let temperature = 1.0, topP = 1.0, lastSample = null;

  const cv = canvas(body, { aspect: 0.6, label: "Next-token probabilities" });
  const st = stats([["kept", "tokens kept by top-p"], ["sample", "last sample"]]);
  const slT = slider({ label: "temperature", min: 0.2, max: 2.0, step: 0.1, value: temperature, format: (v) => v.toFixed(1), onInput: (v) => { temperature = v; update(); } });
  const slP = slider({ label: "top-p", min: 0.1, max: 1.0, step: 0.05, value: topP, format: (v) => v.toFixed(2), onInput: (v) => { topP = v; update(); } });
  const btn = button("Sample a token", () => {
    const probs = softmaxTemperature(LOGITS, temperature);
    const kept = topPFilter(probs, topP);
    const rand = rng(Date.now() & 0xffffffff);
    const pick = sampleFromProbs(kept.map(([, p]) => p), rand);
    lastSample = VOCAB[kept[pick][0]];
    st.set("sample", lastSample);
    say(`sampled ${lastSample}`);
  });
  body.append(cv.box, st.el, slT.el, slP.el, btn);

  let probs = [], keptIds = [];
  cv.onDraw((ctx, w, hh, p) => {
    const bw = w / (VOCAB.length + 1);
    probs.forEach((pr, i) => {
      const bh = pr * (hh - 50);
      ctx.fillStyle = keptIds.includes(i) ? p.accent : p.soft;
      ctx.fillRect(bw * (i + 0.5), hh - 24 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 10px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(VOCAB[i], bw * (i + 0.5) + bw * 0.3, hh - 8);
      ctx.fillText(pr.toFixed(3), bw * (i + 0.5) + bw * 0.3, hh - 28 - bh);
    });
  });

  function update() {
    probs = softmaxTemperature(LOGITS, temperature);
    const kept = topPFilter(probs, topP);
    keptIds = kept.map(([i]) => i);
    st.set("kept", kept.map(([i]) => VOCAB[i]).join(", "));
    say(`temperature ${temperature.toFixed(1)}, top-p ${topP.toFixed(2)}: keeping ${kept.length} of ${VOCAB.length} tokens`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
