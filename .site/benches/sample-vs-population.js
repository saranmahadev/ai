// Bench: random samples centre on the truth; biased samples do not, however large.
import { mean, gauss, bars } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, button, canvas, stats, plot, rng, fmt, live } = kit;
  const body = frame(root, { title: "Random sample versus biased sample" });
  const say = live(body);
  const r0 = rng(11), pop = Array.from({ length: 1000 }, () => 50 + 15 * gauss(r0)), truth = mean(pop);
  const w = pop.map((v) => Math.exp(v / 12)), cum = []; w.reduce((s, x, i) => (cum[i] = s + x), 0);
  let n = 20, seed = 1, A = [], B = [];
  const sn = slider({ label: "sample size", min: 5, max: 400, step: 5, value: n, onInput: (v) => { n = v; sim(); } });
  const cv = canvas(body, { aspect: 0.55, label: "Histograms of 300 sample averages: random sampling and biased sampling" });
  const st = stats([["t", "true population mean"], ["a", "average of the random-sample means"], ["b", "average of the biased-sample means"]]);
  body.append(cv.box, st.el, h("div", { class: "bench-controls" }, sn.el), h("div", { class: "bench-row" }, button("Draw new samples", () => { seed++; sim(); })));
  const pickBiased = (r) => { const t = r() * cum[cum.length - 1]; let lo = 0, hi = cum.length - 1; while (lo < hi) { const m = (lo + hi) >> 1; cum[m] < t ? (lo = m + 1) : (hi = m); } return lo; };
  function sim() { const r = rng(seed * 131 + n); A = []; B = []; for (let i = 0; i < 300; i++) { let a = 0, b = 0; for (let j = 0; j < n; j++) { a += pop[r.int(1000)]; b += pop[pickBiased(r)]; } A.push(a / n); B.push(b / n); } update(); }
  cv.onDraw((ctx, wd, hh, p) => {
    const lo = 35, hi = 85, bins = 50, ca = new Array(bins).fill(0), cb = new Array(bins).fill(0); for (const v of A) { const i = Math.floor(((v - lo) / (hi - lo)) * bins); if (i >= 0 && i < bins) ca[i]++; } for (const v of B) { const i = Math.floor(((v - lo) / (hi - lo)) * bins); if (i >= 0 && i < bins) cb[i]++; }
    const m = plot(wd, hh, [lo, hi], [0, Math.max(...ca, ...cb) * 1.1]); m.axes(ctx, p, { xlabel: "sample average", ylabel: "samples" }); ctx.globalAlpha = 0.6; bars(ctx, m, ca, lo, hi, p.accent, { gap: 0 }); bars(ctx, m, cb, lo, hi, p.warm, { gap: 0 }); ctx.globalAlpha = 1;
    ctx.strokeStyle = p.good; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(m.X(truth), m.pad.t); ctx.lineTo(m.X(truth), m.pad.t + m.ih); ctx.stroke(); ctx.font = "800 11px Nunito, system-ui, sans-serif"; ctx.textAlign = "left"; ctx.fillStyle = p.accent; ctx.fillText("random", m.pad.l + 8, m.pad.t + 12); ctx.fillStyle = p.warm; ctx.fillText("biased", m.pad.l + 8, m.pad.t + 26); ctx.fillStyle = p.good; ctx.fillText("truth", m.pad.l + 8, m.pad.t + 40);
  });
  function update() { st.set("t", fmt(truth, 2)); st.set("a", fmt(mean(A), 2)); st.set("b", fmt(mean(B), 2)); say(`Random average ${fmt(mean(A), 1)}, biased ${fmt(mean(B), 1)}, truth ${fmt(truth, 1)}`); cv.redraw(); }
  sim();
  return () => cv.destroy();
}
