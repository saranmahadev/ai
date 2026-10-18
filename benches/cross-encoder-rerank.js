// Bench: compare a bi-encoder's independent-vector ranking against a cross-encoder's joint-scored ranking for the same two candidates.
import { cosineSim } from "./gakit.js";

const QUERY_VEC = [0.9, 0.1];
const CANDIDATES = {
  "A: repeats \"refund\" but off-topic": { biVec: [0.9, 0.1], trueRelevance: 0.3 },
  "B: on-topic, phrased differently": { biVec: [0.75, 0.2], trueRelevance: 0.95 },
};

export default function mount(root, kit) {
  const { frame, canvas, choice, stats, live } = kit;
  const body = frame(root, { title: "Scoring the pair together catches what pooling misses" });
  const say = live(body);
  let mode = "bi";

  const cv = canvas(body, { aspect: 0.4, label: "Ranking by scoring method" });
  const st = stats([["winner", "top-ranked candidate"]]);
  const ch = choice("Scoring method", [["bi", "bi-encoder (independent cosine similarity)"], ["cross", "cross-encoder (joint relevance score)"]], mode, (v) => { mode = v; update(); });
  body.append(cv.box, st.el, ch.el);

  function scores() {
    return Object.entries(CANDIDATES).map(([name, c]) => [name, mode === "bi" ? cosineSim(QUERY_VEC, c.biVec) : c.trueRelevance]).sort((a, b) => b[1] - a[1]);
  }

  cv.onDraw((ctx, w, hh, p) => {
    const ranked = scores();
    const bw = w / 3;
    ranked.forEach(([name, score], i) => {
      const bh = score * (hh - 30);
      ctx.fillStyle = i === 0 ? p.accent : p.soft;
      ctx.fillRect(bw * (i + 0.6), hh - 15 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 9px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(name.slice(0, 2), bw * (i + 0.6) + bw * 0.3, hh - 2);
      ctx.fillText(score.toFixed(3), bw * (i + 0.6) + bw * 0.3, hh - 15 - bh - 6);
    });
  });

  function update() {
    const ranked = scores();
    st.set("winner", ranked[0][0]);
    say(`${mode === "bi" ? "bi-encoder" : "cross-encoder"}: ${ranked.map(([n, s]) => `${n} ${s.toFixed(3)}`).join(", ")}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
