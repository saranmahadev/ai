// Bench: a per-layer gradient factor raised to the depth, on a log scale, with sigmoid/ReLU reference marks.
import { dot, label } from "./mathkit.js";

export default function mount(root, kit) {
  const { frame, canvas, plot, slider, stats, live, button } = kit;
  const body = frame(root, { title: "A gradient's size after L layers" });
  const say = live(body);
  let factor = 0.25, depth = 20;

  const cv = canvas(body, { aspect: 0.6, label: "The per-layer factor raised to the depth, on a log scale" });
  const st = stats([["g", "surviving gradient fraction"]]);
  const sf = slider({ label: "per-layer factor", min: 0.1, max: 1.6, step: 0.01, value: factor, format: (v) => v.toFixed(2), onInput: (v) => { factor = v; update(); } });
  const sd = slider({ label: "depth (layers)", min: 1, max: 30, step: 1, value: depth, onInput: (v) => { depth = v; update(); } });
  const presets = kit.h("div", { class: "bench-row" },
    button("Sigmoid best case (0.25)", () => { factor = 0.25; sf.set(factor); update(); }),
    button("ReLU (1.0)", () => { factor = 1; sf.set(factor); update(); }));
  body.append(cv.box, st.el, sf.el, sd.el, presets);

  cv.onDraw((ctx, w, hh, p) => {
    const m = plot(w, hh, [0, 30], [-12, 4]);
    m.axes(ctx, p, { xlabel: "layer", ylabel: "log10(gradient fraction)", ticks: 4 });
    ctx.strokeStyle = p.accent; ctx.lineWidth = 3; ctx.beginPath();
    for (let l = 0; l <= depth; l++) {
      const v = Math.log10(Math.max(1e-12, factor ** l));
      const px = m.X(l), py = m.Y(v);
      l === 0 ? ctx.moveTo(px, py) : ctx.lineTo(px, py);
    }
    ctx.stroke();
    for (let l = 0; l <= depth; l++) dot(ctx, m.X(l), m.Y(Math.log10(Math.max(1e-12, factor ** l))), 3.5, p.ink);
    label(ctx, "factor = 1 (unchanged)", m.X(18), m.Y(0) - 8, p.muted, { align: "left", size: 11 });
  });

  function update() {
    const g = factor ** depth;
    st.set("g", g < 1e-10 ? g.toExponential(2) : g.toFixed(6));
    say(`after ${depth} layers, the gradient is ${g < 1e-10 ? g.toExponential(2) : g.toFixed(4)} of its starting size`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
