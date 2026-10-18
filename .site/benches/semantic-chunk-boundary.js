// Bench: slide a similarity threshold and watch where semantic chunking places its boundary.
import { semanticBoundaries } from "./ragkit.js";
import { cosineSim } from "./gakit.js";

const SENTENCES = ["Returns are accepted within 30 days.", "Items must be in original packaging.", "Shipping takes 3-5 business days.", "Orders over $50 ship free.", "Tracking is emailed once shipped."];
const VECS = [[0.9, 0.1], [0.85, 0.15], [0.1, 0.9], [0.15, 0.85], [0.08, 0.88]];

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "A boundary where the topic actually shifts" });
  const say = live(body);
  let threshold = 0.5;

  const sims = [];
  for (let i = 1; i < VECS.length; i++) sims.push(cosineSim(VECS[i - 1], VECS[i]));

  const cv = canvas(body, { aspect: 0.4, label: "Similarity between consecutive sentences" });
  const st = stats([["boundary", "chunk boundary"]]);
  const sl = slider({ label: "similarity threshold", min: 0.1, max: 0.9, step: 0.02, value: threshold, format: (v) => v.toFixed(2), onInput: (v) => { threshold = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  cv.onDraw((ctx, w, hh, p) => {
    const bw = w / sims.length;
    sims.forEach((s, i) => {
      const bh = s * (hh - 30);
      ctx.fillStyle = s < threshold ? p.warm : p.accent;
      ctx.fillRect(bw * (i + 0.2), hh - 15 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 9px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(`${i}–${i + 1}`, bw * (i + 0.2) + bw * 0.3, hh - 2);
    });
  });

  function update() {
    const boundaries = semanticBoundaries(sims, threshold);
    st.set("boundary", boundaries.length ? `after sentence ${boundaries[0]}` : "no boundary found");
    say(`threshold ${threshold.toFixed(2)}: ${boundaries.length ? `chunk boundary falls after sentence ${boundaries[0]}` : "no boundary found at this threshold"}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
