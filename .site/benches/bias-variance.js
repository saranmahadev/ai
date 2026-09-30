// Bench: bias, variance and noise for polynomial fits over many fresh datasets.
import { curve, clip, biasVariance } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, canvas, stats, plot, rng, fmt, live } = kit;
  const body = frame(root, { title: "The bias–variance trade-off" });
  const say = live(body);
  const truth = (x) => Math.sin(2.4 * x) * 0.8 + 0.2 * x;
  let deg = 3, N = 15, noise = 0.3, R;
  const sd = slider({ label: "polynomial degree", min: 0, max: 9, step: 1, value: deg, onInput: (v) => { deg = v; update(); } });
  const sn = slider({ label: "training points per dataset", min: 10, max: 40, step: 1, value: N, onInput: (v) => { N = v; update(); } });
  const sz = slider({ label: "noise", min: 0.1, max: 0.6, step: 0.05, value: noise, format: (v) => fmt(v, 2), onInput: (v) => { noise = v; update(); } });
  const cv = canvas(body, { aspect: 0.5, label: "Thirty fitted curves, their average and the true curve" });
  const cv2 = canvas(body, { aspect: 0.25, maxH: 170, label: "Bars for bias squared, variance, noise and their total" });
  const st = stats([["b", "bias²"], ["v", "variance"], ["n", "noise²"], ["t", "total expected squared error"]]);
  body.append(cv.box, cv2.box, st.el, h("div", { class: "bench-controls" }, sd.el, sn.el, sz.el));
  cv.onDraw((ctx, w, hh, p) => { const m = plot(w, hh, [-1, 1], [-2, 2]); m.axes(ctx, p, { xlabel: "x", ylabel: "y", ticks: 4 }); const c = clip(m);
    R.fits.forEach((f) => curve(ctx, m, (x) => f[Math.round(((x + 1) / 2) * (R.xs.length - 1))], -1, 1, { color: p.soft2, width: 1.2, clip: c, steps: 80 }));
    curve(ctx, m, (x) => R.avg[Math.round(((x + 1) / 2) * (R.xs.length - 1))], -1, 1, { color: p.accent, width: 4, clip: c, steps: 80 }); curve(ctx, m, truth, -1, 1, { color: p.good, width: 2.5, dash: [6, 4], clip: c }); });
  cv2.onDraw((ctx, w, hh, p) => { const vals = [["bias²", R.bias2, p.warm], ["variance", R.variance, p.accent], ["noise²", R.noise2, p.muted], ["total", R.total, p.ink]], top = Math.max(0.2, Math.min(1.6, R.total)) * 1.1, bw = (w - 60) / 4; vals.forEach(([n, v, col], i) => { const bh = (Math.min(v, top) / top) * (hh - 44), x = 30 + i * bw; ctx.fillStyle = col; ctx.fillRect(x + 8, hh - 24 - bh, bw - 16, bh); ctx.fillStyle = p.ink; ctx.font = "800 11px Nunito, system-ui, sans-serif"; ctx.textAlign = "center"; ctx.fillText(n, x + bw / 2, hh - 8); ctx.fillText(fmt(v, 3), x + bw / 2, hh - 28 - bh); }); });
  function update() { R = biasVariance(rng(92), truth, { deg, N, noise }); st.set("b", fmt(R.bias2, 4)); st.set("v", fmt(R.variance, 4)); st.set("n", fmt(R.noise2, 4)); st.set("t", fmt(R.total, 4)); say(`Bias squared ${fmt(R.bias2, 3)}, variance ${fmt(R.variance, 3)}`); cv.redraw(); cv2.redraw(); }
  update();
  return () => { cv.destroy(); cv2.destroy(); };
}
