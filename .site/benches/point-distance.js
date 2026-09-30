// Bench: drag two points and read three kinds of distance.
import { view, grid, arrow, dot, label } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, canvas, stats, dragHandles, slider, fmt, live } = kit;
  const body = frame(root, { title: "Measure the distance between two points" });
  const say = live(body);
  const P = [{ x: 1, y: 2 }, { x: 4, y: 6 }];
  const cv = canvas(body, { aspect: 0.72, label: "A grid with two draggable points and the gaps between them" });
  const st = stats([["gap", "gaps (Δx, Δy)"], ["e", "Euclidean"], ["m", "Manhattan"], ["c", "Chebyshev"], ["mid", "midpoint"]]);
  const mk = (i, ax) => slider({ label: `${i ? "B" : "A"} ${ax}`, min: -6, max: 6, step: 0.5, value: P[i][ax], format: (v) => fmt(v, 1), onInput: (v) => { P[i][ax] = v; sync(); update(); } });
  const ctl = [mk(0, "x"), mk(0, "y"), mk(1, "x"), mk(1, "y")];
  body.append(cv.box, st.el, h("div", { class: "bench-controls" }, ctl.map((c) => c.el)));
  let V = view(300, 200, { scale: 30 });
  const sync = () => { ctl[0].set(P[0].x, true); ctl[1].set(P[0].y, true); ctl[2].set(P[1].x, true); ctl[3].set(P[1].y, true); };
  cv.onDraw((ctx, w, hh, p) => {
    V = view(w, hh, { scale: Math.min(w, hh) / 15 }); grid(ctx, V, w, hh, p, { step: 1 });
    const [A, B] = P;
    ctx.strokeStyle = p.muted; ctx.setLineDash([5, 4]); ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(V.X(A.x), V.Y(A.y)); ctx.lineTo(V.X(B.x), V.Y(A.y)); ctx.lineTo(V.X(B.x), V.Y(B.y)); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = p.accent; ctx.lineWidth = 4; ctx.beginPath(); ctx.moveTo(V.X(A.x), V.Y(A.y)); ctx.lineTo(V.X(B.x), V.Y(B.y)); ctx.stroke();
    dot(ctx, V.X((A.x + B.x) / 2), V.Y((A.y + B.y) / 2), 5, p.good);
    dot(ctx, V.X(A.x), V.Y(A.y), 9, p.warm); dot(ctx, V.X(B.x), V.Y(B.y), 9, p.ink);
    label(ctx, "A", V.X(A.x) + 12, V.Y(A.y) - 10, p.warm); label(ctx, "B", V.X(B.x) + 12, V.Y(B.y) - 10, p.ink);
  });
  dragHandles(cv.cv, () => P.map((q) => ({ x: V.X(q.x), y: V.Y(q.y) })), (i, px, py) => { P[i].x = Math.max(-7, Math.min(7, Math.round(V.x(px) * 2) / 2)); P[i].y = Math.max(-5, Math.min(5, Math.round(V.y(py) * 2) / 2)); sync(); update(); });
  function update() {
    const dx = P[1].x - P[0].x, dy = P[1].y - P[0].y;
    st.set("gap", `${fmt(dx, 1)}, ${fmt(dy, 1)}`); st.set("e", fmt(Math.hypot(dx, dy), 3)); st.set("m", fmt(Math.abs(dx) + Math.abs(dy), 2)); st.set("c", fmt(Math.max(Math.abs(dx), Math.abs(dy)), 2)); st.set("mid", `(${fmt((P[0].x + P[1].x) / 2, 2)}, ${fmt((P[0].y + P[1].y) / 2, 2)})`);
    say(`Euclidean distance ${fmt(Math.hypot(dx, dy), 2)}`); cv.redraw();
  }
  update();
  return () => cv.destroy();
}
