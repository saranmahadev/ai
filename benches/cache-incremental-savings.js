// Bench: slide cache hit rate and watch total time saved across a batch of queries; compare incremental indexing against a full rebuild.
import { cacheSavings } from "./ragkit.js";

const QUERY_COST_MS = 2620, TOTAL_QUERIES = 10000;

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "A repeated question shouldn't cost the full pipeline twice" });
  const say = live(body);
  let hitRate = 0.3;

  const cv = canvas(body, { aspect: 0.4, label: "Total time: with vs. without a cache" });
  const st = stats([["saved", "time saved"], ["incremental", "cost to add 10 docs (incremental vs. full rebuild)"]]);
  const sl = slider({ label: "cache hit rate", min: 0, max: 0.9, step: 0.05, value: hitRate, format: (v) => `${(v * 100).toFixed(0)}%`, onInput: (v) => { hitRate = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  cv.onDraw((ctx, w, hh, p) => {
    const { withoutCache, withCache } = cacheSavings(hitRate, QUERY_COST_MS, TOTAL_QUERIES);
    const bw = w / 3, maxV = withoutCache;
    [["without cache", withoutCache, p.warm], ["with cache", withCache, p.accent]].forEach(([label, v, color], i) => {
      const bh = (v / maxV) * (hh - 30);
      ctx.fillStyle = color;
      ctx.fillRect(bw * (i + 0.6), hh - 15 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 9px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(label, bw * (i + 0.6) + bw * 0.3, hh - 2);
    });
  });

  function update() {
    const { withoutCache, withCache, savings } = cacheSavings(hitRate, QUERY_COST_MS, TOTAL_QUERIES);
    st.set("saved", `${(savings / 1000).toFixed(0)}s of ${(withoutCache / 1000).toFixed(0)}s`);
    st.set("incremental", "10 units vs. 100,000 units");
    say(`hit rate ${(hitRate * 100).toFixed(0)}%: ${(withCache / 1000).toFixed(0)}s instead of ${(withoutCache / 1000).toFixed(0)}s for ${TOTAL_QUERIES.toLocaleString()} queries`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
