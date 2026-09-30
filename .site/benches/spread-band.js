// Bench: shifting and stretching a data set, and what happens to mean, variance and standard deviation.
import { gauss, bars } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, canvas, stats, rng, plot, fmt, live } = kit;
  const body = frame(root, { title: "Mean, spread and rescaling" });
  const say = live(body);
  const r = rng(9), base = Array.from({ length: 40 }, () => 10 + 2 * gauss(r));
  const b0 = base.reduce((a, b) => a + b, 0) / 40, v0 = base.reduce((a, b) => a + (b - b0) ** 2, 0) / 40;
  let shift = 0, stretch = 1;
  const sh = slider({ label: "shift every value by", min: -10, max: 10, step: 0.5, value: shift, format: (v) => fmt(v, 1), onInput: (v) => { shift = v; update(); } });
  const sc = slider({ label: "stretch around the mean by", min: 0.25, max: 3, step: 0.05, value: stretch, format: (v) => "×" + fmt(v, 2), onInput: (v) => { stretch = v; update(); } });
  const cv = canvas(body, { aspect: 0.5, label: "A histogram of 40 values with the mean and a band of one standard deviation" });
  const st = stats([["m", "mean"], ["v", "variance"], ["s", "standard deviation"], ["ck", "check: variance = old variance × stretch²"]]);
  body.append(cv.box, st.el, h("div", { class: "bench-controls" }, sh.el, sc.el));
  const vals = () => base.map((x) => b0 + stretch * (x - b0) + shift);
  cv.onDraw((ctx, w, hh, p) => {
    const V = vals(), bins = 24, lo = -20, hi = 40, cnt = new Array(bins).fill(0); for (const x of V) { const i = Math.floor(((x - lo) / (hi - lo)) * bins); if (i >= 0 && i < bins) cnt[i]++; }
    const m = plot(w, hh, [lo, hi], [0, 14]); m.axes(ctx, p, { xlabel: "value", ylabel: "count" }); const mu = V.reduce((a, b) => a + b, 0) / 40, sd = Math.sqrt(V.reduce((a, b) => a + (b - mu) ** 2, 0) / 40);
    ctx.fillStyle = p.warm; ctx.globalAlpha = 0.18; ctx.fillRect(m.X(mu - sd), m.pad.t, m.X(mu + sd) - m.X(mu - sd), m.ih); ctx.globalAlpha = 1;
    bars(ctx, m, cnt, lo, hi, p.accent); ctx.strokeStyle = p.warm; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(m.X(mu), m.pad.t); ctx.lineTo(m.X(mu), m.pad.t + m.ih); ctx.stroke();
  });
  function update() { const V = vals(), mu = V.reduce((a, b) => a + b, 0) / 40, v = V.reduce((a, b) => a + (b - mu) ** 2, 0) / 40; st.set("m", fmt(mu, 3)); st.set("v", fmt(v, 3)); st.set("s", fmt(Math.sqrt(v), 3)); st.set("ck", `${fmt(v0, 3)} × ${fmt(stretch * stretch, 3)} = ${fmt(v0 * stretch * stretch, 3)}`); say(`Standard deviation ${fmt(Math.sqrt(v), 2)}`); cv.redraw(); }
  update();
  return () => cv.destroy();
}
