// Bench: apply a matrix and its inverse to a shape.
import { view, grid, apply2, matrixControls } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, canvas, stats, toggles, fmt, live } = kit;
  const body = frame(root, { title: "Undo a transformation" });
  const say = live(body);
  const M = [2, 1, 1, 1]; let undo = false;
  const F = [[0, 0], [0, 2], [1.2, 2], [1.2, 1.7], [0.4, 1.7], [0.4, 1.2], [0.9, 1.2], [0.9, 0.9], [0.4, 0.9], [0.4, 0]];
  const cv = canvas(body, { aspect: 0.72, label: "A letter shape, transformed by a matrix and optionally brought back by the inverse" });
  const st = stats([["det", "determinant"], ["inv", "inverse matrix"]]);
  const ctl = matrixControls(kit, M, update, [["Identity", [1, 0, 0, 1]], ["Shear", [1, 1, 0, 1]], ["Rotate 90°", [0, -1, 1, 0]], ["Flatten (no inverse)", [1, 2, 0.5, 1]]]);
  const tg = toggles([["undo", "apply the inverse afterwards", false]], (v) => { undo = v.undo; update(); });
  body.append(cv.box, st.el, ctl.el, ctl.row, tg.el);
  const det = () => M[0] * M[3] - M[1] * M[2];
  const inv = () => { const d = det(); return Math.abs(d) < 1e-9 ? null : [M[3] / d, -M[1] / d, -M[2] / d, M[0] / d]; };
  const poly = (ctx, V, pts, fill, stroke, dash) => { ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(V.X(x), V.Y(y)) : ctx.moveTo(V.X(x), V.Y(y)))); ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.globalAlpha = 0.35; ctx.fill(); ctx.globalAlpha = 1; } ctx.strokeStyle = stroke; ctx.lineWidth = 2.5; if (dash) ctx.setLineDash(dash); ctx.stroke(); ctx.setLineDash([]); };
  cv.onDraw((ctx, w, hh, p) => {
    const V = view(w, hh, { scale: Math.min(w, hh) / 12 }); grid(ctx, V, w, hh, p, { labels: false });
    poly(ctx, V, F, null, p.muted, [5, 4]);
    const T = F.map(([x, y]) => apply2(M, x, y)); poly(ctx, V, T, p.accent, p.accent);
    const I = inv(); if (undo && I) poly(ctx, V, T.map(([x, y]) => apply2(I, x, y)), p.good, p.good);
  });
  function update() { const I = inv(); st.set("det", fmt(det(), 3)); st.set("inv", I ? `[ ${fmt(I[0], 3)} ${fmt(I[1], 3)} ; ${fmt(I[2], 3)} ${fmt(I[3], 3)} ]` : "none: the determinant is 0, so the shape was flattened and cannot be recovered"); say(I ? "Invertible" : "No inverse"); cv.redraw(); }
  update();
  return () => cv.destroy();
}
