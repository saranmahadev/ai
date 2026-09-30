// Bench: one share written as a fraction, a decimal and a percentage.
export default function mount(root, kit) {
  const { h, frame, slider, canvas, stats, fmt, live } = kit;
  const body = frame(root, { title: "Fractions, decimals and percentages" });
  const say = live(body);
  let n = 3, d = 4;
  const gcd = (a, b) => (b ? gcd(b, a % b) : a);
  const sn = slider({ label: "numerator (parts shaded)", min: 0, max: 24, value: n, onInput: (v) => { n = v; update(); } });
  const sd = slider({ label: "denominator (equal parts)", min: 1, max: 12, value: d, onInput: (v) => { d = v; update(); } });
  const cv = canvas(body, { aspect: 0.32, maxH: 200, label: "Bars divided into equal parts with some shaded" });
  const st = stats([["frac", "fraction"], ["red", "simplest form"], ["dec", "decimal"], ["pct", "percentage"]]);
  body.append(cv.box, st.el, h("div", { class: "bench-controls" }, sn.el, sd.el));
  cv.onDraw((ctx, w, hh, p) => {
    const bars = Math.max(1, Math.ceil(n / d)), bh = Math.min(46, (hh - 16) / bars - 8), x0 = 12, bw = w - 24;
    for (let b = 0; b < bars; b++) {
      const y = 8 + b * (bh + 8);
      for (let i = 0; i < d; i++) {
        const on = b * d + i < n;
        ctx.fillStyle = on ? p.accent : p.soft; ctx.fillRect(x0 + (bw * i) / d + 1, y, bw / d - 2, bh);
      }
    }
  });
  function update() {
    const g = n === 0 ? d : gcd(n, d), val = n / d;
    st.set("frac", `${n}/${d}`); st.set("red", n === 0 ? "0" : `${n / g}/${d / g}`); st.set("dec", fmt(val, 4)); st.set("pct", fmt(val * 100, 2) + "%");
    say(`${n} over ${d} is ${fmt(val, 3)}, or ${fmt(val * 100, 1)} percent`); cv.redraw();
  }
  update();
  return () => cv.destroy();
}
