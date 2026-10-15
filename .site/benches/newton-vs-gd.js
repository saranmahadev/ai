// Bench: Newton's method (one exact step) vs gradient descent (many steps) on an elongated quadratic bowl.
import { dot } from "./mathkit.js";

export default function mount(root, kit) {
  const { frame, canvas, plot, slider, stats, live, stepper } = kit;
  const body = frame(root, { title: "One Newton step vs many gradient-descent steps" });
  const say = live(body);
  let a = 10, b = 1, lr = 0.1, path = [], i = 0;
  const start = [1, 1];

  const cv = canvas(body, { aspect: 0.75, label: "The gradient-descent path and Newton's single step, on an elongated bowl" });
  const st = stats([["gd", "gradient-descent steps taken"], ["dist", "gradient-descent distance to minimum"]]);
  const sa = slider({ label: "curvature a (steep direction)", min: 2, max: 20, step: 1, value: a, onInput: (v) => { a = v; lr = 1 / a; reset(); } });
  const sb = slider({ label: "curvature b (shallow direction)", min: 0.2, max: 5, step: 0.2, value: b, format: (v) => v.toFixed(1), onInput: (v) => { b = v; reset(); } });
  const sp = stepper({ onStep: step, onReset: reset, interval: 200 });
  body.append(cv.box, st.el, sa.el, sb.el, sp.el);

  function reset() { path = [start.slice()]; i = 0; draw(); }
  function step() {
    if (i >= 60) return false;
    const [x, y] = path[path.length - 1];
    path.push([x - lr * a * x, y - lr * b * y]);
    i++;
    draw();
    return i < 60;
  }
  cv.onDraw((ctx, w, hh, p) => {
    const m = plot(w, hh, [-1.5, 1.5], [-1.5, 1.5]);
    m.axes(ctx, p, { xlabel: "x (steep)", ylabel: "y (shallow)", ticks: 3 });
    ctx.strokeStyle = p.accent; ctx.lineWidth = 2; ctx.beginPath();
    path.forEach(([x, y], idx) => { const px = m.X(x), py = m.Y(y); idx === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); });
    ctx.stroke();
    path.forEach(([x, y]) => dot(ctx, m.X(x), m.Y(y), 3, p.accent));
    dot(ctx, m.X(start[0]), m.Y(start[1]), 6, p.muted);
    dot(ctx, m.X(0), m.Y(0), 6, p.good);
    dot(ctx, m.X(0), m.Y(0), 10, p.warm);
  });

  function draw() {
    const [x, y] = path[path.length - 1];
    st.set("gd", String(i));
    st.set("dist", Math.hypot(x, y).toFixed(4));
    say(`gradient descent step ${i}, distance ${Math.hypot(x, y).toFixed(3)}; Newton reaches 0 in one step`);
    cv.redraw();
  }
  lr = 1 / a;
  reset();
  return () => { cv.destroy(); sp.stop(); };
}
