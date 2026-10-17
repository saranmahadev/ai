// Bench: compare cosine similarity between a chosen input's embedding and several target-modality concepts.
import { cosineSim } from "./gakit.js";

const SHARED = {
  "image: cat": [0.9, 0.3, 0.1],
  "text: cat": [0.85, 0.35, 0.05],
  "text: dog": [0.1, 0.9, 0.2],
  "audio: meow": [0.88, 0.28, 0.15],
};

export default function mount(root, kit) {
  const { frame, canvas, choice, live } = kit;
  const body = frame(root, { title: "One shared space, any modality in, any modality out" });
  const say = live(body);
  let source = "image: cat";

  const cv = canvas(body, { aspect: 0.45, label: "Similarity to every other concept" });
  const ch = choice("Input", Object.keys(SHARED).map((k) => [k, k]), source, (v) => { source = v; update(); });
  body.append(cv.box, ch.el);

  let sims = [];
  cv.onDraw((ctx, w, hh, p) => {
    const bw = w / (sims.length + 1);
    sims.forEach(([label, sim], i) => {
      const bh = Math.max(0, sim) * (hh - 50);
      ctx.fillStyle = label === source ? p.soft : p.accent;
      ctx.fillRect(bw * (i + 0.5), hh - 24 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 9px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(label, bw * (i + 0.5) + bw * 0.3, hh - 8);
      ctx.fillText(sim.toFixed(3), bw * (i + 0.5) + bw * 0.3, hh - 28 - bh);
    });
  });

  function update() {
    const vec = SHARED[source];
    sims = Object.entries(SHARED).map(([label, v]) => [label, cosineSim(vec, v)]);
    const best = sims.filter(([l]) => l !== source).sort((a, b) => b[1] - a[1])[0];
    say(`closest other concept to "${source}" is "${best[0]}" at similarity ${best[1].toFixed(3)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
