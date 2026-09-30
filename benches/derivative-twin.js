// Bench: a function and its derivative, with a tangent line.
import { curve, clip, dot, numDiff } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, choice, canvas, stats, plot, fmt, live } = kit;
  const body = frame(root, { title: "A function and its derivative" });
  const say = live(body);
  const sig = (x) => 1 / (1 + Math.exp(-x));
  const F = { exp: ["eˣ", Math.exp, [-3, 3], [-1, 8], -3, 3], ln: ["ln x", Math.log, [0.05, 6], [-3, 3], 0.05, 6], sig: ["sigmoid", sig, [-6, 6], [-0.3, 1.2], -6, 6], tanh: ["tanh", Math.tanh, [-4, 4], [-1.5, 1.5], -4, 4] };
  let key = "sig", x = 0;
  const sx = slider({ label: "input x", min: -6, max: 6, step: 0.05, value: x, format: (v) => fmt(v, 2), onInput: (v) => { x = v; update(); } });
  const ch = choice("Function", Object.entries(F).map(([k, v]) => [k, v[0]]), key, (k) => { key = k; const [, , , , lo, hi] = F[k]; x = Math.min(hi, Math.max(lo, x)); if (k === "ln") x = Math.max(x, 0.5); sx.input.min = lo; sx.input.max = hi; sx.set(x, true); update(); });
  const cv = canvas(body, { aspect: 0.62, label: "The function, its derivative and the tangent at a chosen point" });
  const st = stats([["y", "f(x)"], ["s", "f′(x)  (slope)"]]);
  body.append(cv.box, st.el, ch.el, h("div", { class: "bench-controls" }, sx.el));
  cv.onDraw((ctx, w, hh, p) => {
    const [, f, rx, ry] = F[key], m = plot(w, hh, rx, ry), c = clip(m), s = numDiff(f, x); m.axes(ctx, p, { xlabel: "x", ylabel: "value" });
    curve(ctx, m, f, rx[0], rx[1], { color: p.accent, width: 4, clip: c, steps: 400 });
    curve(ctx, m, (t) => numDiff(f, t), rx[0], rx[1], { color: p.warm, width: 2.5, dash: [6, 4], clip: c, steps: 400 });
    curve(ctx, m, (t) => f(x) + s * (t - x), rx[0], rx[1], { color: p.muted, width: 1.8, clip: c, steps: 2 });
    dot(ctx, m.X(x), m.Y(f(x)), 6, p.accent); dot(ctx, m.X(x), m.Y(Math.max(ry[0], Math.min(ry[1], s))), 5, p.warm);
    ctx.font = "800 11px Nunito, system-ui, sans-serif"; ctx.textAlign = "left"; ctx.fillStyle = p.accent; ctx.fillText("f", m.pad.l + 8, m.pad.t + 12); ctx.fillStyle = p.warm; ctx.fillText("f′ (dashed)", m.pad.l + 8, m.pad.t + 26);
  });
  function update() { const f = F[key][1]; st.set("y", fmt(f(x), 4)); st.set("s", fmt(numDiff(f, x), 4)); say(`f is ${fmt(f(x), 3)}, slope ${fmt(numDiff(f, x), 3)}`); cv.redraw(); }
  update();
  return () => cv.destroy();
}
