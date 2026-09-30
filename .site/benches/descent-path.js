// Bench: gradient descent steps across a contour map.
import { view, heatmap, arrow, dot } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, choice, stepper, canvas, stats, dragHandles, fmt, live } = kit;
  const body = frame(root, { title: "Roll downhill" });
  const say = live(body);
  const T = { round: ["round bowl x² + y²", 1, 1], long: ["stretched bowl x² + 6y²", 1, 6] };
  let key = "round", eta = 0.1, start = [3, 2.5], path = [[3, 2.5]];
  const f = (x, y) => T[key][1] * x * x + T[key][2] * y * y;
  const se = slider({ label: "learning rate η", min: 0.02, max: 0.45, step: 0.01, value: eta, format: (v) => fmt(v, 2), onInput: (v) => { eta = v; reset(); } });
  const ch = choice("Landscape", Object.entries(T).map(([k, v]) => [k, v[0]]), key, (k) => { key = k; reset(); });
  const cv = canvas(body, { aspect: 0.7, label: "A contour map with a path of gradient-descent steps from a draggable start" });
  const st = stats([["n", "steps taken"], ["p", "position"], ["l", "loss"]]);
  const stp = stepper({ interval: 450, stepLabel: "Step", onStep: () => { if (path.length > 60) return false; const [x, y] = path[path.length - 1]; path.push([x - eta * 2 * T[key][1] * x, y - eta * 2 * T[key][2] * y]); update(); const l = path[path.length - 1]; if (!Number.isFinite(f(...l)) || Math.abs(l[0]) > 1e3) return false; }, onReset: () => reset() });
  body.append(cv.box, st.el, ch.el, h("div", { class: "bench-controls" }, se.el), h("p", { class: "bench-line" }, "Drag the orange start point to choose where the walk begins."), stp.el);
  let V = view(300, 200);
  const reset = () => { path = [start.slice()]; update(); };
  cv.onDraw((ctx, w, hh, p) => {
    V = view(w, hh, { scale: Math.min(w, hh) / 8 }); heatmap(ctx, w, hh, V, f, { block: 6, lo: 0, hi: 60 });
    ctx.lineWidth = 2.5; ctx.strokeStyle = p.ink; ctx.beginPath(); path.forEach(([x, y], i) => (i ? ctx.lineTo(V.X(x), V.Y(y)) : ctx.moveTo(V.X(x), V.Y(y)))); ctx.stroke();
    path.forEach(([x, y]) => dot(ctx, V.X(x), V.Y(y), 3.5, p.ink)); dot(ctx, V.X(start[0]), V.Y(start[1]), 8, p.warm); dot(ctx, V.X(0), V.Y(0), 5, p.white);
  });
  dragHandles(cv.cv, () => [{ x: V.X(start[0]), y: V.Y(start[1]) }], (_, px, py) => { start = [Math.max(-4, Math.min(4, V.x(px))), Math.max(-3, Math.min(3, V.y(py)))]; reset(); });
  function update() { const l = path[path.length - 1]; st.set("n", String(path.length - 1)); st.set("p", `(${fmt(l[0], 3)}, ${fmt(l[1], 3)})`); st.set("l", Number.isFinite(f(...l)) ? fmt(f(...l), 4) : "diverged"); say(`Loss ${fmt(f(...l), 3)}`); cv.redraw(); }
  update();
  return () => { stp.stop(); cv.destroy(); };
}
