// Bench: the determinant is the signed area of the transformed unit square.
import { view, warp, matrixControls, PRESETS } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, canvas, stats, fmt, live } = kit;
  const body = frame(root, { title: "How much does the area change?" });
  const say = live(body);
  const M = [2, 0, 0, 1.5];
  const cv = canvas(body, { aspect: 0.72, label: "The unit square and its image under a matrix" });
  const st = stats([["det", "determinant  a·d − b·c"], ["area", "area of the new shape"], ["or", "orientation"]]);
  const ctl = matrixControls(kit, M, update, PRESETS);
  body.append(cv.box, st.el, ctl.el, ctl.row);
  cv.onDraw((ctx, w, hh, p) => { const V = view(w, hh, { scale: Math.min(w, hh) / 12 }); warp(ctx, V, M, p, { columns: true }); ctx.strokeStyle = p.muted; ctx.setLineDash([4, 4]); ctx.strokeRect(V.X(0), V.Y(1), V.scale, V.scale); ctx.setLineDash([]); });
  function update() { const d = M[0] * M[3] - M[1] * M[2]; st.set("det", fmt(d, 3)); st.set("area", `${fmt(Math.abs(d), 3)}  (the dashed unit square has area 1)`); st.set("or", Math.abs(d) < 1e-9 ? "collapsed onto a line" : d > 0 ? "kept" : "flipped (mirror image)"); say(`Determinant ${fmt(d, 2)}`); cv.redraw(); }
  update();
  return () => cv.destroy();
}
