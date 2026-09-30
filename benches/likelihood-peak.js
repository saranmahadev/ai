// Bench: the likelihood of a coin's heads-chance peaks at the observed fraction.
import { curve, clip, dot } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, toggles, canvas, stats, plot, fmt, live } = kit;
  const body = frame(root, { title: "Slide the parameter, watch the likelihood peak" });
  const say = live(body);
  let n = 10, hd = 7, p0 = 0.5, log = false;
  const sn = slider({ label: "number of flips", min: 5, max: 100, step: 1, value: n, onInput: (v) => { n = v; if (hd > n) { hd = n; sh.set(hd, true); } sh.input.max = n; update(); } });
  const sh = slider({ label: "heads observed", min: 0, max: 100, step: 1, value: hd, onInput: (v) => { hd = Math.min(v, n); update(); } });
  const sp = slider({ label: "heads-chance p to try", min: 0.01, max: 0.99, step: 0.01, value: p0, format: (v) => fmt(v, 2), onInput: (v) => { p0 = v; update(); } });
  const tg = toggles([["log", "show the log-likelihood", false]], (v) => { log = v.log; update(); });
  const cv = canvas(body, { aspect: 0.55, label: "The likelihood of the observed flips as a function of p" });
  const st = stats([["L", "likelihood of the sequence at your p"], ["mle", "best p (maximum likelihood)"], ["rel", "your likelihood relative to the best"]]);
  body.append(cv.box, st.el, h("div", { class: "bench-controls" }, sn.el, sh.el, sp.el), tg.el);
  const ll = (p) => hd * Math.log(p) + (n - hd) * Math.log(1 - p);
  cv.onDraw((ctx, w, hh, p) => {
    const best = hd / n, lb = ll(Math.min(0.999, Math.max(0.001, best))), f = (q) => (log ? Math.max(-12, ll(q) - lb) : Math.exp(ll(q) - lb)), m = plot(w, hh, [0, 1], log ? [-12, 0.5] : [0, 1.1]);
    m.axes(ctx, p, { xlabel: "p", ylabel: log ? "log-likelihood (relative to best)" : "likelihood (relative to best)" }); curve(ctx, m, (q) => f(Math.min(0.999, Math.max(0.001, q))), 0.001, 0.999, { color: p.accent, width: 4, clip: clip(m), steps: 400 });
    ctx.strokeStyle = p.good; ctx.setLineDash([5, 4]); ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(m.X(best), m.pad.t); ctx.lineTo(m.X(best), m.pad.t + m.ih); ctx.stroke(); ctx.setLineDash([]); dot(ctx, m.X(p0), m.Y(f(p0)), 7, p.warm);
  });
  function update() { const best = hd / n, lb = ll(Math.min(0.999, Math.max(0.001, best))); st.set("L", `${(Math.exp(ll(p0))).toExponential(3)}`); st.set("mle", fmt(best, 3)); st.set("rel", fmt(Math.exp(ll(p0) - lb) * 100, 1) + "% of the peak"); say(`Best p is ${fmt(best, 2)}`); cv.redraw(); }
  update();
  return () => cv.destroy();
}
