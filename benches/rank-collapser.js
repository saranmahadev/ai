// Bench: rank is how many directions a matrix keeps.
import { view, warp, arrow, matrixControls, PRESETS } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, canvas, stats, fmt, live } = kit;
  const body = frame(root, { title: "How flat does the matrix squash space?" });
  const say = live(body);
  const M = [1, 2, 0.5, 1];
  const cv = canvas(body, { aspect: 0.72, label: "The grid transformed by a matrix, collapsing to a line when the rank drops" });
  const st = stats([["rank", "rank"], ["img", "image (all outputs)"], ["null", "sent to zero"]]);
  const ctl = matrixControls(kit, M, update, [["Identity", [1, 0, 0, 1]], ["Rank 1", [1, 2, 0.5, 1]], ["Rank 1 (another)", [1, 1, 2, 2]], ["Zero", [0, 0, 0, 0]], ...PRESETS.slice(1, 3)]);
  body.append(cv.box, st.el, ctl.el, ctl.row);
  const rank = () => { if (Math.abs(M[0] * M[3] - M[1] * M[2]) > 1e-9) return 2; return M.some((x) => Math.abs(x) > 1e-9) ? 1 : 0; };
  cv.onDraw((ctx, w, hh, p) => { const V = view(w, hh, { scale: Math.min(w, hh) / 12 }); warp(ctx, V, M, p, { square: rank() === 2, columns: true }); if (rank() === 1) { const d = Math.abs(M[0]) + Math.abs(M[2]) > 1e-9 ? [M[0], M[2]] : [M[1], M[3]]; ctx.strokeStyle = p.accent; ctx.globalAlpha = 0.5; ctx.lineWidth = 10; ctx.beginPath(); ctx.moveTo(V.X(-30 * d[0]), V.Y(-30 * d[1])); ctx.lineTo(V.X(30 * d[0]), V.Y(30 * d[1])); ctx.stroke(); ctx.globalAlpha = 1; const n = Math.abs(M[0]) > 1e-9 || Math.abs(M[1]) > 1e-9 ? [-M[1], M[0]] : [-M[3], M[2]]; arrow(ctx, V.X(0), V.Y(0), V.X(n[0]), V.Y(n[1]), p.ink, 3); } });
  function update() {
    const r = rank(); st.set("rank", String(r)); st.set("img", r === 2 ? "the whole plane" : r === 1 ? "a line (span of the columns)" : "just the origin");
    let z = "only the zero vector"; if (r === 1) { const row = Math.abs(M[0]) > 1e-9 || Math.abs(M[1]) > 1e-9 ? [M[0], M[1]] : [M[2], M[3]]; z = `multiples of (${fmt(-row[1], 2)}, ${fmt(row[0], 2)})`; } else if (r === 0) z = "everything";
    st.set("null", z); say(`Rank ${r}`); cv.redraw();
  }
  update();
  return () => cv.destroy();
}
