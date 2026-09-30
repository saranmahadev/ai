// Bench: a hand-set threshold rule against a threshold learned from examples, on old and fresh data.
import { rng } from "./mlkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, button, canvas, stats, plot, live, fmt } = kit;
  const body = frame(root, { title: "A hand-set rule versus a learned one" });
  const say = live(body);
  const make = (seed) => { const r = rng(seed); return Array.from({ length: 40 }, (_, i) => { const c = i % 2; return { x: Math.max(0, Math.min(10, (c ? 6 : 2.2) + (c ? 1.6 : 1.3) * r.gauss())), c, y: r() }; }); };
  let train = make(11), fresh = make(500), seed = 500, t = 4;
  const acc = (pts) => pts.filter((p) => (p.x > t ? 1 : 0) === p.c).length / pts.length;
  const cv = canvas(body, { aspect: 0.42, label: "Messages placed by number of spammy words, with a threshold line" });
  const s = slider({ label: "Rule: spam if spammy words >", min: 0, max: 10, step: 0.05, value: t, format: (v) => fmt(v, 2), onInput: (v) => { t = v; update(); } });
  const st = stats([["a", "accuracy on the examples"], ["b", "accuracy on fresh messages"], ["c", "threshold"]]);
  const learn = button("Learn the threshold from the examples", () => { let best = -1, tied = []; for (let v = 0; v <= 10.001; v += 0.05) { t = v; const a = acc(train); if (a > best + 1e-9) { best = a; tied = [v]; } else if (Math.abs(a - best) < 1e-9) tied.push(v); } t = tied.reduce((a, b) => a + b, 0) / tied.length; s.set(t, true); update(); });
  const more = button("Draw a new fresh sample", () => { fresh = make(++seed); update(); });
  body.append(cv.box, st.el, s.el, h("div", { class: "bench-row" }, learn, more));
  cv.onDraw((ctx, w, hh, p) => { const m = plot(w, hh, [0, 10], [0, 1], { l: 16, r: 14, t: 10, b: 32 });
    ctx.globalAlpha = 0.14; ctx.fillStyle = p.accent; ctx.fillRect(m.pad.l, m.pad.t, m.X(t) - m.pad.l, m.ih); ctx.fillStyle = p.warm; ctx.fillRect(m.X(t), m.pad.t, m.pad.l + m.iw - m.X(t), m.ih); ctx.globalAlpha = 1;
    m.axes(ctx, p, { xlabel: "spammy words in the message", ticks: 5 });
    for (const [pts, r0, fill] of [[train, 6, true], [fresh, 4, false]]) for (const q of pts) { ctx.beginPath(); ctx.arc(m.X(q.x), m.pad.t + 8 + q.y * (m.ih - 16), r0, 0, 7); ctx.strokeStyle = q.c ? p.warm : p.accent; ctx.lineWidth = 2; if (fill) { ctx.fillStyle = q.c ? p.warm : p.accent; ctx.fill(); } ctx.stroke(); }
    ctx.strokeStyle = p.ink; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(m.X(t), m.pad.t); ctx.lineTo(m.X(t), m.pad.t + m.ih); ctx.stroke(); });
  function update() { st.set("a", fmt(acc(train) * 100, 0) + "%"); st.set("b", fmt(acc(fresh) * 100, 0) + "%"); st.set("c", fmt(t, 2)); say(`Threshold ${fmt(t, 2)}: ${fmt(acc(train) * 100, 0)} percent on the examples, ${fmt(acc(fresh) * 100, 0)} percent on fresh messages`); cv.redraw(); }
  update(); return () => cv.destroy();
}
