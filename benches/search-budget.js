// Bench: grid search against random search on a hidden validation-score landscape with a fixed number of trials.
import { rng } from "./mlkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, choice, button, canvas, stats, plot, live, fmt } = kit;
  const body = frame(root, { title: "Spend a tuning budget" });
  const say = live(body);
  const score = (x, y) => 0.55 + 0.4 * Math.exp(-((x + 2.3) ** 2) / 0.35) * (0.7 + 0.3 * Math.exp(-((y + 3) ** 2) / 6));
  let mode = "random", budget = 9, seed = 1;
  const mc = choice("Strategy", [["grid", "grid"], ["random", "random"]], mode, (v) => { mode = v; update(); });
  const sl = slider({ label: "trials (training runs)", min: 4, max: 36, step: 1, value: budget, onInput: (v) => { budget = v; update(); } });
  const cv = canvas(body, { aspect: 0.75, label: "Hidden validation score over learning rate and regularisation, with the trials marked" });
  const st = stats([["b", "best score found"], ["t", "best possible"], ["d", "different learning rates tried"]]);
  body.append(cv.box, st.el, mc.el, sl.el, h("div", { class: "bench-row" }, button("New random draw", () => { seed++; update(); })));
  const trials = () => { if (mode === "grid") { const n = Math.max(1, Math.round(Math.sqrt(budget))), out = []; for (let i = 0; i < n; i++) for (let j = 0; j < n; j++) out.push([-4 + (4 * (i + 0.5)) / n, -5 + (5 * (j + 0.5)) / n]); return out; } const r = rng(seed * 17); return Array.from({ length: budget }, () => [-4 + 4 * r(), -5 + 5 * r()]); };
  let T = [];
  cv.onDraw((ctx, w, hh, p) => { const m = plot(w, hh, [-4, 0], [-5, 0]); m.axes(ctx, p, { xlabel: "log₁₀ learning rate", ylabel: "log₁₀ regularisation", ticks: 4 });
    for (let px = 0; px < m.iw; px += 6) for (let py = 0; py < m.ih; py += 6) { const s = score(m.x(m.pad.l + px + 3), m.y(m.pad.t + py + 3)); ctx.globalAlpha = Math.max(0, (s - 0.55) / 0.4) * 0.85; ctx.fillStyle = p.warm; ctx.fillRect(m.pad.l + px, m.pad.t + py, 6, 6); } ctx.globalAlpha = 1;
    for (const [x, y] of T) { ctx.fillStyle = p.ink; ctx.beginPath(); ctx.arc(m.X(x), m.Y(y), 4.5, 0, 7); ctx.fill(); ctx.strokeStyle = p.white; ctx.lineWidth = 1.5; ctx.stroke(); } });
  function update() { T = trials(); const best = Math.max(...T.map(([x, y]) => score(x, y))); st.set("b", fmt(best, 3)); st.set("t", fmt(score(-2.3, -3), 3)); st.set("d", new Set(T.map(([x]) => x.toFixed(4))).size); say(`Best score ${fmt(best, 3)} in ${T.length} trials`); cv.redraw(); }
  update(); return () => cv.destroy();
}
