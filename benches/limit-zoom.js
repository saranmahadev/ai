// Bench: sneak up on a limit from the left and right.
import { curve, clip, dot } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, choice, canvas, stats, plot, fmt, live } = kit;
  const body = frame(root, { title: "Sneak up on a limit" });
  const say = live(body);
  const F = {
    a: { name: "(x² − 4)/(x − 2) at 2", f: (x) => (Math.abs(x - 2) < 1e-12 ? NaN : (x * x - 4) / (x - 2)), at: 2, limit: "4", yr: [0, 8] },
    b: { name: "sin x / x at 0", f: (x) => (Math.abs(x) < 1e-12 ? NaN : Math.sin(x) / x), at: 0, limit: "1", yr: [-0.3, 1.3] },
    c: { name: "(1 − cos x)/x² at 0", f: (x) => (Math.abs(x) < 1e-12 ? NaN : (1 - Math.cos(x)) / (x * x)), at: 0, limit: "0.5", yr: [-0.1, 0.7] },
    d: { name: "a step at 0", f: (x) => (x < 0 ? -1 : 1), at: 0, limit: "does not exist (left −1, right +1)", yr: [-2, 2] }
  };
  let key = "a", k = 0;
  const sk = slider({ label: "how close: distance = 10^(−k)", min: 0, max: 5, step: 0.25, value: k, format: (v) => "10^-" + v, onInput: (v) => { k = v; update(); } });
  const ch = choice("Function", Object.entries(F).map(([id, v]) => [id, v.name]), key, (v) => { key = v; update(); });
  const cv = canvas(body, { aspect: 0.55, label: "A curve near a point with points approaching it from both sides" });
  const st = stats([["d", "distance"], ["l", "value just left"], ["r", "value just right"], ["lim", "the limit"]]);
  body.append(cv.box, st.el, ch.el, h("div", { class: "bench-controls" }, sk.el));
  cv.onDraw((ctx, w, hh, p) => {
    const { f, at, yr } = F[key], m = plot(w, hh, [at - 2, at + 2], yr), d = 10 ** -k; m.axes(ctx, p, { xlabel: "x", ylabel: "f(x)" });
    curve(ctx, m, f, at - 2, at + 2, { color: p.accent, width: 3.5, clip: clip(m), steps: 600 });
    ctx.strokeStyle = p.muted; ctx.setLineDash([4, 4]); ctx.beginPath(); ctx.moveTo(m.X(at), m.pad.t); ctx.lineTo(m.X(at), m.pad.t + m.ih); ctx.stroke(); ctx.setLineDash([]);
    for (const s of [-1, 1]) { const x = at + s * Math.max(d, 0.02), y = f(x); if (Number.isFinite(y)) dot(ctx, m.X(x), m.Y(y), 6, s < 0 ? p.warm : p.good); }
  });
  function update() { const { f, at, limit } = F[key], d = 10 ** -k; st.set("d", d.toPrecision(2)); st.set("l", fmt(f(at - d), 6)); st.set("r", fmt(f(at + d), 6)); st.set("lim", limit); say(`Distance ${d.toPrecision(2)}`); cv.redraw(); }
  update();
  return () => cv.destroy();
}
