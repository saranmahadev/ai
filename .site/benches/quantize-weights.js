// Bench: quantize a set of weights to b bits over a chosen range, showing the dequantized error.
export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "Rounding weights to a fixed set of levels" });
  const say = live(body);
  let w = [-0.8, 0.3, 0.95, -0.2, 0.6];
  let bits = 8, lo = -1, hi = 1;

  const cv = canvas(body, { aspect: 0.5, label: "Original weights and their dequantized approximations" });
  const st = stats([["scale", "scale (level spacing)"], ["maxerr", "max possible error"], ["avgerr", "average error here"]]);
  const sliders = w.map((v, i) => slider({ label: `w${i + 1}`, min: -1, max: 1, step: 0.01, value: v, format: (val) => val.toFixed(2), onInput: (val) => { w[i] = val; update(); } }));
  const sb = slider({ label: "bits", min: 2, max: 8, step: 1, value: bits, onInput: (v) => { bits = v; update(); } });
  const slo = slider({ label: "range min", min: -2, max: 0, step: 0.1, value: lo, format: (v) => v.toFixed(1), onInput: (v) => { lo = v; update(); } });
  const shi = slider({ label: "range max", min: 0, max: 2, step: 0.1, value: hi, format: (v) => v.toFixed(1), onInput: (v) => { hi = v; update(); } });
  body.append(cv.box, st.el, ...sliders.map((s) => s.el), sb.el, slo.el, shi.el);

  function compute() {
    const levels = 2 ** bits - 1;
    const scale = (hi - lo) / levels;
    const q = w.map((v) => Math.round((v - lo) / scale));
    const dequant = q.map((v) => lo + v * scale);
    const errors = w.map((v, i) => Math.abs(v - dequant[i]));
    return { scale, dequant, errors };
  }

  cv.onDraw((ctx, wd, hh, p) => {
    const { dequant } = compute();
    const n = w.length, gw = wd / n;
    w.forEach((v, i) => {
      const bw = gw * 0.25;
      const bar = (val, dx, color) => { const y0 = hh / 2, bh = val * (hh / 2 - 10); ctx.fillStyle = color; ctx.fillRect(i * gw + gw * 0.2 + dx, y0 - Math.max(0, bh), bw, Math.abs(bh)); };
      bar(v, 0, p.accent);
      bar(dequant[i], bw + 4, p.warm);
    });
  });

  function update() {
    const { scale, errors } = compute();
    st.set("scale", scale.toFixed(6));
    st.set("maxerr", (scale / 2).toFixed(6));
    st.set("avgerr", (errors.reduce((a, b) => a + b, 0) / errors.length).toFixed(6));
    say(`${bits}-bit quantization, average error ${(errors.reduce((a, b) => a + b, 0) / errors.length).toFixed(5)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
