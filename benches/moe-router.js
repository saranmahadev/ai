// Bench: route a token through a mixture of experts and compare active vs total feed-forward parameters.
import { routeTopK } from "./tfkit.js";
import { rng } from "./kit.js";

const D_MODEL = 4;
const PARAMS_PER_EXPERT = 76; // matches The Feed-Forward Sublayer's worked example (dFF=8, dModel=4)

export default function mount(root, kit) {
  const { frame, canvas, slider, stats, live } = kit;
  const body = frame(root, { title: "A router choosing which experts run" });
  const say = live(body);
  let x = [0.5, -0.3, 0.8, 0.1], numExperts = 8, topK = 2;

  const cv = canvas(body, { aspect: 0.5, label: "Router probability for each expert; selected experts highlighted" });
  const st = stats([["total", "total parameters"], ["active", "active parameters"], ["pct", "percent active"]]);
  const sliders = x.map((v, i) => slider({ label: `x[${i}]`, min: -1.5, max: 1.5, step: 0.1, value: v, format: (n) => n.toFixed(1), onInput: (n) => { x[i] = n; update(); } }));
  const slE = slider({ label: "number of experts", min: 2, max: 16, step: 1, value: numExperts, format: (v) => String(v), onInput: (v) => { numExperts = v; topK = Math.min(topK, v); update(); } });
  const slK = slider({ label: "top-k selected", min: 1, max: 16, step: 1, value: topK, format: (v) => String(v), onInput: (v) => { topK = Math.min(v, numExperts); update(); } });
  body.append(cv.box, st.el, ...sliders.map((s) => s.el), slE.el, slK.el);

  let probs = [], selected = [];
  cv.onDraw((ctx, w, hh, p) => {
    const bw = w / (numExperts + 1);
    const selectedSet = new Set(selected.map((e) => e.i));
    probs.forEach((prob, i) => {
      const bh = prob * (hh - 50);
      ctx.fillStyle = selectedSet.has(i) ? p.good : p.soft;
      ctx.fillRect(bw * (i + 0.5), hh - 24 - bh, bw * 0.6, bh);
      ctx.fillStyle = p.ink; ctx.font = "700 9px Nunito, system-ui, sans-serif"; ctx.textAlign = "center";
      ctx.fillText(`e${i}`, bw * (i + 0.5) + bw * 0.3, hh - 8);
    });
  });

  function update() {
    slK.input.max = numExperts;
    const rand = rng(41);
    const Wrouter = Array.from({ length: numExperts }, () => Array.from({ length: D_MODEL }, () => (rand() * 2 - 1) * 0.5));
    const r = routeTopK(x, Wrouter, topK);
    probs = r.probs;
    selected = r.selected;
    const total = numExperts * PARAMS_PER_EXPERT, active = topK * PARAMS_PER_EXPERT;
    st.set("total", total.toLocaleString());
    st.set("active", active.toLocaleString());
    st.set("pct", `${((active / total) * 100).toFixed(1)}%`);
    say(`selected experts: ${selected.map((e) => e.i).join(", ")}; ${((active / total) * 100).toFixed(1)}% of parameters active`);
    cv.redraw();
  }
  update();
  return () => cv.destroy();
}
