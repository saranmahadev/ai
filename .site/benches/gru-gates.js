// Bench: step a GRU through an input sequence, showing the reset/update gates and the old-vs-new blend.
import { gruStep } from "./dlkit.js";

const GATES = { Wr: [[0.5, 0.3]], br: [0.0], Wz: [[0.4, 0.4]], bz: [0.1], Wn: [[0.8, 0.5]], bn: [0.0] };

export default function mount(root, kit) {
  const { frame, canvas, plot, slider, stats, live, stepper } = kit;
  const body = frame(root, { title: "A GRU's update gate, blending old and new" });
  const say = live(body);
  let xs = [1, 1, 0, 1, 0, 0], t = 0, h = [0], log = [];

  const cv = canvas(body, { aspect: 0.55, label: "The hidden state across the steps so far" });
  const st = stats([["r", "reset gate"], ["z", "update gate"], ["n", "candidate"], ["h", "hidden state"]]);
  const sliders = xs.map((v, i) => slider({ label: `x${i + 1}`, min: 0, max: 1, step: 1, value: v, onInput: (val) => { xs[i] = val; reset(); } }));
  const sp = stepper({ onStep: step, onReset: reset, interval: 400 });
  body.append(cv.box, st.el, ...sliders.map((s) => s.el), sp.el);

  function reset() { t = 0; h = [0]; log = []; update(); }
  function step() {
    if (t >= xs.length) return false;
    const r = gruStep([xs[t]], h, GATES);
    log.push(r); h = r.h; t++;
    update();
    return t < xs.length;
  }

  cv.onDraw((ctx, w, hh, p) => {
    const m = plot(w, hh, [0, xs.length], [0, 1]);
    m.axes(ctx, p, { xlabel: "step", ylabel: "hidden state" });
    ctx.strokeStyle = p.accent; ctx.lineWidth = 3; ctx.beginPath();
    ctx.moveTo(m.X(0), m.Y(0));
    log.forEach((r, i) => ctx.lineTo(m.X(i + 1), m.Y(r.h[0])));
    ctx.stroke();
    log.forEach((r, i) => { ctx.fillStyle = p.ink; ctx.beginPath(); ctx.arc(m.X(i + 1), m.Y(r.h[0]), 4, 0, 7); ctx.fill(); });
  });

  function update() {
    const last = log[log.length - 1];
    st.set("r", last ? last.r[0].toFixed(4) : "—");
    st.set("z", last ? last.z[0].toFixed(4) : "—");
    st.set("n", last ? last.n[0].toFixed(4) : "—");
    st.set("h", h[0].toFixed(4));
    say(`step ${t}, hidden state ${h[0].toFixed(3)}`);
    cv.redraw();
  }
  reset();
  return () => { cv.destroy(); sp.stop(); };
}
