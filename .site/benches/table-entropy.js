// Bench: entropies of a joint table and the chain rule.
import { entropy } from "./mathkit.js";
export default function mount(root, kit) {
  const { h, frame, slider, stats, fmt, live } = kit;
  const body = frame(root, { title: "Entropy of a joint table" });
  const say = live(body);
  const c = [0.3, 0.2, 0.1];
  const mk = (l, i) => slider({ label: l, min: 0, max: 1, step: 0.05, value: c[i], format: (v) => fmt(v, 2), onInput: (v) => { c[i] = v; const o = c.reduce((a, b, j) => (j === i ? a : a + b), 0); if (c[i] + o > 1) { c[i] = Math.max(0, Math.round((1 - o) * 20) / 20); s[i].set(c[i], true); } update(); } });
  const s = [mk("P(X = 0, Y = 0)", 0), mk("P(X = 0, Y = 1)", 1), mk("P(X = 1, Y = 0)", 2)];
  const tbl = h("table", { class: "truth" });
  const st = stats([["hx", "H(X)"], ["hy", "H(Y)"], ["hxy", "H(X, Y)"], ["hyx", "H(Y given X) = H(X, Y) − H(X)"], ["i", "saving: H(Y) − H(Y given X)"]]);
  body.append(tbl, st.el, h("div", { class: "bench-controls" }, s.map((x) => x.el), h("p", { class: "bench-line" }, "The fourth cell is whatever is left so the four add to 1.")));
  function update() {
    const p11 = Math.max(0, 1 - c[0] - c[1] - c[2]), P = [[c[0], c[1]], [c[2], p11]], px = [P[0][0] + P[0][1], P[1][0] + P[1][1]], py = [P[0][0] + P[1][0], P[0][1] + P[1][1]];
    tbl.textContent = ""; tbl.append(h("thead", {}, h("tr", {}, ["", "Y = 0", "Y = 1"].map((t) => h("th", {}, t))))); const tb = h("tbody"); [0, 1].forEach((i) => tb.append(h("tr", {}, h("th", {}, `X = ${i}`), P[i].map((v) => h("td", { style: "text-align:center;padding:.4rem 1rem" }, fmt(v, 3)))))); tbl.append(tb);
    const hx = entropy(px), hy = entropy(py), hxy = entropy([P[0][0], P[0][1], P[1][0], P[1][1]]);
    st.set("hx", fmt(hx, 4)); st.set("hy", fmt(hy, 4)); st.set("hxy", fmt(hxy, 4)); st.set("hyx", fmt(hxy - hx, 4)); st.set("i", fmt(hy - (hxy - hx), 4) + " bits"); say(`Joint entropy ${fmt(hxy, 3)} bits`);
  }
  update();
  return () => {};
}
