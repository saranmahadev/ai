// Bench: how many principal components five correlated features really need.
import { rng, pca } from "./mlkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, canvas, stats, plot, live, fmt } = kit;
  const body = frame(root, { title: "Keep the components that matter" });
  const say = live(body);
  const r = rng(3), X = Array.from({ length: 100 }, () => { const a = r.gauss() * 2, b = r.gauss(); return [a + 0.3 * r.gauss(), 0.8 * a + 0.3 * r.gauss(), b + 0.3 * r.gauss(), -0.5 * b + 0.18 * a + 0.3 * r.gauss(), 0.3 * r.gauss()]; });
  const P = pca(X), tot = P.vals.reduce((a, b) => a + b, 0);
  let k = 2;
  const sl = slider({ label: "components kept", min: 1, max: 5, step: 1, value: k, onInput: (v) => { k = v; update(); } });
  const cv = canvas(body, { aspect: 0.5, label: "Variance explained by each principal component" });
  const st = stats([["v", "variance kept"], ["e", "reconstruction error (RMS per value)"], ["c", "numbers stored per example"]]);
  body.append(cv.box, st.el, sl.el);
  const recon = (kk) => { let se = 0; for (const row of X) { const c = row.map((v, j) => v - P.mean[j]), rec = c.map(() => 0); for (let q = 0; q < kk; q++) { const z = c.reduce((s, v, j) => s + v * P.vecs[q][j], 0); P.vecs[q].forEach((v, j) => { rec[j] += z * v; }); } se += c.reduce((s, v, j) => s + (v - rec[j]) ** 2, 0); } return Math.sqrt(se / (X.length * 5)); };
  cv.onDraw((ctx, w, hh, p) => { const m = plot(w, hh, [0, 6], [0, 1.05], { l: 44, r: 14, t: 12, b: 32 }); m.axes(ctx, p, { xlabel: "principal component", ylabel: "share of variance", ticks: 1 }); let cum = 0, prevC = 0;
    P.vals.forEach((v, i) => { const f = v / tot, x0 = m.X(i + 0.6), x1 = m.X(i + 1.4); cum += f; ctx.fillStyle = i < k ? p.accent : p.soft2; ctx.fillRect(x0, m.Y(f), x1 - x0, m.pad.t + m.ih - m.Y(f)); ctx.fillStyle = p.warm; ctx.beginPath(); ctx.arc(m.X(i + 1), m.Y(cum), 4.5, 0, 7); ctx.fill(); if (i) { ctx.strokeStyle = p.warm; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(m.X(i), m.Y(prevC)); ctx.lineTo(m.X(i + 1), m.Y(cum)); ctx.stroke(); } prevC = cum; }); });
  function update() { const kept = P.vals.slice(0, k).reduce((a, b) => a + b, 0) / tot; st.set("v", fmt(kept * 100, 1) + "%"); st.set("e", fmt(recon(k), 3)); st.set("c", k); say(`${k} components keep ${fmt(kept * 100, 1)} percent of the variance`); cv.redraw(); }
  update(); return () => cv.destroy();
}
