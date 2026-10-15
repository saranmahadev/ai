// Bench: step a tiny one-unit RNN through an editable input sequence, showing the hidden state at each step.
import { rnnStep } from "./dlkit.js";

const Wx = [[0.5]], Wh = [[0.8]], B = [0.1];

export default function mount(root, kit) {
  const { frame, canvas, plot, slider, stats, live, stepper } = kit;
  const body = frame(root, { title: "Reading a sequence, one step at a time" });
  const say = live(body);
  let xs = [1, 0, 1, 1, 0, 0, 1], t = 0, hs = [0];

  const cv = canvas(body, { aspect: 0.5, label: "The hidden state after each step so far" });
  const st = stats([["h", "hidden state after this step"]]);
  const sliders = xs.map((v, i) => slider({ label: `x${i + 1}`, min: 0, max: 1, step: 1, value: v, onInput: (val) => { xs[i] = val; reset(); } }));
  const sp = stepper({ onStep: step, onReset: reset, interval: 400 });
  body.append(cv.box, st.el, ...sliders.map((s) => s.el), sp.el);

  function reset() { t = 0; hs = [0]; update(); }
  function step() {
    if (t >= xs.length) return false;
    const h = rnnStep([xs[t]], [hs[hs.length - 1]], Wx, Wh, B);
    hs.push(h[0]);
    t++;
    update();
    return t < xs.length;
  }

  cv.onDraw((ctx, w, hh, p) => {
    const m = plot(w, hh, [0, xs.length], [-1, 1]);
    m.axes(ctx, p, { xlabel: "step", ylabel: "hidden state" });
    ctx.strokeStyle = p.accent; ctx.lineWidth = 3; ctx.beginPath();
    hs.forEach((h, i) => { const px = m.X(i), py = m.Y(h); i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); });
    ctx.stroke();
    hs.forEach((h, i) => { ctx.fillStyle = p.ink; ctx.beginPath(); ctx.arc(m.X(i), m.Y(h), 3.5, 0, 7); ctx.fill(); });
  });

  function update() {
    const h = hs[hs.length - 1];
    st.set("h", h.toFixed(4));
    say(`step ${t}, hidden state ${h.toFixed(3)}`);
    cv.redraw();
  }
  reset();
  return () => { cv.destroy(); sp.stop(); };
}
