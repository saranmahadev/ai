// Bench: as dimensions grow, random points become equally far apart and space empties out.
import { rng } from "./mlkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, canvas, stats, plot, live, fmt } = kit;
  const body = frame(root, { title: "Distances in many dimensions" });
  const say = live(body);
  let d = 2;
  const sl = slider({ label: "dimensions", min: 1, max: 200, step: 1, value: d, onInput: (v) => { d = v; update(); } });
  const cv = canvas(body, { aspect: 0.5, label: "Histogram of distances from one point to 200 others" });
  const st = stats([["r", "(farthest − nearest) ÷ nearest"], ["c", "cells, 10 per axis"], ["p", "cells per data point"]]);
  body.append(cv.box, st.el, sl.el);
  const sim = () => { const r = rng(4), P = Array.from({ length: 201 }, () => Array.from({ length: d }, () => r())), q = P[0]; return P.slice(1).map((p) => Math.hypot(...p.map((v, i) => v - q[i]))); };
  let dists = sim();
  cv.onDraw((ctx, w, hh, p) => { const hi = Math.sqrt(d), m = plot(w, hh, [0, hi], [0, 1], { l: 16, r: 14, t: 10, b: 32 }); m.axes(ctx, p, { xlabel: "distance from the query point", ticks: 4 });
    const bins = new Array(30).fill(0); dists.forEach((v) => bins[Math.min(29, Math.floor((v / hi) * 30))]++); const mx = Math.max(...bins);
    ctx.fillStyle = p.accent; bins.forEach((c, i) => { const x0 = m.X((i / 30) * hi), x1 = m.X(((i + 1) / 30) * hi); ctx.fillRect(x0 + 1, m.Y(c / mx * 0.95), x1 - x0 - 2, m.pad.t + m.ih - m.Y(c / mx * 0.95)); });
    ctx.fillStyle = p.warm; for (const v of [Math.min(...dists), Math.max(...dists)]) ctx.fillRect(m.X(v) - 2, m.pad.t, 4, m.ih); });
  function update() { dists = sim(); const mn = Math.min(...dists), mxv = Math.max(...dists), cells = 10 ** d; st.set("r", fmt((mxv - mn) / mn, 2)); st.set("c", cells > 1e9 ? "10^" + d : cells.toLocaleString("en-US")); st.set("p", cells / 200 > 1e6 ? "10^" + fmt(d - 2.3, 0) : fmt(cells / 200, 1)); say(`${d} dimensions: farthest is ${fmt(mxv / mn, 2)} times the nearest`); cv.redraw(); }
  update(); return () => cv.destroy();
}
