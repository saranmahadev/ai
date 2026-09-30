// Bench: 100 confidence intervals; how many capture the true mean?
import { gauss } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, choice, button, canvas, stats, plot, rng, fmt, live } = kit;
  const body = frame(root, { title: "Do 95% of intervals capture the truth?" });
  const say = live(body);
  let n = 25, level = 0.95, seed = 1, ivs = [];
  const Z = { 0.9: 1.645, 0.95: 1.96, 0.99: 2.576 };
  const sn = slider({ label: "sample size n", min: 5, max: 200, step: 5, value: n, onInput: (v) => { n = v; sim(); } });
  const ch = choice("Confidence level", [[0.9, "90%"], [0.95, "95%"], [0.99, "99%"]], level, (v) => { level = +v; sim(); });
  const cv = canvas(body, { aspect: 0.85, maxH: 520, label: "One hundred confidence intervals with those missing the true mean marked" });
  const st = stats([["cov", "intervals capturing the true mean (50)"], ["w", "typical interval width"]]);
  body.append(cv.box, st.el, ch.el, h("div", { class: "bench-controls" }, sn.el), h("div", { class: "bench-row" }, button("Draw 100 new samples", () => { seed++; sim(); })));
  function sim() { const r = rng(seed * 313 + n), z = Z[level], se = 10 / Math.sqrt(n); ivs = Array.from({ length: 100 }, () => { let s = 0; for (let i = 0; i < n; i++) s += 50 + 10 * gauss(r); const m = s / n; return [m - z * se, m + z * se, m]; }); update(); }
  cv.onDraw((ctx, w, hh, p) => {
    const m = plot(w, hh, [40, 60], [0, 100], { l: 34, r: 12, t: 8, b: 30 }); m.axes(ctx, p, { xlabel: "value of the mean", ticks: 5 });
    ivs.forEach(([lo, hi, mid], i) => { const y = m.Y(i + 0.5), miss = lo > 50 || hi < 50; ctx.strokeStyle = miss ? p.warm : p.accent; ctx.lineWidth = miss ? 2.6 : 1.6; ctx.beginPath(); ctx.moveTo(m.X(lo), y); ctx.lineTo(m.X(hi), y); ctx.stroke(); ctx.fillStyle = ctx.strokeStyle; ctx.beginPath(); ctx.arc(m.X(mid), y, 1.8, 0, 7); ctx.fill(); });
    ctx.strokeStyle = p.good; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(m.X(50), m.pad.t); ctx.lineTo(m.X(50), m.pad.t + m.ih); ctx.stroke();
  });
  function update() { const hit = ivs.filter(([lo, hi]) => lo <= 50 && hi >= 50).length; st.set("cov", `${hit} of 100  (expected about ${Math.round(level * 100)})`); st.set("w", fmt(2 * Z[level] * 10 / Math.sqrt(n), 2)); say(`${hit} of 100 intervals capture the truth`); cv.redraw(); }
  sim();
  return () => cv.destroy();
}
