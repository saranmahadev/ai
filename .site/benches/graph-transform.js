// Bench: g(x) = a·f(x − h) + k drawn over f(x).
import { curve, clip } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, choice, canvas, stats, plot, fmt, live } = kit;
  const body = frame(root, { title: "Shift, stretch and flip" });
  const say = live(body);
  const F = { sq: ["x²", (x) => x * x], abs: ["|x|", Math.abs], rt: ["√x", (x) => Math.sqrt(x)], sin: ["sin x", Math.sin] };
  let key = "sq", a = 1, hh = 0, k = 0;
  const sa = slider({ label: "a  (stretch, negative flips)", min: -3, max: 3, step: 0.1, value: a, format: (v) => fmt(v, 1), onInput: (v) => { a = v; update(); } });
  const sh = slider({ label: "h  (shift right)", min: -5, max: 5, step: 0.1, value: hh, format: (v) => fmt(v, 1), onInput: (v) => { hh = v; update(); } });
  const sk = slider({ label: "k  (shift up)", min: -5, max: 5, step: 0.1, value: k, format: (v) => fmt(v, 1), onInput: (v) => { k = v; update(); } });
  const ch = choice("Base function f", Object.entries(F).map(([id, f]) => [id, f[0]]), key, (v) => { key = v; update(); });
  const cv = canvas(body, { aspect: 0.7, label: "Graph of f and its transformed copy g" });
  const st = stats([["g", "g(x)"]]);
  body.append(cv.box, st.el, ch.el, h("div", { class: "bench-controls" }, sa.el, sh.el, sk.el));
  cv.onDraw((ctx, w, H, p) => {
    const m = plot(w, H, [-8, 8], [-8, 8]); m.axes(ctx, p, { xlabel: "x", ylabel: "y", ticks: 8 });
    const f = F[key][1];
    curve(ctx, m, f, -8, 8, { color: p.muted, width: 2.5, dash: [6, 5], clip: clip(m), steps: 400 });
    curve(ctx, m, (x) => a * f(x - hh) + k, -8, 8, { color: p.accent, width: 4, clip: clip(m), steps: 400 });
  });
  function update() { st.set("g", `${fmt(a, 1)} · ${F[key][0].replace("x", "(x − " + fmt(hh, 1) + ")")} + ${fmt(k, 1)}`); say("Graph updated"); cv.redraw(); }
  update();
  return () => cv.destroy();
}
