// Bench: a softmax policy over three actions, nudged after every reward (REINFORCE), with or without a baseline.
import { rng } from "./mlkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, toggles, button, canvas, stats, stepper, plot, live, fmt } = kit;
  const body = frame(root, { title: "Nudge the probabilities toward what paid" });
  const say = live(body);
  const MU = [4.2, 4.6, 5.0];
  let lr = 0.1, useBase = true, seed = 9;
  const init = () => ({ th: [0, 0, 0], base: 0, n: 0, r: rng(seed), hist: [] });
  let S = init();
  const sm = (th) => { const m = Math.max(...th), e = th.map((t) => Math.exp(t - m)), z = e.reduce((a, b) => a + b, 0); return e.map((v) => v / z); };
  const sl = slider({ label: "learning rate", min: 0.02, max: 0.3, step: 0.02, value: lr, format: (v) => fmt(v, 2), onInput: (v) => { lr = v; } });
  const tg = toggles([["b", "subtract the average reward (baseline)", true]], (v) => { useBase = v.b; });
  const cv = canvas(body, { aspect: 0.5, label: "Probability of each of three actions over time" });
  const st = stats([["n", "actions taken"], ["p", "probabilities (A, B, C)"], ["q", "true average rewards"]]);
  const sp = stepper({ interval: 120, stepLabel: "Take 1 action", onStep: () => { stepOnce(); update(); }, onReset: () => { S = init(); update(); } });
  body.append(cv.box, st.el, sl.el, tg.el, sp.el, h("div", { class: "bench-row" }, button("Take 100 actions", () => { for (let i = 0; i < 100; i++) stepOnce(); update(); }), button("Start a new run", () => { sp.stop(); seed++; S = init(); update(); })));
  function stepOnce() { const p = sm(S.th); let u = S.r(), a = 0, acc = 0; for (; a < 3; a++) { acc += p[a]; if (u <= acc) break; } a = Math.min(a, 2); const rew = MU[a] + 0.5 * S.r.gauss(), adv = rew - (useBase ? S.base : 0); S.n++; S.base += (rew - S.base) / S.n; for (let j = 0; j < 3; j++) S.th[j] += lr * adv * ((j === a ? 1 : 0) - p[j]); if (S.n % 5 === 0 || S.n < 30) S.hist.push({ n: S.n, p: sm(S.th) }); }
  cv.onDraw((ctx, w, hh, p) => { const m = plot(w, hh, [0, Math.max(60, S.n)], [0, 1], { l: 44, r: 14, t: 12, b: 32 }); m.axes(ctx, p, { xlabel: "actions taken", ylabel: "probability", ticks: 3 }); const cols = [p.muted, p.accent, p.warm];
    for (let a = 0; a < 3; a++) { ctx.strokeStyle = cols[a]; ctx.lineWidth = a === 2 ? 3.5 : 2.5; ctx.beginPath(); [{ n: 0, p: [1 / 3, 1 / 3, 1 / 3] }, ...S.hist].forEach((q, i) => { const X = m.X(q.n), Y = m.Y(q.p[a]); i ? ctx.lineTo(X, Y) : ctx.moveTo(X, Y); }); ctx.stroke(); } ctx.font = "800 11px Nunito, system-ui"; ctx.textAlign = "left"; ["A (4.2)", "B (4.6)", "C (5.0)"].forEach((t, a) => { ctx.fillStyle = cols[a]; ctx.fillText(t, m.pad.l + 8, m.pad.t + 14 + 14 * a); }); });
  function update() { const p = sm(S.th); st.set("n", S.n); st.set("p", p.map((v) => fmt(v, 2)).join(", ")); st.set("q", MU.join(", ")); say(`Probability of the best action ${fmt(p[2], 2)}`); cv.redraw(); }
  update(); return () => { sp.stop(); cv.destroy(); };
}
