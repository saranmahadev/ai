// Bench: compare a model's perplexity on a training example against a held-out one.
import { perplexity } from "./gakit.js";

const EXAMPLES = {
  "seen during training": [0.95, 0.97, 0.93, 0.96],
  "never seen (held-out)": [0.4, 0.35, 0.5, 0.3],
};

export default function mount(root, kit) {
  const { frame, canvas, choice, stats, live } = kit;
  const body = frame(root, { title: "Lower perplexity on training data is a memorization signal" });
  const say = live(body);
  let key = Object.keys(EXAMPLES)[0];

  const cv = canvas(body, { aspect: 0.4, label: "Per-token probability" });
  const st = stats([["perplexity", "perplexity"]]);
  const ch = choice("Example", Object.keys(EXAMPLES).map((k) => [k, k]), key, (v) => { key = v; update(); });
  body.append(cv.box, st.el, ch.el);

  cv.onDraw((ctx, w, hh, p) => {
    const probs = EXAMPLES[key], bw = w / (probs.length + 1);
    probs.forEach((pr, i) => {
      const bh = pr * (hh - 30);
      ctx.fillStyle = p.accent;
      ctx.fillRect(bw * (i + 0.5), hh - 15 - bh, bw * 0.6, bh);
    });
  });

  function update() {
    const pp = perplexity(EXAMPLES[key]);
    st.set("perplexity", pp.toFixed(3));
    say(`"${key}": perplexity ${pp.toFixed(3)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
