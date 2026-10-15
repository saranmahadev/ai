// Bench: an anchor, a positive and three negatives in 2D; cosine similarity, softmax and the InfoNCE-style loss.
import { softmax } from "./dlkit.js";

const norm = (v) => { const n = Math.hypot(...v) || 1; return [v[0] / n, v[1] / n]; };
const dot2 = (a, b) => a[0] * b[0] + a[1] * b[1];

export default function mount(root, kit) {
  const { frame, canvas, plot, slider, stats, live } = kit;
  const body = frame(root, { title: "Picking the true match out of a lineup" });
  const say = live(body);
  let pts = { a: [1, 0], p: [0.9, 0.1], n1: [-1, 0], n2: [0, 1], n3: [-0.5, 0.5] };
  let tau = 0.5;

  const cv = canvas(body, { aspect: 0.75, label: "Anchor (dark), positive (green) and negatives (red), as unit vectors" });
  const st = stats([["probs", "softmax probabilities"], ["loss", "contrastive loss"]]);
  const sliders = Object.keys(pts).flatMap((k) => [
    slider({ label: `${k} x`, min: -1.5, max: 1.5, step: 0.1, value: pts[k][0], format: (v) => v.toFixed(1), onInput: (v) => { pts[k][0] = v; update(); } }),
    slider({ label: `${k} y`, min: -1.5, max: 1.5, step: 0.1, value: pts[k][1], format: (v) => v.toFixed(1), onInput: (v) => { pts[k][1] = v; update(); } })
  ]);
  const st2 = slider({ label: "temperature τ", min: 0.1, max: 2, step: 0.1, value: tau, format: (v) => v.toFixed(1), onInput: (v) => { tau = v; update(); } });
  body.append(cv.box, st.el, ...sliders.map((s) => s.el), st2.el);

  function compute() {
    const a = norm(pts.a);
    const candidates = ["p", "n1", "n2", "n3"].map((k) => norm(pts[k]));
    const scores = candidates.map((v) => dot2(a, v) / tau);
    const probs = softmax(scores);
    return { a, candidates, scores, probs, loss: -Math.log(Math.max(1e-9, probs[0])) };
  }

  cv.onDraw((ctx, w, hh, p) => {
    const m = plot(w, hh, [-1.2, 1.2], [-1.2, 1.2]);
    m.axes(ctx, p, { xlabel: "dim 1", ylabel: "dim 2", ticks: 3 });
    const dot = (v, color, r) => { ctx.fillStyle = color; ctx.beginPath(); ctx.arc(m.X(v[0]), m.Y(v[1]), r, 0, 7); ctx.fill(); };
    dot(pts.a, p.ink, 7);
    dot(pts.p, p.good, 7);
    ["n1", "n2", "n3"].forEach((k) => dot(pts[k], p.warm, 6));
  });

  function update() {
    const r = compute();
    st.set("probs", `positive ${(r.probs[0] * 100).toFixed(1)}%, negatives ${r.probs.slice(1).map((v) => (v * 100).toFixed(1) + "%").join(", ")}`);
    st.set("loss", r.loss.toFixed(4));
    say(`contrastive loss ${r.loss.toFixed(3)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
