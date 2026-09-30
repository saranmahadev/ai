// Bench: a 2x2 matrix warps the grid; its columns are where the basis arrows land.
import { view, warp, PRESETS, matrixControls } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, canvas, stats, fmt, live } = kit;
  const body = frame(root, { title: "Warp the grid with a matrix" });
  const say = live(body);
  const M = [1, 1, 0, 1];
  const cv = canvas(body, { aspect: 0.72, label: "A grid warped by a 2 by 2 matrix with its two column vectors" });
  const st = stats([["c1", "column 1: where (1, 0) lands"], ["c2", "column 2: where (0, 1) lands"], ["t", "(2, 1) goes to"]]);
  const ctl = matrixControls(kit, M, update, [...PRESETS.slice(0, 2), ["Rotate 45°", [0.7071, -0.7071, 0.7071, 0.7071]], ...PRESETS.slice(3)]);
  body.append(cv.box, st.el, ctl.el, ctl.row);
  cv.onDraw((ctx, w, hh, p) => { const V = view(w, hh, { scale: Math.min(w, hh) / 12 }); ctx.save(); warp(ctx, V, [1, 0, 0, 1], p, { square: false, columns: false, faint: true }); ctx.restore(); warp(ctx, V, M, p); });
  function update() { st.set("c1", `(${fmt(M[0], 2)}, ${fmt(M[2], 2)})`); st.set("c2", `(${fmt(M[1], 2)}, ${fmt(M[3], 2)})`); st.set("t", `(${fmt(M[0] * 2 + M[1], 2)}, ${fmt(M[2] * 2 + M[3], 2)})`); say("Matrix updated"); cv.redraw(); }
  update();
  return () => cv.destroy();
}
