// Bench: rank documents by bi-encoder cosine similarity and compare the per-query compute cost against a cross-encoder's.
import { cosineSim } from "./gakit.js";

const QUERY_VEC = [0.9, 0.1];
const DOCS = { "refund timeline": [0.95, 0.05], "returns policy": [0.85, 0.15], "shipping times": [0.3, 0.2] };

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Precompute the documents once, compare cheaply forever" });
  const say = live(body);
  let n = 1000;

  const cv = canvas(body, { aspect: 0.4, label: "Bi-encoder ranking (precomputed document vectors)" });
  const st = stats([["biCost", "bi-encoder cost (1 query encode + N dot products)"], ["crossCost", "cross-encoder cost (N full joint passes)"]]);
  const sl = slider({ label: "collection size (N documents)", min: 100, max: 5000, step: 100, value: n, format: (v) => v.toLocaleString(), onInput: (v) => { n = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  cv.onDraw((ctx, w, hh, p) => {
    const ranked = Object.entries(DOCS).map(([name, v]) => [name, cosineSim(QUERY_VEC, v)]).sort((a, b) => b[1] - a[1]);
    const bw = w / 4;
    ranked.forEach(([name, score], i) => {
      const bh = score * (hh - 30);
      ctx.fillStyle = p.accent;
      ctx.fillRect(bw * (i + 0.6), hh - 15 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 9px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(name, bw * (i + 0.6) + bw * 0.3, hh - 2);
      ctx.fillText(score.toFixed(3), bw * (i + 0.6) + bw * 0.3, hh - 15 - bh - 6);
    });
  });

  function update() {
    const biCost = 1 + n; // one query encode, then N cheap dot products against precomputed doc vectors
    const crossCost = n * 100; // N full joint forward passes, each roughly ~100x a dot product
    st.set("biCost", biCost.toLocaleString());
    st.set("crossCost", crossCost.toLocaleString());
    say(`${n.toLocaleString()} documents: bi-encoder cost ${biCost.toLocaleString()} units, cross-encoder cost ${crossCost.toLocaleString()} units`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
