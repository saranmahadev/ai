// Bench: powers grow (or shrink) by repeated multiplication; roots undo them.
export default function mount(root, kit) {
  const { h, frame, slider, canvas, stats, fmt, plot, live } = kit;
  const body = frame(root, { title: "Powers and roots" });
  const say = live(body);
  let a = 2, n = 5, r = 2;
  const sa = slider({ label: "base a", min: 0.2, max: 4, step: 0.1, value: a, format: (v) => fmt(v, 1), onInput: (v) => { a = v; update(); } });
  const sn = slider({ label: "exponent n", min: -4, max: 10, step: 1, value: n, onInput: (v) => { n = v; update(); } });
  const sr = slider({ label: "root index r", min: 2, max: 6, step: 1, value: r, onInput: (v) => { r = v; update(); } });
  const cv = canvas(body, { aspect: 0.5, label: "Bars showing a to the power k for k from minus four to ten" });
  const st = stats([["pow", "aⁿ"], ["rec", "a⁻ⁿ"], ["root", "a^(1/r)"], ["back", "(a^(1/r))^r"]]);
  body.append(cv.box, st.el, h("div", { class: "bench-controls" }, sa.el, sn.el, sr.el));
  cv.onDraw((ctx, w, hh, p) => {
    const ks = Array.from({ length: 15 }, (_, i) => i - 4), vals = ks.map((k) => a ** k), top = Math.min(Math.max(...vals), 2000);
    const m = plot(w, hh, [-4.6, 10.6], [0, top]);
    m.axes(ctx, p, { xlabel: "exponent k", ylabel: "aᵏ" });
    ks.forEach((k, i) => { const v = Math.min(vals[i], top); ctx.fillStyle = k === n ? p.warm : p.accent; ctx.globalAlpha = k === n ? 1 : 0.55; ctx.fillRect(m.X(k) - m.iw / 40, m.Y(v), m.iw / 20, m.Y(0) - m.Y(v)); });
    ctx.globalAlpha = 1;
  });
  function update() {
    const pw = a ** n, rt = a ** (1 / r);
    st.set("pow", fmt(pw, 4)); st.set("rec", fmt(1 / pw, 4)); st.set("root", fmt(rt, 4)); st.set("back", fmt(rt ** r, 4));
    say(`${fmt(a, 1)} to the ${n} is ${fmt(pw, 3)}`); cv.redraw();
  }
  update();
  return () => cv.destroy();
}
