// Bench: a logarithm counts doublings; it mirrors the exponent.
export default function mount(root, kit) {
  const { h, frame, slider, toggles, canvas, stats, plot, fmt, live } = kit;
  const body = frame(root, { title: "Logarithm and exponent as mirrors" });
  const say = live(body);
  let s = 3, logAxis = false;
  const ss = slider({ label: "number = 2^s   (slide s)", min: -4, max: 10, step: 0.25, value: s, format: (v) => fmt(v, 2), onInput: (v) => { s = v; update(); } });
  const tg = toggles([["log", "logarithmic horizontal axis", false]], (v) => { logAxis = v.log; update(); });
  const cv = canvas(body, { aspect: 0.55, label: "Graph of log base 2 of x, with a marker at the chosen number" });
  const st = stats([["x", "number x"], ["l2", "log₂ x (doublings)"], ["l10", "log₁₀ x"], ["ln", "ln x"]]);
  body.append(cv.box, st.el, h("div", { class: "bench-controls" }, ss.el, tg.el));
  cv.onDraw((ctx, w, hh, p) => {
    const x = 2 ** s, m = logAxis ? plot(w, hh, [-4.5, 10.5], [-4.5, 10.5]) : plot(w, hh, [0, 1100], [-5, 11]);
    m.axes(ctx, p, { xlabel: logAxis ? "log₂ x" : "x", ylabel: "log₂ x" });
    ctx.save(); ctx.beginPath(); ctx.rect(m.pad.l, m.pad.t, m.iw, m.ih); ctx.clip();
    ctx.strokeStyle = p.accent; ctx.lineWidth = 3.5; ctx.beginPath();
    for (let i = 0; i <= 300; i++) { const t = -4.4 + (14.8 * i) / 300, X = logAxis ? m.X(t) : m.X(2 ** t), Y = m.Y(t); if (i) ctx.lineTo(X, Y); else ctx.moveTo(X, Y); }
    ctx.stroke();
    const mx = logAxis ? m.X(s) : m.X(x); ctx.fillStyle = p.warm; ctx.beginPath(); ctx.arc(mx, m.Y(s), 7, 0, 7); ctx.fill(); ctx.restore();
  });
  function update() {
    const x = 2 ** s;
    st.set("x", fmt(x, 4)); st.set("l2", fmt(Math.log2(x), 3)); st.set("l10", fmt(Math.log10(x), 3)); st.set("ln", fmt(Math.log(x), 3));
    say(`x is ${fmt(x, 3)}, log base 2 is ${fmt(s, 2)}`); cv.redraw();
  }
  update();
  return () => cv.destroy();
}
