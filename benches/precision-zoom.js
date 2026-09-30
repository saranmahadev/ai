// Bench: the gap between neighbouring floating-point numbers grows with their size.
export default function mount(root, kit) {
  const { h, frame, slider, choice, canvas, stats, fmt, live } = kit;
  const body = frame(root, { title: "How finely can numbers be told apart?" });
  const say = live(body);
  let k = 8, prec = "f64";
  const sk = slider({ label: "magnitude: x = 10^k", min: 0, max: 20, step: 1, value: k, format: (v) => "10^" + v, onInput: (v) => { k = v; update(); } });
  const ch = choice("Precision", [["f32", "float32"], ["f64", "float64"]], prec, (v) => { prec = v; update(); });
  const cv = canvas(body, { aspect: 0.22, maxH: 120, label: "Neighbouring representable numbers around x, drawn as equally spaced ticks" });
  const st = stats([["ulp", "gap to the next representable number"], ["rel", "relative gap"], ["add", "does x + 1 change x?"], ["p1", "0.1 is stored as"], ["sum", "0.1 + 0.2 =" ]]);
  body.append(cv.box, st.el, ch.el, h("div", { class: "bench-controls" }, sk.el));
  const bits = () => (prec === "f32" ? 23 : 52), rnd = (v) => (prec === "f32" ? Math.fround(v) : v);
  const ulp = (x) => 2 ** (Math.floor(Math.log2(x)) - bits());
  cv.onDraw((ctx, w, hh, p) => { const y = hh / 2, n = 9; ctx.strokeStyle = p.muted; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(10, y); ctx.lineTo(w - 10, y); ctx.stroke(); for (let i = 0; i < n; i++) { const x = 30 + (i * (w - 60)) / (n - 1); ctx.fillStyle = i === 4 ? p.warm : p.accent; ctx.beginPath(); ctx.arc(x, y, i === 4 ? 6 : 4, 0, 7); ctx.fill(); } ctx.fillStyle = p.muted; ctx.font = "700 11px Nunito, system-ui, sans-serif"; ctx.textAlign = "center"; ctx.fillText("x", 30 + 4 * ((w - 60) / 8), y + 22); ctx.fillText("neighbours are one gap apart", w / 2, y - 16); });
  function update() { const x = rnd(10 ** k), g = ulp(x), one = rnd(x + 1) === x; st.set("ulp", g.toExponential(3)); st.set("rel", (g / x).toExponential(2)); st.set("add", one ? "no: adding 1 is lost in rounding" : "yes"); st.set("p1", prec === "f32" ? Math.fround(0.1).toPrecision(17) : (0.1).toPrecision(20)); st.set("sum", prec === "f32" ? Math.fround(Math.fround(0.1) + Math.fround(0.2)).toPrecision(9) : (0.1 + 0.2).toPrecision(20)); say(`Gap ${g.toExponential(2)}`); cv.redraw(); }
  update();
  return () => cv.destroy();
}
