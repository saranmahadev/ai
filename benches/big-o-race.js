// Bench: growth curves for log n, n, n log n, n² and 2ⁿ.
import { curve, clip } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, toggles, canvas, stats, plot, fmt, live } = kit;
  const body = frame(root, { title: "Growth-rate race" });
  const say = live(body);
  let n = 10, logY = false;
  const F = { log: ["log n", (x) => Math.log2(Math.max(x, 1))], lin: ["n", (x) => x], nlog: ["n log n", (x) => x * Math.log2(Math.max(x, 1))], sq: ["n²", (x) => x * x], exp: ["2ⁿ", (x) => 2 ** x] };
  const COL = (p) => ({ log: p.good, lin: p.muted, nlog: p.warm, sq: p.accent, exp: p.ink });
  const sn = slider({ label: "input size n", min: 1, max: 100, step: 1, value: n, onInput: (v) => { n = v; update(); } });
  const tg = toggles([["log", "logarithmic vertical axis", false]], (v) => { logY = v.log; update(); });
  const cv = canvas(body, { aspect: 0.62, label: "Growth curves for five functions of n" });
  const st = stats(Object.entries(F).map(([k, v]) => [k, v[0]]));
  body.append(cv.box, st.el, h("div", { class: "bench-controls" }, sn.el), tg.el);
  const tf = (y) => (logY ? Math.log10(Math.max(y, 1)) : y);
  cv.onDraw((ctx, w, hh, p) => {
    const hi = logY ? 30 : Math.max(20, n * n * 1.1), m = plot(w, hh, [1, 100], [0, logY ? hi : Math.min(hi, 12000)]);
    m.axes(ctx, p, { xlabel: "n", ylabel: logY ? "log₁₀ of cost" : "cost (steps)" });
    const col = COL(p); Object.entries(F).forEach(([k, [, f]]) => curve(ctx, m, (x) => tf(f(x)), 1, 100, { color: col[k], width: 3, clip: clip(m), steps: 200 }));
    ctx.strokeStyle = p.muted; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(m.X(n), m.pad.t); ctx.lineTo(m.X(n), m.pad.t + m.ih); ctx.stroke(); ctx.setLineDash([]);
    ctx.font = "800 11px Nunito, system-ui, sans-serif"; ctx.textAlign = "left"; Object.entries(F).forEach(([k, [t]], i) => { ctx.fillStyle = col[k]; ctx.fillText(t, m.pad.l + 8, m.pad.t + 12 + i * 14); });
  });
  function update() { for (const [k, [, f]] of Object.entries(F)) { const v = f(n); st.set(k, v > 1e9 ? v.toExponential(2) : fmt(v, 1)); } say(`n is ${n}`); cv.redraw(); }
  update();
  return () => cv.destroy();
}
