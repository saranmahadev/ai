// Bench: compare a general model's perplexity on domain text against a continued-pretrained model's.
import { perplexity } from "./gakit.js";

const MODELS = {
  "general base model": [0.3, 0.25, 0.2, 0.35, 0.28],
  "continued-pretrained on domain": [0.75, 0.8, 0.7, 0.85, 0.78],
};

export default function mount(root, kit) {
  const { frame, canvas, choice, stats, live } = kit;
  const body = frame(root, { title: "Perplexity on domain text, before and after" });
  const say = live(body);
  let key = Object.keys(MODELS)[0];

  const cv = canvas(body, { aspect: 0.4, label: "Per-token probability on domain text" });
  const st = stats([["perplexity", "perplexity"]]);
  const ch = choice("Model", Object.keys(MODELS).map((k) => [k, k]), key, (v) => { key = v; update(); });
  body.append(cv.box, st.el, ch.el);

  cv.onDraw((ctx, w, hh, p) => {
    const probs = MODELS[key], bw = w / (probs.length + 1);
    probs.forEach((pr, i) => {
      const bh = pr * (hh - 30);
      ctx.fillStyle = p.accent;
      ctx.fillRect(bw * (i + 0.5), hh - 15 - bh, bw * 0.6, bh);
    });
  });

  function update() {
    const pp = perplexity(MODELS[key]);
    st.set("perplexity", pp.toFixed(3));
    say(`"${key}": perplexity ${pp.toFixed(3)} on the domain text`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
