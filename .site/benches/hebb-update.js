// Bench: step through repeated Hebbian weight updates for two neurons with adjustable activations.
export default function mount(root, kit) {
  const { frame, canvas, plot, slider, stats, live, stepper } = kit;
  const body = frame(root, { title: "Strengthening a connection by co-activation" });
  const say = live(body);
  let x = 0.8, y = 0.6, eta = 0.1, w = 0.2, history = [0.2], t = 0;

  const cv = canvas(body, { aspect: 0.5, label: "The weight after each Hebbian update" });
  const st = stats([["dw", "last update (Δw)"], ["w", "current weight"]]);
  const sx = slider({ label: "x (presynaptic)", min: 0, max: 1, step: 0.05, value: x, format: (v) => v.toFixed(2), onInput: (v) => { x = v; reset(); } });
  const sy = slider({ label: "y (postsynaptic)", min: 0, max: 1, step: 0.05, value: y, format: (v) => v.toFixed(2), onInput: (v) => { y = v; reset(); } });
  const se = slider({ label: "learning rate η", min: 0.02, max: 0.3, step: 0.02, value: eta, format: (v) => v.toFixed(2), onInput: (v) => { eta = v; reset(); } });
  const sp = stepper({ onStep: step, onReset: reset, interval: 400 });
  body.append(cv.box, st.el, sx.el, sy.el, se.el, sp.el);

  function reset() { w = 0.2; history = [0.2]; t = 0; update(); }
  function step() {
    if (t >= 10) return false;
    const dw = eta * x * y;
    w += dw;
    history.push(w);
    t++;
    update();
    return t < 10;
  }

  cv.onDraw((ctx, w2, hh, p) => {
    const m = plot(w2, hh, [0, 10], [0, 1.2]);
    m.axes(ctx, p, { xlabel: "step", ylabel: "weight" });
    ctx.strokeStyle = p.accent; ctx.lineWidth = 3; ctx.beginPath();
    history.forEach((v, i) => { const px = m.X(i), py = m.Y(v); i === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); });
    ctx.stroke();
    history.forEach((v, i) => { ctx.fillStyle = p.ink; ctx.beginPath(); ctx.arc(m.X(i), m.Y(v), 3.5, 0, 7); ctx.fill(); });
  });

  function update() {
    const dw = eta * x * y;
    st.set("dw", dw.toFixed(4));
    st.set("w", w.toFixed(4));
    say(`step ${t}, weight ${w.toFixed(3)}`);
    cv.redraw();
  }
  reset();
  return () => { cv.destroy(); sp.stop(); };
}
