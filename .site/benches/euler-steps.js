// Bench: Euler's method solving dx/dt = x from x0=1 to t=2, with an adjustable step size.
import { curve, clip, dot } from "./mathkit.js";

export default function mount(root, kit) {
  const { frame, canvas, plot, slider, stats, live } = kit;
  const body = frame(root, { title: "Solving a differential equation with more or fewer steps" });
  const say = live(body);
  let h = 1;

  const cv = canvas(body, { aspect: 0.55, label: "The Euler approximation path against the true curve e^t" });
  const st = stats([["steps", "number of steps"], ["approx", "approximation at t=2"], ["err", "error vs true value"]]);
  const sl = slider({ label: "step size h", min: 0.05, max: 1, step: 0.05, value: h, format: (v) => v.toFixed(2), onInput: (v) => { h = v; update(); } });
  body.append(cv.box, st.el, sl.el);

  function path() {
    const steps = Math.round(2 / h);
    const pts = [[0, 1]];
    let x = 1;
    for (let i = 0; i < steps; i++) { x = x + h * x; pts.push([(i + 1) * h, x]); }
    return pts;
  }

  cv.onDraw((ctx, w, hh, p) => {
    const m = plot(w, hh, [0, 2], [0, 8]);
    m.axes(ctx, p, { xlabel: "t", ylabel: "x" });
    curve(ctx, m, (t) => Math.exp(t), 0, 2, { color: p.muted, width: 2.5, dash: [5, 4], clip: clip(m) });
    const pts = path();
    ctx.strokeStyle = p.accent; ctx.lineWidth = 3; ctx.beginPath();
    pts.forEach(([t, x], i) => { const px = m.X(t), py = m.Y(x); i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); });
    ctx.stroke();
    pts.forEach(([t, x]) => dot(ctx, m.X(t), m.Y(x), 4, p.ink));
  });

  function update() {
    const pts = path();
    const approx = pts[pts.length - 1][1];
    const trueVal = Math.exp(2);
    st.set("steps", String(pts.length - 1));
    st.set("approx", approx.toFixed(4));
    st.set("err", Math.abs(trueVal - approx).toFixed(4));
    say(`${pts.length - 1} steps, approximation ${approx.toFixed(3)}, true value ${trueVal.toFixed(3)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
