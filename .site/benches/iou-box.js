// Bench: two draggable boxes with the overlap region and computed Intersection over Union.
export default function mount(root, kit) {
  const { frame, canvas, plot, slider, stats, live } = kit;
  const body = frame(root, { title: "How well do two boxes overlap?" });
  const say = live(body);
  let A = [1, 1, 5, 4], B = [3, 2, 7, 5];

  const cv = canvas(body, { aspect: 0.6, label: "Two boxes, with their overlap region shaded" });
  const st = stats([["inter", "overlap area"], ["union", "union area"], ["iou", "IoU"]]);
  const mk = (box, idx, label) => slider({ label, min: 0, max: 10, step: 0.5, value: box[idx], format: (v) => v.toFixed(1), onInput: (v) => { box[idx] = v; update(); } });
  const sliders = [mk(A, 0, "A x1"), mk(A, 1, "A y1"), mk(A, 2, "A x2"), mk(A, 3, "A y2"), mk(B, 0, "B x1"), mk(B, 1, "B y1"), mk(B, 2, "B x2"), mk(B, 3, "B y2")];
  body.append(cv.box, st.el, ...sliders.map((s) => s.el));

  function compute() {
    const xl = Math.max(A[0], B[0]), yt = Math.max(A[1], B[1]), xr = Math.min(A[2], B[2]), yb = Math.min(A[3], B[3]);
    const iw = Math.max(0, xr - xl), ih = Math.max(0, yb - yt), inter = iw * ih;
    const areaA = Math.max(0, A[2] - A[0]) * Math.max(0, A[3] - A[1]);
    const areaB = Math.max(0, B[2] - B[0]) * Math.max(0, B[3] - B[1]);
    const union = areaA + areaB - inter;
    return { xl, yt, xr, yb, inter, union, iou: union > 0 ? inter / union : 0 };
  }

  cv.onDraw((ctx, w, hh, p) => {
    const m = plot(w, hh, [0, 10], [0, 10]);
    m.axes(ctx, p, { xlabel: "x", ylabel: "y", ticks: 5 });
    const rect = (box, color) => { ctx.strokeStyle = color; ctx.lineWidth = 3; ctx.strokeRect(m.X(box[0]), m.Y(box[3]), m.X(box[2]) - m.X(box[0]), m.Y(box[1]) - m.Y(box[3])); };
    rect(A, p.accent); rect(B, p.warm);
    const r = compute();
    if (r.inter > 0) { ctx.fillStyle = p.good; ctx.globalAlpha = 0.35; ctx.fillRect(m.X(r.xl), m.Y(r.yb), m.X(r.xr) - m.X(r.xl), m.Y(r.yt) - m.Y(r.yb)); ctx.globalAlpha = 1; }
  });

  function update() {
    const r = compute();
    st.set("inter", r.inter.toFixed(2));
    st.set("union", r.union.toFixed(2));
    st.set("iou", r.iou.toFixed(3));
    say(`IoU ${r.iou.toFixed(2)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
