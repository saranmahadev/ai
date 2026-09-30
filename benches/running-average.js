// Bench: running averages settle onto the expectation.
import { curve, clip } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, choice, toggles, button, canvas, stats, plot, rng, fmt, live } = kit;
  const body = frame(root, { title: "Watch an average settle" });
  const say = live(body);
  let kind = "coin", N = 1000, many = false, seed = 5;
  const EXP = { coin: [0.5, () => 0, (r) => r.int(2)], die: [3.5, () => 0, (r) => 1 + r.int(6)] };
  const ch = choice("Experiment", [["coin", "fraction of heads (coin)"], ["die", "average of a die"]], kind, (v) => { kind = v; update(); });
  const sn = slider({ label: "number of trials", min: 10, max: 5000, step: 10, value: N, onInput: (v) => { N = v; update(); } });
  const tg = toggles([["many", "overlay 8 runs", false]], (v) => { many = v.many; update(); });
  const cv = canvas(body, { aspect: 0.55, label: "Running averages against the number of trials, with the expected value marked" });
  const st = stats([["mu", "expected value"], ["end", "final average of run 1"], ["gap", "distance from the expectation"]]);
  body.append(cv.box, st.el, ch.el, h("div", { class: "bench-controls" }, sn.el), tg.el, h("div", { class: "bench-row" }, button("New random runs", () => { seed = (seed * 7919 + 13) % 100003; update(); })));
  const run = (i) => { const r = rng(seed + i * 101), draw = EXP[kind][2], out = []; let s = 0; for (let t = 1; t <= N; t++) { s += draw(r); out.push(s / t); } return out; };
  cv.onDraw((ctx, w, hh, p) => {
    const mu = EXP[kind][0], span = kind === "coin" ? 0.5 : 3, m = plot(w, hh, [0, Math.log10(N)], [mu - span * 0.7, mu + span * 0.7]); m.axes(ctx, p, { xlabel: "log₁₀ of the number of trials", ylabel: "running average", ticks: 4 });
    ctx.strokeStyle = p.good; ctx.setLineDash([5, 4]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(m.X(0), m.Y(mu)); ctx.lineTo(m.X(Math.log10(N)), m.Y(mu)); ctx.stroke(); ctx.setLineDash([]);
    for (let i = many ? 7 : 0; i >= 0; i--) { const v = run(i); curve(ctx, m, (x) => v[Math.max(0, Math.min(N - 1, Math.round(10 ** x) - 1))], 0, Math.log10(N), { color: i ? p.muted : p.accent, width: i ? 1.6 : 3, clip: clip(m), steps: 240 }); }
  });
  function update() { const v = run(0), mu = EXP[kind][0]; st.set("mu", fmt(mu, 2)); st.set("end", fmt(v[N - 1], 4)); st.set("gap", fmt(Math.abs(v[N - 1] - mu), 4)); say(`After ${N} trials the average is ${fmt(v[N - 1], 3)}`); cv.redraw(); }
  update();
  return () => cv.destroy();
}
