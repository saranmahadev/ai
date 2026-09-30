// Bench: convex or not, and where gradient descent ends up.
import { curve, clip, dot, numDiff } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, choice, button, canvas, stats, plot, fmt, live } = kit;
  const body = frame(root, { title: "One valley or many?" });
  const say = live(body);
  const F = { bowl: ["bowl x²", (x) => x * x], bumpy: ["bumpy x⁴ − 2x² + 0.5x", (x) => x ** 4 - 2 * x * x + 0.5 * x] };
  let key = "bowl", a = -1, b = 1.5, s = 1.5, path = [];
  const sa = slider({ label: "point a", min: -2, max: 2, step: 0.05, value: a, format: (v) => fmt(v, 2), onInput: (v) => { a = v; update(); } });
  const sb = slider({ label: "point b", min: -2, max: 2, step: 0.05, value: b, format: (v) => fmt(v, 2), onInput: (v) => { b = v; update(); } });
  const ss = slider({ label: "start of the descent", min: -2, max: 2, step: 0.05, value: s, format: (v) => fmt(v, 2), onInput: (v) => { s = v; path = []; update(); } });
  const ch = choice("Function", Object.entries(F).map(([k, v]) => [k, v[0]]), key, (k) => { key = k; path = []; update(); });
  const run = button("Run gradient descent from the start", () => { const f = F[key][1]; path = [s]; let x = s; for (let i = 0; i < 120; i++) { x -= 0.02 * numDiff(f, x); path.push(x); } update(); });
  const cv = canvas(body, { aspect: 0.6, label: "A curve with a chord between two points and a gradient-descent path" });
  const st = stats([["mid", "midpoint test  f((a+b)/2) ≤ (f(a)+f(b))/2"], ["end", "descent ended at"]]);
  body.append(cv.box, st.el, ch.el, h("div", { class: "bench-controls" }, sa.el, sb.el, ss.el), h("div", { class: "bench-row" }, run));
  cv.onDraw((ctx, w, hh, p) => {
    const f = F[key][1], m = plot(w, hh, [-2, 2], [-2.5, 5]); m.axes(ctx, p, { xlabel: "x", ylabel: "f(x)" });
    curve(ctx, m, f, -2, 2, { color: p.accent, width: 4, clip: clip(m), steps: 300 });
    ctx.strokeStyle = p.warm; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.moveTo(m.X(a), m.Y(f(a))); ctx.lineTo(m.X(b), m.Y(f(b))); ctx.stroke();
    dot(ctx, m.X(a), m.Y(f(a)), 6, p.warm); dot(ctx, m.X(b), m.Y(f(b)), 6, p.warm); dot(ctx, m.X((a + b) / 2), m.Y(f((a + b) / 2)), 6, p.ink); dot(ctx, m.X((a + b) / 2), m.Y((f(a) + f(b)) / 2), 5, p.good);
    dot(ctx, m.X(s), m.Y(f(s)), 7, p.muted); path.forEach((x, i) => { if (i % 6 === 0) dot(ctx, m.X(x), m.Y(f(x)), 3, p.ink); });
  });
  function update() { const f = F[key][1], lhs = f((a + b) / 2), rhs = (f(a) + f(b)) / 2; st.set("mid", `${fmt(lhs, 3)} ≤ ${fmt(rhs, 3)}  →  ${lhs <= rhs + 1e-12 ? "holds here" : "FAILS: the chord dips below the curve"}`); st.set("end", path.length ? `x = ${fmt(path[path.length - 1], 3)}, f = ${fmt(f(path[path.length - 1]), 3)}` : "press the button"); say(lhs <= rhs ? "Midpoint test holds" : "Midpoint test fails"); cv.redraw(); }
  update();
  return () => cv.destroy();
}
