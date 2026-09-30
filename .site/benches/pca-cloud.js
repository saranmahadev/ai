// Bench: the principal axes of a tilted point cloud.
import { view, grid, arrow, dot } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, canvas, slider, toggles, stats, rng, fmt, live } = kit;
  const body = frame(root, { title: "Principal axes of a point cloud" });
  const say = live(body);
  let s1 = 2.5, s2 = 0.8, tilt = 30, proj = false;
  const r = rng(21), Z = Array.from({ length: 70 }, () => { const u = Math.max(1e-6, r()), v = r(), R = Math.sqrt(-2 * Math.log(u)); return [R * Math.cos(6.2832 * v), R * Math.sin(6.2832 * v)]; });
  const cv = canvas(body, { aspect: 0.72, label: "A cloud of points with its two principal axes" });
  const st = stats([["l", "variance along axis 1 and axis 2"], ["share", "share of variance on axis 1"], ["dir", "direction of axis 1"]]);
  const a = slider({ label: "spread along the long direction", min: 0.5, max: 3, step: 0.1, value: s1, format: (v) => fmt(v, 1), onInput: (v) => { s1 = v; update(); } });
  const b = slider({ label: "spread across it", min: 0.3, max: 3, step: 0.1, value: s2, format: (v) => fmt(v, 1), onInput: (v) => { s2 = v; update(); } });
  const t = slider({ label: "tilt of the cloud", min: 0, max: 180, step: 5, value: tilt, format: (v) => v + "°", onInput: (v) => { tilt = v; update(); } });
  const tg = toggles([["proj", "project the points onto axis 1", false]], (v) => { proj = v.proj; update(); });
  body.append(cv.box, st.el, h("div", { class: "bench-controls" }, a.el, b.el, t.el), tg.el);
  const pts = () => { const c = Math.cos((tilt * Math.PI) / 180), s = Math.sin((tilt * Math.PI) / 180); return Z.map(([x, y]) => [x * s1 * c - y * s2 * s, x * s1 * s + y * s2 * c]); };
  const pca = () => { const P = pts(), n = P.length, mx = P.reduce((q, p) => q + p[0], 0) / n, my = P.reduce((q, p) => q + p[1], 0) / n; let sxx = 0, syy = 0, sxy = 0; for (const [x, y] of P) { sxx += (x - mx) ** 2; syy += (y - my) ** 2; sxy += (x - mx) * (y - my); } sxx /= n - 1; syy /= n - 1; sxy /= n - 1; const t = sxx + syy, d = sxx * syy - sxy * sxy, s = Math.sqrt(Math.max(0, t * t / 4 - d)), l1 = t / 2 + s, l2 = t / 2 - s, ang = 0.5 * Math.atan2(2 * sxy, sxx - syy); return { P, mx, my, l1, l2, ang }; };
  cv.onDraw((ctx, w, hh, p) => {
    const V = view(w, hh, { scale: Math.min(w, hh) / 14 }); grid(ctx, V, w, hh, p, { labels: false });
    const f = pca(), u = [Math.cos(f.ang), Math.sin(f.ang)], q = [-u[1], u[0]];
    for (const [x, y] of f.P) { if (proj) { const k = (x - f.mx) * u[0] + (y - f.my) * u[1], px = f.mx + k * u[0], py = f.my + k * u[1]; ctx.strokeStyle = p.soft2; ctx.lineWidth = 1; ctx.beginPath(); ctx.moveTo(V.X(x), V.Y(y)); ctx.lineTo(V.X(px), V.Y(py)); ctx.stroke(); dot(ctx, V.X(px), V.Y(py), 3.5, p.warm); } dot(ctx, V.X(x), V.Y(y), proj ? 3 : 4, p.accent); }
    const L1 = 2 * Math.sqrt(f.l1), L2 = 2 * Math.sqrt(f.l2);
    arrow(ctx, V.X(f.mx), V.Y(f.my), V.X(f.mx + u[0] * L1), V.Y(f.my + u[1] * L1), p.warm, 4); arrow(ctx, V.X(f.mx), V.Y(f.my), V.X(f.mx + q[0] * L2), V.Y(f.my + q[1] * L2), p.good, 4);
  });
  function update() { const f = pca(); st.set("l", `${fmt(f.l1, 3)} and ${fmt(f.l2, 3)}`); st.set("share", fmt((100 * f.l1) / (f.l1 + f.l2), 1) + "%"); st.set("dir", fmt((((f.ang * 180) / Math.PI) % 180 + 180) % 180, 1) + "°"); say(`Axis 1 holds ${fmt((100 * f.l1) / (f.l1 + f.l2), 0)} percent of the variance`); cv.redraw(); }
  update();
  return () => cv.destroy();
}
