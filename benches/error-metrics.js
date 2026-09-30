// Bench: MAE, RMSE and R² for a small set of predictions, with one error you can grow.
export default function mount(root, kit) {
  const { h, frame, slider, canvas, stats, plot, live, fmt } = kit;
  const body = frame(root, { title: "Measure regression errors" });
  const say = live(body);
  const actual = [3, 5, 7, 9, 11, 13, 15, 17], err0 = [-1, 1, 0, -1, 1, 0.5, -0.5, 1];
  let last = 1;
  const sl = slider({ label: "error on the last prediction", min: -12, max: 12, step: 0.5, value: last, format: (v) => fmt(v, 1), onInput: (v) => { last = v; update(); } });
  const cv = canvas(body, { aspect: 0.6, label: "Predicted against actual values with the identity line" });
  const st = stats([["m", "MAE"], ["r", "RMSE"], ["q", "R²"]]);
  body.append(cv.box, st.el, sl.el);
  const errs = () => [...err0.slice(0, 7), last], preds = () => actual.map((a, i) => a + errs()[i]);
  cv.onDraw((ctx, w, hh, p) => { const m = plot(w, hh, [0, 30], [0, 30]); m.axes(ctx, p, { xlabel: "actual", ylabel: "predicted", ticks: 3 }); ctx.strokeStyle = p.muted; ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.moveTo(m.X(0), m.Y(0)); ctx.lineTo(m.X(30), m.Y(30)); ctx.stroke(); ctx.setLineDash([]);
    const pr = preds(); actual.forEach((a, i) => { ctx.strokeStyle = p.muted; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.moveTo(m.X(a), m.Y(a)); ctx.lineTo(m.X(a), m.Y(Math.max(0, Math.min(30, pr[i])))); ctx.stroke(); ctx.fillStyle = i === 7 ? p.warm : p.accent; ctx.beginPath(); ctx.arc(m.X(a), m.Y(Math.max(0, Math.min(30, pr[i]))), 5.5, 0, 7); ctx.fill(); }); });
  function update() { const e = errs(), n = e.length, mae = e.reduce((s, v) => s + Math.abs(v), 0) / n, rmse = Math.sqrt(e.reduce((s, v) => s + v * v, 0) / n), my = actual.reduce((s, v) => s + v, 0) / n, sst = actual.reduce((s, v) => s + (v - my) ** 2, 0), r2 = 1 - e.reduce((s, v) => s + v * v, 0) / sst;
    st.set("m", fmt(mae, 2)); st.set("r", fmt(rmse, 2)); st.set("q", fmt(r2, 3)); say(`MAE ${fmt(mae, 2)}, RMSE ${fmt(rmse, 2)}, R squared ${fmt(r2, 3)}`); cv.redraw(); }
  update(); return () => cv.destroy();
}
