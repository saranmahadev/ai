// Bench: fill in or drop missing incomes, and see how the estimated average moves.
import { rng } from "./mlkit.js";
export default function mount(root, kit) {
  const { h, frame, choice, canvas, stats, plot, live, fmt } = kit;
  const body = frame(root, { title: "Handling missing values" });
  const say = live(body);
  const r = rng(8), data = Array.from({ length: 40 }, () => Math.round(Math.exp(3.6 + 0.55 * r.gauss()) * 10) / 10);
  data[3] = 210; data[17] = 165;
  const trueMean = data.reduce((a, b) => a + b, 0) / data.length;
  let mech = "random", strat = "drop";
  const hidden = (v, i) => (mech === "random" ? i % 4 === 1 : v > 45 && i % 2 === 0);
  const mc = choice("Why values are missing", [["random", "at random"], ["high", "high earners skip the question"]], mech, (v) => { mech = v; update(); });
  const sc = choice("Strategy", [["drop", "drop those rows"], ["mean", "fill with the mean"], ["median", "fill with the median"]], strat, (v) => { strat = v; update(); });
  const cv = canvas(body, { aspect: 0.32, maxH: 180, label: "Incomes on a number line, hidden values as hollow marks" });
  const st = stats([["t", "true mean"], ["e", "estimated mean"], ["n", "rows used"], ["m", "values missing"]]);
  body.append(cv.box, st.el, mc.el, sc.el);
  const med = (a) => { const s = [...a].sort((x, y) => x - y), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
  const calc = () => { const seen = data.filter((v, i) => !hidden(v, i)), miss = data.length - seen.length, fill = strat === "mean" ? seen.reduce((a, b) => a + b, 0) / seen.length : med(seen);
    const used = strat === "drop" ? seen : data.map((v, i) => (hidden(v, i) ? fill : v)); return { miss, est: used.reduce((a, b) => a + b, 0) / used.length, n: used.length, fill }; };
  cv.onDraw((ctx, w, hh, p) => { const m = plot(w, hh, [0, 220], [0, 1], { l: 16, r: 14, t: 10, b: 30 }); m.axes(ctx, p, { xlabel: "income (thousands)", ticks: 4 }); const c = calc();
    data.forEach((v, i) => { const y = m.pad.t + 10 + ((i * 37) % 100) / 100 * (m.ih - 20); ctx.beginPath(); ctx.arc(m.X(v), y, 5, 0, 7); ctx.lineWidth = 2; ctx.strokeStyle = p.accent; if (hidden(v, i)) { if (strat !== "drop") { ctx.strokeStyle = p.warm; ctx.beginPath(); ctx.arc(m.X(c.fill), y, 5, 0, 7); ctx.fillStyle = p.warm; ctx.fill(); ctx.beginPath(); ctx.moveTo(m.X(v), y); ctx.lineTo(m.X(c.fill), y); ctx.setLineDash([3, 3]); ctx.stroke(); ctx.setLineDash([]); } ctx.beginPath(); ctx.arc(m.X(v), y, 5, 0, 7); ctx.strokeStyle = p.muted; ctx.stroke(); } else { ctx.fillStyle = p.accent; ctx.fill(); } });
    ctx.strokeStyle = p.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(m.X(c.est), m.pad.t); ctx.lineTo(m.X(c.est), m.pad.t + m.ih); ctx.stroke(); ctx.strokeStyle = p.good; ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(m.X(trueMean), m.pad.t); ctx.lineTo(m.X(trueMean), m.pad.t + m.ih); ctx.stroke(); ctx.setLineDash([]); });
  function update() { const c = calc(); st.set("t", fmt(trueMean, 1)); st.set("e", fmt(c.est, 1)); st.set("n", c.n); st.set("m", c.miss); say(`Estimated mean ${fmt(c.est, 1)} against a true mean of ${fmt(trueMean, 1)}`); cv.redraw(); }
  update(); return () => cv.destroy();
}
