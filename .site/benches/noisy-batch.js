// Bench: mini-batch gradient descent is noisy but finds the way.
import { curve, clip } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, canvas, stats, plot, rng, fmt, live } = kit;
  const body = frame(root, { title: "Noisy steps that still find the way" });
  const say = live(body);
  const r0 = rng(31), N = 50, data = Array.from({ length: N }, () => { const u = Math.max(1e-6, r0()), v = r0(); return 5 + 3 * Math.sqrt(-2 * Math.log(u)) * Math.cos(6.2832 * v); });
  const mean = data.reduce((a, b) => a + b, 0) / N;
  let B = 5, eta = 0.1;
  const sb = slider({ label: "batch size", min: 1, max: 50, step: 1, value: B, onInput: (v) => { B = v; update(); } });
  const se = slider({ label: "learning rate η", min: 0.02, max: 0.5, step: 0.02, value: eta, format: (v) => fmt(v, 2), onInput: (v) => { eta = v; update(); } });
  const cv = canvas(body, { aspect: 0.55, label: "The parameter over 60 steps for mini-batch and full-batch descent" });
  const st = stats([["m", "true best value (the mean)"], ["mb", "mini-batch ends at"], ["fb", "full batch ends at"], ["sd", "jitter of the mini-batch path (last 20 steps)"]]);
  body.append(cv.box, st.el, h("div", { class: "bench-controls" }, sb.el, se.el));
  let mini = [], full = [];
  function sim() { const r = rng(B * 97 + Math.round(eta * 100)); mini = [0]; full = [0]; for (let t = 0; t < 60; t++) { const idx = r.shuffle([...Array(N).keys()]).slice(0, B), bm = idx.reduce((s, i) => s + data[i], 0) / B; mini.push(mini[t] - eta * 2 * (mini[t] - bm)); full.push(full[t] - eta * 2 * (full[t] - mean)); } }
  cv.onDraw((ctx, w, hh, p) => {
    const m = plot(w, hh, [0, 60], [-1, 10]); m.axes(ctx, p, { xlabel: "step", ylabel: "parameter w" });
    ctx.strokeStyle = p.good; ctx.setLineDash([5, 4]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(m.X(0), m.Y(mean)); ctx.lineTo(m.X(60), m.Y(mean)); ctx.stroke(); ctx.setLineDash([]);
    const at = (arr) => (t) => arr[Math.min(60, Math.round(t))];
    curve(ctx, m, at(full), 0, 60, { color: p.muted, width: 2.5, clip: clip(m), steps: 60 }); curve(ctx, m, at(mini), 0, 60, { color: p.accent, width: 3, clip: clip(m), steps: 60 });
  });
  function update() { sim(); const tail = mini.slice(-20), mu = tail.reduce((a, b) => a + b, 0) / 20; st.set("m", fmt(mean, 3)); st.set("mb", fmt(mini[60], 3)); st.set("fb", fmt(full[60], 3)); st.set("sd", fmt(Math.sqrt(tail.reduce((a, b) => a + (b - mu) ** 2, 0) / 20), 3)); say(`Mini-batch ends at ${fmt(mini[60], 2)}, true best ${fmt(mean, 2)}`); cv.redraw(); }
  update();
  return () => cv.destroy();
}
