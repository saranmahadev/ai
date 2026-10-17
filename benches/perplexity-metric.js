// Bench: compute perplexity from a sequence of per-token probabilities under different toy models.
import { perplexity } from "./gakit.js";

const MODELS = {
  "confident & correct": [0.9, 0.85, 0.8, 0.9],
  "uniform guess (4 tokens)": [0.25, 0.25, 0.25, 0.25],
  "unconfident / wrong": [0.2, 0.15, 0.1, 0.25],
};

export default function mount(root, kit) {
  const { frame, canvas, choice, stats, live } = kit;
  const body = frame(root, { title: "How surprised was the model?" });
  const say = live(body);
  let modelKey = Object.keys(MODELS)[0];

  const cv = canvas(body, { aspect: 0.4, label: "Per-token probability" });
  const st = stats([["perplexity", "perplexity"]]);
  const ch = choice("Model", Object.keys(MODELS).map((k) => [k, k]), modelKey, (v) => { modelKey = v; update(); });
  body.append(cv.box, st.el, ch.el);

  cv.onDraw((ctx, w, hh, p) => {
    const probs = MODELS[modelKey];
    const bw = w / (probs.length + 1);
    probs.forEach((pr, i) => {
      const bh = pr * (hh - 30);
      ctx.fillStyle = p.accent;
      ctx.fillRect(bw * (i + 0.5), hh - 15 - bh, bw * 0.6, bh);
    });
  });

  function update() {
    const pp = perplexity(MODELS[modelKey]);
    st.set("perplexity", pp.toFixed(3));
    say(`"${modelKey}": perplexity ${pp.toFixed(3)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
