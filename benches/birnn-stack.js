// Bench: forward and backward hidden states of a tiny RNN over an editable sequence.
import { rnnStep } from "./dlkit.js";

const Wx = [[0.5]], Wh = [[0.8]], B = [0.1];

export default function mount(root, kit) {
  const { frame, canvas, plot, slider, stats, live } = kit;
  const body = frame(root, { title: "Reading a sequence forward, backward, and both" });
  const say = live(body);
  let xs = [1, 0, 0, 1, 0];

  const cv = canvas(body, { aspect: 0.55, label: "Forward and backward hidden states at each position" });
  const st = stats([["pos", "position"], ["fwd", "forward hidden state"], ["bwd", "backward hidden state"]]);
  const sliders = xs.map((v, i) => slider({ label: `x${i + 1}`, min: 0, max: 1, step: 1, value: v, onInput: (val) => { xs[i] = val; update(); } }));
  body.append(cv.box, st.el, ...sliders.map((s) => s.el));

  function runForward() { let h = [0]; const out = []; for (const x of xs) { h = rnnStep([x], h, Wx, Wh, B); out.push(h[0]); } return out; }
  function runBackward() { let h = [0]; const out = []; for (const x of [...xs].reverse()) { h = rnnStep([x], h, Wx, Wh, B); out.push(h[0]); } return out.reverse(); }

  cv.onDraw((ctx, w, hh, p) => {
    const fwd = runForward(), bwd = runBackward();
    const m = plot(w, hh, [0, xs.length], [0, 1]);
    m.axes(ctx, p, { xlabel: "position", ylabel: "hidden state" });
    const line = (arr, color) => { ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.beginPath(); arr.forEach((v, i) => { const px = m.X(i + 0.5), py = m.Y(v); i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); }); ctx.stroke(); };
    line(fwd, p.accent);
    line(bwd, p.warm);
  });

  function update() {
    const fwd = runForward(), bwd = runBackward();
    st.set("pos", `1..${xs.length}`);
    st.set("fwd", fwd.map((v) => v.toFixed(3)).join(", "));
    st.set("bwd", bwd.map((v) => v.toFixed(3)).join(", "));
    say(`forward and backward hidden states updated`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
