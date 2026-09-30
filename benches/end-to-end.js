// Bench: a whole small project: choose preprocessing and a model, compare by cross-validation, open the sealed test set once.
import { rng, logisticFit, logisticProb, fitTreeN, treeProbN, cvAccuracy } from "./mlkit.js";
export default function mount(root, kit) {
  const { h, frame, toggles, choice, button, stats, live, fmt } = kit;
  const body = frame(root, { title: "A small project, start to finish" });
  const say = live(body);
  const r = rng(41), rows = Array.from({ length: 600 }, () => { const a = r.gauss(), b = r.gauss(), ring = a * a + b * b > 1.4 ? 1 : 0, c = r() < 0.1 ? 1 - ring : ring; return { f: [a, b, 1000 * r.gauss(), 0.3 * (c ? 1 : -1) + r.gauss()], c }; });
  const tr = rows.slice(0, 400), te = rows.slice(400);
  let model = "forest", opt = { std: true, sq: true, drop: false }, opened = false;
  const mc = choice("Model", [["logistic", "logistic regression"], ["knn", "7 nearest neighbours"], ["tree", "decision tree (depth 4)"], ["forest", "random forest (25 trees)"]], model, (v) => { model = v; update(); });
  const tg = toggles([["std", "standardise the features", true], ["sq", "add the feature x₁² + x₂²", true], ["drop", "drop the huge-scale column", false]], (v) => { opt = v; update(); });
  const st = stats([["c", "cross-validated accuracy (5 folds, training data)"], ["t", "test accuracy (sealed set of 200)"]]);
  const open = button("Open the test set (once)", () => { opened = true; open.disabled = true; update(); });
  body.append(st.el, mc.el, tg.el, open);
  const mk = (row) => { let v = row.slice(); if (opt.drop) v = [v[0], v[1], v[3]]; if (opt.sq) v.push(row[0] * row[0] + row[1] * row[1]); return v; };
  const std = (X) => { const d = X[0].length, mu = [], sd = []; for (let j = 0; j < d; j++) { const c = X.map((q) => q[j]), m = c.reduce((a, b) => a + b, 0) / c.length; mu.push(m); sd.push(Math.sqrt(c.reduce((s, v) => s + (v - m) ** 2, 0) / c.length) || 1); } return (row) => row.map((v, j) => (v - mu[j]) / sd[j]); };
  const L = { logistic: (X, y) => { const w = logisticFit(X, y, { iters: 600, lr: 0.3 }); return (row) => (logisticProb(w, row) > 0.5 ? 1 : 0); }, knn: (X, y) => (row) => { const d = X.map((x, i) => ({ d: x.reduce((s, v, j) => s + (v - row[j]) ** 2, 0), c: y[i] })).sort((a, b) => a.d - b.d).slice(0, 7); return d.reduce((s, e) => s + e.c, 0) / 7 > 0.5 ? 1 : 0; }, tree: (X, y) => { const t = fitTreeN(X, y, { maxDepth: 4, minLeaf: 3 }); return (row) => (treeProbN(t, row) > 0.5 ? 1 : 0); }, forest: (X, y) => { const rg = rng(3), F = Array.from({ length: 25 }, () => { const idx = Array.from({ length: X.length }, () => rg.int(X.length)); return fitTreeN(idx.map((i) => X[i]), idx.map((i) => y[i]), { maxDepth: 6, minLeaf: 2, rand: rg }); }); return (row) => (F.reduce((s, t) => s + treeProbN(t, row), 0) / F.length > 0.5 ? 1 : 0); } };
  const learn = (Xr, y) => { const Xp = Xr.map(mk), s = opt.std ? std(Xp) : (q) => q, f = L[model](Xp.map(s), y); return (row) => f(s(mk(row))); };
  function update() { const cv = cvAccuracy(tr.map((p) => p.f), tr.map((p) => p.c), learn, 5, 1); st.set("c", `${fmt(cv.mean * 100, 1)}% ± ${fmt(cv.sd * 100, 1)}`);
    if (opened) { const f = learn(tr.map((p) => p.f), tr.map((p) => p.c)); st.set("t", fmt((te.filter((p) => f(p.f) === p.c).length / te.length) * 100, 1) + "%  (opened; sealed for good)"); } else st.set("t", "sealed"); say(`Cross-validated accuracy ${fmt(cv.mean * 100, 1)} percent`); }
  update(); return () => {};
}
