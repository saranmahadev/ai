// Bench: build arithmetic, geometric or Fibonacci sequences term by term.
export default function mount(root, kit) {
  const { h, frame, slider, choice, stepper, canvas, stats, fmt, plot, live } = kit;
  const body = frame(root, { title: "Build a sequence" });
  const say = live(body);
  let kind = "arith", a1 = 3, d = 4, shown = 1;
  const MAX = 10;
  const terms = () => { const t = []; for (let i = 0; i < MAX; i++) t.push(kind === "arith" ? a1 + i * d : kind === "geo" ? a1 * d ** i : i < 2 ? 1 : t[i - 1] + t[i - 2]); return t; };
  const sa = slider({ label: "first term", min: 1, max: 10, step: 1, value: a1, onInput: (v) => { a1 = v; update(); } });
  const sd = slider({ label: "step (arithmetic) or ratio (geometric)", min: -3, max: 4, step: 0.5, value: d, format: (v) => fmt(v, 1), onInput: (v) => { d = v; update(); } });
  const ch = choice("Rule", [["arith", "Add a step"], ["geo", "Multiply by a ratio"], ["fib", "Fibonacci"]], kind, (k) => { kind = k; update(); });
  const cv = canvas(body, { aspect: 0.5, label: "Bars for the terms of the sequence" });
  const st = stats([["term", "latest term"], ["sum", "sum so far"]]);
  const stp = stepper({ interval: 500, stepLabel: "Add a term", onStep: () => { if (shown >= MAX) return false; shown++; update(); if (shown >= MAX) return false; }, onReset: () => { shown = 1; update(); } });
  body.append(cv.box, st.el, ch.el, h("div", { class: "bench-controls" }, sa.el, sd.el), stp.el);
  cv.onDraw((ctx, w, hh, p) => {
    const t = terms().slice(0, shown), hi = Math.max(1, ...terms().slice(0, MAX).map(Math.abs)), lo = Math.min(0, ...terms());
    const m = plot(w, hh, [0, MAX + 1], [lo, Math.max(hi, 1)]);
    m.axes(ctx, p, { xlabel: "term number n", ylabel: "aₙ" });
    t.forEach((v, i) => { ctx.fillStyle = i === shown - 1 ? p.warm : p.accent; const y0 = m.Y(0), y1 = m.Y(v); ctx.fillRect(m.X(i + 1) - m.iw / 26, Math.min(y0, y1), m.iw / 13, Math.abs(y1 - y0)); });
  });
  function update() { const t = terms().slice(0, shown); st.set("term", fmt(t[t.length - 1], 3)); st.set("sum", fmt(t.reduce((s, v) => s + v, 0), 3)); say(`Term ${shown} is ${fmt(t[t.length - 1], 2)}`); cv.redraw(); }
  update();
  return () => { stp.stop(); cv.destroy(); };
}
