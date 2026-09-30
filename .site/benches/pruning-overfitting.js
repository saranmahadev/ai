// Bench: tree depth and minimum leaf size against training and unseen accuracy.
import { rng, moons, fitTree, treeProb, treeLeaves, accuracy } from "./mlkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, canvas, stats, plot, live, fmt } = kit;
  const body = frame(root, { title: "Depth, leaf size and overfitting" });
  const say = live(body);
  const all = moons(rng(4), 400, 0.55), train = all.slice(0, 120), test = all.slice(120);
  let depth = 3, leaf = 1;
  const sd = slider({ label: "maximum depth", min: 1, max: 10, step: 1, value: depth, onInput: (v) => { depth = v; update(); } });
  const sl = slider({ label: "minimum points in a leaf", min: 1, max: 30, step: 1, value: leaf, onInput: (v) => { leaf = v; update(); } });
  const cv = canvas(body, { aspect: 0.55, label: "Training and unseen accuracy against tree depth" });
  const st = stats([["l", "leaves"], ["a", "training accuracy"], ["b", "accuracy on unseen points"]]);
  body.append(cv.box, st.el, sd.el, sl.el);
  const run = (d) => { const t = fitTree(train, { maxDepth: d, minLeaf: leaf }), pr = (q) => (treeProb(t, q.x, q.y) > 0.5 ? 1 : 0); return { t, a: accuracy(train, pr), b: accuracy(test, pr) }; };
  cv.onDraw((ctx, w, hh, p) => { const m = plot(w, hh, [1, 10], [0.6, 1.02]); m.axes(ctx, p, { xlabel: "maximum depth", ylabel: "accuracy", ticks: 3 }); const rs = Array.from({ length: 10 }, (_, i) => run(i + 1));
    for (const [key, col] of [["a", p.accent], ["b", p.warm]]) { ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); rs.forEach((r, i) => { const X = m.X(i + 1), Y = m.Y(r[key]); i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }); ctx.stroke(); rs.forEach((r, i) => { ctx.fillStyle = col; ctx.beginPath(); ctx.arc(m.X(i + 1), m.Y(r[key]), 3.5, 0, 7); ctx.fill(); }); }
    ctx.strokeStyle = p.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(m.X(depth), m.pad.t); ctx.lineTo(m.X(depth), m.pad.t + m.ih); ctx.stroke(); ctx.font = "800 12px Nunito, system-ui"; ctx.fillStyle = p.accent; ctx.textAlign = "left"; ctx.fillText("training", m.pad.l + 8, m.pad.t + 14); ctx.fillStyle = p.warm; ctx.fillText("unseen", m.pad.l + 8, m.pad.t + 30); });
  function update() { const r = run(depth); st.set("l", treeLeaves(r.t)); st.set("a", fmt(r.a * 100, 0) + "%"); st.set("b", fmt(r.b * 100, 0) + "%"); say(`Depth ${depth}, leaf size ${leaf}: training ${fmt(r.a * 100, 0)} percent, unseen ${fmt(r.b * 100, 0)} percent`); cv.redraw(); }
  update(); return () => cv.destroy();
}
