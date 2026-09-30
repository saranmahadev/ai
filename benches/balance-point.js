// Bench: the expectation is the balance point of the distribution.
export default function mount(root, kit) {
  const { h, frame, slider, canvas, stats, fmt, live } = kit;
  const body = frame(root, { title: "Where does the distribution balance?" });
  const say = live(body);
  const w = [1, 2, 4, 2, 1];
  const sl = w.map((v, i) => slider({ label: `weight of value ${i + 1}`, min: 0, max: 10, step: 1, value: v, onInput: (x) => { w[i] = x; update(); } }));
  const cv = canvas(body, { aspect: 0.5, maxH: 300, label: "Bars for five values balanced on a triangle at the expectation" });
  const st = stats([["p", "probabilities"], ["mean", "expectation E[X]"], ["mode", "most likely value"]]);
  body.append(cv.box, st.el, h("div", { class: "bench-controls" }, sl.map((s) => s.el)));
  const probs = () => { const t = w.reduce((a, b) => a + b, 0) || 1; return w.map((x) => x / t); };
  cv.onDraw((ctx, W, H, p) => {
    const P = probs(), X = (v) => 30 + ((v - 0.5) / 5) * (W - 60), base = H - 40, mean = P.reduce((s, q, i) => s + q * (i + 1), 0), top = Math.max(...P, 0.2);
    ctx.strokeStyle = p.muted; ctx.lineWidth = 3; ctx.beginPath(); ctx.moveTo(20, base); ctx.lineTo(W - 20, base); ctx.stroke();
    P.forEach((q, i) => { const hgt = (q / top) * (H - 90); ctx.fillStyle = p.accent; ctx.fillRect(X(i + 1) - 18, base - hgt, 36, hgt); ctx.fillStyle = p.ink; ctx.font = "800 12px Nunito, system-ui, sans-serif"; ctx.textAlign = "center"; ctx.fillText(String(i + 1), X(i + 1), base + 16); ctx.fillText(fmt(q, 2), X(i + 1), base - hgt - 6); });
    ctx.fillStyle = p.warm; ctx.beginPath(); ctx.moveTo(X(mean), base + 2); ctx.lineTo(X(mean) - 12, base + 24); ctx.lineTo(X(mean) + 12, base + 24); ctx.closePath(); ctx.fill();
  });
  function update() { const P = probs(), mean = P.reduce((s, q, i) => s + q * (i + 1), 0); st.set("p", P.map((q) => fmt(q, 2)).join("  ")); st.set("mean", fmt(mean, 3)); st.set("mode", String(P.indexOf(Math.max(...P)) + 1)); say(`Expectation ${fmt(mean, 2)}`); cv.redraw(); }
  update();
  return () => cv.destroy();
}
