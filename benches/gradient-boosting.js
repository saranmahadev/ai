// Bench: boosting on a wiggly curve: each round adds a one-split tree fitted to what is still wrong.
import { rng, fitStump } from "./mlkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, canvas, stats, stepper, plot, live, fmt } = kit;
  const body = frame(root, { title: "Boosting, one small tree at a time" });
  const say = live(body);
  const f = (x) => Math.sin(1.3 * x) + 0.3 * x, mk = (seed, n) => { const r = rng(seed); return Array.from({ length: n }, () => { const x = 6 * r(); return { x, y: f(x) + 0.3 * r.gauss() }; }); };
  const tr = mk(31, 60), te = mk(32, 200);
  let lr = 0.3, stumps = [], base = tr.reduce((s, p) => s + p.y, 0) / tr.length;
  const pred = (x) => base + stumps.reduce((s, st) => s + lr * (x <= st.t ? st.l : st.r), 0);
  const mse = (pts) => pts.reduce((s, p) => s + (pred(p.x) - p.y) ** 2, 0) / pts.length;
  const cv = canvas(body, { aspect: 0.55, label: "Data points, the boosted prediction and the residuals" });
  const lrs = slider({ label: "learning rate", min: 0.05, max: 1, step: 0.05, value: lr, format: (v) => fmt(v, 2), onInput: (v) => { lr = v; update(); } });
  const st = stats([["n", "trees added"], ["a", "training error (MSE)"], ["b", "unseen error (MSE)"]]);
  const sp = stepper({ interval: 300, stepLabel: "Add a tree", onStep: () => { const res = tr.map((p) => p.y - pred(p.x)); stumps.push(fitStump(tr.map((p) => p.x), res)); update(); if (stumps.length >= 150) return false; }, onReset: () => { stumps = []; update(); } });
  body.append(cv.box, st.el, lrs.el, sp.el);
  cv.onDraw((ctx, w, hh, p) => { const m = plot(w, hh, [0, 6], [-2, 3.5]); m.axes(ctx, p, { xlabel: "x", ylabel: "y" }); ctx.strokeStyle = p.soft2; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i <= 120; i++) { const x = (6 * i) / 120; i ? ctx.lineTo(m.X(x), m.Y(f(x))) : ctx.moveTo(m.X(x), m.Y(f(x))); } ctx.stroke();
    for (const q of tr) { ctx.strokeStyle = p.muted; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(m.X(q.x), m.Y(q.y)); ctx.lineTo(m.X(q.x), m.Y(pred(q.x))); ctx.stroke(); ctx.fillStyle = p.accent; ctx.beginPath(); ctx.arc(m.X(q.x), m.Y(q.y), 3.6, 0, 7); ctx.fill(); }
    ctx.strokeStyle = p.warm; ctx.lineWidth = 3; ctx.beginPath(); for (let i = 0; i <= 240; i++) { const x = (6 * i) / 240; i ? ctx.lineTo(m.X(x), m.Y(pred(x))) : ctx.moveTo(m.X(x), m.Y(pred(x))); } ctx.stroke(); });
  function update() { st.set("n", stumps.length); st.set("a", fmt(mse(tr), 3)); st.set("b", fmt(mse(te), 3)); say(`${stumps.length} trees, unseen error ${fmt(mse(te), 3)}`); cv.redraw(); }
  update(); return () => { sp.stop(); cv.destroy(); };
}
