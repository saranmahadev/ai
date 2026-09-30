// Bench: compare two logical formulas by their truth tables.
export default function mount(root, kit) {
  const { h, frame, choice, stats, live } = kit;
  const body = frame(root, { title: "Build a truth table" });
  const say = live(body);
  const F = { and: ["p ∧ q", (p, q) => p && q], or: ["p ∨ q", (p, q) => p || q], xor: ["p ⊕ q", (p, q) => p !== q], imp: ["p → q", (p, q) => !p || q], nimp: ["¬p ∨ q", (p, q) => !p || q], nand: ["¬(p ∧ q)", (p, q) => !(p && q)], dm1: ["¬p ∨ ¬q", (p, q) => !p || !q], dm2: ["¬p ∧ ¬q", (p, q) => !p && !q], nor: ["¬(p ∨ q)", (p, q) => !(p || q)] };
  let a = "imp", b = "nimp";
  const opts = Object.entries(F).map(([k, v]) => [k, v[0]]);
  const ca = choice("Formula 1", opts, a, (k) => { a = k; update(); });
  const cb = choice("Formula 2", opts, b, (k) => { b = k; update(); });
  const tbl = h("table", { class: "truth" });
  const st = stats([["eq", "are they equivalent?"]]);
  body.append(tbl, st.el, ca.el, cb.el);
  const T = (v) => (v ? "T" : "F");
  function update() {
    const rows = [[true, true], [true, false], [false, true], [false, false]];
    tbl.textContent = "";
    tbl.append(h("thead", {}, h("tr", {}, ["p", "q", F[a][0], F[b][0]].map((t) => h("th", {}, t)))));
    let same = true; const tb = h("tbody");
    for (const [p, q] of rows) { const x = F[a][1](p, q), y = F[b][1](p, q), diff = x !== y; if (diff) same = false; tb.append(h("tr", { style: diff ? "background:var(--soft)" : "" }, [T(p), T(q), T(x), T(y)].map((t) => h("td", { style: "text-align:center;padding:.3rem .8rem" }, t)))); }
    tbl.append(tb);
    st.set("eq", same ? "yes: every row matches" : "no: the highlighted rows differ"); say(same ? "Equivalent" : "Not equivalent");
  }
  update();
  return () => {};
}
