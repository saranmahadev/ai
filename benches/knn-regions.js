// Bench: k-nearest-neighbour decision regions on two half-moons.
import { rng, moons, knn, regions, scatter, accuracy } from "./mlkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, canvas, stats, plot, live, fmt } = kit;
  const body = frame(root, { title: "Neighbours vote" });
  const say = live(body);
  const all = moons(rng(4), 160, 0.5), train = all.slice(0, 80), test = all.slice(80);
  let k = 1;
  const sl = slider({ label: "k (neighbours that vote)", min: 1, max: 41, step: 2, value: k, onInput: (v) => { k = v; update(); } });
  const cv = canvas(body, { aspect: 0.7, label: "Two half-moons with nearest-neighbour decision regions" });
  const st = stats([["a", "training accuracy"], ["b", "accuracy on held-out points"]]);
  body.append(cv.box, st.el, sl.el);
  const pred = (p, pool) => (knn(pool, p.x, p.y, k).vote > 0.5 ? 1 : 0);
  cv.onDraw((ctx, w, hh, p) => { const m = plot(w, hh, [-2.4, 2.4], [-2, 2]); m.axes(ctx, p); regions(ctx, m, (x, y) => knn(train, x, y, k).vote, p, { block: 8 }); scatter(ctx, m, train, p, { r: 4.5 });
    for (const q of test) { ctx.strokeStyle = q.c ? p.warm : p.accent; ctx.lineWidth = 2; ctx.beginPath(); ctx.rect(m.X(q.x) - 4, m.Y(q.y) - 4, 8, 8); ctx.stroke(); } });
  function update() {
    const tr = accuracy(train, (p) => pred(p, train)), te = accuracy(test, (p) => pred(p, train)); st.set("a", fmt(tr * 100, 0) + "%"); st.set("b", fmt(te * 100, 0) + "%"); say(`k = ${k}: ${fmt(te * 100, 0)} percent on held-out points`); cv.redraw(); }
  update(); return () => cv.destroy();
}
