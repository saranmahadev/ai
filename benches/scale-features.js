// Bench: nearest neighbours under raw, standardised and min-max distances.
import { rng } from "./mlkit.js";
export default function mount(root, kit) {
  const { h, frame, choice, canvas, stats, plot, dragHandles, live, fmt } = kit;
  const body = frame(root, { title: "Distance depends on scale" });
  const say = live(body);
  const r = rng(13), pts = Array.from({ length: 40 }, (_, i) => { const age = 20 + 40 * r(); const c = age > 40 ? 1 : 0; return { x: age, y: 20000 + 100000 * r(), c }; });
  const mean = (a) => a.reduce((s, v) => s + v, 0) / a.length, sd = (a) => Math.sqrt(mean(a.map((v) => (v - mean(a)) ** 2)));
  const S = { x: [mean(pts.map((p) => p.x)), sd(pts.map((p) => p.x))], y: [mean(pts.map((p) => p.y)), sd(pts.map((p) => p.y))] };
  const R = { x: [20, 60], y: [20000, 120000] };
  let mode = "raw", Q = { x: 32, y: 60000 };
  const dist = (a, b) => mode === "raw" ? Math.hypot(a.x - b.x, a.y - b.y) : mode === "std" ? Math.hypot((a.x - b.x) / S.x[1], (a.y - b.y) / S.y[1]) : Math.hypot((a.x - b.x) / (R.x[1] - R.x[0]), (a.y - b.y) / (R.y[1] - R.y[0]));
  const near = (q, k, skip) => pts.filter((p) => p !== skip).map((p) => ({ p, d: dist(q, p) })).sort((a, b) => a.d - b.d).slice(0, k);
  const mc = choice("Distance uses", [["raw", "raw numbers"], ["std", "standardised"], ["mm", "min-max scaled"]], mode, (v) => { mode = v; update(); });
  const cv = canvas(body, { aspect: 0.62, label: "People by age and income with a draggable query and its three nearest neighbours" });
  const st = stats([["v", "3-neighbour vote"], ["a", "accuracy on the other 40 people"], ["ax", "age's share of the distance"]]);
  body.append(cv.box, st.el, mc.el);
  let m;
  cv.onDraw((ctx, w, hh, p) => { m = plot(w, hh, [15, 65], [10000, 130000], { l: 56, r: 14, t: 14, b: 32 }); m.axes(ctx, p, { xlabel: "age", ylabel: "income" }); const nn = near(Q, 3).map((e) => e.p);
    for (const q of pts) { ctx.fillStyle = q.c ? p.warm : p.accent; ctx.beginPath(); ctx.arc(m.X(q.x), m.Y(q.y), nn.includes(q) ? 7 : 4.5, 0, 7); ctx.fill(); if (nn.includes(q)) { ctx.strokeStyle = p.ink; ctx.lineWidth = 2.5; ctx.stroke(); ctx.beginPath(); ctx.moveTo(m.X(Q.x), m.Y(Q.y)); ctx.lineTo(m.X(q.x), m.Y(q.y)); ctx.setLineDash([4, 4]); ctx.stroke(); ctx.setLineDash([]); } }
    ctx.fillStyle = p.ink; ctx.beginPath(); ctx.arc(m.X(Q.x), m.Y(Q.y), 8, 0, 7); ctx.fill(); });
  dragHandles(cv.cv, () => (m ? [{ x: m.X(Q.x), y: m.Y(Q.y) }] : []), (_, px, py) => { Q = { x: Math.max(15, Math.min(65, m.x(px))), y: Math.max(10000, Math.min(130000, m.y(py))) }; update(); });
  function update() { const vote = near(Q, 3).reduce((s, e) => s + e.p.c, 0) / 3; const right = pts.filter((p) => (near(p, 3, p).reduce((s, e) => s + e.p.c, 0) / 3 > 0.5 ? 1 : 0) === p.c).length / pts.length;
    const nn = near(Q, 3), dx = nn.reduce((s, e) => s + (mode === "raw" ? (e.p.x - Q.x) ** 2 : mode === "std" ? ((e.p.x - Q.x) / S.x[1]) ** 2 : ((e.p.x - Q.x) / 40) ** 2), 0), dy = nn.reduce((s, e) => s + (mode === "raw" ? (e.p.y - Q.y) ** 2 : mode === "std" ? ((e.p.y - Q.y) / S.y[1]) ** 2 : ((e.p.y - Q.y) / 100000) ** 2), 0);
    st.set("v", vote > 0.5 ? "over 40" : "40 or under"); st.set("a", fmt(right * 100, 0) + "%"); st.set("ax", fmt((100 * dx) / (dx + dy || 1), 0) + "%"); say(`Vote ${vote > 0.5 ? "over 40" : "40 or under"}; age share ${fmt((100 * dx) / (dx + dy || 1), 0)} percent`); cv.redraw(); }
  update(); return () => cv.destroy();
}
