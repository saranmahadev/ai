// Bench: average-linkage hierarchical clustering cut at a chosen number of clusters.
import { rng, clusters, agglomerate, cutMerges } from "./mlkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, canvas, stats, plot, live, fmt } = kit;
  const body = frame(root, { title: "Cut the merge tree" });
  const say = live(body);
  const pts = clusters(rng(9), [[-1.5, 0], [1.5, 0.5], [0, 2]], 5, 0.3), merges = agglomerate(pts), n = pts.length, PAL = (p) => [p.accent, p.warm, p.good, p.ink, p.muted, p.soft2, p.planet, p.accent, p.warm, p.good, p.ink, p.muted, p.soft2, p.planet, p.accent];
  let k = 3;
  const sl = slider({ label: "clusters after cutting", min: 1, max: 8, step: 1, value: k, onInput: (v) => { k = v; update(); } });
  const cv = canvas(body, { aspect: 0.5, label: "Points coloured by cluster beside the sizes of each merge" });
  const st = stats([["g", "distance of the next merge you undo"], ["r", "ratio to the merge before"]]);
  body.append(cv.box, st.el, sl.el);
  cv.onDraw((ctx, w, hh, p) => { const half = Math.round(w * 0.5), lab = cutMerges(n, merges, k), c = PAL(p), m = plot(half, hh, [-2.4, 2.4], [-1, 3], { l: 30, r: 8, t: 14, b: 32 }); m.axes(ctx, p, { ticks: 2 });
    pts.forEach((q, i) => { ctx.fillStyle = c[lab[i]]; ctx.beginPath(); ctx.arc(m.X(q.x), m.Y(q.y), 6, 0, 7); ctx.fill(); });
    ctx.save(); ctx.translate(half + 8, 0); const ds = merges.map((q) => q.d), m2 = plot(w - half - 8, hh, [0, ds.length + 1], [0, Math.max(...ds) * 1.1], { l: 34, r: 12, t: 14, b: 32 }); m2.axes(ctx, p, { xlabel: "merge number (earliest first)", ticks: 2 });
    ds.forEach((d, i) => { const undone = i >= n - k; ctx.fillStyle = undone ? p.warm : p.accent; const x0 = m2.X(i + 0.6), x1 = m2.X(i + 1.4); ctx.fillRect(x0, m2.Y(d), x1 - x0, m2.pad.t + m2.ih - m2.Y(d)); }); ctx.restore(); });
  function update() { const ds = merges.map((q) => q.d), i = n - k; if (k >= 1 && i < ds.length) { st.set("g", fmt(ds[i], 2)); st.set("r", i > 0 ? fmt(ds[i] / ds[i - 1], 1) + "×" : "—"); } say(`${k} clusters`); cv.redraw(); }
  update(); return () => cv.destroy();
}
