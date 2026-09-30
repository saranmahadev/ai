// Bench: expectation-maximisation fitting two bell curves to a one-dimensional sample.
import { rng, emStep } from "./mlkit.js";
export default function mount(root, kit) {
  const { h, frame, canvas, stats, stepper, plot, live, fmt } = kit;
  const body = frame(root, { title: "Two bells by EM" });
  const say = live(body);
  const r = rng(4), xs = Array.from({ length: 80 }, (_, i) => (i % 2 ? 5 + 0.9 * r.gauss() : 1.5 + 0.7 * r.gauss()));
  const init = () => [{ w: 0.5, mu: 2.5, sd: 1.5 }, { w: 0.5, mu: 3.5, sd: 1.5 }];
  let comps = init(), ll = emStep(xs, comps).ll, steps = 0, R = emStep(xs, comps).R;
  const pdf = (x, c) => Math.exp(-((x - c.mu) ** 2) / (2 * c.sd * c.sd)) / (c.sd * Math.sqrt(2 * Math.PI));
  const cv = canvas(body, { aspect: 0.5, label: "A one-dimensional sample with two fitted bell curves" });
  const st = stats([["s", "steps"], ["l", "log-likelihood"], ["a", "bell 1: weight, mean, spread"], ["b", "bell 2: weight, mean, spread"]]);
  const sp = stepper({ interval: 450, stepLabel: "One EM step", onStep: () => { const e = emStep(xs, comps); comps = e.comps; steps++; const n = emStep(xs, comps); ll = n.ll; R = n.R; update(); if (Math.abs(n.ll - e.ll) < 1e-4) return false; }, onReset: () => { comps = init(); steps = 0; const n = emStep(xs, comps); ll = n.ll; R = n.R; update(); } });
  body.append(cv.box, st.el, sp.el);
  cv.onDraw((ctx, w, hh, p) => { const m = plot(w, hh, [-1, 8], [0, 0.75], { l: 16, r: 14, t: 10, b: 32 }); m.axes(ctx, p, { xlabel: "value", ticks: 4 });
    xs.forEach((x, i) => { const t = R[i][1]; ctx.fillStyle = t > 0.5 ? p.warm : p.accent; ctx.globalAlpha = 0.35 + 0.65 * Math.abs(t - 0.5) * 2; ctx.beginPath(); ctx.arc(m.X(x), m.pad.t + m.ih - 6 - (i % 5) * 7, 4, 0, 7); ctx.fill(); }); ctx.globalAlpha = 1;
    comps.forEach((c, k) => { ctx.strokeStyle = k ? p.warm : p.accent; ctx.lineWidth = 3; ctx.beginPath(); for (let i = 0; i <= 160; i++) { const x = -1 + (9 * i) / 160, y = c.w * pdf(x, c); i ? ctx.lineTo(m.X(x), m.Y(y)) : ctx.moveTo(m.X(x), m.Y(y)); } ctx.stroke(); }); });
  function update() { st.set("s", steps); st.set("l", fmt(ll, 1)); comps.forEach((c, k) => st.set(k ? "b" : "a", `${fmt(c.w, 2)}, ${fmt(c.mu, 2)}, ${fmt(c.sd, 2)}`)); say(`Step ${steps}, log-likelihood ${fmt(ll, 1)}`); cv.redraw(); }
  update(); return () => { sp.stop(); cv.destroy(); };
}
