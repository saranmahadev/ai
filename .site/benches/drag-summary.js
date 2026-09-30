// Bench: drag points on a number line and watch the summaries.
import { quantile, mean, variance } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, canvas, stats, dragHandles, fmt, live } = kit;
  const body = frame(root, { title: "Move a point, watch the summary" });
  const say = live(body);
  const P = [2, 4, 4, 4, 5, 5, 7, 9];
  let sel = 7;
  const cv = canvas(body, { aspect: 0.3, maxH: 180, label: "Eight points on a number line with the mean and median marked" });
  const st = stats([["mean", "mean"], ["med", "median"], ["rng", "range"], ["sd", "standard deviation (sample)"], ["iqr", "interquartile range"]]);
  const pick = h("select", { "aria-label": "Which point to move" }, P.map((_, i) => h("option", { value: i }, `point ${i + 1}`)));
  pick.value = String(sel); pick.addEventListener("change", () => { sel = +pick.value; sl.set(P[sel], true); });
  const sl = slider({ label: "value of the chosen point", min: 0, max: 60, step: 0.5, value: P[sel], format: (v) => fmt(v, 1), onInput: (v) => { P[sel] = v; update(); } });
  body.append(cv.box, st.el, h("div", { class: "bench-controls" }, h("label", { class: "bench-slider" }, h("span", {}, "point"), pick), sl.el, h("p", { class: "bench-line" }, "You can also drag the points on the line above.")));
  const X = (v, w) => 20 + (v / 60) * (w - 40);
  let W = 300;
  cv.onDraw((ctx, w, hh, p) => {
    W = w; const y = hh * 0.6, s = [...P].sort((a, b) => a - b);
    ctx.strokeStyle = p.muted; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(20, y); ctx.lineTo(w - 20, y); ctx.stroke(); ctx.fillStyle = p.muted; ctx.font = "700 10px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
    for (let v = 0; v <= 60; v += 10) { ctx.fillText(String(v), X(v, w), y + 20); ctx.beginPath(); ctx.moveTo(X(v, w), y - 4); ctx.lineTo(X(v, w), y + 4); ctx.stroke(); }
    const mu = mean(P), md = quantile(s, 0.5); ctx.strokeStyle = p.warm; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(X(mu, w), y - 30); ctx.lineTo(X(mu, w), y + 8); ctx.stroke(); ctx.strokeStyle = p.good; ctx.beginPath(); ctx.moveTo(X(md, w), y - 30); ctx.lineTo(X(md, w), y + 8); ctx.stroke();
    ctx.font = "800 11px Nunito, system-ui, sans-serif"; ctx.fillStyle = p.warm; ctx.fillText("mean", X(mu, w), y - 36); ctx.fillStyle = p.good; ctx.fillText("median", X(md, w) + (Math.abs(md - mu) < 3 ? 30 : 0), y - 36);
    P.forEach((v, i) => { ctx.fillStyle = i === sel ? p.warm : p.accent; ctx.beginPath(); ctx.arc(X(v, w), y - 10 - (i % 2) * 0, 7, 0, 7); ctx.fill(); });
  });
  dragHandles(cv.cv, () => P.map((v) => ({ x: X(v, W), y: cv.h * 0.6 - 10 })), (i, px) => { P[i] = Math.max(0, Math.min(60, Math.round(((px - 20) / (W - 40)) * 60 * 2) / 2)); sel = i; pick.value = String(i); sl.set(P[i], true); update(); });
  function update() { const s = [...P].sort((a, b) => a - b); st.set("mean", fmt(mean(P), 3)); st.set("med", fmt(quantile(s, 0.5), 3)); st.set("rng", fmt(s[s.length - 1] - s[0], 2)); st.set("sd", fmt(Math.sqrt(variance(P)), 3)); st.set("iqr", fmt(quantile(s, 0.75) - quantile(s, 0.25), 3)); say(`Mean ${fmt(mean(P), 2)}, median ${fmt(quantile(s, 0.5), 2)}`); cv.redraw(); }
  update();
  return () => cv.destroy();
}
