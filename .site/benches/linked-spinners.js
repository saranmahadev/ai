// Bench: independence means the joint probability equals the product.
export default function mount(root, kit) {
  const { h, frame, slider, stats, fmt, live } = kit;
  const body = frame(root, { title: "Independent or linked?" });
  const say = live(body);
  let pa = 0.5, pb = 0.4, link = 0;
  const s1 = slider({ label: "P(A)", min: 0.1, max: 0.9, step: 0.05, value: pa, format: (v) => fmt(v, 2), onInput: (v) => { pa = v; update(); } });
  const s2 = slider({ label: "P(B)", min: 0.1, max: 0.9, step: 0.05, value: pb, format: (v) => fmt(v, 2), onInput: (v) => { pb = v; update(); } });
  const s3 = slider({ label: "link between A and B (−1 = never together, 0 = independent, +1 = always together)", min: -1, max: 1, step: 0.1, value: link, format: (v) => fmt(v, 1), onInput: (v) => { link = v; update(); } });
  const tbl = h("table", { class: "truth" });
  const st = stats([["prod", "P(A) · P(B)"], ["j", "P(A and B)"], ["ab", "P(A given B)"], ["v", "verdict"]]);
  body.append(tbl, st.el, h("div", { class: "bench-controls" }, s1.el, s2.el, s3.el));
  function update() {
    const ind = pa * pb, hi = Math.min(pa, pb), lo = Math.max(0, pa + pb - 1), j = link >= 0 ? ind + link * (hi - ind) : ind + link * (ind - lo), c = [[j, pa - j], [pb - j, 1 - pa - pb + j]];
    tbl.textContent = ""; tbl.append(h("thead", {}, h("tr", {}, ["", "B", "not B"].map((t) => h("th", {}, t)))));
    const tb = h("tbody"); ["A", "not A"].forEach((n, i) => tb.append(h("tr", {}, h("th", {}, n), c[i].map((v) => h("td", { style: "text-align:center;padding:.4rem 1rem" }, fmt(v, 3)))))); tbl.append(tb);
    st.set("prod", fmt(ind, 4)); st.set("j", fmt(j, 4)); st.set("ab", fmt(j / pb, 4) + `   (compare P(A) = ${fmt(pa, 2)})`); st.set("v", Math.abs(j - ind) < 1e-9 ? "independent: the joint equals the product" : j > ind ? "positively linked: they occur together more than chance" : "negatively linked: together less than chance"); say(st ? "Table updated" : "");
  }
  update();
  return () => {};
}
