// Bench: gradient descent on a bowl loss with noise scaled by 1/sqrt(batch size).
import { dot, gauss } from "./mathkit.js";

const STEPS = 40, LR = 0.15;

export default function mount(root, kit) {
  const { frame, canvas, plot, choice, stats, live, rng, stepper } = kit;
  const body = frame(root, { title: "Batch size and the noisiness of a training run" });
  const say = live(body);
  let B = 1, path = [], r = rng(3), i = 0;

  const cv = canvas(body, { aspect: 0.8, label: "Gradient-descent path toward the minimum at the centre" });
  const st = stats([["dist", "distance to the minimum"]]);
  const ch = choice("Batch size", [["1", "1"], ["4", "4"], ["16", "16"], ["64", "64"], ["256", "256"]], "1", (v) => { B = +v; reset(); });
  const sp = stepper({ onStep: step, onReset: reset, interval: 220 });
  body.append(cv.box, st.el, ch.el, sp.el);

  function reset() { path = [[2.5, 2]]; r = rng(3); i = 0; draw(); return undefined; }
  function step() {
    if (i >= STEPS) return false;
    const [x, y] = path[path.length - 1];
    const noise = 1 / Math.sqrt(B);
    const gx = 2 * x + noise * gauss(r), gy = 2 * y + noise * gauss(r);
    path.push([x - LR * gx, y - LR * gy]);
    i++;
    draw();
    return i < STEPS;
  }

  cv.onDraw((ctx, w, hh, p) => {
    const m = plot(w, hh, [-3, 3], [-3, 3]);
    m.axes(ctx, p, { xlabel: "x", ylabel: "y", ticks: 3 });
    for (let k = 1; k <= 3; k++) { ctx.strokeStyle = p.soft2; ctx.lineWidth = 1; ctx.beginPath(); ctx.arc(m.X(0), m.Y(0), k * (m.iw / 7), 0, 7); ctx.stroke(); }
    ctx.strokeStyle = p.accent; ctx.lineWidth = 2; ctx.beginPath();
    path.forEach(([x, y], idx) => { const px = m.X(x), py = m.Y(y); idx === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); });
    ctx.stroke();
    path.forEach(([x, y]) => dot(ctx, m.X(x), m.Y(y), 3, p.accent));
    dot(ctx, m.X(0), m.Y(0), 6, p.good);
  });

  function draw() {
    const [x, y] = path[path.length - 1];
    st.set("dist", Math.hypot(x, y).toFixed(3));
    say(`step ${i}, distance to minimum ${Math.hypot(x, y).toFixed(2)}`);
    cv.redraw();
  }
  reset();
  return () => { cv.destroy(); sp.stop(); };
}
