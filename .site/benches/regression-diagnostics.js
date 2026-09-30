// Bench: a least-squares line through draggable points, with residuals and R².
export default function mount(root, kit) {
  const { h, frame, button, canvas, stats, plot, dragHandles, live, fmt } = kit;
  const body = frame(root, { title: "Fit a line, read the residuals" });
  const say = live(body);
  const init = () => [[0.6, 1.3], [1.2, 1.9], [1.8, 2.6], [2.4, 2.9], [3.0, 3.8], [3.6, 4.1], [4.2, 5.0], [4.8, 5.3], [5.4, 6.3], [6.0, 6.6]].map(([x, y]) => ({ x, y }));
  let pts = init(), m;
  const cv = canvas(body, { aspect: 0.6, label: "Draggable points with the least-squares line and residual bars" });
  const st = stats([["s", "slope"], ["i", "intercept"], ["r", "RMSE"], ["q", "R²"]]);
  body.append(cv.box, st.el, h("div", { class: "bench-row" }, button("Add an outlier", () => { pts.push({ x: 5.6, y: 1.2 }); update(); }), button("Reset", () => { pts = init(); update(); })));
  const fit = () => { const n = pts.length, mx = pts.reduce((s, p) => s + p.x, 0) / n, my = pts.reduce((s, p) => s + p.y, 0) / n; let sxy = 0, sxx = 0; for (const p of pts) { sxy += (p.x - mx) * (p.y - my); sxx += (p.x - mx) ** 2; } const s = sxx ? sxy / sxx : 0, b = my - s * mx; const sse = pts.reduce((a, p) => a + (s * p.x + b - p.y) ** 2, 0), sst = pts.reduce((a, p) => a + (p.y - my) ** 2, 0); return { s, b, rmse: Math.sqrt(sse / n), r2: sst ? 1 - sse / sst : 0 }; };
  cv.onDraw((ctx, w, hh, p) => { m = plot(w, hh, [0, 7], [0, 8]); m.axes(ctx, p, { xlabel: "x", ylabel: "y" }); const f = fit();
    ctx.strokeStyle = p.warm; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(m.X(0), m.Y(f.b)); ctx.lineTo(m.X(7), m.Y(7 * f.s + f.b)); ctx.stroke();
    for (const q of pts) { ctx.strokeStyle = p.muted; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(m.X(q.x), m.Y(q.y)); ctx.lineTo(m.X(q.x), m.Y(f.s * q.x + f.b)); ctx.stroke(); ctx.fillStyle = p.accent; ctx.beginPath(); ctx.arc(m.X(q.x), m.Y(q.y), 6, 0, 7); ctx.fill(); } });
  dragHandles(cv.cv, () => (m ? pts.map((q) => ({ x: m.X(q.x), y: m.Y(q.y) })) : []), (i, px, py) => { pts[i] = { x: Math.max(0, Math.min(7, m.x(px))), y: Math.max(0, Math.min(8, m.y(py))) }; update(); });
  function update() { const f = fit(); st.set("s", fmt(f.s, 2)); st.set("i", fmt(f.b, 2)); st.set("r", fmt(f.rmse, 2)); st.set("q", fmt(f.r2, 2)); say(`Slope ${fmt(f.s, 2)}, R squared ${fmt(f.r2, 2)}`); cv.redraw(); }
  update(); return () => cv.destroy();
}
