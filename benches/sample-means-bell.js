// Bench: the histogram of sample means becomes a bell curve.
import { curve, clip, normPdf, gauss, bars } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, choice, canvas, stats, plot, rng, fmt, live } = kit;
  const body = frame(root, { title: "Averages turn into bell curves" });
  const say = live(body);
  const SRC = { flat: ["flat (uniform 0–1)", (r) => r(), 0.5, Math.sqrt(1 / 12)], skew: ["skewed (exponential)", (r) => -Math.log(Math.max(1e-9, r())), 1, 1], two: ["two humps", (r) => (r() < 0.5 ? 0.15 + 0.05 * gauss(r) : 0.85 + 0.05 * gauss(r)), 0.5, 0.7] };
  SRC.two[3] = Math.sqrt(0.5 * (0.15 ** 2 + 0.0025) + 0.5 * (0.85 ** 2 + 0.0025) - 0.25);
  let key = "skew", n = 1;
  const ch = choice("Source of the individual values", Object.entries(SRC).map(([k, v]) => [k, v[0]]), key, (k) => { key = k; update(); });
  const sn = slider({ label: "values averaged (sample size n)", min: 1, max: 60, step: 1, value: n, onInput: (v) => { n = v; update(); } });
  const cv = canvas(body, { aspect: 0.55, label: "A histogram of 3,000 sample means with a normal curve for comparison" });
  const st = stats([["mu", "mean of the sample means"], ["sd", "spread of the sample means"], ["se", "predicted: σ / √n"]]);
  body.append(cv.box, st.el, ch.el, h("div", { class: "bench-controls" }, sn.el));
  let means = [];
  function sim() { const r = rng(17 + n), draw = SRC[key][1]; means = []; for (let i = 0; i < 3000; i++) { let s = 0; for (let j = 0; j < n; j++) s += draw(r); means.push(s / n); } }
  cv.onDraw((ctx, w, hh, p) => {
    const [, , mu, sg] = SRC[key], lo = key === "skew" ? -0.2 : -0.05, hi = key === "skew" ? 4 : 1.05, bins = 50, cnt = new Array(bins).fill(0); for (const x of means) { const i = Math.floor(((x - lo) / (hi - lo)) * bins); if (i >= 0 && i < bins) cnt[i]++; }
    const dens = cnt.map((c) => c / means.length / ((hi - lo) / bins)), top = Math.max(...dens, normPdf(mu, mu, sg / Math.sqrt(n))) * 1.1, m = plot(w, hh, [lo, hi], [0, top]); m.axes(ctx, p, { xlabel: "value of the average", ylabel: "density" });
    bars(ctx, m, dens, lo, hi, p.accent, { gap: 0.5 }); curve(ctx, m, (x) => normPdf(x, mu, sg / Math.sqrt(n)), lo, hi, { color: p.warm, width: 3, clip: clip(m), steps: 300 });
  });
  function update() { sim(); const [, , mu, sg] = SRC[key], mm = means.reduce((a, b) => a + b, 0) / means.length, sd = Math.sqrt(means.reduce((a, b) => a + (b - mm) ** 2, 0) / means.length); st.set("mu", `${fmt(mm, 3)}  (true mean ${fmt(mu, 3)})`); st.set("sd", fmt(sd, 4)); st.set("se", fmt(sg / Math.sqrt(n), 4)); say(`Sample size ${n}`); cv.redraw(); }
  update();
  return () => cv.destroy();
}
