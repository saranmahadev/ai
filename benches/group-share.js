// Bench: one model, two groups whose data follow different rules, and how the training mix decides who it serves.
import { rng } from "./mlkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, canvas, stats, plot, live, fmt } = kit;
  const body = frame(root, { title: "Whose data trained the model?" });
  const say = live(body);
  const gen = (r, n, g) => Array.from({ length: n }, () => { const t = g ? 1.2 : 0, x = t + 1.2 * r.gauss(); return { x, g, c: x - t + 0.5 * r.gauss() > 0 ? 1 : 0 }; });
  const te = rng(99), tA = gen(te, 4000, 0), tB = gen(te, 4000, 1);
  let share = 0.1, thr = 0;
  const sl = slider({ label: "share of group B in the training data", min: 0.05, max: 0.5, step: 0.05, value: share, format: (v) => fmt(v * 100, 0) + "%", onInput: (v) => { share = v; update(); } });
  const cv = canvas(body, { aspect: 0.5, label: "Feature distributions of two groups with their own true boundaries and the one learned threshold" });
  const st = stats([["t", "learned threshold"], ["a", "accuracy, group A"], ["b", "accuracy, group B"], ["g", "gap"]]);
  body.append(cv.box, st.el, sl.el);
  const acc = (P, t) => P.filter((p) => (p.x > t ? 1 : 0) === p.c).length / P.length;
  cv.onDraw((ctx, w, hh, p) => { const m = plot(w, hh, [-4, 6], [0, 1], { l: 16, r: 14, t: 12, b: 32 }); m.axes(ctx, p, { xlabel: "feature value", ticks: 5 });
    for (const [mu, col, tb] of [[0, p.accent, 0], [1.2, p.warm, 1.2]]) { ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); for (let i = 0; i <= 120; i++) { const x = -4 + (10 * i) / 120, y = Math.exp(-((x - mu) ** 2) / (2 * 1.44)) * 0.85; i ? ctx.lineTo(m.X(x), m.Y(y)) : ctx.moveTo(m.X(x), m.Y(y)); } ctx.stroke(); ctx.setLineDash([5, 4]); ctx.beginPath(); ctx.moveTo(m.X(tb), m.pad.t); ctx.lineTo(m.X(tb), m.pad.t + m.ih); ctx.stroke(); ctx.setLineDash([]); }
    ctx.strokeStyle = p.ink; ctx.lineWidth = 3.5; ctx.beginPath(); ctx.moveTo(m.X(thr), m.pad.t); ctx.lineTo(m.X(thr), m.pad.t + m.ih); ctx.stroke(); ctx.font = "800 11px Nunito, system-ui"; ctx.textAlign = "left"; ctx.fillStyle = p.accent; ctx.fillText("group A (dashed: its true boundary)", m.pad.l + 6, m.pad.t + 12); ctx.fillStyle = p.warm; ctx.fillText("group B (dashed: its true boundary)", m.pad.l + 6, m.pad.t + 26); ctx.fillStyle = p.ink; ctx.fillText("solid: the learned threshold", m.pad.l + 6, m.pad.t + 40); });
  function update() { const r = rng(7), N = 4000, nB = Math.round(N * share), tr = [...gen(r, N - nB, 0), ...gen(r, nB, 1)]; let best = -1;
    for (let t = -3; t <= 4; t += 0.02) { const a = acc(tr, t); if (a > best + 1e-9) { best = a; thr = t; } }
    const a = acc(tA, thr), b = acc(tB, thr); st.set("t", fmt(thr, 2)); st.set("a", fmt(a * 100, 0) + "%"); st.set("b", fmt(b * 100, 0) + "%"); st.set("g", fmt(Math.abs(a - b) * 100, 0) + " points"); say(`Group A ${fmt(a * 100, 0)} percent, group B ${fmt(b * 100, 0)} percent`); cv.redraw(); }
  update(); return () => cv.destroy();
}
