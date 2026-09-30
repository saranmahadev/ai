// Bench: simulate a fair coin and see how surprising the observed result is.
import { normCdf, bars } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, canvas, stats, plot, rng, fmt, live } = kit;
  const body = frame(root, { title: "Simulate the null world" });
  const say = live(body);
  let n = 100, obs = 60, counts = [];
  const sn = slider({ label: "number of flips", min: 10, max: 500, step: 10, value: n, onInput: (v) => { n = v; obs = Math.min(obs, n); so.input.max = n; so.set(obs, true); sim(); } });
  const so = slider({ label: "heads observed", min: 0, max: 500, step: 1, value: obs, onInput: (v) => { obs = Math.min(v, n); update(); } });
  const cv = canvas(body, { aspect: 0.55, label: "The distribution of head counts for a fair coin with results at least as extreme as yours shaded" });
  const st = stats([["z", "z = (heads − n/2) / (√n / 2)"], ["ps", "p-value from 5,000 simulated experiments"], ["pn", "p-value from the normal approximation"]]);
  body.append(cv.box, st.el, h("div", { class: "bench-controls" }, sn.el, so.el));
  function sim() { const r = rng(2 + n); counts = new Array(n + 1).fill(0); for (let i = 0; i < 5000; i++) { let k = 0; for (let j = 0; j < n; j++) k += r.int(2); counts[k]++; } update(); }
  cv.onDraw((ctx, w, hh, p) => {
    const sd = Math.sqrt(n) / 2, lo = Math.max(0, Math.floor(n / 2 - 4.5 * sd)), hi = Math.min(n, Math.ceil(n / 2 + 4.5 * sd)), c = counts.slice(lo, hi + 1), m = plot(w, hh, [lo - 0.5, hi + 0.5], [0, Math.max(...c) * 1.1]); m.axes(ctx, p, { xlabel: "heads in n flips (fair coin)", ylabel: "experiments" });
    bars(ctx, m, c, lo - 0.5, hi + 0.5, p.accent, { gap: 0.5 }); const d = Math.abs(obs - n / 2); ctx.globalAlpha = 0.85; c.forEach((v, i) => { const k = lo + i; if (Math.abs(k - n / 2) >= d) { ctx.fillStyle = p.warm; ctx.fillRect(m.X(k - 0.5) + 0.5, m.Y(v), Math.max(1, m.X(k + 0.5) - m.X(k - 0.5) - 1), m.Y(0) - m.Y(v)); } }); ctx.globalAlpha = 1;
    ctx.strokeStyle = p.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(m.X(obs), m.pad.t); ctx.lineTo(m.X(obs), m.pad.t + m.ih); ctx.stroke();
  });
  function update() { const d = Math.abs(obs - n / 2), sd = Math.sqrt(n) / 2; let tail = 0; counts.forEach((v, k) => { if (Math.abs(k - n / 2) >= d) tail += v; }); const z = (obs - n / 2) / sd; st.set("z", fmt(z, 2)); st.set("ps", fmt(tail / 5000, 4)); st.set("pn", fmt(2 * (1 - normCdf(Math.abs(z))), 4)); say(`Simulated p-value ${fmt(tail / 5000, 3)}`); cv.redraw(); }
  sim();
  return () => cv.destroy();
}
