// Bench: k-means one assign-and-move iteration at a time, from a random start.
import { rng, clusters, seedCentres, kmeansStep, inertia } from "./mlkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, button, canvas, stats, stepper, plot, live, fmt } = kit;
  const body = frame(root, { title: "k-means, one iteration at a time" });
  const say = live(body);
  const pts = clusters(rng(7), [[-1.4, -1], [1.4, -0.8], [-0.4, 1.4], [2.2, 1.9]], 25, 0.6), PAL = (p) => [p.accent, p.warm, p.good, p.ink, p.muted, p.soft2];
  let k = 4, seed = 1, cents, assign, steps;
  const sl = slider({ label: "number of clusters k", min: 2, max: 6, step: 1, value: k, onInput: (v) => { k = v; start(); } });
  const cv = canvas(body, { aspect: 0.7, label: "Points coloured by nearest centre with the centres marked" });
  const st = stats([["s", "iterations"], ["i", "inertia (total squared distance)"], ["m", "state"]]);
  const sp = stepper({ interval: 600, stepLabel: "One iteration", onStep: () => { const nx = kmeansStep(pts, cents), prev = inertia(pts, cents, assign); cents = nx.cents; assign = kmeansStep(pts, cents).assign; steps++; update(Math.abs(prev - inertia(pts, cents, assign)) < 1e-9); if (Math.abs(prev - inertia(pts, cents, assign)) < 1e-9) return false; }, onReset: start });
  body.append(cv.box, st.el, sl.el, sp.el, button("New random start", () => { seed++; start(); }));
  let m;
  cv.onDraw((ctx, w, hh, p) => { m = plot(w, hh, [-3.2, 4], [-3, 3.6]); m.axes(ctx, p); const c = PAL(p);
    pts.forEach((q, i) => { ctx.fillStyle = c[assign[i]]; ctx.beginPath(); ctx.arc(m.X(q.x), m.Y(q.y), 4.5, 0, 7); ctx.fill(); });
    cents.forEach((q, i) => { ctx.fillStyle = c[i]; ctx.strokeStyle = p.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(m.X(q.x) - 9, m.Y(q.y)); ctx.lineTo(m.X(q.x) + 9, m.Y(q.y)); ctx.moveTo(m.X(q.x), m.Y(q.y) - 9); ctx.lineTo(m.X(q.x), m.Y(q.y) + 9); ctx.stroke(); }); });
  function start() { sp.stop(); cents = seedCentres(pts, k, seed); assign = kmeansStep(pts, cents).assign; steps = 0; update(false); }
  function update(done) { st.set("s", steps); st.set("i", fmt(inertia(pts, cents, assign), 1)); st.set("m", done ? "settled" : steps ? "moving" : "start"); say(`Iteration ${steps}, inertia ${fmt(inertia(pts, cents, assign), 1)}`); cv.redraw(); }
  start(); return () => { sp.stop(); cv.destroy(); };
}
