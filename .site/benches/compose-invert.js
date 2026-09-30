// Bench: chain two functions, swap the order, and see the inverse as a mirror image.
import { curve, clip, dot } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, choice, toggles, canvas, stats, plot, fmt, live } = kit;
  const body = frame(root, { title: "Chain functions and undo them" });
  const say = live(body);
  const F = { lin: ["2x + 3", (x) => 2 * x + 3], sq: ["x²", (x) => x * x], inc: ["x + 1", (x) => x + 1], tri: ["3x", (x) => 3 * x] };
  let fk = "lin", gk = "sq", x = 2, inv = false, swap = false;
  const sx = slider({ label: "input x", min: -3, max: 3, step: 0.5, value: x, format: (v) => fmt(v, 1), onInput: (v) => { x = v; update(); } });
  const cf = choice("f", Object.entries(F).map(([k, v]) => [k, v[0]]), fk, (k) => { fk = k; update(); });
  const cg = choice("g", Object.entries(F).map(([k, v]) => [k, v[0]]), gk, (k) => { gk = k; update(); });
  const tg = toggles([["inv", "show the inverse of f (mirror across y = x)", false], ["swap", "swap the order (f after g)", false]], (v) => { inv = v.inv; swap = v.swap; update(); });
  const cv = canvas(body, { aspect: 0.7, label: "Graph of f, the composition, and optionally the inverse of f" });
  const st = stats([["chain", "the chain"], ["cmp", "composition"]]);
  body.append(cv.box, st.el, cf.el, cg.el, h("div", { class: "bench-controls" }, sx.el), tg.el);
  const f = () => F[fk][1], g = () => F[gk][1];
  const comp = (t) => (swap ? f()(g()(t)) : g()(f()(t)));
  cv.onDraw((ctx, w, hh, p) => {
    const m = plot(w, hh, [-8, 8], [-8, 8]); m.axes(ctx, p, { xlabel: "x", ylabel: "y", ticks: 8 }); const c = clip(m);
    curve(ctx, m, f(), -8, 8, { color: p.muted, width: 2.5, clip: c, steps: 300 });
    curve(ctx, m, comp, -8, 8, { color: p.accent, width: 4, clip: c, steps: 300 });
    if (inv) { curve(ctx, m, (t) => t, -8, 8, { color: p.soft2, width: 1.5, dash: [4, 4], clip: c }); ctx.save(); ctx.beginPath(); ctx.rect(c.x, c.y, c.w, c.h); ctx.clip(); ctx.fillStyle = p.warm; for (let t = -8; t <= 8; t += 0.05) { const y = f()(t); ctx.fillRect(m.X(y) - 1.5, m.Y(t) - 1.5, 3, 3); } ctx.restore(); }
    const y = comp(x); if (Number.isFinite(y)) { ctx.save(); ctx.beginPath(); ctx.rect(c.x, c.y, c.w, c.h); ctx.clip(); dot(ctx, m.X(x), m.Y(y), 6, p.good); ctx.restore(); }
  });
  function update() {
    const a = swap ? g() : f(), b = swap ? f() : g(), an = swap ? F[gk][0] : F[fk][0], bn = swap ? F[fk][0] : F[gk][0], mid = a(x);
    st.set("chain", `x = ${fmt(x, 1)} → ${an} → ${fmt(mid, 2)} → ${bn} → ${fmt(b(mid), 2)}`);
    st.set("cmp", `${swap ? "f after g" : "g after f"}   (grey: f, blue: composition${inv ? ", orange: mirror image of f" : ""})`);
    say(`Result ${fmt(b(mid), 2)}`); cv.redraw();
  }
  update();
  return () => cv.destroy();
}
