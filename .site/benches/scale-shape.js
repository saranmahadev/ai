// Bench: scale a shape and watch length, area and volume grow by k, k² and k³.
export default function mount(root, kit) {
  const { h, frame, slider, choice, canvas, stats, plot, fmt, live } = kit;
  const body = frame(root, { title: "Scale a shape" });
  const say = live(body);
  let k = 2, shape = "sq";
  const S = { sq: { name: "Square / cube", len: 1, area: 1, vol: 1 }, ci: { name: "Circle / sphere", len: 1, area: Math.PI, vol: (4 / 3) * Math.PI } };
  const sk = slider({ label: "scale factor k", min: 0.25, max: 4, step: 0.25, value: k, format: (v) => "×" + fmt(v, 2), onInput: (v) => { k = v; update(); } });
  const ch = choice("Shape (side or radius 1 to start)", [["sq", "Square / cube"], ["ci", "Circle / sphere"]], shape, (v) => { shape = v; update(); });
  const cv = canvas(body, { aspect: 0.55, label: "Bars showing how length, area and volume scale" });
  const st = stats([["l", "length × k"], ["a", "area × k²"], ["v", "volume × k³"], ["abs", "actual area and volume"]]);
  body.append(cv.box, st.el, ch.el, h("div", { class: "bench-controls" }, sk.el));
  cv.onDraw((ctx, w, hh, p) => {
    const vals = [k, k * k, k * k * k], top = Math.max(4, ...vals), m = plot(w, hh, [0, 4], [0, top]);
    m.axes(ctx, p, { ticks: 4, ylabel: "growth factor" });
    ["length", "area", "volume"].forEach((n, i) => { const x = m.X(0.5 + i * 1.2), bw = m.iw / 6, y = m.Y(vals[i]); ctx.fillStyle = [p.muted, p.accent, p.warm][i]; ctx.fillRect(x, y, bw, m.Y(0) - y); ctx.fillStyle = p.ink; ctx.font = "800 12px Nunito, system-ui, sans-serif"; ctx.textAlign = "center"; ctx.fillText(n, x + bw / 2, m.Y(0) + 14); ctx.fillText("×" + fmt(vals[i], 2), x + bw / 2, y - 5); });
  });
  function update() { const s = S[shape]; st.set("l", fmt(k, 3)); st.set("a", fmt(k * k, 3)); st.set("v", fmt(k * k * k, 3)); st.set("abs", `${fmt(s.area * k * k, 3)} and ${fmt(s.vol * k ** 3, 3)}`); say(`Area ${fmt(k * k, 2)} times, volume ${fmt(k ** 3, 2)} times`); cv.redraw(); }
  update();
  return () => cv.destroy();
}
