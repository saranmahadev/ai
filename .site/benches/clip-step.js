// Bench: clip-by-norm on a 2D gradient arrow, with a draggable gradient and a clip-threshold slider.
import { arrow, label, dot } from "./mathkit.js";

export default function mount(root, kit) {
  const { frame, canvas, plot, slider, stats, live, dragHandles } = kit;
  const body = frame(root, { title: "Clipping an oversized gradient" });
  const say = live(body);
  let g = [3, 9], thr = 4;

  const cv = canvas(body, { aspect: 0.75, label: "The raw gradient arrow and the clipped step actually taken" });
  const st = stats([["norm", "raw gradient length"], ["clipped", "clipped length"]]);
  const sx = slider({ label: "gradient x", min: -10, max: 10, step: 0.1, value: g[0], format: (v) => v.toFixed(1), onInput: (v) => { g[0] = v; update(); } });
  const sy = slider({ label: "gradient y", min: -10, max: 10, step: 0.1, value: g[1], format: (v) => v.toFixed(1), onInput: (v) => { g[1] = v; update(); } });
  const st2 = slider({ label: "clip threshold", min: 0.5, max: 10, step: 0.1, value: thr, format: (v) => v.toFixed(1), onInput: (v) => { thr = v; update(); } });
  body.append(cv.box, st.el, sx.el, sy.el, st2.el);

  cv.onDraw((ctx, w, hh, p) => {
    const m = plot(w, hh, [-10, 10], [-10, 10]);
    m.axes(ctx, p, { xlabel: "x", ylabel: "y", ticks: 4 });
    const norm = Math.hypot(g[0], g[1]);
    const scale = Math.min(1, thr / Math.max(1e-9, norm));
    const cgx = g[0] * scale, cgy = g[1] * scale;
    arrow(ctx, m.X(0), m.Y(0), m.X(g[0]), m.Y(g[1]), p.muted, 2.5);
    if (scale < 1) arrow(ctx, m.X(0), m.Y(0), m.X(cgx), m.Y(cgy), p.accent, 4);
    dot(ctx, m.X(0), m.Y(0), 4, p.ink);
    label(ctx, "raw", m.X(g[0]) + 6, m.Y(g[1]), p.muted, { align: "left" });
    if (scale < 1) label(ctx, "clipped", m.X(cgx) + 6, m.Y(cgy) + 14, p.accent, { align: "left" });
  });

  function update() {
    const norm = Math.hypot(g[0], g[1]);
    const scale = Math.min(1, thr / Math.max(1e-9, norm));
    st.set("norm", norm.toFixed(3));
    st.set("clipped", (norm * scale).toFixed(3));
    say(scale < 1 ? `gradient clipped from ${norm.toFixed(2)} down to ${thr.toFixed(2)}` : `gradient of length ${norm.toFixed(2)} is under the threshold, unchanged`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
