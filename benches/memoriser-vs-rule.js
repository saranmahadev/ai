// Bench: a model that memorises its examples aces the training set and stumbles on new data.
export default function mount(root, kit) {
  const { h, frame, slider, canvas, rng, plot, live, stats, fmt } = kit;
  const body = frame(root, {
    title: "Memorising vs learning the pattern"
  });
  const say = live(body);
  const gen = (seed, n) => { const r = rng(seed); return Array.from({ length: n }, () => { const x = r(), y = r(); let l = x + y > 1 ? 1 : 0; if (r() < 0.12) l = 1 - l; return { x, y, l }; }); };
  const pool = gen(3, 120), test = gen(77, 400);
  let n = 120, k = 1;
  const sn = slider({ label: "training examples", min: 20, max: 120, step: 10, value: n, format: (v) => v, onInput: (v) => { n = v; sk.input.max = Math.min(31, n); if (k > n) { k = n; sk.set(k, true); } update(); } });
  const sk = slider({ label: "k: how many neighbours vote (1 = pure memorising)", min: 1, max: 31, step: 2, value: k, format: (v) => v, onInput: (v) => { k = v; update(); } });
  const cv = canvas(body, { aspect: 0.75, label: "Scatter of noisy training points with the model's decision regions shaded" });
  const st = stats([["train", "accuracy on training examples"], ["test", "accuracy on new examples"], ["gap", "gap"]]);
  const out = h("p", { class: "bench-verdict" });
  body.append(cv.box, st.el, h("div", { class: "bench-controls" }, sn.el, sk.el));
  const predict = (tr, p) => { const d = tr.map((t) => ({ d: (t.x - p.x) ** 2 + (t.y - p.y) ** 2, l: t.l })).sort((a, b) => a.d - b.d).slice(0, k); return d.reduce((a, b) => a + b.l, 0) * 2 > k ? 1 : 0; };
  cv.onDraw((ctx, W, H, p) => {
    const tr = pool.slice(0, n), m = plot(W, H, [0, 1], [0, 1], { l: 8, r: 8, t: 8, b: 8 }), G = 36;
    for (let i = 0; i < G; i++) for (let j = 0; j < G; j++) {
      const x = (i + 0.5) / G, y = (j + 0.5) / G, c = predict(tr, { x, y });
      ctx.globalAlpha = 0.28; ctx.fillStyle = c ? p.warm : p.accent; ctx.fillRect(m.X(i / G), m.Y((j + 1) / G), m.iw / G + 1, m.ih / G + 1);
    }
    ctx.globalAlpha = 1;
    for (const t of tr) { ctx.fillStyle = t.l ? p.warm : p.accent; ctx.strokeStyle = p.ink; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(m.X(t.x), m.Y(t.y), 5, 0, 7); ctx.fill(); ctx.stroke(); }
    ctx.setLineDash([6, 6]); ctx.strokeStyle = p.muted; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(m.X(0), m.Y(1)); ctx.lineTo(m.X(1), m.Y(0)); ctx.stroke(); ctx.setLineDash([]);
  });
  function update() {
    const tr = pool.slice(0, n), acc = (set) => set.filter((q) => predict(tr, q) === q.l).length / set.length;
    const a = acc(tr), b = acc(test);
    st.set("train", fmt(a * 100, 0) + "%"); st.set("test", fmt(b * 100, 0) + "%"); st.set("gap", fmt((a - b) * 100, 0) + " points");
    const msg = k === 1 ? `With k = 1 it remembers every training point, noise included: ${fmt(a * 100, 0)}% on training data but only ${fmt(b * 100, 0)}% on new data.`
      : a - b > 0.08 ? "Still a big gap between training and new data: it is fitting quirks of the examples."
      : `The gap has closed: ${fmt(a * 100, 0)}% on training and ${fmt(b * 100, 0)}% on new data. It has learned the pattern, not the noise.`;
    out.textContent = msg; say(msg); cv.redraw();
  }
  update();
  return () => cv.destroy();
}
