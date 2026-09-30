// Bench: shapes, bins, box plots and outliers.
import { quantile, mean, gauss, bars } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, choice, toggles, canvas, stats, plot, rng, fmt, live } = kit;
  const body = frame(root, { title: "Shape, bins and outliers" });
  const say = live(body);
  const G = { bell: (r) => 50 + 10 * gauss(r), skew: (r) => 20 + 25 * -Math.log(Math.max(1e-9, r())) * 0.6, two: (r) => (r() < 0.5 ? 35 + 5 * gauss(r) : 70 + 6 * gauss(r)) };
  let shape = "bell", bins = 15, add = false, out = 120;
  const data = {}; for (const k of Object.keys(G)) { const r = rng(4 + k.length); data[k] = Array.from({ length: 200 }, () => G[k](r)); }
  const ch = choice("Shape", [["bell", "bell"], ["skew", "right-skewed"], ["two", "two humps"]], shape, (v) => { shape = v; update(); });
  const sb = slider({ label: "number of bins", min: 3, max: 60, step: 1, value: bins, onInput: (v) => { bins = v; update(); } });
  const tg = toggles([["add", "add one outlier", false]], (v) => { add = v.add; update(); });
  const so = slider({ label: "outlier value", min: 60, max: 200, step: 5, value: out, onInput: (v) => { out = v; update(); } });
  const cv = canvas(body, { aspect: 0.62, label: "A histogram above a box plot with outliers flagged" });
  const st = stats([["mean", "mean"], ["med", "median"], ["fence", "fences (Q1 − 1.5·IQR, Q3 + 1.5·IQR)"], ["n", "points flagged as outliers"]]);
  body.append(cv.box, st.el, ch.el, h("div", { class: "bench-controls" }, sb.el, so.el), tg.el);
  const vals = () => (add ? [...data[shape], out] : data[shape]);
  cv.onDraw((ctx, w, hh, p) => {
    const V = vals(), lo = 0, hi = 210, cnt = new Array(bins).fill(0); for (const x of V) { const i = Math.min(bins - 1, Math.max(0, Math.floor(((x - lo) / (hi - lo)) * bins))); cnt[i]++; }
    const m = plot(w, hh * 0.72, [lo, hi], [0, Math.max(...cnt) * 1.1]); m.axes(ctx, p, { xlabel: "value", ylabel: "count" }); bars(ctx, m, cnt, lo, hi, p.accent);
    const s = [...V].sort((a, b) => a - b), q1 = quantile(s, 0.25), q2 = quantile(s, 0.5), q3 = quantile(s, 0.75), i = q3 - q1, lf = q1 - 1.5 * i, uf = q3 + 1.5 * i, y = hh * 0.72 + 26, X = (v) => m.X(v);
    const inside = s.filter((v) => v >= lf && v <= uf); ctx.strokeStyle = p.ink; ctx.lineWidth = 2; ctx.strokeRect(X(q1), y - 12, X(q3) - X(q1), 24); ctx.beginPath(); ctx.moveTo(X(q2), y - 12); ctx.lineTo(X(q2), y + 12); ctx.moveTo(X(inside[0]), y); ctx.lineTo(X(q1), y); ctx.moveTo(X(q3), y); ctx.lineTo(X(inside[inside.length - 1]), y); ctx.stroke();
    ctx.fillStyle = p.warm; for (const v of s) if (v < lf || v > uf) { ctx.beginPath(); ctx.arc(X(v), y, 3.5, 0, 7); ctx.fill(); }
  });
  function update() { const V = vals(), s = [...V].sort((a, b) => a - b), q1 = quantile(s, 0.25), q3 = quantile(s, 0.75), i = q3 - q1, lf = q1 - 1.5 * i, uf = q3 + 1.5 * i; so.el.hidden = !add; st.set("mean", fmt(mean(V), 2)); st.set("med", fmt(quantile(s, 0.5), 2)); st.set("fence", `${fmt(lf, 1)} and ${fmt(uf, 1)}`); st.set("n", String(s.filter((v) => v < lf || v > uf).length)); say(`Mean ${fmt(mean(V), 1)}, median ${fmt(quantile(s, 0.5), 1)}`); cv.redraw(); }
  update();
  return () => cv.destroy();
}
