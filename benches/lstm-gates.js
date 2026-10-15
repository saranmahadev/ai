// Bench: step an LSTM cell through an input sequence, showing gates, cell state and hidden state.
import { lstmStep } from "./dlkit.js";

const GATES = { Wf: [[0.5, 0.5]], bf: [0.2], Wi: [[0.6, -0.1]], bi: [0.0], Wo: [[0.4, 0.4]], bo: [0.1], Wg: [[1.0, 0.2]], bg: [0.0] };

export default function mount(root, kit) {
  const { frame, canvas, plot, slider, stats, live, stepper } = kit;
  const body = frame(root, { title: "An LSTM's gates, step by step" });
  const say = live(body);
  let xs = [1, 1, 0, 1, 0, 0], t = 0, h = [0], c = [0], gateLog = [];

  const cv = canvas(body, { aspect: 0.55, label: "Cell state and hidden state across the steps so far" });
  const st = stats([["f", "forget gate"], ["i", "input gate"], ["o", "output gate"], ["c", "cell state"], ["h", "hidden state"]]);
  const sliders = xs.map((v, i) => slider({ label: `x${i + 1}`, min: 0, max: 1, step: 1, value: v, onInput: (val) => { xs[i] = val; reset(); } }));
  const sp = stepper({ onStep: step, onReset: reset, interval: 400 });
  body.append(cv.box, st.el, ...sliders.map((s) => s.el), sp.el);

  function reset() { t = 0; h = [0]; c = [0]; gateLog = []; update(); }
  function step() {
    if (t >= xs.length) return false;
    const r = lstmStep([xs[t]], h, c, GATES);
    gateLog.push(r); h = r.h; c = r.c; t++;
    update();
    return t < xs.length;
  }

  cv.onDraw((ctx, w, hh, p) => {
    const m = plot(w, hh, [0, xs.length], [0, 1]);
    m.axes(ctx, p, { xlabel: "step", ylabel: "value" });
    const series = (get, color) => { ctx.strokeStyle = color; ctx.lineWidth = 2.5; ctx.beginPath(); gateLog.forEach((r, i) => { const v = get(r); const px = m.X(i + 1), py = m.Y(v); i === 0 ? (ctx.moveTo(m.X(0), m.Y(0)), ctx.lineTo(px, py)) : ctx.lineTo(px, py); }); ctx.stroke(); };
    series((r) => r.c[0], p.accent);
    series((r) => r.h[0], p.good);
  });

  function update() {
    const last = gateLog[gateLog.length - 1];
    st.set("f", last ? last.f[0].toFixed(4) : "—");
    st.set("i", last ? last.i[0].toFixed(4) : "—");
    st.set("o", last ? last.o[0].toFixed(4) : "—");
    st.set("c", c[0].toFixed(4));
    st.set("h", h[0].toFixed(4));
    say(`step ${t}, cell state ${c[0].toFixed(3)}, hidden state ${h[0].toFixed(3)}`);
    cv.redraw();
  }
  reset();
  return () => { cv.destroy(); sp.stop(); };
}
