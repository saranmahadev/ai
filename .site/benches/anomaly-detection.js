// Bench: flag unusual points by distance from the centre, by per-feature z-score, or by Mahalanobis distance.
import { rng } from "./mlkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, choice, canvas, stats, plot, live, fmt } = kit;
  const body = frame(root, { title: "Which points are unusual?" });
  const say = live(body);
  const r = rng(11), pts = Array.from({ length: 150 }, () => { const a = r.gauss(), b = r.gauss(); return { x: 1.2 * a, y: 0.9 * (0.85 * a + 0.53 * b), bad: false }; });
  [[1.6, -1.4], [-1.5, 1.3], [3.9, 3.4], [-3.6, -3.1], [0.2, 3.3], [3, -0.4]].forEach(([x, y]) => pts.push({ x, y, bad: true }));
  const n = pts.length, mx = pts.reduce((s, p) => s + p.x, 0) / n, my = pts.reduce((s, p) => s + p.y, 0) / n, cxx = pts.reduce((s, p) => s + (p.x - mx) ** 2, 0) / n, cyy = pts.reduce((s, p) => s + (p.y - my) ** 2, 0) / n, cxy = pts.reduce((s, p) => s + (p.x - mx) * (p.y - my), 0) / n, det = cxx * cyy - cxy * cxy;
  const scoreOf = { euclid: (p) => Math.hypot(p.x - mx, p.y - my), z: (p) => Math.max(Math.abs(p.x - mx) / Math.sqrt(cxx), Math.abs(p.y - my) / Math.sqrt(cyy)), maha: (p) => { const dx = p.x - mx, dy = p.y - my; return Math.sqrt((cyy * dx * dx - 2 * cxy * dx * dy + cxx * dy * dy) / det); } };
  let method = "maha", t = 2.4;
  const mc = choice("Score", [["euclid", "distance from centre"], ["z", "largest feature z-score"], ["maha", "Mahalanobis distance"]], method, (v) => { method = v; update(); });
  const sl = slider({ label: "flag points scoring above", min: 0.5, max: 6, step: 0.05, value: t, format: (v) => fmt(v, 2), onInput: (v) => { t = v; update(); } });
  const cv = canvas(body, { aspect: 0.75, label: "A correlated cloud with six planted anomalies and the points flagged by the chosen score" });
  const st = stats([["c", "anomalies caught (of 6)"], ["f", "false alarms (of 150 normal)"]]);
  body.append(cv.box, st.el, mc.el, sl.el);
  cv.onDraw((ctx, w, hh, p) => { const m = plot(w, hh, [-5, 5], [-4.5, 4.5]); m.axes(ctx, p); const f = scoreOf[method];
    for (const q of pts) { const flag = f(q) > t; ctx.fillStyle = q.bad ? p.warm : p.accent; ctx.beginPath(); ctx.arc(m.X(q.x), m.Y(q.y), q.bad ? 6 : 3.6, 0, 7); ctx.fill(); if (flag) { ctx.strokeStyle = p.ink; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(m.X(q.x), m.Y(q.y), 9, 0, 7); ctx.stroke(); } } });
  function update() { const f = scoreOf[method], caught = pts.filter((q) => q.bad && f(q) > t).length, fa = pts.filter((q) => !q.bad && f(q) > t).length; st.set("c", caught); st.set("f", fa); say(`${caught} of 6 anomalies caught, ${fa} false alarms`); cv.redraw(); }
  update(); return () => cv.destroy();
}
