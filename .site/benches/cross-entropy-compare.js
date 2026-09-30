// Bench: cross-entropy of a predicted distribution against a true one.
import { entropy, norm1 } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, choice, canvas, stats, fmt, live } = kit;
  const body = frame(root, { title: "True versus predicted distribution" });
  const say = live(body);
  const t = [5, 5, 0], q = [9, 1, 1]; let onehot = false, cls = 0;
  const mk = (arr, name, i, max) => slider({ label: `${name} weight of class ${"ABC"[i]}`, min: 0, max, step: 1, value: arr[i], onInput: (v) => { arr[i] = v; update(); } });
  const st1 = [0, 1, 2].map((i) => mk(t, "true", i, 10)), sq = [0, 1, 2].map((i) => mk(q, "predicted", i, 20));
  const ch = choice("Truth", [["dist", "a mixed distribution"], ["hot", "one-hot: the answer is class A"]], "dist", (v) => { onehot = v === "hot"; update(); });
  const cv = canvas(body, { aspect: 0.45, maxH: 260, label: "True and predicted probabilities for three classes" });
  const st = stats([["h", "entropy of the truth H(p)"], ["ce", "cross-entropy H(p, q)"], ["kl", "excess: H(p, q) − H(p)  (the KL divergence)"]]);
  body.append(cv.box, st.el, ch.el, h("div", { class: "bench-controls" }, st1.map((s) => s.el), sq.map((s) => s.el)));
  const P = () => (onehot ? [1, 0, 0] : norm1(t)), Q = () => norm1(q.map((v) => v + 1e-9));
  cv.onDraw((ctx, w, hh, pc) => { const p = P(), qq = Q(), base = hh - 26; [0, 1, 2].forEach((i) => { const x = 40 + ((i + 0.5) / 3) * (w - 80); [[p[i], pc.accent, -22], [qq[i], pc.warm, 4]].forEach(([v, col, dx]) => { const bh = v * (base - 14); ctx.fillStyle = col; ctx.fillRect(x + dx, base - bh, 18, bh); ctx.fillStyle = pc.ink; ctx.font = "700 10px Nunito, system-ui, sans-serif"; ctx.textAlign = "center"; ctx.fillText(fmt(v, 2), x + dx + 9, base - bh - 4); }); ctx.fillStyle = pc.ink; ctx.font = "800 12px Nunito, system-ui, sans-serif"; ctx.fillText("ABC"[i], x, base + 16); }); ctx.font = "800 11px Nunito, system-ui, sans-serif"; ctx.textAlign = "left"; ctx.fillStyle = pc.accent; ctx.fillText("true", 8, 14); ctx.fillStyle = pc.warm; ctx.fillText("predicted", 8, 28); });
  function update() { const p = P(), qq = Q(), ce = -p.reduce((s, x, i) => s + (x > 0 ? x * Math.log2(qq[i]) : 0), 0); st.set("h", `${fmt(entropy(p), 4)} bits`); st.set("ce", `${fmt(ce, 4)} bits`); st.set("kl", `${fmt(ce - entropy(p), 4)} bits`); say(`Cross-entropy ${fmt(ce, 3)} bits`); cv.redraw(); }
  update();
  return () => cv.destroy();
}
