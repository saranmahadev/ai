// Bench: a curved map looks like its Jacobian when you zoom in.
import { view, numDiff } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, choice, canvas, stats, fmt, live } = kit;
  const body = frame(root, { title: "A curved map and its linear stand-in" });
  const say = live(body);
  const F = { a: ["(x + 0.4y², y + 0.4x²)", (x, y) => [x + 0.4 * y * y, y + 0.4 * x * x]], b: ["(x², x·y)", (x, y) => [x * x, x * y]], c: ["(x·cos y, x·sin y)", (x, y) => [x * Math.cos(y), x * Math.sin(y)]] };
  let key = "a", p0 = [1, 1], r = 0.5;
  const sx = slider({ label: "base point x", min: -2, max: 2, step: 0.1, value: p0[0], format: (v) => fmt(v, 1), onInput: (v) => { p0[0] = v; update(); } });
  const sy = slider({ label: "base point y", min: -2, max: 2, step: 0.1, value: p0[1], format: (v) => fmt(v, 1), onInput: (v) => { p0[1] = v; update(); } });
  const sr = slider({ label: "neighbourhood size", min: 0.05, max: 1, step: 0.05, value: r, format: (v) => fmt(v, 2), onInput: (v) => { r = v; update(); } });
  const ch = choice("Function f(x, y)", Object.entries(F).map(([k, v]) => [k, v[0]]), key, (k) => { key = k; update(); });
  const cv = canvas(body, { aspect: 0.72, label: "A small grid mapped by a curved function and by its linear approximation" });
  const st = stats([["J", "Jacobian [∂f₁/∂x ∂f₁/∂y ; ∂f₂/∂x ∂f₂/∂y]"], ["err", "worst gap between the two images (relative to size)"]]);
  body.append(cv.box, st.el, ch.el, h("div", { class: "bench-controls" }, sx.el, sy.el, sr.el));
  const J = () => { const f = F[key][1]; return [0, 1].map((o) => [numDiff((t) => f(t, p0[1])[o], p0[0]), numDiff((t) => f(p0[0], t)[o], p0[1])]); };
  const img = (dx, dy, lin) => { const f = F[key][1]; if (!lin) return f(p0[0] + dx, p0[1] + dy); const j = J(), c = f(...p0); return [c[0] + j[0][0] * dx + j[0][1] * dy, c[1] + j[1][0] * dx + j[1][1] * dy]; };
  cv.onDraw((ctx, w, hh, p) => {
    const c = F[key][1](...p0), j = J(), gain = Math.max(0.5, Math.hypot(j[0][0], j[0][1], j[1][0], j[1][1]) / 1.4), V = view(w, hh, { cx: c[0], cy: c[1], scale: (Math.min(w, hh) * 0.36) / (r * gain) });
    const N = 6; ctx.lineWidth = 2;
    for (const [lin, col, dash] of [[false, p.warm, []], [true, p.accent, [6, 5]]]) { ctx.strokeStyle = col; ctx.setLineDash(dash);
      for (let a = -N; a <= N; a += 2) for (const horiz of [true, false]) { ctx.beginPath(); for (let s = -N; s <= N; s++) { const q = horiz ? img((s / N) * r, (a / N) * r, lin) : img((a / N) * r, (s / N) * r, lin); s === -N ? ctx.moveTo(V.X(q[0]), V.Y(q[1])) : ctx.lineTo(V.X(q[0]), V.Y(q[1])); } ctx.stroke(); } }
    ctx.setLineDash([]); ctx.fillStyle = p.ink; ctx.beginPath(); ctx.arc(V.X(c[0]), V.Y(c[1]), 5, 0, 7); ctx.fill();
  });
  function update() { const j = J(), a = img(r, r, false), b = img(r, r, true), size = Math.hypot(j[0][0] * r + j[0][1] * r, j[1][0] * r + j[1][1] * r) || 1; st.set("J", `[ ${fmt(j[0][0], 2)} ${fmt(j[0][1], 2)} ; ${fmt(j[1][0], 2)} ${fmt(j[1][1], 2)} ]`); st.set("err", fmt((100 * Math.hypot(a[0] - b[0], a[1] - b[1])) / size, 1) + "%"); say("Images updated. Orange is the curved map, dashed blue is the linear one"); cv.redraw(); }
  update();
  return () => cv.destroy();
}
