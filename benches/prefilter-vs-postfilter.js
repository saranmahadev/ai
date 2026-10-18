// Bench: compare how many results actually survive when a metadata filter is applied before vs. after an ANN search.
import { postFilterSurvivorCount } from "./ragkit.js";

const COLLECTION_SIZE = 1000;
const TOP_K = 20;

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Filtering after search can come back nearly empty" });
  const say = live(body);
  let matchRate = 0.05;

  const cv = canvas(body, { aspect: 0.4, label: "Results returned: pre-filter vs. post-filter" });
  const st = stats([["postFilter", "post-filter: results surviving"], ["preFilter", "pre-filter: results returned"]]);
  const sl = slider({ label: "fraction of collection matching the filter", min: 0.01, max: 0.5, step: 0.01, value: matchRate, format: (v) => `${(v * 100).toFixed(0)}%`, onInput: (v) => { matchRate = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  cv.onDraw((ctx, w, hh, p) => {
    const post = postFilterSurvivorCount(TOP_K, matchRate);
    const bw = w / 3;
    [["post-filter", post, p.warm], ["pre-filter", TOP_K, p.accent]].forEach(([label, v, color], i) => {
      const bh = (v / TOP_K) * (hh - 30);
      ctx.fillStyle = color;
      ctx.fillRect(bw * (i + 0.6), hh - 15 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 9px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(label, bw * (i + 0.6) + bw * 0.3, hh - 2);
      ctx.fillText(String(v), bw * (i + 0.6) + bw * 0.3, hh - 15 - bh - 6);
    });
  });

  function update() {
    const post = postFilterSurvivorCount(TOP_K, matchRate);
    const preCandidates = Math.round(COLLECTION_SIZE * matchRate);
    st.set("postFilter", `${post} of ${TOP_K} requested`);
    st.set("preFilter", `${Math.min(TOP_K, preCandidates)} of ${TOP_K} requested`);
    say(`at ${(matchRate * 100).toFixed(0)} percent match rate: post-filtering ${TOP_K} ANN results leaves ${post}; pre-filtering first leaves ${Math.min(TOP_K, preCandidates)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
