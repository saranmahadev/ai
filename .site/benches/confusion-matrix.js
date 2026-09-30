// Bench: a confusion matrix built from prevalence, sensitivity and specificity, next to the "always say no" baseline.
export default function mount(root, kit) {
  const { h, frame, slider, stats, live, fmt } = kit;
  const body = frame(root, { title: "Build a confusion matrix" });
  const say = live(body);
  let prev = 0.02, sens = 0.9, spec = 0.95;
  const sp = slider({ label: "prevalence (share truly positive)", min: 0.005, max: 0.5, step: 0.005, value: prev, format: (v) => fmt(v * 100, 1) + "%", onInput: (v) => { prev = v; update(); } });
  const ss = slider({ label: "sensitivity (positives caught)", min: 0.3, max: 1, step: 0.01, value: sens, format: (v) => fmt(v * 100, 0) + "%", onInput: (v) => { sens = v; update(); } });
  const sc = slider({ label: "specificity (negatives cleared)", min: 0.3, max: 1, step: 0.01, value: spec, format: (v) => fmt(v * 100, 0) + "%", onInput: (v) => { spec = v; update(); } });
  const table = h("table", { class: "bench-table" });
  const st = stats([["a", "accuracy"], ["b", "always-say-no accuracy"], ["p", "precision"], ["r", "recall"]]);
  body.append(table, st.el, sp.el, ss.el, sc.el);
  function update() { const N = 1000, P = N * prev, Ng = N - P, TP = P * sens, FN = P - TP, TN = Ng * spec, FP = Ng - TN, r = (x) => fmt(x, 0);
    table.textContent = ""; table.append(h("tr", {}, h("th", {}, "of 1000 cases"), h("th", {}, "flagged positive"), h("th", {}, "flagged negative")), h("tr", {}, h("th", {}, "truly positive"), h("td", {}, "TP " + r(TP)), h("td", {}, "FN " + r(FN))), h("tr", {}, h("th", {}, "truly negative"), h("td", {}, "FP " + r(FP)), h("td", {}, "TN " + r(TN))));
    st.set("a", fmt(((TP + TN) / N) * 100, 1) + "%"); st.set("b", fmt((Ng / N) * 100, 1) + "%"); st.set("p", TP + FP ? fmt((TP / (TP + FP)) * 100, 0) + "%" : "—"); st.set("r", fmt(sens * 100, 0) + "%"); say(`Accuracy ${fmt(((TP + TN) / N) * 100, 1)} percent, precision ${TP + FP ? fmt((TP / (TP + FP)) * 100, 0) : 0} percent`); }
  update(); return () => {};
}
