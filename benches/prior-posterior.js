// Bench: prior, likelihood and posterior for a coin.
import { curve, clip, betaPdf } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, canvas, stats, plot, fmt, live } = kit;
  const body = frame(root, { title: "Beliefs before and after the data" });
  const say = live(body);
  let s = 1, hd = 7, n = 10;
  const ss = slider({ label: "prior belief the coin is fair: Beta(s, s), strength s", min: 1, max: 30, step: 1, value: s, onInput: (v) => { s = v; update(); } });
  const sn = slider({ label: "flips", min: 1, max: 200, step: 1, value: n, onInput: (v) => { n = v; hd = Math.min(hd, n); sh.input.max = n; sh.set(hd, true); update(); } });
  const sh = slider({ label: "heads", min: 0, max: 200, step: 1, value: hd, onInput: (v) => { hd = Math.min(v, n); update(); } });
  const cv = canvas(body, { aspect: 0.55, label: "The prior, the likelihood and the posterior for the coin's heads-chance" });
  const st = stats([["post", "posterior distribution"], ["pm", "posterior mean"], ["mle", "maximum-likelihood estimate (heads ÷ flips)"]]);
  body.append(cv.box, st.el, h("div", { class: "bench-controls" }, ss.el, sn.el, sh.el));
  cv.onDraw((ctx, w, hh, p) => {
    const f = [(q) => betaPdf(q, s, s), (q) => betaPdf(q, hd + 1, n - hd + 1), (q) => betaPdf(q, s + hd, s + n - hd)], top = Math.max(...[0.01, 0.99].map(() => 0), ...f.map((g) => { let m = 0; for (let q = 0.01; q < 1; q += 0.01) m = Math.max(m, g(q)); return m; })) * 1.1, m = plot(w, hh, [0, 1], [0, top]);
    m.axes(ctx, p, { xlabel: "heads-chance p", ylabel: "density" });
    [[f[0], p.muted, 2.5, [6, 4]], [f[1], p.warm, 2.5, [2, 3]], [f[2], p.accent, 4, null]].forEach(([g, col, wd, dash]) => curve(ctx, m, g, 0.005, 0.995, { color: col, width: wd, dash, clip: clip(m), steps: 300 }));
    ctx.font = "800 11px Nunito, system-ui, sans-serif"; ctx.textAlign = "left"; [["prior", p.muted], ["likelihood (scaled)", p.warm], ["posterior", p.accent]].forEach(([t, c], i) => { ctx.fillStyle = c; ctx.fillText(t, m.pad.l + 8, m.pad.t + 12 + i * 14); });
  });
  function update() { const a = s + hd, b = s + n - hd; st.set("post", `Beta(${a}, ${b})`); st.set("pm", fmt(a / (a + b), 3)); st.set("mle", fmt(hd / n, 3)); say(`Posterior mean ${fmt(a / (a + b), 2)}`); cv.redraw(); }
  update();
  return () => cv.destroy();
}
