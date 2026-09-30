// Bench: how a decision tree carves the plane as its allowed depth grows.
import { rng, moons, fitTree, treeProb, treeLeaves, regions, scatter, accuracy } from "./mlkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, canvas, stats, plot, live, fmt } = kit;
  const body = frame(root, { title: "Grow the tree" });
  const say = live(body);
  const all = moons(rng(4), 400, 0.55), train = all.slice(0, 120), test = all.slice(120);
  let depth = 2, tree;
  const sl = slider({ label: "maximum depth", min: 1, max: 10, step: 1, value: depth, onInput: (v) => { depth = v; update(); } });
  const cv = canvas(body, { aspect: 0.7, label: "Half-moon data with the rectangles a decision tree draws" });
  const st = stats([["l", "leaves"], ["a", "training accuracy"], ["b", "accuracy on unseen points"]]);
  body.append(cv.box, st.el, sl.el);
  cv.onDraw((ctx, w, hh, p) => { const m = plot(w, hh, [-2.6, 2.6], [-2.2, 2.2]); m.axes(ctx, p); regions(ctx, m, (x, y) => treeProb(tree, x, y), p, { block: 6 }); scatter(ctx, m, train, p, { r: 3.6 }); });
  function update() { tree = fitTree(train, { maxDepth: depth }); const pr = (q) => (treeProb(tree, q.x, q.y) > 0.5 ? 1 : 0), a = accuracy(train, pr), b = accuracy(test, pr);
    st.set("l", treeLeaves(tree)); st.set("a", fmt(a * 100, 0) + "%"); st.set("b", fmt(b * 100, 0) + "%"); say(`Depth ${depth}: ${treeLeaves(tree)} leaves, ${fmt(b * 100, 0)} percent on unseen points`); cv.redraw(); }
  update(); return () => cv.destroy();
}
