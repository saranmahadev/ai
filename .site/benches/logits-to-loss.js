// Bench: logits, softmax with temperature, and cross-entropy.
export default function mount(root, kit) {
  const { h, frame, slider, choice, canvas, stats, fmt, live } = kit;
  const body = frame(root, { title: "From scores to probabilities to loss" });
  const say = live(body);
  const z = [2, 1, 0.1]; let T = 1, cls = 0;
  const sl = z.map((v, i) => slider({ label: `score of class ${"ABC"[i]}`, min: -5, max: 5, step: 0.1, value: v, format: (x) => fmt(x, 1), onInput: (x) => { z[i] = x; update(); } }));
  const sT = slider({ label: "temperature T", min: 0.25, max: 4, step: 0.05, value: T, format: (x) => fmt(x, 2), onInput: (x) => { T = x; update(); } });
  const ch = choice("True class", [[0, "A"], [1, "B"], [2, "C"]], cls, (v) => { cls = +v; update(); });
  const cv = canvas(body, { aspect: 0.4, maxH: 250, label: "Softmax probabilities of three classes" });
  const st = stats([["p", "probabilities"], ["L", "loss −ln p(true class)"], ["g", "gradient p − target (for each score)"]]);
  body.append(cv.box, st.el, ch.el, h("div", { class: "bench-controls" }, sl.map((s) => s.el), sT.el));
  const soft = () => { const s = z.map((v) => v / T), m = Math.max(...s), e = s.map((v) => Math.exp(v - m)), t = e.reduce((a, b) => a + b, 0); return e.map((v) => v / t); };
  cv.onDraw((ctx, w, hh, p) => { const P = soft(), base = hh - 26; P.forEach((q, i) => { const x = 40 + ((i + 0.5) / 3) * (w - 80), bh = q * (base - 14); ctx.fillStyle = i === cls ? p.warm : p.accent; ctx.fillRect(x - 26, base - bh, 52, bh); ctx.fillStyle = p.ink; ctx.font = "800 12px Nunito, system-ui, sans-serif"; ctx.textAlign = "center"; ctx.fillText(fmt(q, 3), x, base - bh - 6); ctx.fillText("ABC"[i] + (i === cls ? " (true)" : ""), x, base + 16); }); });
  function update() { const P = soft(); st.set("p", P.map((q) => fmt(q, 3)).join("   ")); st.set("L", fmt(-Math.log(Math.max(1e-12, P[cls])), 4)); st.set("g", P.map((q, i) => fmt((q - (i === cls ? 1 : 0)), 3)).join("   ")); say(`Loss ${fmt(-Math.log(P[cls]), 3)}`); cv.redraw(); }
  update();
  return () => cv.destroy();
}
