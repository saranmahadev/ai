// Bench: a generative classifier (class-wise Gaussians) against a discriminative one (logistic regression).
import { rng, blobs, logisticFit, scatter, boundaryLine, accuracy, logisticProb } from "./mlkit.js";
export default function mount(root, kit) {
  const { h, frame, toggles, canvas, stats, plot, live, fmt } = kit;
  const body = frame(root, { title: "Model the classes, or model the boundary" });
  const say = live(body);
  const base = blobs(rng(15), 60, [-0.9, -0.3], [0.9, 0.3], 0.7), extra = Array.from({ length: 8 }, (_, i) => ({ x: 4.2 + 0.1 * (i % 4), y: 0.3 + 0.25 * ((i * 3) % 5 - 2) * 0.4, c: 1 }));
  let withExtra = false;
  const tg = toggles([["e", "add 8 extreme but easy class-1 points on the far right", false]], (v) => { withExtra = v.e; update(); });
  const cv = canvas(body, { aspect: 0.6, label: "Two classes with the boundary from a generative model and from logistic regression" });
  const st = stats([["g", "generative accuracy"], ["d", "logistic accuracy"]]);
  body.append(cv.box, st.el, tg.el);
  let gen, log;
  const gaussians = (d) => { const m = [0, 1].map((c) => { const q = d.filter((p) => p.c === c); return [q.reduce((s, p) => s + p.x, 0) / q.length, q.reduce((s, p) => s + p.y, 0) / q.length]; }); let ss = 0; d.forEach((p) => { ss += (p.x - m[p.c][0]) ** 2 + (p.y - m[p.c][1]) ** 2; }); const s2 = ss / (2 * d.length), n1 = d.filter((p) => p.c).length / d.length;
    const w1 = (m[1][0] - m[0][0]) / s2, w2 = (m[1][1] - m[0][1]) / s2, b = -((m[1][0] ** 2 + m[1][1] ** 2) - (m[0][0] ** 2 + m[0][1] ** 2)) / (2 * s2) + Math.log(n1 / (1 - n1)); return [b, w1, w2]; };
  cv.onDraw((ctx, w, hh, p) => { const m = plot(w, hh, [-3, 5.2], [-3, 3]); m.axes(ctx, p); scatter(ctx, m, withExtra ? [...base, ...extra] : base, p, { r: 4.5 }); boundaryLine(ctx, m, gen, p.warm, { rx: [-3, 5.2] }); boundaryLine(ctx, m, log, p.ink, { rx: [-3, 5.2], dash: [7, 5] }); ctx.font = "800 12px Nunito, system-ui"; ctx.fillStyle = p.warm; ctx.fillText("— generative", m.pad.l + 8, m.pad.t + 14); ctx.fillStyle = p.ink; ctx.fillText("- - logistic", m.pad.l + 8, m.pad.t + 30); });
  function update() { const d = withExtra ? [...base, ...extra] : base; gen = gaussians(d); log = logisticFit(d.map((p) => [p.x, p.y]), d.map((p) => p.c), { iters: 1500, lr: 0.4 });
    st.set("g", fmt(accuracy(base, (p) => (gen[0] + gen[1] * p.x + gen[2] * p.y > 0 ? 1 : 0)) * 100, 0) + "%"); st.set("d", fmt(accuracy(base, (p) => (logisticProb(log, [p.x, p.y]) > 0.5 ? 1 : 0)) * 100, 0) + "%"); say("Both boundaries updated"); cv.redraw(); }
  update(); return () => cv.destroy();
}
