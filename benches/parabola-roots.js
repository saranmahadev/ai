// Bench: a parabola, its vertex and roots from a, b and c.
import { curve, clip, dot } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, canvas, stats, plot, fmt, live } = kit;
  const body = frame(root, { title: "Parabola, vertex and roots" });
  const say = live(body);
  let a = 1, b = -5, c = 6;
  const sa = slider({ label: "a", min: -3, max: 3, step: 0.1, value: a, format: (v) => fmt(v, 1), onInput: (v) => { a = v; update(); } });
  const sb = slider({ label: "b", min: -8, max: 8, step: 0.5, value: b, format: (v) => fmt(v, 1), onInput: (v) => { b = v; update(); } });
  const sc = slider({ label: "c", min: -8, max: 8, step: 0.5, value: c, format: (v) => fmt(v, 1), onInput: (v) => { c = v; update(); } });
  const cv = canvas(body, { aspect: 0.68, label: "Parabola with vertex and roots marked" });
  const st = stats([["d", "discriminant b² − 4ac"], ["r", "roots"], ["v", "vertex"]]);
  body.append(cv.box, st.el, h("div", { class: "bench-controls" }, sa.el, sb.el, sc.el));
  const D = () => b * b - 4 * a * c;
  cv.onDraw((ctx, w, hh, p) => {
    const m = plot(w, hh, [-6, 6], [-10, 10]); m.axes(ctx, p, { xlabel: "x", ylabel: "f(x)", ticks: 6 });
    curve(ctx, m, (x) => a * x * x + b * x + c, -6, 6, { color: p.accent, width: 4, clip: clip(m), steps: 300 });
    if (Math.abs(a) > 1e-6) {
      const vx = -b / (2 * a), vy = a * vx * vx + b * vx + c; ctx.save(); ctx.beginPath(); const cl = clip(m); ctx.rect(cl.x, cl.y, cl.w, cl.h); ctx.clip();
      dot(ctx, m.X(vx), m.Y(vy), 6, p.warm);
      if (D() >= 0) for (const s of [1, -1]) dot(ctx, m.X((-b + s * Math.sqrt(D())) / (2 * a)), m.Y(0), 6, p.good);
      ctx.restore();
    }
  });
  function update() {
    st.set("d", fmt(D(), 2));
    if (Math.abs(a) < 1e-6) { st.set("r", b ? fmt(-c / b, 2) + " (a line)" : "none"); st.set("v", "no vertex (a = 0)"); }
    else { const vx = -b / (2 * a); st.set("r", D() < 0 ? "none (never reaches 0)" : D() === 0 ? fmt(vx, 2) : `${fmt((-b - Math.sqrt(D())) / (2 * a), 2)} and ${fmt((-b + Math.sqrt(D())) / (2 * a), 2)}`); st.set("v", `(${fmt(vx, 2)}, ${fmt(a * vx * vx + b * vx + c, 2)})`); }
    say(`Discriminant ${fmt(D(), 1)}`); cv.redraw();
  }
  update();
  return () => cv.destroy();
}
