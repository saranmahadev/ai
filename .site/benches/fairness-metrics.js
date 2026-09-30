// Bench: two groups with different base rates, per-group thresholds, and the fairness measures that cannot all be met at once.
import { normCdf } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, toggles, stats, live, fmt } = kit;
  const body = frame(root, { title: "Two groups, one score" });
  const say = live(body);
  let tA = 0.75, tB = 0.75, pB = 0.2, same = true;
  const sa = slider({ label: "threshold, group A (40% positive)", min: -1, max: 3.5, step: 0.05, value: tA, format: (v) => fmt(v, 2), onInput: (v) => { tA = v; if (same) { tB = v; sb.set(v, true); } update(); } });
  const sb = slider({ label: "threshold, group B", min: -1, max: 3.5, step: 0.05, value: tB, format: (v) => fmt(v, 2), onInput: (v) => { tB = v; if (same) { same = false; tg.set({ s: false }, true); } update(); } });
  const sp = slider({ label: "share of positives in group B", min: 0.05, max: 0.6, step: 0.01, value: pB, format: (v) => fmt(v * 100, 0) + "%", onInput: (v) => { pB = v; update(); } });
  const tg = toggles([["s", "use the same threshold for both groups", true]], (v) => { same = v.s; if (same) { tB = tA; sb.set(tA, true); } update(); });
  const table = h("table", { class: "bench-table" });
  const st = stats([["s", "selection-rate gap"], ["t", "true-positive-rate gap"], ["p", "precision gap"]]);
  body.append(table, st.el, tg.el, sa.el, sb.el, sp.el);
  const grp = (prev, t) => { const P = 1000 * prev, N = 1000 - P, TP = P * (1 - normCdf(t - 1.5)), FP = N * (1 - normCdf(t)); return { sel: (TP + FP) / 10, tpr: (TP / P) * 100, fpr: (FP / N) * 100, prec: TP + FP ? (TP / (TP + FP)) * 100 : 0 }; };
  function update() { const A = grp(0.4, tA), B = grp(pB, tB), r = (v) => fmt(v, 1) + "%";
    table.textContent = ""; table.append(h("tr", {}, h("th", {}, "per 1000 people"), h("th", {}, "selected"), h("th", {}, "true positive rate"), h("th", {}, "false positive rate"), h("th", {}, "precision")), h("tr", {}, h("th", {}, "group A"), h("td", {}, r(A.sel)), h("td", {}, r(A.tpr)), h("td", {}, r(A.fpr)), h("td", {}, r(A.prec))), h("tr", {}, h("th", {}, "group B"), h("td", {}, r(B.sel)), h("td", {}, r(B.tpr)), h("td", {}, r(B.fpr)), h("td", {}, r(B.prec))));
    st.set("s", fmt(Math.abs(A.sel - B.sel), 1) + " points"); st.set("t", fmt(Math.abs(A.tpr - B.tpr), 1) + " points"); st.set("p", fmt(Math.abs(A.prec - B.prec), 1) + " points"); say(`Selection gap ${fmt(Math.abs(A.sel - B.sel), 1)}, true positive rate gap ${fmt(Math.abs(A.tpr - B.tpr), 1)}`); }
  update(); return () => {};
}
