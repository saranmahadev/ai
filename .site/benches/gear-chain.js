// Bench: the chain rule multiplies the rates of the inner and outer function.
import { numDiff } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, choice, stats, fmt, live } = kit;
  const body = frame(root, { title: "Rates multiply along a chain" });
  const say = live(body);
  const IN = { a: ["3x + 1", (x) => 3 * x + 1, () => 3], b: ["x²", (x) => x * x, (x) => 2 * x], c: ["2x − 1", (x) => 2 * x - 1, () => 2] };
  const OUT = { a: ["u²", (u) => u * u, (u) => 2 * u], b: ["sin u", Math.sin, Math.cos], c: ["eᵘ", Math.exp, Math.exp] };
  let ik = "a", ok = "a", x = 1;
  const sx = slider({ label: "input x", min: -2, max: 2, step: 0.1, value: x, format: (v) => fmt(v, 1), onInput: (v) => { x = v; update(); } });
  const ci = choice("Inner function g", Object.entries(IN).map(([k, v]) => [k, v[0]]), ik, (k) => { ik = k; update(); });
  const co = choice("Outer function f", Object.entries(OUT).map(([k, v]) => [k, v[0]]), ok, (k) => { ok = k; update(); });
  const st = stats([["u", "u = g(x)"], ["out", "f(u)"], ["dg", "g′(x)  (inner rate)"], ["df", "f′(u)  (outer rate)"], ["prod", "f′(u) · g′(x)"], ["num", "numerical slope of f(g(x))"]]);
  body.append(st.el, ci.el, co.el, h("div", { class: "bench-controls" }, sx.el));
  function update() { const [, g, dg] = IN[ik], [, f, df] = OUT[ok], u = g(x); st.set("u", fmt(u, 4)); st.set("out", fmt(f(u), 4)); st.set("dg", fmt(dg(x), 4)); st.set("df", fmt(df(u), 4)); st.set("prod", fmt(df(u) * dg(x), 4)); st.set("num", fmt(numDiff((t) => f(g(t)), x), 4)); say(`Chain rule slope ${fmt(df(u) * dg(x), 3)}`); }
  update();
  return () => {};
}
