// Bench: linear, quadratic and exponential growth compared, with a log axis.
import { curve, clip } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, toggles, canvas, stats, plot, fmt, live } = kit;
  const body = frame(root, { title: "Linear, polynomial and exponential growth" });
  const say = live(body);
  let s0 = 2, lin = 3, quad = 0.3, g = 1.2, logY = false;
  const s1 = slider({ label: "start value", min: 1, max: 10, step: 1, value: s0, onInput: (v) => { s0 = v; update(); } });
  const s2 = slider({ label: "linear: added per step", min: 0, max: 8, step: 0.5, value: lin, format: (v) => fmt(v, 1), onInput: (v) => { lin = v; update(); } });
  const s3 = slider({ label: "quadratic: k in k·t²", min: 0, max: 1.5, step: 0.05, value: quad, format: (v) => fmt(v, 2), onInput: (v) => { quad = v; update(); } });
  const s4 = slider({ label: "exponential: factor per step", min: 0.7, max: 1.5, step: 0.01, value: g, format: (v) => fmt(v, 2), onInput: (v) => { g = v; update(); } });
  const tg = toggles([["log", "logarithmic vertical axis", false]], (v) => { logY = v.log; update(); });
  const cv = canvas(body, { aspect: 0.62, label: "Curves for linear, quadratic and exponential growth" });
  const st = stats([["t", "doubling time / half-life"], ["v", "values at t = 20"]]);
  body.append(cv.box, st.el, h("div", { class: "bench-controls" }, s1.el, s2.el, s3.el, s4.el), tg.el);
  const fs = { lin: (t) => s0 + lin * t, quad: (t) => s0 + quad * t * t, exp: (t) => s0 * g ** t };
  cv.onDraw((ctx, w, hh, p) => {
    const tf = (y) => (logY ? Math.log10(Math.max(y, 1e-3)) : y), hi = logY ? Math.max(1, Math.ceil(Math.log10(Math.max(fs.lin(20), fs.quad(20), fs.exp(20), 10)))) : Math.min(Math.max(fs.lin(20), fs.quad(20), fs.exp(20), 10), 400);
    const m = plot(w, hh, [0, 20], [logY ? 0 : 0, hi]); m.axes(ctx, p, { xlabel: "step t", ylabel: logY ? "log₁₀ value" : "value" });
    const mm = { X: m.X, Y: (y) => m.Y(y) };
    curve(ctx, mm, (t) => tf(fs.lin(t)), 0, 20, { color: p.muted, width: 3, clip: clip(m) });
    curve(ctx, mm, (t) => tf(fs.quad(t)), 0, 20, { color: p.warm, width: 3, clip: clip(m) });
    curve(ctx, mm, (t) => tf(fs.exp(t)), 0, 20, { color: p.accent, width: 4, clip: clip(m) });
    ctx.font = "800 11px Nunito, system-ui, sans-serif"; ctx.textAlign = "left";
    [["linear", p.muted, 0], ["quadratic", p.warm, 14], ["exponential", p.accent, 28]].forEach(([t, c, o]) => { ctx.fillStyle = c; ctx.fillText(t, m.pad.l + 8, m.pad.t + 12 + o); });
  });
  function update() {
    st.set("t", g > 1 ? `${fmt(Math.log(2) / Math.log(g), 2)} steps to double` : g < 1 ? `${fmt(Math.log(0.5) / Math.log(g), 2)} steps to halve` : "constant");
    st.set("v", `linear ${fmt(fs.lin(20), 1)} · quadratic ${fmt(fs.quad(20), 1)} · exponential ${fmt(fs.exp(20), 1)}`);
    say("Curves updated"); cv.redraw();
  }
  update();
  return () => cv.destroy();
}
