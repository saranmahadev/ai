// Bench: an encoder RNN produces a context vector; a decoder RNN steps forward, feeding its own output back in.
import { rnnStep, sigmoid } from "./dlkit.js";

const We = [[0.5]], Whe = [[0.8]], Be = [0.1];
const Wd = [[0.6]], Whd = [[0.7]], Bd = [0.05];

export default function mount(root, kit) {
  const { frame, canvas, plot, slider, stats, live, stepper } = kit;
  const body = frame(root, { title: "Encode once, decode step by step" });
  const say = live(body);
  let xs = [1, 0, 1], context = 0, t = 0, hd = [0], outs = [];

  const cv = canvas(body, { aspect: 0.55, label: "Decoder outputs, each fed back in as the next step's input" });
  const st = stats([["ctx", "encoder context vector"], ["out", "decoder outputs so far"]]);
  const sliders = xs.map((v, i) => slider({ label: `x${i + 1}`, min: 0, max: 1, step: 1, value: v, onInput: (val) => { xs[i] = val; encode(); reset(); } }));
  const sp = stepper({ onStep: step, onReset: reset, interval: 400, stepLabel: "Decode step" });
  body.append(cv.box, st.el, ...sliders.map((s) => s.el), sp.el);

  function encode() { let h = [0]; for (const x of xs) h = rnnStep([x], h, We, Whe, Be); context = h[0]; }
  function reset() { t = 0; hd = [context]; outs = []; update(); }
  function step() {
    if (t >= 5) return false;
    const input = t === 0 ? [0] : [outs[outs.length - 1]];
    hd = rnnStep(input, hd, Wd, Whd, Bd);
    outs.push(sigmoid(hd[0]));
    t++;
    update();
    return t < 5;
  }

  cv.onDraw((ctx, w, hh, p) => {
    const m = plot(w, hh, [0, 5], [0, 1]);
    m.axes(ctx, p, { xlabel: "decoder step", ylabel: "output" });
    ctx.strokeStyle = p.accent; ctx.lineWidth = 3; ctx.beginPath();
    outs.forEach((v, i) => { const px = m.X(i + 1), py = m.Y(v); i === 0 ? ctx.moveTo(m.X(0), m.Y(context)) : null; ctx.lineTo(px, py); });
    ctx.stroke();
    outs.forEach((v, i) => { ctx.fillStyle = p.ink; ctx.beginPath(); ctx.arc(m.X(i + 1), m.Y(v), 4, 0, 7); ctx.fill(); });
  });

  function update() {
    st.set("ctx", context.toFixed(4));
    st.set("out", outs.map((v) => v.toFixed(3)).join(", ") || "—");
    say(`decoder step ${t}, context ${context.toFixed(3)}`);
    cv.redraw();
  }
  encode();
  reset();
  return () => { cv.destroy(); sp.stop(); };
}
