// Bench: find the directions that a matrix only stretches.
import { view, grid, arrow, apply2, matrixControls } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, canvas, slider, stats, fmt, live } = kit;
  const body = frame(root, { title: "Find the directions that only stretch" });
  const say = live(body);
  const M = [2, 1, 1, 2]; let deg = 20;
  const cv = canvas(body, { aspect: 0.72, label: "A test arrow and its image under a matrix, with eigenvector directions dashed" });
  const st = stats([["ev", "eigenvalues"], ["ang", "angle between the arrow and its image"], ["ratio", "image length ÷ arrow length"]]);
  const ctl = matrixControls(kit, M, update, [["Symmetric", [2, 1, 1, 2]], ["Diagonal", [3, 0, 0, 1]], ["Rotate 90° (none real)", [0, -1, 1, 0]], ["Shear", [1, 1, 0, 1]]]);
  const sd = slider({ label: "test arrow angle", min: 0, max: 180, step: 1, value: deg, format: (v) => v + "°", onInput: (v) => { deg = v; update(); } });
  body.append(cv.box, st.el, ctl.el, ctl.row, h("div", { class: "bench-controls" }, sd.el));
  const eig = () => { const [a, b, c, d] = M, t = a + d, D = a * d - b * c, disc = t * t - 4 * D; if (disc < -1e-9) return []; const s = Math.sqrt(Math.max(0, disc)); return [...new Set([(t + s) / 2, (t - s) / 2].map((x) => Math.round(x * 1e6) / 1e6))].map((l) => { let v; if (Math.abs(b) > 1e-9) v = [b, l - a]; else if (Math.abs(c) > 1e-9) v = [l - d, c]; else v = Math.abs(l - a) < 1e-9 ? [1, 0] : [0, 1]; return { l, v }; }); };
  cv.onDraw((ctx, w, hh, p) => {
    const V = view(w, hh, { scale: Math.min(w, hh) / 14 }); grid(ctx, V, w, hh, p, { labels: false });
    for (const { v } of eig()) { ctx.strokeStyle = p.good; ctx.globalAlpha = 0.6; ctx.lineWidth = 2; ctx.setLineDash([6, 5]); ctx.beginPath(); ctx.moveTo(V.X(-30 * v[0]), V.Y(-30 * v[1])); ctx.lineTo(V.X(30 * v[0]), V.Y(30 * v[1])); ctx.stroke(); ctx.setLineDash([]); ctx.globalAlpha = 1; }
    const r = (deg * Math.PI) / 180, u = [3 * Math.cos(r), 3 * Math.sin(r)], q = apply2(M, ...u);
    arrow(ctx, V.X(0), V.Y(0), V.X(u[0]), V.Y(u[1]), p.muted, 4); arrow(ctx, V.X(0), V.Y(0), V.X(q[0]), V.Y(q[1]), p.accent, 4);
  });
  function update() {
    const e = eig(), r = (deg * Math.PI) / 180, u = [Math.cos(r), Math.sin(r)], q = apply2(M, ...u), lq = Math.hypot(...q);
    st.set("ev", e.length ? e.map((x) => fmt(x.l, 3)).join("  and  ") : "none real (every direction turns)");
    st.set("ang", lq ? fmt((Math.acos(Math.max(-1, Math.min(1, (u[0] * q[0] + u[1] * q[1]) / lq))) * 180) / Math.PI, 1) + "°" : "the image is zero"); st.set("ratio", fmt(lq, 3));
    say(`Eigenvalues: ${e.map((x) => fmt(x.l, 2)).join(", ") || "none real"}`); cv.redraw();
  }
  update();
  return () => cv.destroy();
}
