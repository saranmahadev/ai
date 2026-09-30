// Bench: the perceptron learning rule, one mistake at a time.
import { rng, blobs, regions, scatter, boundaryLine } from "./mlkit.js";
export default function mount(root, kit) {
  const { h, frame, button, canvas, stats, stepper, plot, live, fmt } = kit;
  const body = frame(root, { title: "The perceptron, one mistake at a time" });
  const say = live(body);
  const clean = () => blobs(rng(7), 24, [-0.5, -0.3], [0.5, 0.3], 0.28);
  let pts = clean(), w = [0, 0, 0], updates = 0, cursor = 0, done = false, hard = false;
  const score = (p) => w[0] + w[1] * p.x + w[2] * p.y, wrong = (p) => (score(p) > 0 ? 1 : 0) !== p.c || score(p) === 0;
  const cv = canvas(body, { aspect: 0.75, label: "Two classes and the perceptron's current line" });
  const st = stats([["u", "updates"], ["m", "points misclassified"], ["s", "state"]]);
  const sp = stepper({ interval: 450, stepLabel: "Fix one mistake", onStep: () => { if (done) return false; for (let k = 0; k < pts.length; k++) { const p = pts[(cursor + k) % pts.length]; if (wrong(p)) { const y = p.c ? 1 : -1; w = [w[0] + y, w[1] + y * p.x, w[2] + y * p.y]; updates++; cursor = (cursor + k + 1) % pts.length; update(); if (updates >= 300) { done = true; update(); return false; } return true; } } done = true; update(); return false; }, onReset: reset });
  const hardBtn = button("Make the data overlap", () => { hard = !hard; hardBtn.setAttribute("aria-pressed", String(hard)); pts = hard ? blobs(rng(3), 24, [-0.3, -0.2], [0.3, 0.2], 0.5) : clean(); reset(); });
  hardBtn.setAttribute("aria-pressed", "false");
  body.append(cv.box, st.el, sp.el, hardBtn);
  function reset() { w = [0, 0, 0]; updates = 0; cursor = 0; done = false; update(); }
  cv.onDraw((ctx, wd, hh, p) => { const m = plot(wd, hh, [-2.5, 2.5], [-2.5, 2.5]); m.axes(ctx, p); if (updates) regions(ctx, m, (x, y) => (score({ x, y }) > 0 ? 0.75 : 0.25), p, { alpha: 0.16, block: 12 }); scatter(ctx, m, pts, p, { r: 5, ring: wrong }); if (updates) boundaryLine(ctx, m, w, p.ink, { rx: [-2.5, 2.5] }); });
  function update() { const bad = pts.filter(wrong).length; st.set("u", updates); st.set("m", bad); st.set("s", !updates ? "not started" : bad === 0 ? "converged" : done ? "gave up (never settles)" : "learning"); say(`${updates} updates, ${bad} misclassified`); cv.redraw(); }
  update(); return () => { sp.stop(); cv.destroy(); };
}
