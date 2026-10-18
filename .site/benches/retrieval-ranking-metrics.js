// Bench: slide k and switch metrics to see precision, recall, MRR and NDCG score the same ranked list differently.
import { precisionAtK, recallAtK, mrr, ndcgAtK } from "./ragkit.js";

const RANKED = [
  { doc: "d3", relevant: true, gain: 3 },
  { doc: "d1", relevant: false, gain: 0 },
  { doc: "d5", relevant: true, gain: 2 },
  { doc: "d2", relevant: false, gain: 0 },
  { doc: "d4", relevant: false, gain: 0 },
];
const TOTAL_RELEVANT = 2;

export default function mount(root, kit) {
  const { frame, h, slider, stats, live } = kit;
  const body = frame(root, { title: "Different metrics, same ranked list" });
  const say = live(body);
  let k = 3;

  const list = h("ol", { class: "isai-list" });
  const st = stats([["precision", "precision@k"], ["recall", "recall@k"], ["mrr", "MRR (whole list)"], ["ndcg", "NDCG@k"]]);
  const sl = slider({ label: "k", min: 1, max: 5, step: 1, value: k, format: (v) => String(v), onInput: (v) => { k = v; update(); } });
  body.append(list, st.el, sl.el);

  function update() {
    list.textContent = "";
    RANKED.forEach((r, i) => list.append(h("li", {}, `${r.doc}: relevant=${r.relevant}, gain=${r.gain}${i < k ? "  (in top-k)" : ""}`)));
    st.set("precision", precisionAtK(RANKED, k).toFixed(3));
    st.set("recall", recallAtK(RANKED, k, TOTAL_RELEVANT).toFixed(3));
    st.set("mrr", mrr(RANKED).toFixed(3));
    st.set("ndcg", ndcgAtK(RANKED, k).toFixed(3));
    say(`k=${k}: precision ${precisionAtK(RANKED, k).toFixed(3)}, recall ${recallAtK(RANKED, k, TOTAL_RELEVANT).toFixed(3)}, NDCG ${ndcgAtK(RANKED, k).toFixed(3)}, MRR ${mrr(RANKED).toFixed(3)}`);
  }
  update();
  return () => {};
}
