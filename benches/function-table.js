// Bench: a function as a machine, a table and a graph, with the vertical line test.
import { curve, clip, dot } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, choice, toggles, canvas, stats, plot, fmt, live } = kit;
  const body = frame(root, { title: "Function machine: table and graph" });
  const say = live(body);
  const FN = { sq: ["x²", (x) => x * x], inv: ["1/x", (x) => 1 / x], lin: ["2x + 1", (x) => 2 * x + 1], rt: ["√x", (x) => Math.sqrt(x)], circ: ["circle x² + y² = 4 (not a function)", null] };
  let key = "sq", x = 1.5, vline = false, rows = [];
  const sx = slider({ label: "input x", min: -3, max: 3, step: 0.1, value: x, format: (v) => fmt(v, 1), onInput: (v) => { x = v; log(); update(); } });
  const ch = choice("Rule", Object.entries(FN).map(([k, v]) => [k, v[0].split(" (")[0]]), key, (k) => { key = k; rows = []; log(); update(); });
  const tg = toggles([["v", "vertical line test", false]], (v) => { vline = v.v; update(); });
  const cv = canvas(body, { aspect: 0.7, label: "Graph of the chosen rule" });
  const st = stats([["io", "machine"]]);
  const table = h("p", { class: "bench-line", style: "font-family:ui-monospace,monospace" });
  body.append(cv.box, st.el, table, ch.el, h("div", { class: "bench-controls" }, sx.el), tg.el);
  function log() { const y = FN[key][1] ? FN[key][1](x) : null; if (y === null) return; const e = `${fmt(x, 1)} → ${Number.isFinite(y) ? fmt(y, 2) : "undefined"}`; if (rows[rows.length - 1] !== e) rows.push(e); rows = rows.slice(-5); }
  cv.onDraw((ctx, w, hh, p) => {
    const m = plot(w, hh, [-4, 4], [-4, 4]); m.axes(ctx, p, { xlabel: "x", ylabel: "f(x)" });
    const c = clip(m);
    if (key === "circ") { ctx.strokeStyle = p.accent; ctx.lineWidth = 3.5; ctx.beginPath(); for (let i = 0; i <= 120; i++) { const t = (i / 120) * Math.PI * 2, X = m.X(2 * Math.cos(t)), Y = m.Y(2 * Math.sin(t)); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); } ctx.stroke(); }
    else curve(ctx, m, FN[key][1], -4, 4, { color: p.accent, width: 3.5, clip: c, steps: 400 });
    if (vline || key !== "circ") { ctx.save(); ctx.beginPath(); ctx.rect(c.x, c.y, c.w, c.h); ctx.clip(); ctx.strokeStyle = p.warm; ctx.lineWidth = 2; ctx.setLineDash([5, 5]); ctx.beginPath(); ctx.moveTo(m.X(x), c.y); ctx.lineTo(m.X(x), c.y + c.h); ctx.stroke(); ctx.setLineDash([]);
      const ys = key === "circ" ? (Math.abs(x) <= 2 ? [Math.sqrt(4 - x * x), -Math.sqrt(4 - x * x)] : []) : [FN[key][1](x)].filter(Number.isFinite);
      for (const y of ys) dot(ctx, m.X(x), m.Y(y), 6, p.good); ctx.restore(); }
  });
  function update() {
    const y = FN[key][1] ? FN[key][1](x) : null;
    st.set("io", key === "circ" ? `x = ${fmt(x, 1)} crosses the circle at ${Math.abs(x) < 2 ? "two points" : Math.abs(x) === 2 ? "one point" : "no points"}` : `${fmt(x, 1)} → f → ${Number.isFinite(y) ? fmt(y, 3) : "undefined (outside the domain)"}`);
    table.textContent = rows.length ? "input → output:  " + rows.join("   |   ") : "";
    say(key === "circ" ? "circle: one input can give two outputs" : `f of ${fmt(x, 1)} is ${Number.isFinite(y) ? fmt(y, 2) : "undefined"}`); cv.redraw();
  }
  log(); update();
  return () => cv.destroy();
}
