// Bench: a classifier trained on one distribution meets data whose features have shifted.
import { rng, logisticFit, logisticProb } from "./mlkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, toggles, canvas, stats, plot, live, fmt } = kit;
  const body = frame(root, { title: "When the world moves" });
  const say = live(body);
  const r = rng(2), mk = (n, d) => Array.from({ length: n }, (_, i) => ({ x: (i % 2 ? 1 : -1) + d + 0.8 * r.gauss(), y: 0.8 * r.gauss(), c: i % 2 }));
  const tr = mk(400, 0), w0 = logisticFit(tr.map((p) => [p.x, p.y]), tr.map((p) => p.c), { iters: 1500, lr: 0.5 });
  const test = new Map(), retrained = new Map(), accOf = (w, P) => P.filter((p) => (logisticProb(w, [p.x, p.y]) > 0.5 ? 1 : 0) === p.c).length / P.length;
  const grid = []; for (let d = -2; d <= 2.001; d += 0.25) grid.push(+d.toFixed(2));
  for (const d of grid) { const T = mk(4000, d), R = mk(400, d); test.set(d, T); retrained.set(d, logisticFit(R.map((p) => [p.x, p.y]), R.map((p) => p.c), { iters: 1500, lr: 0.5 })); }
  let d = 0, redo = false;
  const sl = slider({ label: "shift of every feature value", min: -2, max: 2, step: 0.25, value: d, format: (v) => fmt(v, 2), onInput: (v) => { d = v; update(); } });
  const tg = toggles([["r", "retrain on data from the new world", false]], (v) => { redo = v.r; update(); });
  const cv = canvas(body, { aspect: 0.5, label: "Shifted test points with the decision line, and accuracy against shift" });
  const st = stats([["a", "accuracy now"], ["b", "accuracy before the shift"]]);
  body.append(cv.box, st.el, sl.el, tg.el);
  const W = () => (redo ? retrained.get(d) : w0);
  cv.onDraw((ctx, wd, hh, p) => { const half = Math.round(wd * 0.5), m = plot(half, hh, [-4.5, 4.5], [-3, 3], { l: 30, r: 8, t: 14, b: 32 }); m.axes(ctx, p, { ticks: 2 }); const T = test.get(d).slice(0, 160), w = W();
    T.forEach((q) => { ctx.fillStyle = q.c ? p.warm : p.accent; ctx.beginPath(); ctx.arc(m.X(q.x), m.Y(q.y), 3.4, 0, 7); ctx.fill(); });
    ctx.save(); ctx.beginPath(); ctx.rect(m.pad.l, m.pad.t, m.iw, m.ih); ctx.clip(); ctx.strokeStyle = p.ink; ctx.lineWidth = 3; ctx.beginPath(); if (Math.abs(w[2]) > 1e-6) { ctx.moveTo(m.X(-4.5), m.Y(-(w[0] + w[1] * -4.5) / w[2])); ctx.lineTo(m.X(4.5), m.Y(-(w[0] + w[1] * 4.5) / w[2])); } else { const x = -w[0] / w[1]; ctx.moveTo(m.X(x), m.pad.t); ctx.lineTo(m.X(x), m.pad.t + m.ih); } ctx.stroke(); ctx.restore();
    ctx.save(); ctx.translate(half + 8, 0); const m2 = plot(wd - half - 8, hh, [-2, 2], [0.4, 1], { l: 34, r: 12, t: 14, b: 32 }); m2.axes(ctx, p, { xlabel: "shift", ticks: 2 });
    for (const [key, col] of [["fixed", p.warm], ["retrained", p.accent]]) { ctx.strokeStyle = col; ctx.lineWidth = 3; ctx.beginPath(); grid.forEach((g, i) => { const a = accOf(key === "fixed" ? w0 : retrained.get(g), test.get(g)), X = m2.X(g), Y = m2.Y(a); i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }); ctx.stroke(); }
    ctx.strokeStyle = p.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(m2.X(d), m2.pad.t); ctx.lineTo(m2.X(d), m2.pad.t + m2.ih); ctx.stroke(); ctx.font = "800 11px Nunito, system-ui"; ctx.fillStyle = p.warm; ctx.fillText("fixed model", m2.pad.l + 6, m2.pad.t + 12); ctx.fillStyle = p.accent; ctx.fillText("retrained", m2.pad.l + 6, m2.pad.t + 26); ctx.restore(); });
  function update() { const a = accOf(W(), test.get(d)); st.set("a", fmt(a * 100, 0) + "%"); st.set("b", fmt(accOf(w0, test.get(0)) * 100, 0) + "%"); say(`Accuracy ${fmt(a * 100, 0)} percent at shift ${fmt(d, 2)}`); cv.redraw(); }
  update(); return () => cv.destroy();
}
