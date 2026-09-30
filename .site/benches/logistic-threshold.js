// Bench: a logistic regression's probabilities, and how the decision threshold trades errors.
import { rng, blobs, logisticFit, logisticProb, regions, scatter, boundaryLine } from "./mlkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, canvas, stats, plot, live, fmt } = kit;
  const body = frame(root, { title: "Probability, threshold, errors" });
  const say = live(body);
  const pts = blobs(rng(6), 80, [-0.7, -0.4], [0.7, 0.4], 0.75), w = logisticFit(pts.map((p) => [p.x, p.y]), pts.map((p) => p.c), { iters: 1500, lr: 0.5 });
  let t = 0.5;
  const cv = canvas(body, { aspect: 0.75, label: "Two classes with probability shading and the decision line for the chosen threshold" });
  const sl = slider({ label: "call it class 1 if probability ≥", min: 0.05, max: 0.95, step: 0.01, value: t, format: (v) => fmt(v, 2), onInput: (v) => { t = v; update(); } });
  const st = stats([["tp", "caught (true +)"], ["fp", "false alarms"], ["fn", "missed"], ["tn", "true −"], ["p", "precision"], ["r", "recall"]]);
  body.append(cv.box, st.el, sl.el);
  cv.onDraw((ctx, wd, hh, p) => { const m = plot(wd, hh, [-3, 3], [-3, 3]); m.axes(ctx, p); regions(ctx, m, (x, y) => logisticProb(w, [x, y]), p); scatter(ctx, m, pts, p);
    boundaryLine(ctx, m, [w[0] - Math.log(t / (1 - t)), w[1], w[2]], p.ink); });
  function update() { let tp = 0, fp = 0, fn = 0, tn = 0; for (const p of pts) { const pred = logisticProb(w, [p.x, p.y]) >= t ? 1 : 0; if (pred && p.c) tp++; else if (pred) fp++; else if (p.c) fn++; else tn++; }
    st.set("tp", tp); st.set("fp", fp); st.set("fn", fn); st.set("tn", tn); st.set("p", tp + fp ? fmt((100 * tp) / (tp + fp), 0) + "%" : "—"); st.set("r", fmt((100 * tp) / (tp + fn), 0) + "%"); say(`Threshold ${fmt(t, 2)}: ${fp} false alarms, ${fn} missed`); cv.redraw(); }
  update(); return () => cv.destroy();
}
