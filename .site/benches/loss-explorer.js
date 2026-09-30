// Bench: how squared, absolute and Huber losses treat errors, and how one outlier changes the average.
import { curve, clip, dot } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, choice, canvas, stats, plot, fmt, live } = kit;
  const body = frame(root, { title: "How different losses punish errors" });
  const say = live(body);
  const L = { sq: ["squared", (e) => e * e], abs: ["absolute", Math.abs], hub: ["Huber (δ = 1)", (e) => (Math.abs(e) <= 1 ? 0.5 * e * e : Math.abs(e) - 0.5)] };
  const errs = [-1, 1, 2, 0.5, -0.5];
  let show = "sq";
  const sl = errs.map((v, i) => slider({ label: `error ${i + 1}`, min: -8, max: 8, step: 0.5, value: v, format: (x) => fmt(x, 1), onInput: (x) => { errs[i] = x; update(); } }));
  const ch = choice("Curve shown", Object.entries(L).map(([k, v]) => [k, v[0]]), show, (k) => { show = k; update(); });
  const cv = canvas(body, { aspect: 0.55, label: "Loss as a function of error for squared, absolute and Huber loss with the five errors marked" });
  const st = stats(Object.entries(L).map(([k, v]) => [k, `average ${v[0]} loss`]));
  body.append(cv.box, st.el, ch.el, h("div", { class: "bench-controls" }, sl.map((s) => s.el)));
  cv.onDraw((ctx, w, hh, p) => {
    const m = plot(w, hh, [-8, 8], [0, 32]); m.axes(ctx, p, { xlabel: "error (prediction − truth)", ylabel: "loss" });
    Object.entries(L).forEach(([k, [, f]], i) => curve(ctx, m, f, -8, 8, { color: [p.accent, p.warm, p.good][i], width: k === show ? 4 : 2, clip: clip(m), dash: k === show ? null : [5, 4] }));
    for (const e of errs) dot(ctx, m.X(e), m.Y(Math.min(32, L[show][1](e))), 5, p.ink);
    ctx.font = "800 11px Nunito, system-ui, sans-serif"; ctx.textAlign = "left"; Object.entries(L).forEach(([k, [t]], i) => { ctx.fillStyle = [p.accent, p.warm, p.good][i]; ctx.fillText(t, m.pad.l + 8, m.pad.t + 12 + i * 14); });
  });
  function update() { for (const [k, [, f]] of Object.entries(L)) st.set(k, fmt(errs.reduce((s, e) => s + f(e), 0) / errs.length, 3)); say("Losses updated"); cv.redraw(); }
  update();
  return () => cv.destroy();
}
