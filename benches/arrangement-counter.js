// Bench: permutations, combinations and Pascal's triangle.
export default function mount(root, kit) {
  const { h, frame, slider, canvas, stats, fmt, live } = kit;
  const body = frame(root, { title: "Permutations, combinations and Pascal's triangle" });
  const say = live(body);
  let n = 5, k = 2;
  const fact = (x) => { let r = 1; for (let i = 2; i <= x; i++) r *= i; return r; };
  const C = (a, b) => Math.round(fact(a) / (fact(b) * fact(a - b)));
  const sn = slider({ label: "n (items)", min: 1, max: 10, step: 1, value: n, onInput: (v) => { n = v; if (k > n) { k = n; sk.set(k, true); } sk.input.max = n; update(); } });
  const sk = slider({ label: "k (chosen)", min: 0, max: 10, step: 1, value: k, onInput: (v) => { k = Math.min(v, n); update(); } });
  const cv = canvas(body, { aspect: 0.7, label: "Pascal's triangle with the chosen entry highlighted" });
  const st = stats([["f", "n!"], ["p", "P(n, k) ordered"], ["c", "C(n, k) unordered"], ["r", "ratio P ÷ C"], ["s", "row sum 2ⁿ"]]);
  body.append(cv.box, st.el, h("div", { class: "bench-controls" }, sn.el, sk.el));
  cv.onDraw((ctx, w, hh, p) => {
    ctx.textAlign = "center"; ctx.font = "800 12px Nunito, system-ui, sans-serif";
    for (let r = 0; r <= 10; r++) for (let c = 0; c <= r; c++) {
      const x = w / 2 + (c - r / 2) * Math.min(52, (w - 20) / 11), y = 18 + r * ((hh - 30) / 10), on = r === n && c === k, inRow = r === n;
      if (on) { ctx.fillStyle = p.accent; ctx.beginPath(); ctx.arc(x, y - 4, 14, 0, 7); ctx.fill(); }
      ctx.fillStyle = on ? p.white : inRow ? p.accent : p.muted; ctx.fillText(String(C(r, c)), x, y);
    }
  });
  function update() { const P = fact(n) / fact(n - k); st.set("f", String(fact(n))); st.set("p", String(P)); st.set("c", String(C(n, k))); st.set("r", `${fmt(P / C(n, k), 0)} = ${k}!`); st.set("s", String(2 ** n)); say(`${n} choose ${k} is ${C(n, k)}`); cv.redraw(); }
  update();
  return () => cv.destroy();
}
