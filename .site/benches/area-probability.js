// Bench: probability as area under a density.
import { curve, clip } from "./mathkit.js";
import { normPdf, integrate } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, choice, canvas, stats, plot, fmt, live } = kit;
  const body = frame(root, { title: "Probability as area under a curve" });
  const say = live(body);
  let kind = "norm", mu = 0, sg = 1, a = -1, b = 1;
  const D = { norm: [(x) => normPdf(x, mu, sg), [-6, 6]], unif: [(x) => (x >= -2 && x <= 4 ? 1 / 6 : 0), [-6, 6]], exp: [(x) => (x >= 0 ? 0.5 * Math.exp(-0.5 * x) : 0), [-1, 8]] };
  const ch = choice("Density", [["norm", "Normal"], ["unif", "Uniform on [−2, 4]"], ["exp", "Exponential (rate 0.5)"]], kind, (v) => { kind = v; const r = D[v][1]; sa.input.min = sb.input.min = r[0]; sa.input.max = sb.input.max = r[1]; a = Math.max(r[0], Math.min(a, r[1])); b = Math.max(r[0], Math.min(b, r[1])); sa.set(a, true); sb.set(b, true); update(); });
  const sm = slider({ label: "mean μ (normal)", min: -3, max: 3, step: 0.5, value: mu, format: (v) => fmt(v, 1), onInput: (v) => { mu = v; update(); } });
  const ss = slider({ label: "standard deviation σ (normal)", min: 0.5, max: 3, step: 0.25, value: sg, format: (v) => fmt(v, 2), onInput: (v) => { sg = v; update(); } });
  const sa = slider({ label: "interval starts at a", min: -6, max: 6, step: 0.25, value: a, format: (v) => fmt(v, 2), onInput: (v) => { a = v; update(); } });
  const sb = slider({ label: "interval ends at b", min: -6, max: 6, step: 0.25, value: b, format: (v) => fmt(v, 2), onInput: (v) => { b = v; update(); } });
  const cv = canvas(body, { aspect: 0.5, label: "A density curve with the area between a and b shaded" });
  const st = stats([["p", "P(a ≤ X ≤ b) = area"], ["z", "in σ units from the mean (normal)"]]);
  body.append(cv.box, st.el, ch.el, h("div", { class: "bench-controls" }, sm.el, ss.el, sa.el, sb.el));
  cv.onDraw((ctx, w, hh, p) => {
    const [f, rx] = D[kind], top = kind === "norm" ? normPdf(mu, mu, sg) * 1.2 : kind === "unif" ? 0.3 : 0.6, m = plot(w, hh, rx, [0, top]); m.axes(ctx, p, { xlabel: "x", ylabel: "density" });
    const lo = Math.min(a, b), hi = Math.max(a, b); ctx.save(); ctx.beginPath(); ctx.rect(m.pad.l, m.pad.t, m.iw, m.ih); ctx.clip(); ctx.fillStyle = p.accent; ctx.globalAlpha = 0.4; ctx.beginPath(); ctx.moveTo(m.X(lo), m.Y(0)); for (let i = 0; i <= 120; i++) { const x = lo + ((hi - lo) * i) / 120; ctx.lineTo(m.X(x), m.Y(f(x))); } ctx.lineTo(m.X(hi), m.Y(0)); ctx.closePath(); ctx.fill(); ctx.globalAlpha = 1; ctx.restore();
    curve(ctx, m, f, rx[0], rx[1], { color: p.ink, width: 3, clip: clip(m), steps: 500 });
  });
  function update() { const [f] = D[kind], lo = Math.min(a, b), hi = Math.max(a, b), area = integrate(f, lo, hi, 600); sm.el.hidden = ss.el.hidden = kind !== "norm"; st.set("p", fmt(area, 4)); st.set("z", kind === "norm" ? `${fmt((lo - mu) / sg, 2)} to ${fmt((hi - mu) / sg, 2)}` : "—"); say(`Probability ${fmt(area, 3)}`); cv.redraw(); }
  update();
  return () => cv.destroy();
}
