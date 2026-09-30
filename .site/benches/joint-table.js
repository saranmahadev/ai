// Bench: a joint table, its marginals and conditionals.
export default function mount(root, kit) {
  const { h, frame, slider, stats, fmt, live } = kit;
  const body = frame(root, { title: "Joint table, marginals and conditionals" });
  const say = live(body);
  const c = [0.3, 0.2, 0.1];
  const mk = (l, i) => slider({ label: l, min: 0, max: 1, step: 0.05, value: c[i], format: (v) => fmt(v, 2), onInput: (v) => { c[i] = v; clampAll(i); update(); } });
  const s = [mk("P(X = 0, Y = 0)", 0), mk("P(X = 0, Y = 1)", 1), mk("P(X = 1, Y = 0)", 2)];
  const tbl = h("table", { class: "truth" });
  const st = stats([["mx", "marginal P(X = 1)"], ["my", "marginal P(Y = 1)"], ["c1", "P(Y = 1 given X = 1)"], ["c0", "P(Y = 1 given X = 0)"], ["ind", "independent?"]]);
  body.append(tbl, st.el, h("div", { class: "bench-controls" }, s.map((x) => x.el), h("p", { class: "bench-line" }, "The fourth cell is whatever is left so that all four add to 1.")));
  function clampAll(i) { const others = c.reduce((a, b, j) => (j === i ? a : a + b), 0); if (c[i] + others > 1) { c[i] = Math.max(0, Math.round((1 - others) * 20) / 20); s[i].set(c[i], true); } }
  function update() {
    const p11 = Math.max(0, 1 - c[0] - c[1] - c[2]), P = [[c[0], c[1]], [c[2], p11]], px = [P[0][0] + P[0][1], P[1][0] + P[1][1]], py = [P[0][0] + P[1][0], P[0][1] + P[1][1]];
    tbl.textContent = ""; tbl.append(h("thead", {}, h("tr", {}, ["", "Y = 0", "Y = 1", "P(X)"].map((t) => h("th", {}, t)))));
    const tb = h("tbody"); [0, 1].forEach((i) => tb.append(h("tr", {}, h("th", {}, `X = ${i}`), P[i].map((v) => h("td", { style: "text-align:center;padding:.4rem 1rem" }, fmt(v, 3))), h("td", { style: "text-align:center;padding:.4rem 1rem;font-weight:800" }, fmt(px[i], 3))))); tb.append(h("tr", {}, h("th", {}, "P(Y)"), py.map((v) => h("td", { style: "text-align:center;padding:.4rem 1rem;font-weight:800" }, fmt(v, 3))), h("td", {}, ""))); tbl.append(tb);
    st.set("mx", fmt(px[1], 3)); st.set("my", fmt(py[1], 3)); st.set("c1", px[1] ? fmt(P[1][1] / px[1], 3) : "undefined"); st.set("c0", px[0] ? fmt(P[0][1] / px[0], 3) : "undefined");
    const ind = [0, 1].every((i) => [0, 1].every((j) => Math.abs(P[i][j] - px[i] * py[j]) < 0.005)); st.set("ind", ind ? "yes: every cell equals the product of its marginals" : "no: at least one cell differs from the product"); say(ind ? "Independent" : "Dependent");
  }
  update();
  return () => {};
}
