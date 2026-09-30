// Bench: two lines, and whether they meet once, never or everywhere.
import { view, grid, dot } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, canvas, slider, stats, fmt, live } = kit;
  const body = frame(root, { title: "Where do the lines meet?" });
  const say = live(body);
  const L = [[1, 1, 5], [1, -1, 1]];
  const cv = canvas(body, { aspect: 0.72, label: "Two lines in the plane" });
  const st = stats([["eq", "system"], ["det", "determinant of the coefficients"], ["sol", "solution"]]);
  const sl = L.flatMap((l, i) => ["a", "b", "c"].map((n, j) => slider({ label: `line ${i + 1}: ${n}${i + 1}`, min: -5, max: 10, step: 0.5, value: l[j], format: (x) => fmt(x, 1), onInput: (x) => { l[j] = x; update(); } })));
  body.append(cv.box, st.el, h("div", { class: "bench-controls" }, sl.map((s) => s.el)));
  cv.onDraw((ctx, w, hh, p) => {
    const V = view(w, hh, { scale: Math.min(w, hh) / 16, cx: 2, cy: 2 }); grid(ctx, V, w, hh, p);
    L.forEach(([a, b, c], i) => { ctx.strokeStyle = i ? p.warm : p.accent; ctx.lineWidth = 3.5; ctx.beginPath(); if (Math.abs(b) > 1e-9) { ctx.moveTo(V.X(-30), V.Y((c + 30 * a) / b)); ctx.lineTo(V.X(30), V.Y((c - 30 * a) / b)); } else if (Math.abs(a) > 1e-9) { ctx.moveTo(V.X(c / a), V.Y(-30)); ctx.lineTo(V.X(c / a), V.Y(30)); } ctx.stroke(); });
    const d = L[0][0] * L[1][1] - L[0][1] * L[1][0]; if (Math.abs(d) > 1e-9) dot(ctx, V.X((L[0][2] * L[1][1] - L[0][1] * L[1][2]) / d), V.Y((L[0][0] * L[1][2] - L[0][2] * L[1][0]) / d), 8, p.good);
  });
  function update() {
    const [[a1, b1, c1], [a2, b2, c2]] = L, d = a1 * b2 - b1 * a2;
    st.set("eq", `${a1}x + ${b1}y = ${c1}   and   ${a2}x + ${b2}y = ${c2}`); st.set("det", fmt(d, 3));
    if (Math.abs(d) > 1e-9) st.set("sol", `one solution: x = ${fmt((c1 * b2 - b1 * c2) / d, 3)}, y = ${fmt((a1 * c2 - c1 * a2) / d, 3)}`);
    else { const same = Math.abs(a1 * c2 - a2 * c1) < 1e-9 && Math.abs(b1 * c2 - b2 * c1) < 1e-9; st.set("sol", same ? "infinitely many: the lines are the same" : "none: the lines are parallel"); }
    say(st && "System updated"); cv.redraw();
  }
  update();
  return () => cv.destroy();
}
