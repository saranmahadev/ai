// Bench: activation functions and their slopes.
import { curve, clip, dot } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, choice, canvas, stats, plot, fmt, live } = kit;
  const body = frame(root, { title: "Activation functions and their slopes" });
  const say = live(body);
  const sig = (x) => 1 / (1 + Math.exp(-x));
  const F = { sig: ["sigmoid", sig], tanh: ["tanh", Math.tanh], relu: ["ReLU", (x) => Math.max(0, x)], leaky: ["leaky ReLU", (x) => (x > 0 ? x : 0.1 * x)], soft: ["softplus", (x) => Math.log(1 + Math.exp(x))] };
  let key = "sig", x = 1;
  const d = (f, t) => (f(t + 1e-4) - f(t - 1e-4)) / 2e-4;
  const sx = slider({ label: "input x", min: -6, max: 6, step: 0.1, value: x, format: (v) => fmt(v, 1), onInput: (v) => { x = v; update(); } });
  const ch = choice("Function", Object.entries(F).map(([k, v]) => [k, v[0]]), key, (k) => { key = k; update(); });
  const cv = canvas(body, { aspect: 0.62, label: "The activation function and its slope" });
  const st = stats([["y", "output f(x)"], ["s", "slope f′(x)"]]);
  body.append(cv.box, st.el, ch.el, h("div", { class: "bench-controls" }, sx.el));
  cv.onDraw((ctx, w, hh, p) => {
    const m = plot(w, hh, [-6, 6], [-1.5, 3]); m.axes(ctx, p, { xlabel: "x", ylabel: "value", ticks: 6 }); const f = F[key][1], c = clip(m);
    curve(ctx, m, f, -6, 6, { color: p.accent, width: 4, clip: c, steps: 300 });
    curve(ctx, m, (t) => d(f, t), -6, 6, { color: p.warm, width: 2.5, dash: [6, 4], clip: c, steps: 300 });
    dot(ctx, m.X(x), m.Y(f(x)), 6, p.accent);
    ctx.font = "800 11px Nunito, system-ui, sans-serif"; ctx.textAlign = "left"; ctx.fillStyle = p.accent; ctx.fillText("f(x)", m.pad.l + 8, m.pad.t + 12); ctx.fillStyle = p.warm; ctx.fillText("slope", m.pad.l + 8, m.pad.t + 26);
  });
  function update() { const f = F[key][1]; st.set("y", fmt(f(x), 4)); st.set("s", fmt(d(f, x), 4)); say(`Output ${fmt(f(x), 3)}, slope ${fmt(d(f, x), 3)}`); cv.redraw(); }
  update();
  return () => cv.destroy();
}
