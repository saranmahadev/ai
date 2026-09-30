// Bench: smooth, hole, jump or corner at x = 1.
import { curve, clip, dot } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, choice, canvas, stats, plot, fmt, live } = kit;
  const body = frame(root, { title: "Smooth, hole, jump or corner?" });
  const say = live(body);
  const F = {
    smooth: { name: "smooth: x²", f: (x) => x * x, L: 1, R: 1, V: 1, y: [-1, 5] },
    hole: { name: "hole: (x² − 1)/(x − 1)", f: (x) => (Math.abs(x - 1) < 1e-12 ? NaN : (x * x - 1) / (x - 1)), L: 2, R: 2, V: NaN, y: [-1, 5] },
    jump: { name: "jump: step at 1", f: (x) => (x < 1 ? 1 : 3), L: 1, R: 3, V: 3, y: [-1, 5] },
    corner: { name: "corner: |x − 1| + 1", f: (x) => Math.abs(x - 1) + 1, L: 1, R: 1, V: 1, y: [-1, 5] }
  };
  let key = "smooth", x = 0.5;
  const sx = slider({ label: "x (special point is 1)", min: -1, max: 3, step: 0.05, value: x, format: (v) => fmt(v, 2), onInput: (v) => { x = v; update(); } });
  const ch = choice("Function", Object.entries(F).map(([k, v]) => [k, v.name]), key, (k) => { key = k; update(); });
  const cv = canvas(body, { aspect: 0.55, label: "A function with a special point at x = 1" });
  const st = stats([["l", "left-hand limit at 1"], ["r", "right-hand limit at 1"], ["v", "value at 1"], ["c", "continuous?"], ["d", "has a slope at 1?"]]);
  body.append(cv.box, st.el, ch.el, h("div", { class: "bench-controls" }, sx.el));
  cv.onDraw((ctx, w, hh, p) => {
    const { f, y, V } = F[key], m = plot(w, hh, [-1, 3], y); m.axes(ctx, p, { xlabel: "x", ylabel: "f(x)" });
    curve(ctx, m, f, -1, 3, { color: p.accent, width: 3.5, clip: clip(m), steps: 800 });
    ctx.strokeStyle = p.accent; ctx.lineWidth = 3; const F1 = F[key];
    ctx.fillStyle = p.white; ctx.beginPath(); ctx.arc(m.X(1), m.Y(F1.R), 5, 0, 7); ctx.fill(); ctx.stroke();
    if (Number.isFinite(V)) dot(ctx, m.X(1), m.Y(V), 5, p.accent);
    const fy = f(x); if (Number.isFinite(fy)) dot(ctx, m.X(x), m.Y(fy), 6, p.warm);
  });
  function update() { const F1 = F[key], cont = F1.L === F1.R && F1.R === F1.V, smooth = cont && key !== "corner"; st.set("l", fmt(F1.L, 2)); st.set("r", fmt(F1.R, 2)); st.set("v", Number.isFinite(F1.V) ? fmt(F1.V, 2) : "undefined"); st.set("c", cont ? "yes" : F1.L !== F1.R ? "no: the sides disagree (a jump)" : "no: the value is missing (a hole)"); st.set("d", smooth ? "yes" : key === "corner" ? "no: a sharp corner" : "no"); say(cont ? "Continuous at 1" : "Not continuous at 1"); cv.redraw(); }
  update();
  return () => cv.destroy();
}
