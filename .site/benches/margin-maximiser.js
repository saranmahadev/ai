// Bench: a linear support vector machine with a draggable strictness (C) and an optional outlier.
import { rng, blobs, svmFit, scatter, boundaryLine, regions } from "./mlkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, toggles, canvas, stats, plot, live, fmt } = kit;
  const body = frame(root, { title: "Widest street between two classes" });
  const say = live(body);
  const base = blobs(rng(12), 28, [-0.9, -0.5], [0.9, 0.5], 0.5), odd = { x: 0.3, y: 0.15, c: 0 };
  let C = 1, withOdd = false, model;
  const sl = slider({ label: "strictness C", min: -2, max: 2, step: 0.1, value: 0, format: (v) => fmt(10 ** v, 2), onInput: (v) => { C = 10 ** v; update(); } });
  const tg = toggles([["o", "add a stray point deep in the other class", false]], (v) => { withOdd = v.o; update(); });
  const cv = canvas(body, { aspect: 0.75, label: "Two classes, the separating line, its margin and the support vectors" });
  const st = stats([["w", "street width"], ["s", "support vectors"], ["a", "training accuracy"]]);
  body.append(cv.box, st.el, sl.el, tg.el);
  const data = () => (withOdd ? [...base, odd] : base), sc = (p) => model[0] + model[1] * p.x + model[2] * p.y;
  cv.onDraw((ctx, wd, hh, p) => { const m = plot(wd, hh, [-3, 3], [-3, 3]); m.axes(ctx, p); const d = data(); regions(ctx, m, (x, y) => (sc({ x, y }) > 0 ? 0.8 : 0.2), p, { alpha: 0.14, block: 12 }); scatter(ctx, m, d, p, { r: 5.5, ring: (q) => Math.abs(sc(q)) <= 1.02 || (q.c ? sc(q) < 1 : sc(q) > -1) });
    boundaryLine(ctx, m, model, p.ink); boundaryLine(ctx, m, [model[0] - 1, model[1], model[2]], p.muted, { width: 2, dash: [6, 5] }); boundaryLine(ctx, m, [model[0] + 1, model[1], model[2]], p.muted, { width: 2, dash: [6, 5] }); });
  function update() { const d = data(); model = svmFit(d, C); const n = Math.hypot(model[1], model[2]) || 1e-9, sv = d.filter((q) => Math.abs(sc(q)) <= 1.02 || (q.c ? sc(q) < 1 : sc(q) > -1)).length, acc = d.filter((q) => (sc(q) > 0 ? 1 : 0) === q.c).length / d.length;
    st.set("w", fmt(2 / n, 2)); st.set("s", sv); st.set("a", fmt(acc * 100, 0) + "%"); say(`Street width ${fmt(2 / n, 2)}, ${sv} support vectors`); cv.redraw(); }
  update(); return () => cv.destroy();
}
