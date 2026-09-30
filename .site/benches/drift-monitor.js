// Bench: a deployed classifier, a change in the world on day 40, and two ways of noticing.
import { rng } from "./mlkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, choice, canvas, stats, plot, live, fmt } = kit;
  const body = frame(root, { title: "Notice the drift" });
  const say = live(body);
  let size = 1, z = 3, kind = "sudden";
  const kc = choice("The change", [["sudden", "sudden on day 40"], ["gradual", "gradual over 30 days"]], kind, (v) => { kind = v; update(); });
  const ss = slider({ label: "size of the shift", min: 0, max: 2, step: 0.1, value: size, format: (v) => fmt(v, 1), onInput: (v) => { size = v; update(); } });
  const sz = slider({ label: "alert when the daily mean moves more than this many standard errors", min: 2, max: 5, step: 0.5, value: z, onInput: (v) => { z = v; update(); } });
  const cv = canvas(body, { aspect: 0.55, label: "Daily accuracy and the input-drift score over 120 days" });
  const st = stats([["a", "input alert on day"], ["b", "accuracy drop visible in labels on day"], ["c", "accuracy at day 120"]]);
  body.append(cv.box, st.el, kc.el, ss.el, sz.el);
  let days = [];
  const sim = () => { const r = rng(12); days = Array.from({ length: 120 }, (_, t) => { const shift = t < 40 ? 0 : kind === "sudden" ? size : size * Math.min(1, (t - 39) / 30); let ok = 0, sum = 0; for (let i = 0; i < 200; i++) { const c = i % 2, x = (c ? 1 : -1) + shift + 0.8 * r.gauss(); sum += x; if ((x > 0 ? 1 : 0) === c) ok++; } return { acc: ok / 200, mean: sum / 200, zs: Math.abs(sum / 200) / (Math.sqrt(0.64 + 1) / Math.sqrt(200)) }; }); };
  cv.onDraw((ctx, w, hh, p) => { const m = plot(w, hh, [0, 120], [0.4, 1], { l: 44, r: 14, t: 12, b: 32 }); m.axes(ctx, p, { xlabel: "day", ylabel: "accuracy", ticks: 6 });
    ctx.strokeStyle = p.warm; ctx.lineWidth = 2.5; ctx.beginPath(); days.forEach((d, t) => { const X = m.X(t), Y = m.Y(d.acc); t ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }); ctx.stroke();
    ctx.globalAlpha = 0.16; ctx.fillStyle = p.muted; ctx.fillRect(m.X(106), m.pad.t, m.X(120) - m.X(106), m.ih); ctx.globalAlpha = 1; ctx.font = "700 10px Nunito, system-ui"; ctx.fillStyle = p.muted; ctx.textAlign = "right"; ctx.fillText("labels not yet in", m.X(120) - 4, m.pad.t + 12);
    ctx.strokeStyle = p.muted; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(m.X(40), m.pad.t); ctx.lineTo(m.X(40), m.pad.t + m.ih); ctx.stroke(); ctx.setLineDash([]);
    const a = alertDay(), l = labelDay(); if (a != null) { ctx.strokeStyle = p.accent; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(m.X(a), m.pad.t); ctx.lineTo(m.X(a), m.pad.t + m.ih); ctx.stroke(); } if (l != null) { ctx.strokeStyle = p.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(m.X(l), m.pad.t); ctx.lineTo(m.X(l), m.pad.t + m.ih); ctx.stroke(); }
    ctx.textAlign = "left"; ctx.fillStyle = p.warm; ctx.fillText("accuracy (true labels)", m.pad.l + 8, m.pad.t + 12); ctx.fillStyle = p.accent; ctx.fillText("blue line: input alert", m.pad.l + 8, m.pad.t + 24); ctx.fillStyle = p.ink; ctx.fillText("black line: drop visible once labels arrive (14 days late)", m.pad.l + 8, m.pad.t + 36); });
  const alertDay = () => { const i = days.findIndex((d, t) => t >= 40 && d.zs > z); return i < 0 ? null : i; };
  const labelDay = () => { const base = days.slice(0, 40).reduce((s, d) => s + d.acc, 0) / 40, i = days.findIndex((d, t) => t >= 40 && d.acc < base - 0.05); return i < 0 ? null : i + 14; };
  function update() { sim(); const a = alertDay(), l = labelDay(); st.set("a", a == null ? "none" : a); st.set("b", l == null ? "none" : l); st.set("c", fmt(days[119].acc * 100, 0) + "%"); say(`Input alert ${a == null ? "never" : "on day " + a}; drop seen in labels ${l == null ? "never" : "on day " + l}`); cv.redraw(); }
  update(); return () => cv.destroy();
}
