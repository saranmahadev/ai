// Bench: a model is a function with adjustable numbers. Set the numbers by hand and see how well it fits.
export default function mount(root, kit) {
  const { h, frame, slider, button, canvas, rng, plot, live, fmt, stats } = kit;
  const body = frame(root, {
    title: "A model is a function with dials"
  });
  const say = live(body);
  const r = rng(5);
  const data = Array.from({ length: 14 }, () => { const size = 35 + r() * 110; return { size, price: 40 + 2.2 * size + (r() - 0.5) * 90 }; });
  let w = 1, b = 100, query = 90;
  const sw = slider({ label: "w: dollars (thousands) added per square metre", min: 0, max: 4, step: 0.05, value: w, format: (v) => fmt(v, 2), onInput: (v) => { w = v; update(); } });
  const sb = slider({ label: "b: base price (thousands)", min: -50, max: 250, step: 5, value: b, format: (v) => v, onInput: (v) => { b = v; update(); } });
  const sq = slider({ label: "a new house: size in square metres", min: 30, max: 160, step: 1, value: query, format: (v) => v + " m²", onInput: (v) => { query = v; update(); } });
  const cv = canvas(body, { aspect: 0.6, label: "Scatter plot of house size against price with a line you control" });
  const st = stats([["err", "average miss ($k)"], ["pred", "prediction for the new house"]]);
  const out = h("p", { class: "bench-verdict" });
  const line = h("p", { class: "bench-line" });
  const best = button("Reveal the best-fitting dials", () => { const n = data.length, mx = data.reduce((a, d) => a + d.size, 0) / n, my = data.reduce((a, d) => a + d.price, 0) / n; const bw = data.reduce((a, d) => a + (d.size - mx) * (d.price - my), 0) / data.reduce((a, d) => a + (d.size - mx) ** 2, 0); w = Math.round(bw * 20) / 20; b = Math.round((my - bw * mx) / 5) * 5; sw.set(w, true); sb.set(b, true); update(); });
  body.append(cv.box, st.el, line, h("div", { class: "bench-controls" }, sw.el, sb.el, sq.el), h("div", { class: "bench-row" }, best));
  cv.onDraw((ctx, W, H, p) => {
    const m = plot(W, H, [20, 170], [0, 450]);
    m.axes(ctx, p, { xlabel: "size (m²)", ylabel: "price ($k)" });
    ctx.strokeStyle = p.warm; ctx.lineWidth = 1.6;
    for (const d of data) { ctx.beginPath(); ctx.moveTo(m.X(d.size), m.Y(d.price)); ctx.lineTo(m.X(d.size), m.Y(w * d.size + b)); ctx.stroke(); }
    ctx.strokeStyle = p.accent; ctx.lineWidth = 4; ctx.save(); ctx.beginPath(); ctx.rect(m.pad.l, m.pad.t, m.iw, m.ih); ctx.clip(); ctx.beginPath(); ctx.moveTo(m.X(20), m.Y(w * 20 + b)); ctx.lineTo(m.X(170), m.Y(w * 170 + b)); ctx.stroke(); ctx.restore();
    ctx.fillStyle = p.ink; for (const d of data) { ctx.beginPath(); ctx.arc(m.X(d.size), m.Y(d.price), 5, 0, 7); ctx.fill(); }
    const pq = w * query + b; ctx.setLineDash([5, 5]); ctx.strokeStyle = p.good; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(m.X(query), m.pad.t + m.ih); ctx.lineTo(m.X(query), m.Y(pq)); ctx.lineTo(m.pad.l, m.Y(pq)); ctx.stroke(); ctx.setLineDash([]);
    ctx.fillStyle = p.good; ctx.beginPath(); ctx.arc(m.X(query), m.Y(pq), 7, 0, 7); ctx.fill();
  });
  function update() {
    const err = data.reduce((a, d) => a + Math.abs(w * d.size + b - d.price), 0) / data.length, pq = w * query + b;
    st.set("err", fmt(err, 0)); st.set("pred", `$${fmt(pq, 0)}k`);
    line.textContent = `price = ${fmt(w, 2)} × ${query} + ${b} = ${fmt(pq, 0)}`;
    const msg = err < 25 ? "Close fit: the dials are set well." : err < 60 ? "The line follows the trend, but there is room to improve." : "The line misses badly. Keep turning the dials.";
    out.textContent = msg; say(`Average miss ${fmt(err, 0)} thousand. ${msg}`); cv.redraw();
  }
  update();
  return () => cv.destroy();
}
