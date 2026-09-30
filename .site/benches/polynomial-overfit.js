// Bench: fit polynomials of growing degree to noisy points; watch test error turn back up.
import { curve, clip, dot, polyfit, polyval, gauss } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, canvas, stats, plot, rng, fmt, live } = kit;
  const body = frame(root, { title: "Fit polynomials to noisy points" });
  const say = live(body);
  let deg = 3, N = 12, noise = 0.25, seed = 4;
  const sd = slider({ label: "polynomial degree", min: 0, max: 11, step: 1, value: deg, onInput: (v) => { deg = v; update(); } });
  const sn = slider({ label: "training points", min: 8, max: 40, step: 1, value: N, onInput: (v) => { N = v; update(); } });
  const sz = slider({ label: "noise", min: 0.05, max: 0.6, step: 0.05, value: noise, format: (v) => fmt(v, 2), onInput: (v) => { noise = v; update(); } });
  const cv = canvas(body, { aspect: 0.5, label: "The noisy training points, the true curve and the fitted polynomial" });
  const cv2 = canvas(body, { aspect: 0.32, maxH: 220, label: "Training and test error for each polynomial degree" });
  const st = stats([["tr", "error on the training points"], ["te", "error on fresh points"]]);
  body.append(cv.box, cv2.box, st.el, h("div", { class: "bench-controls" }, sd.el, sn.el, sz.el));
  const truth = (x) => Math.sin(2.4 * x) * 0.8 + 0.2 * x;
  let tr, te, coefs;
  const data = () => { const r = rng(seed * 100 + N); const xs = Array.from({ length: N }, (_, i) => -1 + (2 * (i + r() * 0.6)) / N), ys = xs.map((x) => truth(x) + noise * gauss(r)); const r2 = rng(999); const tx = Array.from({ length: 200 }, () => -1 + 2 * r2()), ty = tx.map((x) => truth(x) + noise * gauss(r2)); return { xs, ys, tx, ty }; };
  let D;
  const mse = (c, xs, ys) => xs.reduce((s, x, i) => s + (polyval(c, x) - ys[i]) ** 2, 0) / xs.length;
  cv.onDraw((ctx, w, hh, p) => {
    const m = plot(w, hh, [-1, 1], [-2, 2]); m.axes(ctx, p, { xlabel: "x", ylabel: "y", ticks: 4 });
    curve(ctx, m, truth, -1, 1, { color: p.good, width: 2.5, dash: [6, 4], clip: clip(m) }); curve(ctx, m, (x) => polyval(coefs, x), -1, 1, { color: p.accent, width: 4, clip: clip(m), steps: 300 });
    ctx.save(); ctx.beginPath(); const c = clip(m); ctx.rect(c.x, c.y, c.w, c.h); ctx.clip(); D.xs.forEach((x, i) => dot(ctx, m.X(x), m.Y(D.ys[i]), 4.5, p.ink)); ctx.restore();
  });
  cv2.onDraw((ctx, w, hh, p) => {
    const errs = []; for (let d = 0; d <= 11; d++) { if (d >= D.xs.length) break; const c = polyfit(D.xs, D.ys, d); errs.push([mse(c, D.xs, D.ys), mse(c, D.tx, D.ty)]); }
    const m = plot(w, hh, [-0.5, 11.5], [0, 1], { l: 40, r: 12, t: 10, b: 28 }); m.axes(ctx, p, { xlabel: "degree", ylabel: "error (capped at 1)", ticks: 4 });
    errs.forEach(([a, b], d) => { const cap = (v) => Math.min(1, v), bw = m.iw / 26; ctx.fillStyle = p.accent; ctx.fillRect(m.X(d) - bw, m.Y(cap(a)), bw, m.Y(0) - m.Y(cap(a))); ctx.fillStyle = p.warm; ctx.fillRect(m.X(d), m.Y(cap(b)), bw, m.Y(0) - m.Y(cap(b))); if (d === deg) { ctx.strokeStyle = p.ink; ctx.lineWidth = 2; ctx.strokeRect(m.X(d) - bw - 2, m.pad.t, bw * 2 + 4, m.ih); } });
    ctx.font = "800 11px Nunito, system-ui, sans-serif"; ctx.textAlign = "left"; ctx.fillStyle = p.accent; ctx.fillText("training error", m.pad.l + 8, m.pad.t + 12); ctx.fillStyle = p.warm; ctx.fillText("test error", m.pad.l + 8, m.pad.t + 26);
  });
  function update() { D = data(); const d = Math.min(deg, D.xs.length - 1); coefs = polyfit(D.xs, D.ys, d); tr = mse(coefs, D.xs, D.ys); te = mse(coefs, D.tx, D.ty); st.set("tr", fmt(tr, 4)); st.set("te", te > 100 ? "huge (" + te.toExponential(1) + ")" : fmt(te, 4)); say(`Degree ${deg}: training error ${fmt(tr, 3)}, test error ${fmt(te, 3)}`); cv.redraw(); cv2.redraw(); }
  update();
  return () => { cv.destroy(); cv2.destroy(); };
}
