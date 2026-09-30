// Bench: plain gradient descent, momentum and Adam on the same terrain.
import { view, heatmap, dot } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, choice, canvas, stats, fmt, live } = kit;
  const body = frame(root, { title: "Race the optimisers" });
  const say = live(body);
  const T = { ravine: ["narrow valley 0.05x² + y²", 0.05, 1], bowl: ["round bowl 0.5x² + 0.5y²", 0.5, 0.5] };
  let key = "ravine", eta = 0.3, beta = 0.9, lrA = 0.4, steps = 30;
  const mk = (l, min, max, st, v, set, fm = (x) => fmt(x, 2)) => slider({ label: l, min, max, step: st, value: v, format: fm, onInput: (x) => { set(x); update(); } });
  const s1 = mk("steps taken", 0, 100, 1, steps, (v) => (steps = v), (x) => String(x)), s2 = mk("learning rate (GD and momentum)", 0.05, 0.9, 0.05, eta, (v) => (eta = v)), s3 = mk("momentum β", 0, 0.98, 0.02, beta, (v) => (beta = v)), s4 = mk("Adam learning rate", 0.05, 1, 0.05, lrA, (v) => (lrA = v));
  const ch = choice("Terrain", Object.entries(T).map(([k, v]) => [k, v[0]]), key, (k) => { key = k; update(); });
  const cv = canvas(body, { aspect: 0.55, label: "A contour map with the paths of gradient descent, momentum and Adam" });
  const st = stats([["gd", "plain descent: loss"], ["mo", "momentum: loss"], ["ad", "Adam: loss"]]);
  body.append(cv.box, st.el, ch.el, h("div", { class: "bench-controls" }, s1.el, s2.el, s3.el, s4.el));
  const start = [-8, 2.4];
  const paths = () => {
    const [, a, b] = T[key], g = (p) => [2 * a * p[0], 2 * b * p[1]], out = { gd: [start.slice()], mo: [start.slice()], ad: [start.slice()] };
    let w = start.slice(), v = [0, 0]; const mo = [start.slice()], ad = [start.slice()];
    let x = start.slice(), vel = [0, 0], q = start.slice(), m1 = [0, 0], m2 = [0, 0];
    for (let t = 1; t <= 100; t++) {
      w = w.map((c, i) => c - eta * g(w)[i]); out.gd.push(w.slice());
      const gm = g(x); vel = vel.map((c, i) => beta * c + gm[i]); x = x.map((c, i) => c - eta * vel[i]); out.mo.push(x.slice());
      const ga = g(q); m1 = m1.map((c, i) => 0.9 * c + 0.1 * ga[i]); m2 = m2.map((c, i) => 0.999 * c + 0.001 * ga[i] * ga[i]); q = q.map((c, i) => c - (lrA * (m1[i] / (1 - 0.9 ** t))) / (Math.sqrt(m2[i] / (1 - 0.999 ** t)) + 1e-8)); out.ad.push(q.slice());
    }
    return out;
  };
  const loss = (p) => { const [, a, b] = T[key]; return a * p[0] * p[0] + b * p[1] * p[1]; };
  cv.onDraw((ctx, w, hh, p) => {
    const V = view(w, hh, { scale: w / 22 }), P = paths(); heatmap(ctx, w, hh, V, (x, y) => loss([x, y]), { block: 6, lo: 0, hi: 25 });
    [["gd", p.ink], ["mo", p.warm], ["ad", p.white]].forEach(([k, col]) => { const pts = P[k].slice(0, steps + 1); ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.beginPath(); pts.forEach(([x, y], i) => (i ? ctx.lineTo(V.X(x), V.Y(y)) : ctx.moveTo(V.X(x), V.Y(y)))); ctx.stroke(); const e = pts[pts.length - 1]; dot(ctx, V.X(e[0]), V.Y(e[1]), 6, col); });
    ctx.font = "800 11px Nunito, system-ui, sans-serif"; ctx.textAlign = "left"; [["plain descent", p.ink], ["momentum", p.warm], ["Adam", p.white]].forEach(([t, c], i) => { ctx.fillStyle = c; ctx.fillText(t, 10, 16 + i * 14); });
  });
  function update() { const P = paths(); for (const [k, id] of [["gd", "gd"], ["mo", "mo"], ["ad", "ad"]]) { const l = loss(P[k][steps]); st.set(id, Number.isFinite(l) ? fmt(l, 4) : "diverged"); } say(`After ${steps} steps`); cv.redraw(); }
  update();
  return () => cv.destroy();
}
