// Bench: overflow of the exponential, underflow of long products, and the log-space fix.
import { curve, clip, dot } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, choice, canvas, stats, plot, fmt, live } = kit;
  const body = frame(root, { title: "Where the numbers run out" });
  const say = live(body);
  let x = 700, prec = "f64", m = 100;
  const rnd = (v) => (prec === "f32" ? Math.fround(v) : v);
  const sx = slider({ label: "argument x of e^x", min: 0, max: 800, step: 1, value: x, onInput: (v) => { x = v; update(); } });
  const sm = slider({ label: "number of probabilities multiplied (each 0.1)", min: 10, max: 600, step: 10, value: m, onInput: (v) => { m = v; update(); } });
  const ch = choice("Precision", [["f32", "float32"], ["f64", "float64"]], prec, (v) => { prec = v; update(); });
  const cv = canvas(body, { aspect: 0.5, label: "log10 of e to the x compared with the largest storable value" });
  const st = stats([["e", "e^x as stored"], ["lim", "e^x overflows above x ≈"], ["prod", "product of the probabilities"], ["log", "sum of their logarithms"]]);
  body.append(cv.box, st.el, ch.el, h("div", { class: "bench-controls" }, sx.el, sm.el));
  cv.onDraw((ctx, w, hh, p) => { const lim = prec === "f32" ? 38.53 : 308.25, m2 = plot(w, hh, [0, 800], [0, 350]); m2.axes(ctx, p, { xlabel: "x", ylabel: "log₁₀ of e^x", ticks: 4 }); curve(ctx, m2, (t) => t / Math.LN10, 0, 800, { color: p.accent, width: 3.5, clip: clip(m2) }); ctx.strokeStyle = p.warm; ctx.setLineDash([6, 4]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(m2.X(0), m2.Y(lim)); ctx.lineTo(m2.X(800), m2.Y(lim)); ctx.stroke(); ctx.setLineDash([]); dot(ctx, m2.X(x), m2.Y(x / Math.LN10), 6, x / Math.LN10 > lim ? p.warm : p.ink); });
  function update() { const e = rnd(Math.exp(x)); let prod = 1; for (let i = 0; i < m; i++) prod = rnd(prod * rnd(0.1)); st.set("e", Number.isFinite(e) ? e.toExponential(3) : "Infinity (overflow)"); st.set("lim", prec === "f32" ? "88.7" : "709.8"); st.set("prod", prod === 0 ? "0 (underflow: the value is lost)" : prod.toExponential(3)); st.set("log", `${fmt(m * Math.log(0.1), 2)}  (perfectly ordinary)`); say(Number.isFinite(e) ? "Within range" : "Overflow"); cv.redraw(); }
  update();
  return () => cv.destroy();
}
