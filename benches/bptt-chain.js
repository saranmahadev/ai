// Bench: step backward through an unrolled RNN, multiplying the per-step gradient factor at each hidden state.
import { rnnStep } from "./dlkit.js";

const Wx = [[0.5]], Wh = [[0.8]], B = [0.1];

export default function mount(root, kit) {
  const { frame, canvas, plot, slider, stats, live, stepper } = kit;
  const body = frame(root, { title: "A gradient's path back through time" });
  const say = live(body);
  let xs = [1, 0, 1, 1, 0, 1], hs = [], t = 0;

  function forward() {
    hs = [0];
    for (const x of xs) hs.push(rnnStep([x], [hs[hs.length - 1]], Wx, Wh, B)[0]);
  }

  const cv = canvas(body, { aspect: 0.55, label: "The surviving gradient fraction as it travels backward through time" });
  const st = stats([["g", "surviving gradient fraction"]]);
  const sliders = xs.map((v, i) => slider({ label: `x${i + 1}`, min: 0, max: 1, step: 1, value: v, onInput: (val) => { xs[i] = val; forward(); reset(); } }));
  const sp = stepper({ onStep: step, onReset: reset, interval: 400, stepLabel: "Step back" });
  body.append(cv.box, st.el, ...sliders.map((s) => s.el), sp.el);

  let path = [1];
  function reset() { t = xs.length; path = [1]; update(); }
  function step() {
    if (t <= 1) return false;
    const h = hs[t];
    const factor = Wh[0][0] * (1 - h * h);
    path.push(path[path.length - 1] * factor);
    t--;
    update();
    return t > 1;
  }

  cv.onDraw((ctx, w, hh, p) => {
    const m = plot(w, hh, [0, xs.length], [0, 1.05]);
    m.axes(ctx, p, { xlabel: "steps back from the end", ylabel: "surviving gradient" });
    ctx.strokeStyle = p.accent; ctx.lineWidth = 3; ctx.beginPath();
    path.forEach((v, i) => { const px = m.X(i), py = m.Y(v); i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); });
    ctx.stroke();
    path.forEach((v, i) => { ctx.fillStyle = p.ink; ctx.beginPath(); ctx.arc(m.X(i), m.Y(v), 4, 0, 7); ctx.fill(); });
  });

  function update() {
    const g = path[path.length - 1];
    st.set("g", g.toFixed(4));
    say(`${path.length - 1} steps back, surviving gradient ${g.toFixed(4)}`);
    cv.redraw();
  }
  forward();
  reset();
  return () => { cv.destroy(); sp.stop(); };
}
