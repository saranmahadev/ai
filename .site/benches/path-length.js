// Bench: path length and compute cost for recurrence vs self-attention, as sequence length grows.
export default function mount(root, kit) {
  const { frame, canvas, plot, slider, stats, live } = kit;
  const body = frame(root, { title: "How far does information have to travel?" });
  const say = live(body);
  let T = 20, shrink = 0.9;

  const cv = canvas(body, { aspect: 0.55, label: "Surviving signal (left axis, log scale) for recurrence vs attention" });
  const st = stats([["rnn", "RNN: path length, surviving signal"], ["attn", "attention: path length, surviving signal"], ["cost", "compute cost: RNN vs attention"]]);
  const st2 = slider({ label: "sequence length T", min: 2, max: 200, step: 1, value: T, onInput: (v) => { T = v; update(); } });
  const ss = slider({ label: "per-step shrink factor", min: 0.5, max: 1.0, step: 0.01, value: shrink, format: (v) => v.toFixed(2), onInput: (v) => { shrink = v; update(); } });
  body.append(cv.box, st.el, st2.el, ss.el);

  cv.onDraw((ctx, w, hh, p) => {
    const m = plot(w, hh, [2, 200], [-10, 1]);
    m.axes(ctx, p, { xlabel: "sequence length T", ylabel: "log10(surviving signal)" });
    const line = (fn, color) => { ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.beginPath(); for (let t = 2; t <= 200; t += 2) { const v = Math.log10(Math.max(1e-10, fn(t))); const px = m.X(t), py = m.Y(v); t === 2 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); } ctx.stroke(); };
    line((t) => shrink ** (t - 1), p.warm);
    line(() => 1, p.good);
    ctx.fillStyle = p.ink; ctx.beginPath(); ctx.arc(m.X(T), m.Y(Math.log10(Math.max(1e-10, shrink ** (T - 1)))), 5, 0, 7); ctx.fill();
  });

  function update() {
    const signalRnn = shrink ** (T - 1);
    st.set("rnn", `${T - 1} steps, signal ${signalRnn < 1e-6 ? signalRnn.toExponential(2) : signalRnn.toFixed(4)}`);
    st.set("attn", `1 step, signal 1.0000`);
    st.set("cost", `RNN O(T) = ${T};  attention O(T²) = ${T * T}`);
    say(`T=${T}: RNN path ${T - 1}, attention path 1`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
