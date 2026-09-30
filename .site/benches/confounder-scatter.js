// Bench: a hidden factor creates a correlation between two variables.
import { gauss, mean } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, toggles, canvas, stats, plot, rng, fmt, live } = kit;
  const body = frame(root, { title: "A hidden driver behind a correlation" });
  const say = live(body);
  let a = 0.9, b = 0.9, c = 0, fix = false;
  const mk = (l, v, set) => slider({ label: l, min: 0, max: 1, step: 0.1, value: v, format: (x) => fmt(x, 1), onInput: (x) => { set(x); update(); } });
  const s1 = mk("hidden factor Z drives X", a, (v) => (a = v)), s2 = mk("hidden factor Z drives Y", b, (v) => (b = v)), s3 = mk("X directly affects Y", c, (v) => (c = v));
  const tg = toggles([["fix", "hold Z roughly fixed (use only cases with Z near 0)", false]], (v) => { fix = v.fix; update(); });
  const cv = canvas(body, { aspect: 0.65, label: "Scatter plot of X against Y" });
  const st = stats([["r", "correlation between X and Y (shown points)"], ["all", "correlation using every case"]]);
  body.append(cv.box, st.el, h("div", { class: "bench-controls" }, s1.el, s2.el, s3.el), tg.el);
  const Z = [], E1 = [], E2 = []; const r0 = rng(23); for (let i = 0; i < 300; i++) { Z.push(gauss(r0)); E1.push(gauss(r0) * 0.6); E2.push(gauss(r0) * 0.6); }
  const pts = () => Z.map((z, i) => { const x = a * z + E1[i], y = b * z + c * x + E2[i]; return { x, y, z }; });
  const corr = (P) => { const mx = mean(P.map((q) => q.x)), my = mean(P.map((q) => q.y)); let sxy = 0, sxx = 0, syy = 0; for (const q of P) { sxy += (q.x - mx) * (q.y - my); sxx += (q.x - mx) ** 2; syy += (q.y - my) ** 2; } return sxy / Math.sqrt(sxx * syy || 1); };
  cv.onDraw((ctx, w, hh, pc) => {
    const m = plot(w, hh, [-4, 4], [-4, 4]); m.axes(ctx, pc, { xlabel: "X", ylabel: "Y" });
    for (const q of pts()) { const on = !fix || Math.abs(q.z) < 0.3; ctx.globalAlpha = on ? 0.9 : 0.12; ctx.fillStyle = on ? pc.accent : pc.muted; ctx.beginPath(); ctx.arc(m.X(q.x), m.Y(q.y), 3.5, 0, 7); ctx.fill(); } ctx.globalAlpha = 1;
  });
  function update() { const P = pts(), S = fix ? P.filter((q) => Math.abs(q.z) < 0.3) : P; st.set("r", fmt(corr(S), 3)); st.set("all", fmt(corr(P), 3)); say(`Correlation ${fmt(corr(S), 2)}`); cv.redraw(); }
  update();
  return () => cv.destroy();
}
