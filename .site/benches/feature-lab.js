// Bench: a ring problem a straight line cannot solve until a new feature is added.
import { rng, ring, logisticFit, logisticProb, regions, scatter, accuracy } from "./mlkit.js";
export default function mount(root, kit) {
  const { h, frame, toggles, canvas, stats, plot, live, fmt } = kit;
  const body = frame(root, { title: "Feature lab: give the line something to work with" });
  const say = live(body);
  const all = ring(rng(9), 160), train = all.slice(0, 100), test = all.slice(100);
  const FE = { x: (p) => p.x, y: (p) => p.y, x2: (p) => p.x * p.x, y2: (p) => p.y * p.y, xy: (p) => p.x * p.y, r2: (p) => p.x * p.x + p.y * p.y };
  const tg = toggles([["x", "x", true], ["y", "y", true], ["x2", "x²", false], ["y2", "y²", false], ["xy", "x·y", false], ["r2", "x² + y² (squared distance from the centre)", false]], () => update());
  const cv = canvas(body, { aspect: 0.8, label: "Two classes in a ring pattern with the learned regions" });
  const st = stats([["a", "accuracy on training points"], ["b", "accuracy on held-out points"], ["n", "features used"]]);
  body.append(cv.box, st.el, tg.el);
  let model = null;
  cv.onDraw((ctx, w, hh, p) => { const m = plot(w, hh, [-1.7, 1.7], [-1.7, 1.7]); m.axes(ctx, p); if (model) regions(ctx, m, (x, y) => model.prob({ x, y }), p); scatter(ctx, m, train, p, { r: 4.5 }); });
  function update() { const on = Object.entries(tg.get()).filter(([, v]) => v).map(([k]) => k); if (!on.length) { model = null; st.set("a", "—"); st.set("b", "—"); st.set("n", 0); cv.redraw(); return; }
    const f = (p) => on.map((k) => FE[k](p)), w = logisticFit(train.map(f), train.map((p) => p.c), { iters: 1200, lr: 0.5 }); model = { prob: (p) => logisticProb(w, f(p)) };
    const a = accuracy(train, (p) => (model.prob(p) > 0.5 ? 1 : 0)), b = accuracy(test, (p) => (model.prob(p) > 0.5 ? 1 : 0)); st.set("a", fmt(a * 100, 0) + "%"); st.set("b", fmt(b * 100, 0) + "%"); st.set("n", on.length); say(`Held-out accuracy ${fmt(b * 100, 0)} percent with ${on.length} features`); cv.redraw(); }
  update(); return () => cv.destroy();
}
