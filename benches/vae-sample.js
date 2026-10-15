// Bench: the reparameterization trick and KL divergence to a standard normal, for one latent dimension.
import { curve, clip, normPdf } from "./mathkit.js";

export default function mount(root, kit) {
  const { frame, canvas, plot, slider, stats, live, button } = kit;
  const body = frame(root, { title: "Sampling from a learned distribution" });
  const say = live(body);
  let mu = 0.5, logVar = -0.2, eps = 1.2;

  const cv = canvas(body, { aspect: 0.55, label: "This input's learned distribution against the standard normal target" });
  const st = stats([["z", "sampled z = μ + σ·ε"], ["kl", "KL divergence to N(0,1)"]]);
  const sm = slider({ label: "μ (mean)", min: -2, max: 2, step: 0.1, value: mu, format: (v) => v.toFixed(1), onInput: (v) => { mu = v; update(); } });
  const sv = slider({ label: "log(σ²)", min: -2, max: 2, step: 0.1, value: logVar, format: (v) => v.toFixed(1), onInput: (v) => { logVar = v; update(); } });
  const se = slider({ label: "ε (random draw)", min: -3, max: 3, step: 0.1, value: eps, format: (v) => v.toFixed(1), onInput: (v) => { eps = v; update(); } });
  const bRow = button("Match standard normal (μ=0, logσ²=0)", () => { mu = 0; logVar = 0; sm.set(mu); sv.set(logVar); update(); });
  body.append(cv.box, st.el, sm.el, sv.el, se.el, bRow);

  cv.onDraw((ctx, w, hh, p) => {
    const sigma = Math.exp(logVar / 2);
    const m = plot(w, hh, [-4, 4], [0, 1]);
    m.axes(ctx, p, { xlabel: "z", ylabel: "density" });
    curve(ctx, m, (x) => normPdf(x, 0, 1), -4, 4, { color: p.muted, width: 2.5, dash: [5, 4], clip: clip(m) });
    curve(ctx, m, (x) => normPdf(x, mu, sigma), -4, 4, { color: p.accent, width: 3, clip: clip(m) });
    const z = mu + sigma * eps;
    ctx.fillStyle = p.warm; ctx.beginPath(); ctx.arc(m.X(z), m.Y(0.02), 6, 0, 7); ctx.fill();
  });

  function update() {
    const sigma = Math.exp(logVar / 2), variance = Math.exp(logVar);
    const z = mu + sigma * eps;
    const kl = 0.5 * (variance + mu * mu - 1 - logVar);
    st.set("z", z.toFixed(4));
    st.set("kl", kl.toFixed(4));
    say(`z = ${z.toFixed(3)}, KL divergence ${kl.toFixed(3)}`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
