// Bench: rank images by cross-modal similarity to a text query in a shared embedding space.
import { cosineSim } from "./gakit.js";

const QUERIES = { "a photo of a golden retriever": [0.9, 0.1], "a photo of a cat": [0.12, 0.88] };
const IMAGES = { "golden_retriever.jpg": [0.88, 0.12], "siamese_cat.jpg": [0.15, 0.85], "invoice_scan.png": [0.1, 0.1] };

export default function mount(root, kit) {
  const { frame, canvas, choice, stats, live } = kit;
  const body = frame(root, { title: "A text query, ranking images directly" });
  const say = live(body);
  let query = Object.keys(QUERIES)[0];

  const cv = canvas(body, { aspect: 0.4, label: "Cross-modal similarity to the text query" });
  const st = stats([["top", "top-ranked image"]]);
  const ch = choice("Text query", Object.keys(QUERIES).map((q) => [q, q]), query, (v) => { query = v; update(); });
  body.append(cv.box, st.el, ch.el);

  function ranked() {
    return Object.entries(IMAGES).map(([n, v]) => [n, cosineSim(QUERIES[query], v)]).sort((a, b) => b[1] - a[1]);
  }

  cv.onDraw((ctx, w, hh, p) => {
    const bw = w / 4;
    ranked().forEach(([name, score], i) => {
      const bh = score * (hh - 30);
      ctx.fillStyle = p.accent;
      ctx.fillRect(bw * (i + 0.6), hh - 15 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 9px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(name.split(".")[0], bw * (i + 0.6) + bw * 0.3, hh - 2);
      ctx.fillText(score.toFixed(3), bw * (i + 0.6) + bw * 0.3, hh - 15 - bh - 6);
    });
  });

  function update() {
    const r = ranked();
    st.set("top", r[0][0]);
    say(`"${query}" ranks images: ${r.map(([n, s]) => `${n} ${s.toFixed(3)}`).join(", ")}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
