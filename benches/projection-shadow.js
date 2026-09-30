// Bench: project a onto the line through b; the residual is perpendicular.
import { view, grid, arrow, dot, label } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, canvas, slider, stats, dragHandles, fmt, live } = kit;
  const body = frame(root, { title: "Project one vector onto another" });
  const say = live(body);
  const a = [3, 4], b = [4, 1];
  const cv = canvas(body, { aspect: 0.72, label: "Vector a, vector b, the projection of a onto b and the residual" });
  const st = stats([["dot", "a · b"], ["k", "(a · b) / (b · b)"], ["proj", "projection"], ["res", "residual"], ["chk", "residual · b"]]);
  const mk = (n, arr, i) => slider({ label: `${n} ${i ? "y" : "x"}`, min: -6, max: 6, step: 0.5, value: arr[i], format: (x) => fmt(x, 1), onInput: (x) => { arr[i] = x; update(); } });
  const sl = [mk("a", a, 0), mk("a", a, 1), mk("b", b, 0), mk("b", b, 1)];
  body.append(cv.box, st.el, h("div", { class: "bench-controls" }, sl.map((s) => s.el)));
  let V = view(300, 200);
  const proj = () => { const bb = b[0] * b[0] + b[1] * b[1], k = bb ? (a[0] * b[0] + a[1] * b[1]) / bb : 0; return { k, p: [k * b[0], k * b[1]] }; };
  cv.onDraw((ctx, w, hh, p) => {
    V = view(w, hh, { scale: Math.min(w, hh) / 14 }); grid(ctx, V, w, hh, p);
    const { p: q } = proj(), O = [V.X(0), V.Y(0)];
    ctx.strokeStyle = p.muted; ctx.globalAlpha = 0.5; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(V.X(-30 * b[0]), V.Y(-30 * b[1])); ctx.lineTo(V.X(30 * b[0]), V.Y(30 * b[1])); ctx.stroke(); ctx.globalAlpha = 1;
    ctx.setLineDash([5, 4]); ctx.strokeStyle = p.ink; ctx.beginPath(); ctx.moveTo(V.X(q[0]), V.Y(q[1])); ctx.lineTo(V.X(a[0]), V.Y(a[1])); ctx.stroke(); ctx.setLineDash([]);
    arrow(ctx, ...O, V.X(b[0]), V.Y(b[1]), p.warm, 4); arrow(ctx, ...O, V.X(a[0]), V.Y(a[1]), p.accent, 4); arrow(ctx, ...O, V.X(q[0]), V.Y(q[1]), p.good, 5);
    label(ctx, "a", V.X(a[0]) + 8, V.Y(a[1]) - 8, p.accent); label(ctx, "b", V.X(b[0]) + 8, V.Y(b[1]) - 8, p.warm); label(ctx, "projection", V.X(q[0]) + 8, V.Y(q[1]) + 16, p.good);
    dot(ctx, V.X(a[0]), V.Y(a[1]), 7, p.accent); dot(ctx, V.X(b[0]), V.Y(b[1]), 7, p.warm);
  });
  dragHandles(cv.cv, () => [a, b].map((q) => ({ x: V.X(q[0]), y: V.Y(q[1]) })), (i, px, py) => { const q = i ? b : a; q[0] = Math.max(-6, Math.min(6, Math.round(V.x(px) * 2) / 2)); q[1] = Math.max(-6, Math.min(6, Math.round(V.y(py) * 2) / 2)); sl[i * 2].set(q[0], true); sl[i * 2 + 1].set(q[1], true); update(); });
  function update() { const { k, p } = proj(), r = [a[0] - p[0], a[1] - p[1]]; st.set("dot", fmt(a[0] * b[0] + a[1] * b[1], 3)); st.set("k", fmt(k, 3)); st.set("proj", `(${fmt(p[0], 2)}, ${fmt(p[1], 2)})`); st.set("res", `(${fmt(r[0], 2)}, ${fmt(r[1], 2)})`); st.set("chk", fmt(r[0] * b[0] + r[1] * b[1], 4)); say(`Projection ${fmt(p[0], 2)}, ${fmt(p[1], 2)}`); cv.redraw(); }
  update();
  return () => cv.destroy();
}
