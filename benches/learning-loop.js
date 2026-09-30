// Bench: the learning loop on a line fit: predict, measure the loss, nudge the parameters, repeat.
import { rng } from "./mlkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, canvas, stats, stepper, plot, live, fmt, button } = kit;
  const body = frame(root, { title: "The learning loop" });
  const say = live(body);
  const r = rng(2), pts = Array.from({ length: 14 }, () => { const x = 0.2 + 3.6 * r(); return { x, y: 0.8 * x + 0.6 + 0.25 * r.gauss() }; });
  let w = -0.6, b = 3, lr = 0.1, step = 0, hist = [];
  const loss = () => pts.reduce((s, p) => s + (w * p.x + b - p.y) ** 2, 0) / pts.length;
  const cv = canvas(body, { aspect: 0.55, label: "Data points, the current line, and the loss over steps" });
  const lrs = slider({ label: "learning rate", min: 0.01, max: 0.5, step: 0.01, value: lr, format: (v) => fmt(v, 2), onInput: (v) => { lr = v; } });
  const st = stats([["s", "step"], ["l", "loss"], ["w", "slope w"], ["b", "intercept b"]]);
  const sp = stepper({ interval: 350, stepLabel: "One step", onStep: () => { const n = pts.length; let gw = 0, gb = 0; for (const p of pts) { const e = w * p.x + b - p.y; gw += (2 * e * p.x) / n; gb += (2 * e) / n; } w -= lr * gw; b -= lr * gb; step++; hist.push(loss()); update(); if (step >= 80) return false; }, onReset: () => { w = -0.6; b = 3; step = 0; hist = []; update(); } });
  body.append(cv.box, st.el, lrs.el, sp.el);
  cv.onDraw((ctx, wd, hh, p) => { const half = Math.round(wd * 0.62), m = plot(half, hh, [0, 4], [0, 5]); m.axes(ctx, p, { xlabel: "input x", ylabel: "output y" });
    ctx.fillStyle = p.accent; for (const q of pts) { ctx.beginPath(); ctx.arc(m.X(q.x), m.Y(q.y), 5, 0, 7); ctx.fill(); }
    ctx.strokeStyle = p.warm; ctx.lineWidth = 3; ctx.save(); ctx.beginPath(); ctx.rect(m.pad.l, m.pad.t, m.iw, m.ih); ctx.clip(); ctx.beginPath(); ctx.moveTo(m.X(0), m.Y(b)); ctx.lineTo(m.X(4), m.Y(w * 4 + b)); ctx.stroke(); ctx.restore();
    const ox = half + 10, m2 = plot(wd - ox + 0, hh, [0, 80], [0, 4], { l: 34, r: 8, t: 14, b: 32 }); ctx.save(); ctx.translate(ox, 0); m2.axes(ctx, p, { xlabel: "step", ticks: 2 }); ctx.strokeStyle = p.ink; ctx.lineWidth = 2.5; ctx.beginPath(); [loss0(), ...hist].forEach((v, i) => { const X = m2.X(i), Y = m2.Y(Math.min(4, v)); i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }); ctx.stroke(); ctx.restore(); });
  const loss0 = () => { const w0 = -0.6, b0 = 3; return pts.reduce((s, p) => s + (w0 * p.x + b0 - p.y) ** 2, 0) / pts.length; };
  function update() { st.set("s", step); st.set("l", fmt(loss(), 3)); st.set("w", fmt(w, 2)); st.set("b", fmt(b, 2)); say(`Step ${step}, loss ${fmt(loss(), 3)}`); cv.redraw(); }
  update(); return () => { sp.stop(); cv.destroy(); };
}
