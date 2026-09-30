// Bench: entropy of a four-outcome distribution.
import { entropy, norm1 } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, canvas, stats, fmt, live } = kit;
  const body = frame(root, { title: "Entropy of a distribution" });
  const say = live(body);
  const w = [4, 2, 1, 1];
  const sl = w.map((v, i) => slider({ label: `weight of outcome ${"ABCD"[i]}`, min: 0, max: 10, step: 1, value: v, onInput: (x) => { w[i] = x; update(); } }));
  const cv = canvas(body, { aspect: 0.5, maxH: 300, label: "Bars for four probabilities" });
  const st = stats([["p", "probabilities"], ["s", "surprise of each outcome (bits)"], ["h", "entropy H = average surprise"], ["max", "largest possible for 4 outcomes"]]);
  body.append(cv.box, st.el, h("div", { class: "bench-controls" }, sl.map((s) => s.el)));
  cv.onDraw((ctx, W, H, p) => { const P = norm1(w), base = H - 30, top = 12; P.forEach((q, i) => { const x = 30 + ((i + 0.5) / 4) * (W - 60), bh = q * (base - top); ctx.fillStyle = p.accent; ctx.fillRect(x - 24, base - bh, 48, bh); ctx.fillStyle = p.ink; ctx.font = "800 12px Nunito, system-ui, sans-serif"; ctx.textAlign = "center"; ctx.fillText("ABCD"[i], x, base + 16); ctx.fillText(fmt(q, 2), x, base - bh - 6); }); });
  function update() { const P = norm1(w); st.set("p", P.map((q) => fmt(q, 3)).join("  ")); st.set("s", P.map((q) => (q > 0 ? fmt(-Math.log2(q), 2) : "∞")).join("  ")); st.set("h", `${fmt(entropy(P), 4)} bits`); st.set("max", "2 bits (all four equal)"); say(`Entropy ${fmt(entropy(P), 3)} bits`); cv.redraw(); }
  update();
  return () => cv.destroy();
}
