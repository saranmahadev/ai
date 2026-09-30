// Bench: find flat spots and say whether each is a minimum, maximum or inflection.
import { curve, clip, dot, numDiff } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, choice, canvas, stats, plot, fmt, live } = kit;
  const body = frame(root, { title: "Find and classify the flat spots" });
  const say = live(body);
  const F = { quart: ["x⁴ − 2x²", (x) => x ** 4 - 2 * x * x, [-2, 2], [-2, 4]], uneven: ["x⁴ − 2x² + 0.5x", (x) => x ** 4 - 2 * x * x + 0.5 * x, [-2, 2], [-2, 4]], cubic: ["x³", (x) => x ** 3, [-2, 2], [-8, 8]] };
  let key = "quart", x = 0.4;
  const sx = slider({ label: "marker x", min: -2, max: 2, step: 0.01, value: x, format: (v) => fmt(v, 2), onInput: (v) => { x = v; update(); } });
  const ch = choice("Function", Object.entries(F).map(([k, v]) => [k, v[0]]), key, (k) => { key = k; update(); });
  const cv = canvas(body, { aspect: 0.6, label: "A curve with its flat spots marked" });
  const st = stats([["cp", "flat spots"], ["at", "marker: slope and curvature"]]);
  body.append(cv.box, st.el, ch.el, h("div", { class: "bench-controls" }, sx.el));
  const d1 = (f, t) => numDiff(f, t, 1e-5), d2 = (f, t) => (f(t + 1e-3) - 2 * f(t) + f(t - 1e-3)) / 1e-6;
  const crit = (f) => { const out = []; for (let t = -2; t < 2; t += 0.002) { const a = d1(f, t), b = d1(f, t + 0.002); if (a === 0 || a * b < 0) { let lo = t, hi = t + 0.002; for (let i = 0; i < 30; i++) { const mid = (lo + hi) / 2; d1(f, lo) * d1(f, mid) <= 0 ? (hi = mid) : (lo = mid); } const r = (lo + hi) / 2, c = d2(f, r), kind = Math.abs(c) < 0.05 ? "inflection" : c > 0 ? "minimum" : "maximum"; if (!out.length || Math.abs(out[out.length - 1].x - r) > 0.01) out.push({ x: r, kind }); } } return out; };
  cv.onDraw((ctx, w, hh, p) => {
    const [, f, rx, ry] = F[key], m = plot(w, hh, rx, ry); m.axes(ctx, p, { xlabel: "x", ylabel: "f(x)" }); curve(ctx, m, f, rx[0], rx[1], { color: p.accent, width: 4, clip: clip(m), steps: 400 });
    for (const c of crit(f)) dot(ctx, m.X(c.x), m.Y(f(c.x)), 7, c.kind === "minimum" ? p.good : c.kind === "maximum" ? p.warm : p.muted);
    dot(ctx, m.X(x), m.Y(f(x)), 5, p.ink);
  });
  function update() {
    const f = F[key][1], cs = crit(f), mins = cs.filter((c) => c.kind === "minimum"), best = mins.length ? mins.reduce((a, b) => (f(b.x) < f(a.x) ? b : a)) : null;
    st.set("cp", cs.map((c) => `x = ${fmt(c.x, 2)}: ${c.kind}${c === best && mins.length > 1 ? " (global)" : ""}`).join("   ·   ") || "none"); st.set("at", `slope ${fmt(d1(f, x), 3)}, curvature ${fmt(d2(f, x), 3)}`); say(`${cs.length} flat spots`); cv.redraw();
  }
  update();
  return () => cv.destroy();
}
