// Bench: add, subtract and scale arrows.
import { view, grid, arrow, dot, label } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, canvas, slider, toggles, stats, dragHandles, fmt, live } = kit;
  const body = frame(root, { title: "Add, subtract and scale arrows" });
  const say = live(body);
  const a = [2, 1], b = [1, 3]; let c = 1, show = { sum: true, diff: false, scale: false };
  const cv = canvas(body, { aspect: 0.72, label: "Two draggable arrows a and b with their sum, difference or a scaled copy" });
  const st = stats([["s", "a + b"], ["d", "b − a"], ["k", "c · a"]]);
  const mk = (name, arr, i) => slider({ label: `${name} ${i ? "y" : "x"}`, min: -6, max: 6, step: 0.5, value: arr[i], format: (n) => fmt(n, 1), onInput: (n) => { arr[i] = n; update(); } });
  const sl = [mk("a", a, 0), mk("a", a, 1), mk("b", b, 0), mk("b", b, 1)];
  const sc = slider({ label: "scale c for a", min: -3, max: 3, step: 0.5, value: c, format: (n) => fmt(n, 1), onInput: (n) => { c = n; update(); } });
  const tg = toggles([["sum", "show a + b", true], ["diff", "show b − a", false], ["scale", "show c · a", false]], (v) => { show = v; update(); });
  body.append(cv.box, st.el, h("div", { class: "bench-controls" }, sl.map((s) => s.el), sc.el), tg.el);
  let V = view(300, 200);
  cv.onDraw((ctx, w, hh, p) => {
    V = view(w, hh, { scale: Math.min(w, hh) / 16 }); grid(ctx, V, w, hh, p);
    const O = [V.X(0), V.Y(0)];
    arrow(ctx, ...O, V.X(a[0]), V.Y(a[1]), p.accent, 4); arrow(ctx, ...O, V.X(b[0]), V.Y(b[1]), p.warm, 4);
    label(ctx, "a", V.X(a[0]) + 8, V.Y(a[1]) - 8, p.accent); label(ctx, "b", V.X(b[0]) + 8, V.Y(b[1]) - 8, p.warm);
    if (show.sum) { ctx.setLineDash([4, 4]); ctx.strokeStyle = p.muted; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(V.X(a[0]), V.Y(a[1])); ctx.lineTo(V.X(a[0] + b[0]), V.Y(a[1] + b[1])); ctx.lineTo(V.X(b[0]), V.Y(b[1])); ctx.stroke(); ctx.setLineDash([]); arrow(ctx, ...O, V.X(a[0] + b[0]), V.Y(a[1] + b[1]), p.good, 4); }
    if (show.diff) arrow(ctx, V.X(a[0]), V.Y(a[1]), V.X(b[0]), V.Y(b[1]), p.ink, 3);
    if (show.scale) arrow(ctx, ...O, V.X(c * a[0]), V.Y(c * a[1]), p.muted, 3);
    dot(ctx, V.X(a[0]), V.Y(a[1]), 7, p.accent); dot(ctx, V.X(b[0]), V.Y(b[1]), 7, p.warm);
  });
  dragHandles(cv.cv, () => [a, b].map((q) => ({ x: V.X(q[0]), y: V.Y(q[1]) })), (i, px, py) => { const q = i ? b : a; q[0] = Math.max(-6, Math.min(6, Math.round(V.x(px) * 2) / 2)); q[1] = Math.max(-6, Math.min(6, Math.round(V.y(py) * 2) / 2)); sl[i * 2].set(q[0], true); sl[i * 2 + 1].set(q[1], true); update(); });
  function update() { st.set("s", `(${fmt(a[0] + b[0], 1)}, ${fmt(a[1] + b[1], 1)})`); st.set("d", `(${fmt(b[0] - a[0], 1)}, ${fmt(b[1] - a[1], 1)})`); st.set("k", `(${fmt(c * a[0], 1)}, ${fmt(c * a[1], 1)})`); say("Vectors updated"); cv.redraw(); }
  update();
  return () => cv.destroy();
}
