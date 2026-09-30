// Bench: roll or flip many times and tally the results against the exact probabilities.
// plot comes from kit
import { choose, bars } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, choice, button, canvas, stats, rng, fmt, live, plot } = kit;
  const body = frame(root, { title: "Roll it and tally it" });
  const say = live(body);
  const EXP = {
    two: { name: "sum of two dice", lo: 2, hi: 12, draw: (r) => 1 + r.int(6) + 1 + r.int(6), p: (k) => (6 - Math.abs(k - 7)) / 36 },
    one: { name: "one die", lo: 1, hi: 6, draw: (r) => 1 + r.int(6), p: () => 1 / 6 },
    heads: { name: "heads in 10 flips", lo: 0, hi: 10, draw: (r) => { let c = 0; for (let i = 0; i < 10; i++) c += r.int(2); return c; }, p: (k) => choose(10, k) / 1024 }
  };
  let key = "two", counts = {}, n = 0, r = rng(Date.now() % 9973 + 1);
  const ch = choice("Experiment", Object.entries(EXP).map(([k, v]) => [k, v.name]), key, (k) => { key = k; reset(); });
  const roll = (m) => () => { const e = EXP[key]; for (let i = 0; i < m; i++) { const v = e.draw(r); counts[v] = (counts[v] || 0) + 1; n++; } update(); };
  const cv = canvas(body, { aspect: 0.55, label: "A histogram of results with the exact probabilities marked" });
  const st = stats([["n", "trials"], ["gap", "largest gap between observed and exact share"]]);
  body.append(cv.box, st.el, ch.el, h("div", { class: "bench-row" }, button("Roll ×1", roll(1)), button("×10", roll(10)), button("×100", roll(100)), button("×1000", roll(1000)), button("Reset", () => reset())));
  function reset() { counts = {}; n = 0; update(); }
  cv.onDraw((ctx, w, hh, p) => {
    const e = EXP[key], ks = []; for (let k = e.lo; k <= e.hi; k++) ks.push(k);
    const top = Math.max(0.05, ...ks.map((k) => e.p(k)), ...ks.map((k) => (n ? (counts[k] || 0) / n : 0))) * 1.15, m = plot(w, hh, [e.lo - 0.5, e.hi + 0.5], [0, top]);
    m.axes(ctx, p, { xlabel: "value", ylabel: "share of trials", ticks: Math.min(e.hi - e.lo, 10) });
    bars(ctx, m, ks.map((k) => (n ? (counts[k] || 0) / n : 0)), e.lo - 0.5, e.hi + 0.5, p.accent);
    ks.forEach((k) => { ctx.strokeStyle = p.warm; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(m.X(k - 0.4), m.Y(e.p(k))); ctx.lineTo(m.X(k + 0.4), m.Y(e.p(k))); ctx.stroke(); });
  });
  function update() { const e = EXP[key]; let gap = 0; for (let k = e.lo; k <= e.hi; k++) gap = Math.max(gap, Math.abs((counts[k] || 0) / (n || 1) - e.p(k))); st.set("n", String(n)); st.set("gap", n ? fmt(gap, 3) : "—"); say(`${n} trials`); cv.redraw(); }
  update();
  return () => cv.destroy();
}
