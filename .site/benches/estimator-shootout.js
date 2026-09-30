// Bench: dividing by n versus n − 1 when estimating a variance.
import { gauss, variance, mean, bars } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, button, canvas, stats, plot, rng, fmt, live } = kit;
  const body = frame(root, { title: "Two ways to estimate a variance" });
  const say = live(body);
  let n = 5, seed = 1, A = [], B = [];
  const sn = slider({ label: "sample size n", min: 2, max: 30, step: 1, value: n, onInput: (v) => { n = v; sim(); } });
  const cv = canvas(body, { aspect: 0.55, label: "Histograms of two variance estimators over 2,000 samples with the true variance marked" });
  const st = stats([["t", "true variance"], ["a", "average of the divide-by-n estimates"], ["b", "average of the divide-by-(n−1) estimates"], ["ratio", "first ÷ truth (theory: (n−1)/n)"]]);
  body.append(cv.box, st.el, h("div", { class: "bench-controls" }, sn.el), h("div", { class: "bench-row" }, button("Draw new samples", () => { seed++; sim(); })));
  function sim() { const r = rng(seed * 977 + n); A = []; B = []; for (let i = 0; i < 2000; i++) { const s = Array.from({ length: n }, () => 2 * gauss(r)); A.push(variance(s, 0)); B.push(variance(s, 1)); } update(); }
  cv.onDraw((ctx, w, hh, p) => {
    const lo = 0, hi = 16, bins = 40, ca = new Array(bins).fill(0), cb = new Array(bins).fill(0); for (const v of A) { const i = Math.min(bins - 1, Math.floor(((v - lo) / (hi - lo)) * bins)); ca[i]++; } for (const v of B) { const i = Math.min(bins - 1, Math.floor(((v - lo) / (hi - lo)) * bins)); cb[i]++; }
    const m = plot(w, hh, [lo, hi], [0, Math.max(...ca, ...cb) * 1.1]); m.axes(ctx, p, { xlabel: "estimated variance", ylabel: "samples" }); ctx.globalAlpha = 0.6; bars(ctx, m, ca, lo, hi, p.warm, { gap: 0 }); bars(ctx, m, cb, lo, hi, p.accent, { gap: 0 }); ctx.globalAlpha = 1;
    ctx.strokeStyle = p.good; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(m.X(4), m.pad.t); ctx.lineTo(m.X(4), m.pad.t + m.ih); ctx.stroke();
    ctx.font = "800 11px Nunito, system-ui, sans-serif"; ctx.textAlign = "left"; ctx.fillStyle = p.warm; ctx.fillText("divide by n", m.pad.l + 8, m.pad.t + 12); ctx.fillStyle = p.accent; ctx.fillText("divide by n − 1", m.pad.l + 8, m.pad.t + 26); ctx.fillStyle = p.good; ctx.fillText("truth = 4", m.pad.l + 8, m.pad.t + 40);
  });
  function update() { st.set("t", "4"); st.set("a", fmt(mean(A), 3)); st.set("b", fmt(mean(B), 3)); st.set("ratio", `${fmt(mean(A) / 4, 3)}  (theory ${fmt((n - 1) / n, 3)})`); say(`Divide by n averages ${fmt(mean(A), 2)}, divide by n minus 1 averages ${fmt(mean(B), 2)}`); cv.redraw(); }
  sim();
  return () => cv.destroy();
}
