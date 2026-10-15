// Bench: normalize a batch of five values for one unit, then apply learned scale and shift.
export default function mount(root, kit) {
  const { frame, canvas, plot, slider, stats, live } = kit;
  const body = frame(root, { title: "Normalizing a batch of activations" });
  const say = live(body);
  let x = [2, 4, 4, 4, 5], gamma = 2, beta = 1;

  const cv = canvas(body, { aspect: 0.55, label: "Raw values, normalized values, and the final scaled and shifted output" });
  const st = stats([["mean", "batch mean"], ["var", "batch variance"], ["std", "batch std"]]);
  const sliders = x.map((v, i) => slider({ label: `x${i + 1}`, min: -2, max: 10, step: 0.1, value: v, format: (val) => val.toFixed(1), onInput: (val) => { x[i] = val; update(); } }));
  const sg = slider({ label: "γ (scale)", min: 0, max: 4, step: 0.1, value: gamma, format: (v) => v.toFixed(1), onInput: (v) => { gamma = v; update(); } });
  const sb = slider({ label: "β (shift)", min: -4, max: 4, step: 0.1, value: beta, format: (v) => v.toFixed(1), onInput: (v) => { beta = v; update(); } });
  body.append(cv.box, st.el, ...sliders.map((s) => s.el), sg.el, sb.el);

  cv.onDraw((ctx, w, hh, p) => {
    const mean = x.reduce((a, b) => a + b, 0) / x.length;
    const variance = x.reduce((a, b) => a + (b - mean) ** 2, 0) / x.length;
    const std = Math.sqrt(Math.max(1e-9, variance));
    const xhat = x.map((v) => (v - mean) / std);
    const y = xhat.map((v) => gamma * v + beta);
    const m = plot(w, hh, [0, x.length], [-6, 10]);
    m.axes(ctx, p, { xlabel: "example in batch", ylabel: "value", ticks: 4 });
    const groupW = m.iw / x.length;
    for (let i = 0; i < x.length; i++) {
      const x0 = m.pad.l + i * groupW + groupW * 0.1, bw = groupW * 0.22;
      const bar = (val, dx, color) => { const y0 = m.Y(0), y1 = m.Y(val); ctx.fillStyle = color; ctx.fillRect(x0 + dx, Math.min(y0, y1), bw, Math.abs(y1 - y0)); };
      bar(x[i], 0, p.muted);
      bar(xhat[i], bw + 3, p.accent);
      bar(y[i], 2 * (bw + 3), p.good);
    }
  });

  function update() {
    const mean = x.reduce((a, b) => a + b, 0) / x.length;
    const variance = x.reduce((a, b) => a + (b - mean) ** 2, 0) / x.length;
    st.set("mean", mean.toFixed(3));
    st.set("var", variance.toFixed(3));
    st.set("std", Math.sqrt(variance).toFixed(3));
    say(`mean ${mean.toFixed(2)}, variance ${variance.toFixed(2)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
