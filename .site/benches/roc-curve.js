// Bench: the ROC curve and its area for two Gaussian score distributions.
import { normCdf } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, canvas, stats, plot, live, fmt } = kit;
  const body = frame(root, { title: "The ROC curve" });
  const say = live(body);
  let sep = 1.5, t = 0.75;
  const ss = slider({ label: "class separation", min: 0, max: 4, step: 0.1, value: sep, format: (v) => fmt(v, 1), onInput: (v) => { sep = v; update(); } });
  const st0 = slider({ label: "threshold", min: -2, max: 5, step: 0.05, value: t, format: (v) => fmt(v, 2), onInput: (v) => { t = v; update(); } });
  const cv = canvas(body, { aspect: 0.8, maxH: 420, label: "ROC curve of true positive rate against false positive rate" });
  const st = stats([["a", "AUC"], ["t", "true positive rate"], ["f", "false positive rate"]]);
  body.append(cv.box, st.el, ss.el, st0.el);
  const tpr = (x) => 1 - normCdf(x - sep), fpr = (x) => 1 - normCdf(x), auc = () => normCdf(sep / Math.SQRT2);
  cv.onDraw((ctx, w, hh, p) => { const m = plot(w, hh, [0, 1], [0, 1]); m.axes(ctx, p, { xlabel: "false positive rate", ylabel: "true positive rate", ticks: 4 });
    ctx.strokeStyle = p.muted; ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.moveTo(m.X(0), m.Y(0)); ctx.lineTo(m.X(1), m.Y(1)); ctx.stroke(); ctx.setLineDash([]);
    ctx.beginPath(); ctx.moveTo(m.X(0), m.Y(0)); for (let x = 6; x >= -6; x -= 0.05) ctx.lineTo(m.X(fpr(x)), m.Y(tpr(x))); ctx.strokeStyle = p.warm; ctx.lineWidth = 3; ctx.stroke();
    ctx.globalAlpha = 0.12; ctx.fillStyle = p.warm; ctx.lineTo(m.X(1), m.Y(0)); ctx.fill(); ctx.globalAlpha = 1;
    ctx.fillStyle = p.ink; ctx.beginPath(); ctx.arc(m.X(fpr(t)), m.Y(tpr(t)), 7, 0, 7); ctx.fill(); });
  function update() { st.set("a", fmt(auc(), 3)); st.set("t", fmt(tpr(t) * 100, 0) + "%"); st.set("f", fmt(fpr(t) * 100, 0) + "%"); say(`AUC ${fmt(auc(), 3)}`); cv.redraw(); }
  update(); return () => cv.destroy();
}
