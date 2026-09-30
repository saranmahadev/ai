// Bench: one-dimensional data no cut can separate becomes separable after adding the feature x².
import { rng } from "./mlkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, toggles, canvas, stats, plot, live, fmt } = kit;
  const body = frame(root, { title: "Lift the data one dimension up" });
  const say = live(body);
  const r = rng(6), pts = Array.from({ length: 36 }, (_, i) => { const c = i % 2; const mag = c ? 1.3 + 1.2 * r() : 0.9 * r(); return { x: (r() < 0.5 ? -1 : 1) * mag, c }; });
  let lift = false, cut = 1.4;
  const tg = toggles([["l", "add the feature x²", false]], (v) => { lift = v.l; update(); });
  const sl = slider({ label: "cut height (x² >)", min: 0, max: 6, step: 0.05, value: cut, format: (v) => fmt(v, 2), onInput: (v) => { cut = v; update(); } });
  const cv = canvas(body, { aspect: 0.6, label: "Points on a line, optionally lifted onto the curve x squared, with a cut" });
  const st = stats([["a", "best cut in the original x"], ["b", "accuracy of your cut on x²"]]);
  body.append(cv.box, st.el, tg.el, sl.el);
  const bestRaw = () => { let best = 0; for (let t = -2.6; t <= 2.6; t += 0.05) { const a = pts.filter((p) => (p.x > t ? 1 : 0) === p.c).length / pts.length; best = Math.max(best, a, 1 - a); } return best; };
  cv.onDraw((ctx, w, hh, p) => { const m = plot(w, hh, [-2.8, 2.8], [-0.6, 7]); m.axes(ctx, p, { xlabel: "x", ylabel: lift ? "x²" : "" });
    if (lift) { ctx.strokeStyle = p.soft2; ctx.lineWidth = 2; ctx.beginPath(); for (let i = 0; i <= 100; i++) { const x = -2.8 + (5.6 * i) / 100; i ? ctx.lineTo(m.X(x), m.Y(x * x)) : ctx.moveTo(m.X(x), m.Y(x * x)); } ctx.stroke(); ctx.strokeStyle = p.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(m.pad.l, m.Y(cut)); ctx.lineTo(m.pad.l + m.iw, m.Y(cut)); ctx.stroke(); }
    pts.forEach((q, i) => { const y = lift ? q.x * q.x : 0.3 * ((i % 5) - 2) * 0.25 - 0.2; ctx.fillStyle = q.c ? p.warm : p.accent; ctx.beginPath(); ctx.arc(m.X(q.x), m.Y(y), 5, 0, 7); ctx.fill(); }); });
  function update() { st.set("a", fmt(bestRaw() * 100, 0) + "%"); st.set("b", lift ? fmt((pts.filter((p) => (p.x * p.x > cut ? 1 : 0) === p.c).length / pts.length) * 100, 0) + "%" : "lift first"); say(lift ? "Lifted onto the parabola" : "Points on a line"); cv.redraw(); }
  update(); return () => cv.destroy();
}
