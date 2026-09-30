// Bench: what different correlations look like, and where r fails.
import { gauss, mean } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, choice, toggles, canvas, stats, plot, rng, fmt, live } = kit;
  const body = frame(root, { title: "What does r look like?" });
  const say = live(body);
  let kind = "lin", rho = 0.8, outl = false;
  const r0 = rng(5), E = Array.from({ length: 80 }, () => [gauss(r0), gauss(r0)]);
  const ch = choice("Pattern", [["lin", "straight-line pattern"], ["u", "U-shaped curve"], ["two", "two clusters"]], kind, (v) => { kind = v; update(); });
  const sr = slider({ label: "target correlation (straight-line pattern)", min: -1, max: 1, step: 0.1, value: rho, format: (v) => fmt(v, 1), onInput: (v) => { rho = v; update(); } });
  const tg = toggles([["o", "add one outlier at the bottom right", false]], (v) => { outl = v.o; update(); });
  const cv = canvas(body, { aspect: 0.65, label: "A scatter plot with its correlation coefficient" });
  const st = stats([["r", "correlation r"], ["cov", "covariance"]]);
  body.append(cv.box, st.el, ch.el, h("div", { class: "bench-controls" }, sr.el), tg.el);
  const pts = () => { const P = E.map(([a, b], i) => (kind === "lin" ? [a, rho * a + Math.sqrt(1 - rho * rho) * b] : kind === "u" ? [a * 0.9, a * a * 0.8 - 0.8 + b * 0.25] : [(i % 2 ? 2 : -2) + a * 0.5, (i % 2 ? -1.5 : 1.5) + b * 0.5])); if (outl) P.push([3.5, -3.5]); return P; };
  const stat = (P) => { const mx = mean(P.map((q) => q[0])), my = mean(P.map((q) => q[1])); let sxy = 0, sxx = 0, syy = 0; for (const [x, y] of P) { sxy += (x - mx) * (y - my); sxx += (x - mx) ** 2; syy += (y - my) ** 2; } return { r: sxy / Math.sqrt(sxx * syy), cov: sxy / (P.length - 1) }; };
  cv.onDraw((ctx, w, hh, p) => { const m = plot(w, hh, [-4, 4], [-4, 4]); m.axes(ctx, p, { xlabel: "x", ylabel: "y" }); for (const [x, y] of pts()) { ctx.fillStyle = p.accent; ctx.beginPath(); ctx.arc(m.X(x), m.Y(y), 3.5, 0, 7); ctx.fill(); } });
  function update() { sr.el.hidden = kind !== "lin"; const s = stat(pts()); st.set("r", fmt(s.r, 3)); st.set("cov", fmt(s.cov, 3)); say(`Correlation ${fmt(s.r, 2)}`); cv.redraw(); }
  update();
  return () => cv.destroy();
}
