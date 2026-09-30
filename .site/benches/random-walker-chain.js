// Bench: a two-state Markov chain and its long-run behaviour.
export default function mount(root, kit) {
  const { h, frame, slider, choice, stepper, canvas, stats, rng, plot, fmt, live } = kit;
  const body = frame(root, { title: "A two-state Markov chain" });
  const say = live(body);
  let a = 0.2, b = 0.4, start = "S", dist = [1, 0], t = 0, walk = [], r = rng(3);
  const sa = slider({ label: "chance of Sunny → Rainy", min: 0.05, max: 0.95, step: 0.05, value: a, format: (v) => fmt(v, 2), onInput: (v) => { a = v; reset(); } });
  const sb = slider({ label: "chance of Rainy → Sunny", min: 0.05, max: 0.95, step: 0.05, value: b, format: (v) => fmt(v, 2), onInput: (v) => { b = v; reset(); } });
  const ch = choice("Start", [["S", "Sunny"], ["R", "Rainy"]], start, (v) => { start = v; reset(); });
  const stp = stepper({ interval: 500, stepLabel: "Next day", onStep: () => { if (t >= 30) return false; dist = [dist[0] * (1 - a) + dist[1] * b, dist[0] * a + dist[1] * (1 - b)]; t++; update(); if (t >= 30) return false; }, onReset: () => reset() });
  const cv = canvas(body, { aspect: 0.5, label: "The probability of Sunny and Rainy day by day, with the stationary values marked" });
  const st = stats([["d", "today's distribution (Sunny, Rainy)"], ["pi", "stationary distribution"], ["sim", "simulated: share of sunny days over 500 days"]]);
  body.append(cv.box, st.el, ch.el, h("div", { class: "bench-controls" }, sa.el, sb.el), stp.el);
  let hist = [];
  function reset() { t = 0; dist = start === "S" ? [1, 0] : [0, 1]; hist = [dist[0]]; r = rng(3 + Math.round(a * 100) + Math.round(b * 1000)); let s = start === "S" ? 0 : 1, sun = 0; for (let i = 0; i < 500; i++) { s = s === 0 ? (r() < a ? 1 : 0) : r() < b ? 0 : 1; if (s === 0) sun++; } walk = sun / 500; update(true); }
  cv.onDraw((ctx, w, hh, p) => {
    const m = plot(w, hh, [0, 30], [0, 1]); m.axes(ctx, p, { xlabel: "day", ylabel: "P(Sunny)" }); const pi = b / (a + b);
    ctx.strokeStyle = p.good; ctx.setLineDash([5, 4]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(m.X(0), m.Y(pi)); ctx.lineTo(m.X(30), m.Y(pi)); ctx.stroke(); ctx.setLineDash([]);
    ctx.strokeStyle = p.accent; ctx.lineWidth = 3.5; ctx.beginPath(); hist.forEach((v, i) => (i ? ctx.lineTo(m.X(i), m.Y(v)) : ctx.moveTo(m.X(i), m.Y(v)))); ctx.stroke(); hist.forEach((v, i) => { ctx.fillStyle = p.accent; ctx.beginPath(); ctx.arc(m.X(i), m.Y(v), 3.5, 0, 7); ctx.fill(); });
  });
  function update(fresh) { if (!fresh) hist.push(dist[0]); st.set("d", `(${fmt(dist[0], 3)}, ${fmt(dist[1], 3)})   after ${t} days`); st.set("pi", `(${fmt(b / (a + b), 3)}, ${fmt(a / (a + b), 3)})`); st.set("sim", fmt(walk, 3)); say(`Day ${t}: sunny ${fmt(dist[0], 2)}`); cv.redraw(); }
  reset();
  return () => { stp.stop(); cv.destroy(); };
}
