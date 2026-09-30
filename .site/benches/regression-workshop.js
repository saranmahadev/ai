// Bench: fit a line by hand, by the closed-form formula and by gradient descent.
import { curve, clip, dot } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, button, stepper, canvas, stats, plot, dragHandles, fmt, live } = kit;
  const body = frame(root, { title: "Fit a line by hand, by formula and by descent" });
  const say = live(body);
  const X = [1, 2, 3, 4, 5], Y = [2, 3, 5, 4, 6];
  let m = 0, b = 0, eta = 0.01, steps = 0, M = plot(300, 200, [0, 6], [0, 8]);
  const sm = slider({ label: "slope m", min: -1, max: 3, step: 0.05, value: m, format: (v) => fmt(v, 2), onInput: (v) => { m = v; update(); } });
  const sb = slider({ label: "intercept b", min: -2, max: 6, step: 0.05, value: b, format: (v) => fmt(v, 2), onInput: (v) => { b = v; update(); } });
  const se = slider({ label: "learning rate η for descent", min: 0.001, max: 0.12, step: 0.001, value: eta, format: (v) => fmt(v, 3), onInput: (v) => { eta = v; } });
  const pick = h("select", { "aria-label": "Point to move" }, X.map((_, i) => h("option", { value: i }, `point ${i + 1}`))); let sel = 0; pick.addEventListener("change", () => { sel = +pick.value; sy.set(Y[sel], true); });
  const sy = slider({ label: "y of the chosen point", min: 0, max: 8, step: 0.5, value: Y[0], format: (v) => fmt(v, 1), onInput: (v) => { Y[sel] = v; update(); } });
  const stp = stepper({ interval: 120, stepLabel: "Descent step", onStep: () => { const n = X.length, gm = (2 / n) * X.reduce((s, x, i) => s + (m * x + b - Y[i]) * x, 0), gb = (2 / n) * X.reduce((s, x, i) => s + (m * x + b - Y[i]), 0); m -= eta * gm; b -= eta * gb; steps++; sm.set(Math.max(-1, Math.min(3, m)), true); sb.set(Math.max(-2, Math.min(6, b)), true); update(); if (steps >= 1000) return false; }, onReset: () => { m = 0; b = 0; steps = 0; sm.set(0, true); sb.set(0, true); update(); } });
  const cv = canvas(body, { aspect: 0.62, label: "Five points and an adjustable line with the errors drawn" });
  const st = stats([["eq", "line"], ["L", "mean squared error"], ["R", "R²"], ["cf", "closed-form best line"], ["n", "descent steps taken"]]);
  body.append(cv.box, st.el, h("div", { class: "bench-controls" }, sm.el, sb.el, se.el, h("label", { class: "bench-slider" }, h("span", {}, "point"), pick), sy.el), h("div", { class: "bench-row" }, button("Jump to the closed-form best line", () => { const f = best(); m = f.m; b = f.b; sm.set(m, true); sb.set(b, true); update(); })), stp.el);
  const best = () => { const n = 5, mx = 3, my = Y.reduce((a, c) => a + c, 0) / n, sxy = X.reduce((s, x, i) => s + (x - mx) * (Y[i] - my), 0), sxx = 10, mm = sxy / sxx; return { m: mm, b: my - mm * mx }; };
  const loss = (mm, bb) => X.reduce((s, x, i) => s + (mm * x + bb - Y[i]) ** 2, 0) / X.length;
  cv.onDraw((ctx, w, hh, p) => { M = plot(w, hh, [0, 6], [0, 8]); M.axes(ctx, p, { xlabel: "x", ylabel: "y" }); ctx.strokeStyle = p.warm; ctx.lineWidth = 1.6; X.forEach((x, i) => { ctx.beginPath(); ctx.moveTo(M.X(x), M.Y(Y[i])); ctx.lineTo(M.X(x), M.Y(m * x + b)); ctx.stroke(); }); curve(ctx, M, (x) => m * x + b, 0, 6, { color: p.accent, width: 4, clip: clip(M), steps: 2 }); X.forEach((x, i) => dot(ctx, M.X(x), M.Y(Y[i]), 6, p.ink)); });
  dragHandles(cv.cv, () => X.map((x, i) => ({ x: M.X(x), y: M.Y(Y[i]) })), (i, px, py) => { Y[i] = Math.max(0, Math.min(8, Math.round(M.y(py) * 2) / 2)); sel = i; pick.value = String(i); sy.set(Y[i], true); update(); });
  function update() { const f = best(), sst = Y.reduce((s, y) => s + (y - Y.reduce((a, c) => a + c, 0) / 5) ** 2, 0), sse = loss(m, b) * 5; st.set("eq", `ŷ = ${fmt(m, 3)} x + ${fmt(b, 3)}`); st.set("L", fmt(loss(m, b), 4)); st.set("R", fmt(1 - sse / sst, 3)); st.set("cf", `ŷ = ${fmt(f.m, 3)} x + ${fmt(f.b, 3)}  (loss ${fmt(loss(f.m, f.b), 4)})`); st.set("n", String(steps)); say(`Loss ${fmt(loss(m, b), 3)}`); cv.redraw(); }
  update();
  return () => { stp.stop(); cv.destroy(); };
}
