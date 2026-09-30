// Bench: KL divergence in both directions; drive it to zero by matching the distributions.
import { norm1 } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, button, canvas, stats, fmt, live } = kit;
  const body = frame(root, { title: "Match one distribution to another" });
  const say = live(body);
  const t = [5, 3, 2], q = [1, 1, 8];
  const mk = (arr, name, i) => slider({ label: `${name} weight of outcome ${"ABC"[i]}`, min: 0, max: 10, step: 1, value: arr[i], onInput: (v) => { arr[i] = v; update(); } });
  const st1 = [0, 1, 2].map((i) => mk(t, "target", i)), sq = [0, 1, 2].map((i) => mk(q, "prediction", i));
  const cv = canvas(body, { aspect: 0.45, maxH: 260, label: "Target and predicted probabilities" });
  const st = stats([["pq", "D(p ‖ q): target p, prediction q"], ["qp", "D(q ‖ p): swapped"]]);
  body.append(cv.box, st.el, h("div", { class: "bench-controls" }, st1.map((s) => s.el), sq.map((s) => s.el)), h("div", { class: "bench-row" }, button("Set the prediction equal to the target", () => { q.splice(0, 3, ...t); sq.forEach((s, i) => s.set(q[i], true)); update(); })));
  const P = () => norm1(t), Q = () => norm1(q.map((v) => v + 1e-9));
  const kl = (a, b) => a.reduce((s, x, i) => s + (x > 0 ? x * Math.log2(x / b[i]) : 0), 0);
  cv.onDraw((ctx, w, hh, pc) => { const p = P(), qq = Q(), base = hh - 26; [0, 1, 2].forEach((i) => { const x = 40 + ((i + 0.5) / 3) * (w - 80); [[p[i], pc.accent, -22], [qq[i], pc.warm, 4]].forEach(([v, col, dx]) => { const bh = v * (base - 14); ctx.fillStyle = col; ctx.fillRect(x + dx, base - bh, 18, bh); ctx.fillStyle = pc.ink; ctx.font = "700 10px Nunito, system-ui, sans-serif"; ctx.textAlign = "center"; ctx.fillText(fmt(v, 2), x + dx + 9, base - bh - 4); }); ctx.fillStyle = pc.ink; ctx.font = "800 12px Nunito, system-ui, sans-serif"; ctx.fillText("ABC"[i], x, base + 16); }); ctx.font = "800 11px Nunito, system-ui, sans-serif"; ctx.textAlign = "left"; ctx.fillStyle = pc.accent; ctx.fillText("target p", 8, 14); ctx.fillStyle = pc.warm; ctx.fillText("prediction q", 8, 28); });
  function update() { const p = P(), qq = Q(); st.set("pq", `${fmt(kl(p, qq), 4)} bits`); st.set("qp", `${fmt(kl(qq, p), 4)} bits`); say(`Divergence ${fmt(kl(p, qq), 3)} bits`); cv.redraw(); }
  update();
  return () => cv.destroy();
}
