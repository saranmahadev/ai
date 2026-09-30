// Bench: inertia and silhouette against the number of clusters.
import { rng, clusters, kmeans, silhouette } from "./mlkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, canvas, stats, plot, live, fmt } = kit;
  const body = frame(root, { title: "How many clusters?" });
  const say = live(body);
  const pts = clusters(rng(6), [[-1.4, -1], [1.4, -0.8], [-0.4, 1.4], [2.2, 1.9]], 25, 0.6), PAL = (p) => [p.accent, p.warm, p.good, p.ink, p.muted, p.soft2, p.planet];
  const runs = []; for (let k = 1; k <= 7; k++) { let best = null; for (let s = 1; s <= 6; s++) { const r = kmeans(pts, k, s); if (!best || r.inertia < best.inertia) best = r; } runs[k] = { ...best, sil: silhouette(pts, best.assign, k) }; }
  let k = 4;
  const sl = slider({ label: "k", min: 1, max: 7, step: 1, value: k, onInput: (v) => { k = v; update(); } });
  const cv = canvas(body, { aspect: 0.5, label: "Scatter of the clusters, the inertia curve and the silhouette curve" });
  const st = stats([["i", "inertia"], ["s", "silhouette"]]);
  body.append(cv.box, st.el, sl.el);
  cv.onDraw((ctx, w, hh, p) => { const half = Math.round(w * 0.5), c = PAL(p), m = plot(half, hh, [-3.2, 4], [-3, 3.6], { l: 30, r: 8, t: 14, b: 32 }); m.axes(ctx, p, { ticks: 2 });
    pts.forEach((q, i) => { ctx.fillStyle = c[runs[k].assign[i]]; ctx.beginPath(); ctx.arc(m.X(q.x), m.Y(q.y), 3.6, 0, 7); ctx.fill(); });
    ctx.save(); ctx.translate(half + 8, 0); const m2 = plot(w - half - 8, hh, [1, 7], [0, 1.05], { l: 34, r: 12, t: 14, b: 32 }); m2.axes(ctx, p, { xlabel: "k", ticks: 3 });
    const i0 = runs[1].inertia; ctx.strokeStyle = p.accent; ctx.lineWidth = 3; ctx.beginPath(); for (let j = 1; j <= 7; j++) { const X = m2.X(j), Y = m2.Y(runs[j].inertia / i0); j > 1 ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); } ctx.stroke();
    ctx.strokeStyle = p.warm; ctx.beginPath(); for (let j = 2; j <= 7; j++) { const X = m2.X(j), Y = m2.Y(runs[j].sil); j > 2 ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); } ctx.stroke();
    ctx.strokeStyle = p.ink; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(m2.X(k), m2.pad.t); ctx.lineTo(m2.X(k), m2.pad.t + m2.ih); ctx.stroke(); ctx.font = "800 11px Nunito, system-ui"; ctx.fillStyle = p.accent; ctx.fillText("inertia (÷ k=1)", m2.pad.l + 6, m2.pad.t + 12); ctx.fillStyle = p.warm; ctx.fillText("silhouette", m2.pad.l + 6, m2.pad.t + 26); ctx.restore(); });
  function update() { st.set("i", fmt(runs[k].inertia, 1)); st.set("s", k > 1 ? fmt(runs[k].sil, 3) : "—"); say(`k = ${k}: inertia ${fmt(runs[k].inertia, 1)}`); cv.redraw(); }
  update(); return () => cv.destroy();
}
