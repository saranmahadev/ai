// Bench: total gradient reaching the first layer, plain stacking (f^L) vs residual (1+f)^L, on a log scale.
import { dot } from "./mathkit.js";

export default function mount(root, kit) {
  const { frame, canvas, plot, slider, stats, live } = kit;
  const body = frame(root, { title: "Gradient flow with and without a skip connection" });
  const say = live(body);
  let factor = 0.1, depth = 20;

  const cv = canvas(body, { aspect: 0.55, label: "Total gradient reaching the first layer, on a log scale" });
  const st = stats([["plain", "plain stacking, at full depth"], ["res", "residual (skip) connections, at full depth"]]);
  const sf = slider({ label: "per-block internal factor", min: 0.05, max: 1.5, step: 0.05, value: factor, format: (v) => v.toFixed(2), onInput: (v) => { factor = v; update(); } });
  const sd = slider({ label: "depth (blocks)", min: 1, max: 40, step: 1, value: depth, onInput: (v) => { depth = v; update(); } });
  body.append(cv.box, st.el, sf.el, sd.el);

  cv.onDraw((ctx, w, hh, p) => {
    const m = plot(w, hh, [0, 40], [-14, 4]);
    m.axes(ctx, p, { xlabel: "block", ylabel: "log10(gradient)", ticks: 4 });
    const line = (fn, color) => {
      ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.beginPath();
      for (let l = 0; l <= depth; l++) { const v = Math.log10(Math.max(1e-14, fn(l))); const px = m.X(l), py = m.Y(v); l === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py); }
      ctx.stroke();
    };
    line((l) => factor ** l, p.warm);
    line((l) => (1 + factor) ** l, p.good);
    dot(ctx, m.X(depth), m.Y(Math.log10(Math.max(1e-14, factor ** depth))), 5, p.warm);
    dot(ctx, m.X(depth), m.Y(Math.log10(Math.max(1e-14, (1 + factor) ** depth))), 5, p.good);
  });

  function update() {
    const plain = factor ** depth, res = (1 + factor) ** depth;
    st.set("plain", plain < 1e-8 ? plain.toExponential(2) : plain.toFixed(5));
    st.set("res", res.toFixed(4));
    say(`plain ${plain.toExponential(2)}, residual ${res.toFixed(3)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
