// Bench: k-fold cross-validation of a nearest-neighbour classifier, against luck of a single split.
import { rng, moons, knn } from "./mlkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, button, canvas, stats, plot, live, fmt } = kit;
  const body = frame(root, { title: "Rotate the validation fold" });
  const say = live(body);
  const data = moons(rng(21), 60, 0.5);
  let folds = 5, seed = 1;
  const sl = slider({ label: "number of folds", min: 2, max: 10, step: 1, value: folds, onInput: (v) => { folds = v; update(); } });
  const cv = canvas(body, { aspect: 0.5, label: "Accuracy of each fold as a bar" });
  const st = stats([["m", "mean accuracy"], ["s", "spread between folds"], ["a", "best fold"], ["b", "worst fold"]]);
  body.append(cv.box, st.el, sl.el, h("div", { class: "bench-row" }, button("Shuffle the data again", () => { seed++; update(); })));
  let acc = [];
  const run = () => { const r = rng(seed * 101), idx = data.map((_, i) => i); for (let i = idx.length - 1; i > 0; i--) { const j = r.int(i + 1); [idx[i], idx[j]] = [idx[j], idx[i]]; }
    return Array.from({ length: folds }, (_, f) => { const val = idx.filter((_, k) => k % folds === f).map((i) => data[i]), tr = idx.filter((_, k) => k % folds !== f).map((i) => data[i]); return val.filter((p) => (knn(tr, p.x, p.y, 5).vote > 0.5 ? 1 : 0) === p.c).length / val.length; }); };
  cv.onDraw((ctx, w, hh, p) => { const m = plot(w, hh, [0, folds + 1], [0.4, 1.02], { l: 44, r: 14, t: 12, b: 32 }); m.axes(ctx, p, { xlabel: "fold", ylabel: "accuracy", ticks: 1 }); const mean = acc.reduce((s, v) => s + v, 0) / acc.length;
    acc.forEach((a, i) => { const x0 = m.X(i + 0.65), x1 = m.X(i + 1.35); ctx.fillStyle = p.accent; ctx.fillRect(x0, m.Y(a), x1 - x0, m.pad.t + m.ih - m.Y(a)); });
    ctx.strokeStyle = p.warm; ctx.lineWidth = 3; ctx.setLineDash([6, 4]); ctx.beginPath(); ctx.moveTo(m.pad.l, m.Y(mean)); ctx.lineTo(m.pad.l + m.iw, m.Y(mean)); ctx.stroke(); ctx.setLineDash([]); });
  function update() { acc = run(); const mean = acc.reduce((s, v) => s + v, 0) / acc.length, sd = Math.sqrt(acc.reduce((s, v) => s + (v - mean) ** 2, 0) / (acc.length - 1));
    st.set("m", fmt(mean * 100, 1) + "%"); st.set("s", "± " + fmt(sd * 100, 1)); st.set("a", fmt(Math.max(...acc) * 100, 0) + "%"); st.set("b", fmt(Math.min(...acc) * 100, 0) + "%"); say(`Mean accuracy ${fmt(mean * 100, 1)} percent over ${folds} folds`); cv.redraw(); }
  update(); return () => cv.destroy();
}
