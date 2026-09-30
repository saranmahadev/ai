// Bench: a forest of bootstrapped trees against a single tree on noisy half-moons.
import { rng, moons, fitTree, treeProb, fitForest, forestProb, regions, scatter, accuracy } from "./mlkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, canvas, stats, plot, live, fmt } = kit;
  const body = frame(root, { title: "A forest votes" });
  const say = live(body);
  const all = moons(rng(4), 400, 0.55), train = all.slice(0, 120), test = all.slice(120), single = fitTree(train, { maxDepth: 10 });
  let n = 25, model;
  const sl = slider({ label: "trees in the forest", min: 1, max: 100, step: 1, value: n, onInput: (v) => { n = v; update(); } });
  const cv = canvas(body, { aspect: 0.7, label: "Half-moon data with a random forest's probability regions" });
  const st = stats([["a", "forest, training"], ["b", "forest, unseen"], ["s", "one full tree, unseen"]]);
  body.append(cv.box, st.el, sl.el);
  cv.onDraw((ctx, w, hh, p) => { const m = plot(w, hh, [-2.6, 2.6], [-2.2, 2.2]); m.axes(ctx, p); regions(ctx, m, (x, y) => forestProb(model, x, y), p, { block: 7 }); scatter(ctx, m, train, p, { r: 3.6 }); });
  function update() { model = fitForest(train, n, { maxDepth: 10 }); const pr = (q) => (forestProb(model, q.x, q.y) > 0.5 ? 1 : 0), ps = (q) => (treeProb(single, q.x, q.y) > 0.5 ? 1 : 0);
    st.set("a", fmt(accuracy(train, pr) * 100, 0) + "%"); st.set("b", fmt(accuracy(test, pr) * 100, 0) + "%"); st.set("s", fmt(accuracy(test, ps) * 100, 0) + "%"); say(`${n} trees: ${fmt(accuracy(test, pr) * 100, 0)} percent on unseen points`); cv.redraw(); }
  update(); return () => cv.destroy();
}
