// Bench: Bernoulli, binomial and Poisson distributions.
import { choose, factorial, bars } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, choice, canvas, stats, plot, fmt, live } = kit;
  const body = frame(root, { title: "Bernoulli, binomial and Poisson" });
  const say = live(body);
  let kind = "binom", p = 0.3, n = 10, lam = 3, k = 3;
  const ch = choice("Distribution", [["bern", "Bernoulli(p)"], ["binom", "Binomial(n, p)"], ["pois", "Poisson(λ)"]], kind, (v) => { kind = v; update(); });
  const sp = slider({ label: "p (success chance)", min: 0.05, max: 0.95, step: 0.05, value: p, format: (v) => fmt(v, 2), onInput: (v) => { p = v; update(); } });
  const sn = slider({ label: "n (trials)", min: 1, max: 30, step: 1, value: n, onInput: (v) => { n = v; update(); } });
  const sl = slider({ label: "λ (average rate)", min: 0.5, max: 12, step: 0.5, value: lam, format: (v) => fmt(v, 1), onInput: (v) => { lam = v; update(); } });
  const sk = slider({ label: "mark the count k", min: 0, max: 30, step: 1, value: k, onInput: (v) => { k = v; update(); } });
  const cv = canvas(body, { aspect: 0.55, label: "Bars showing the probability of each count" });
  const st = stats([["k", "P(exactly k)"], ["mean", "mean"], ["var", "variance"]]);
  body.append(cv.box, st.el, ch.el, h("div", { class: "bench-controls" }, sp.el, sn.el, sl.el, sk.el));
  const N = () => (kind === "bern" ? 1 : kind === "binom" ? n : 30);
  const pmf = (x) => (x < 0 || x > N() ? 0 : kind === "bern" ? (x ? p : 1 - p) : kind === "binom" ? choose(n, x) * p ** x * (1 - p) ** (n - x) : Math.exp(-lam) * lam ** x / factorial(x));
  cv.onDraw((ctx, w, hh, pc) => {
    const top = Math.max(...Array.from({ length: N() + 1 }, (_, i) => pmf(i)), 0.1) * 1.15, hi = kind === "pois" ? 25 : N(), m = plot(w, hh, [-0.5, hi + 0.5], [0, top]); m.axes(ctx, pc, { xlabel: "count", ylabel: "probability", ticks: Math.min(hi + 1, 8) });
    const cnt = Array.from({ length: hi + 1 }, (_, i) => pmf(i)); bars(ctx, m, cnt, -0.5, hi + 0.5, pc.accent); if (k <= hi) { ctx.fillStyle = pc.warm; ctx.fillRect(m.X(k - 0.5) + 1, m.Y(pmf(k)), m.X(k + 0.5) - m.X(k - 0.5) - 2, m.Y(0) - m.Y(pmf(k))); }
  });
  function update() { const mean = kind === "bern" ? p : kind === "binom" ? n * p : lam, v = kind === "bern" ? p * (1 - p) : kind === "binom" ? n * p * (1 - p) : lam; sp.el.hidden = kind === "pois"; sn.el.hidden = kind !== "binom"; sl.el.hidden = kind !== "pois"; st.set("k", `${fmt(pmf(k), 4)}`); st.set("mean", fmt(mean, 3)); st.set("var", fmt(v, 3)); say(`Probability of ${k} is ${fmt(pmf(k), 3)}`); cv.redraw(); }
  update();
  return () => cv.destroy();
}
