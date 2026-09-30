// Bench: a logistic regression decision boundary on one input.
import { curve, clip, dot, gauss } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, button, canvas, stats, plot, rng, fmt, live } = kit;
  const body = frame(root, { title: "Draw the decision boundary" });
  const say = live(body);
  const r = rng(12), P = [...Array.from({ length: 12 }, () => [2 + 0.9 * gauss(r), 0]), ...Array.from({ length: 12 }, () => [5 + 0.9 * gauss(r), 1])];
  let w = 1, b = -3;
  const sw = slider({ label: "weight w", min: -1, max: 6, step: 0.1, value: w, format: (v) => fmt(v, 1), onInput: (v) => { w = v; update(); } });
  const sb = slider({ label: "bias b", min: -25, max: 5, step: 0.5, value: b, format: (v) => fmt(v, 1), onInput: (v) => { b = v; update(); } });
  const cv = canvas(body, { aspect: 0.55, label: "Two classes of points on a line, the sigmoid curve and the decision boundary" });
  const st = stats([["bd", "decision boundary at x = −b / w"], ["acc", "accuracy"], ["ll", "average log loss"]]);
  body.append(cv.box, st.el, h("div", { class: "bench-controls" }, sw.el, sb.el), h("div", { class: "bench-row" }, button("Train by gradient descent", () => { let ww = 0, bb = 0; for (let i = 0; i < 400; i++) { let gw = 0, gb = 0; for (const [x, y] of P) { const q = sg(ww * x + bb); gw += (q - y) * x; gb += q - y; } ww -= 0.3 * gw / P.length; bb -= 0.3 * gb / P.length; } w = Math.max(-1, Math.min(6, ww)); b = Math.max(-25, Math.min(5, bb)); sw.set(w, true); sb.set(b, true); update(); })));
  const sg = (z) => 1 / (1 + Math.exp(-z));
  cv.onDraw((ctx, wd, hh, p) => {
    const m = plot(wd, hh, [0, 8], [-0.1, 1.1]); m.axes(ctx, p, { xlabel: "input x", ylabel: "P(yes)" }); curve(ctx, m, (x) => sg(w * x + b), 0, 8, { color: p.accent, width: 4, clip: clip(m), steps: 300 });
    if (Math.abs(w) > 1e-6) { const bx = -b / w; ctx.strokeStyle = p.good; ctx.setLineDash([6, 4]); ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(m.X(bx), m.pad.t); ctx.lineTo(m.X(bx), m.pad.t + m.ih); ctx.stroke(); ctx.setLineDash([]); }
    P.forEach(([x, y]) => dot(ctx, m.X(x), m.Y(y === 1 ? 1 : 0), 5.5, y === 1 ? p.warm : p.ink));
  });
  function update() { let ok = 0, ll = 0; for (const [x, y] of P) { const q = sg(w * x + b); ok += (q >= 0.5) === (y === 1) ? 1 : 0; ll += -(y ? Math.log(Math.max(1e-12, q)) : Math.log(Math.max(1e-12, 1 - q))); } st.set("bd", Math.abs(w) > 1e-6 ? fmt(-b / w, 2) : "none (w is 0)"); st.set("acc", `${ok} of ${P.length}`); st.set("ll", fmt(ll / P.length, 3)); say(`Accuracy ${ok} of ${P.length}`); cv.redraw(); }
  update();
  return () => cv.destroy();
}
