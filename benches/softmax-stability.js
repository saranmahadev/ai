// Bench: naive and stable softmax, with an offset that breaks the naive one.
export default function mount(root, kit) {
  const { h, frame, slider, choice, canvas, stats, fmt, live } = kit;
  const body = frame(root, { title: "Naive versus stable softmax" });
  const say = live(body);
  const z = [1, 2, 3]; let off = 0, prec = "f64";
  const sl = z.map((v, i) => slider({ label: `score ${i + 1}`, min: -5, max: 5, step: 0.5, value: v, format: (x) => fmt(x, 1), onInput: (x) => { z[i] = x; update(); } }));
  const so = slider({ label: "offset added to every score", min: 0, max: 1000, step: 10, value: off, onInput: (v) => { off = v; update(); } });
  const ch = choice("Precision", [["f32", "float32"], ["f64", "float64"]], prec, (v) => { prec = v; update(); });
  const cv = canvas(body, { aspect: 0.4, maxH: 240, label: "Softmax probabilities computed the stable way" });
  const st = stats([["naive", "naive: e^z / Σ e^z"], ["stable", "stable: subtract the largest score first"], ["lse", "log-sum-exp (stable)"]]);
  body.append(cv.box, st.el, ch.el, h("div", { class: "bench-controls" }, sl.map((s) => s.el), so.el));
  const r = (v) => (prec === "f32" ? Math.fround(v) : v);
  const naive = () => { const e = z.map((v) => r(Math.exp(r(v + off)))); const s = e.reduce((a, b) => r(a + b), 0); return e.map((v) => r(v / s)); };
  const stable = () => { const s0 = z.map((v) => v + off), m = Math.max(...s0), e = s0.map((v) => r(Math.exp(r(v - m)))), t = e.reduce((a, b) => r(a + b), 0); return { p: e.map((v) => r(v / t)), lse: m + Math.log(t) }; };
  cv.onDraw((ctx, w, hh, p) => { const { p: P } = stable(), base = hh - 26; P.forEach((q, i) => { const x = 40 + ((i + 0.5) / 3) * (w - 80), bh = q * (base - 14); ctx.fillStyle = p.accent; ctx.fillRect(x - 24, base - bh, 48, bh); ctx.fillStyle = p.ink; ctx.font = "800 12px Nunito, system-ui, sans-serif"; ctx.textAlign = "center"; ctx.fillText(fmt(q, 3), x, base - bh - 6); ctx.fillText("score " + (i + 1), x, base + 16); }); });
  function update() { const n = naive(), s = stable(); st.set("naive", n.some((v) => !Number.isFinite(v)) ? "NaN (the exponentials overflowed)" : n.map((v) => fmt(v, 4)).join("   ")); st.set("stable", s.p.map((v) => fmt(v, 4)).join("   ")); st.set("lse", fmt(s.lse, 4)); say(n.some((v) => !Number.isFinite(v)) ? "Naive softmax failed" : "Both agree"); cv.redraw(); }
  update();
  return () => cv.destroy();
}
