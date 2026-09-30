// Bench: one query attends to five keys through dot products and a softmax.
import { view, grid, arrow, dot } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, toggles, canvas, stats, fmt, live } = kit;
  const body = frame(root, { title: "A query attends to five keys" });
  const say = live(body);
  const K = [0, 45, 90, 135, 180].map((a) => [Math.cos((a * Math.PI) / 180), Math.sin((a * Math.PI) / 180)]);
  let ang = 30, len = 1.5, scale = true;
  const sa = slider({ label: "query direction", min: -20, max: 200, step: 1, value: ang, format: (v) => v + "°", onInput: (v) => { ang = v; update(); } });
  const sl = slider({ label: "query length", min: 0.2, max: 4, step: 0.1, value: len, format: (v) => fmt(v, 1), onInput: (v) => { len = v; update(); } });
  const tg = toggles([["s", "scale scores by 1 / √d (d = 2)", true]], (v) => { scale = v.s; update(); });
  const cv = canvas(body, { aspect: 0.5, label: "Five keys on a half-circle, the query, the attention output and the attention weights as bars" });
  const st = stats([["s", "scores q · k"], ["w", "attention weights"], ["o", "output = Σ weight × value (values = keys)"]]);
  body.append(cv.box, st.el, h("div", { class: "bench-controls" }, sa.el, sl.el), tg.el);
  const Qv = () => [len * Math.cos((ang * Math.PI) / 180), len * Math.sin((ang * Math.PI) / 180)];
  const calc = () => { const q = Qv(), s = K.map((k) => (q[0] * k[0] + q[1] * k[1]) / (scale ? Math.SQRT2 : 1)), m = Math.max(...s), e = s.map((v) => Math.exp(v - m)), t = e.reduce((a, b) => a + b, 0), w = e.map((v) => v / t), o = [w.reduce((a, wi, i) => a + wi * K[i][0], 0), w.reduce((a, wi, i) => a + wi * K[i][1], 0)]; return { q, s, w, o }; };
  cv.onDraw((ctx, wd, hh, p) => {
    const half = Math.floor(wd * 0.55), V = view(half, hh, { scale: Math.min(half, hh) / 5.5, cy: 0.6 }); ctx.save(); ctx.beginPath(); ctx.rect(0, 0, half, hh); ctx.clip(); grid(ctx, V, half, hh, p, { labels: false });
    const { q, w, o } = calc(); K.forEach((k, i) => { arrow(ctx, V.X(0), V.Y(0), V.X(k[0]), V.Y(k[1]), p.muted, 1.5 + w[i] * 6); }); arrow(ctx, V.X(0), V.Y(0), V.X(q[0]), V.Y(q[1]), p.accent, 4); arrow(ctx, V.X(0), V.Y(0), V.X(o[0]), V.Y(o[1]), p.warm, 4); dot(ctx, V.X(q[0]), V.Y(q[1]), 6, p.accent); ctx.restore();
    const x0 = half + 14, bw = (wd - x0 - 10) / 5, base = hh - 24; w.forEach((v, i) => { const bh = v * (base - 16); ctx.fillStyle = p.accent; ctx.fillRect(x0 + i * bw + 4, base - bh, bw - 8, bh); ctx.fillStyle = p.ink; ctx.font = "800 10px Nunito, system-ui, sans-serif"; ctx.textAlign = "center"; ctx.fillText(fmt(v, 2), x0 + i * bw + bw / 2, base - bh - 4); ctx.fillText(`k${i + 1}`, x0 + i * bw + bw / 2, base + 14); });
  });
  function update() { const { s, w, o } = calc(); st.set("s", s.map((v) => fmt(v, 2)).join("  ")); st.set("w", w.map((v) => fmt(v, 3)).join("  ")); st.set("o", `(${fmt(o[0], 3)}, ${fmt(o[1], 3)})`); say(`Most attention on key ${w.indexOf(Math.max(...w)) + 1}`); cv.redraw(); }
  update();
  return () => cv.destroy();
}
