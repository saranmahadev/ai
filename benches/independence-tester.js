// Bench: independent or dependent vectors, and coordinates in a basis.
import { view, grid, arrow, dot } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, canvas, slider, stats, fmt, live } = kit;
  const body = frame(root, { title: "Independent or dependent?" });
  const say = live(body);
  const u = [1, 0], v = [1, 1], w = [2, 2], T = [3, 2];
  const cv = canvas(body, { aspect: 0.72, label: "Three vectors in the plane and a target point" });
  const st = stats([["uv", "u and v"], ["uw", "u and w"], ["vw", "v and w"], ["coord", "target (3, 2) in basis u, v"]]);
  const mk = (n, arr, i) => slider({ label: `${n} ${i ? "y" : "x"}`, min: -3, max: 3, step: 0.5, value: arr[i], format: (x) => fmt(x, 1), onInput: (x) => { arr[i] = x; update(); } });
  const sl = [mk("u", u, 0), mk("u", u, 1), mk("v", v, 0), mk("v", v, 1), mk("w", w, 0), mk("w", w, 1)];
  body.append(cv.box, st.el, h("div", { class: "bench-controls" }, sl.map((s) => s.el)));
  const det = (a, b) => a[0] * b[1] - a[1] * b[0], indep = (a, b) => Math.abs(det(a, b)) > 1e-9;
  cv.onDraw((ctx, W, H, p) => {
    const V = view(W, H, { scale: Math.min(W, H) / 12 }); grid(ctx, V, W, H, p);
    for (const [vec, col] of [[u, p.accent], [v, p.warm], [w, p.good]]) arrow(ctx, V.X(0), V.Y(0), V.X(vec[0]), V.Y(vec[1]), col, 3.5);
    dot(ctx, V.X(T[0]), V.Y(T[1]), 6, p.ink);
  });
  function update() {
    const f = (a, b) => (indep(a, b) ? "independent" : "dependent (one is a multiple of the other)");
    st.set("uv", f(u, v)); st.set("uw", f(u, w)); st.set("vw", f(v, w));
    if (indep(u, v)) { const d = det(u, v), a = (T[0] * v[1] - T[1] * v[0]) / d, b = (u[0] * T[1] - u[1] * T[0]) / d; st.set("coord", `${fmt(a, 2)}·u + ${fmt(b, 2)}·v`); } else st.set("coord", "not a basis (u and v are dependent)");
    say(indep(u, v) ? "u and v form a basis" : "u and v are dependent"); cv.redraw();
  }
  update();
  return () => cv.destroy();
}
