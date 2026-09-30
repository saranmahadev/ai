// Bench: precision, recall and F1 as a decision threshold slides across two overlapping score distributions.
import { normCdf, normPdf } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, canvas, stats, plot, live, fmt } = kit;
  const body = frame(root, { title: "Precision against recall" });
  const say = live(body);
  let t = 0.75, sep = 1.5, prev = 0.2;
  const st0 = slider({ label: "flag as positive if score ≥", min: -1, max: 3.5, step: 0.05, value: t, format: (v) => fmt(v, 2), onInput: (v) => { t = v; update(); } });
  const ss = slider({ label: "class separation", min: 0.5, max: 3, step: 0.1, value: sep, format: (v) => fmt(v, 1), onInput: (v) => { sep = v; update(); } });
  const sp = slider({ label: "share of positives", min: 0.02, max: 0.5, step: 0.01, value: prev, format: (v) => fmt(v * 100, 0) + "%", onInput: (v) => { prev = v; update(); } });
  const cv = canvas(body, { aspect: 0.5, label: "Score distributions for positives and negatives with a threshold" });
  const st = stats([["p", "precision"], ["r", "recall"], ["f", "F1"], ["c", "flagged (of 1000)"]]);
  body.append(cv.box, st.el, st0.el, ss.el, sp.el);
  const counts = () => { const P = 1000 * prev, N = 1000 - P, TP = P * (1 - normCdf(t - sep)), FP = N * (1 - normCdf(t)); return { TP, FP, P }; };
  cv.onDraw((ctx, w, hh, p) => { const m = plot(w, hh, [-3, 6], [0, 1], { l: 16, r: 14, t: 10, b: 32 }); m.axes(ctx, p, { xlabel: "model score", ticks: 3 });
    for (const [mu, wt, col] of [[0, 1 - prev, p.accent], [sep, prev, p.warm]]) { ctx.beginPath(); for (let i = 0; i <= 120; i++) { const x = -3 + (9 * i) / 120, y = (normPdf(x, mu, 1) * wt) / 0.42 * 0.95; i ? ctx.lineTo(m.X(x), m.Y(y)) : ctx.moveTo(m.X(x), m.Y(y)); } ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.stroke(); }
    ctx.strokeStyle = p.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(m.X(t), m.pad.t); ctx.lineTo(m.X(t), m.pad.t + m.ih); ctx.stroke(); });
  function update() { const { TP, FP, P } = counts(), pr = TP + FP > 0 ? TP / (TP + FP) : 0, rc = TP / P, f1 = pr + rc ? (2 * pr * rc) / (pr + rc) : 0;
    st.set("p", fmt(pr * 100, 0) + "%"); st.set("r", fmt(rc * 100, 0) + "%"); st.set("f", fmt(f1 * 100, 0) + "%"); st.set("c", fmt(TP + FP, 0)); say(`Precision ${fmt(pr * 100, 0)}, recall ${fmt(rc * 100, 0)}, F1 ${fmt(f1 * 100, 0)} percent`); cv.redraw(); }
  update(); return () => cv.destroy();
}
