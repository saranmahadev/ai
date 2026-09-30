// Bench: how integer codes and one-hot vectors change the distances between categories.
export default function mount(root, kit) {
  const { h, frame, choice, stats, live, fmt } = kit;
  const body = frame(root, { title: "Encode the categories" });
  const say = live(body);
  const SETS = { city: { names: ["Paris", "Tokyo", "Lima", "Oslo"], note: "no natural order" }, size: { names: ["S", "M", "L", "XL"], note: "ordered" } };
  let set = "city", enc = "int";
  const sc = choice("Category", [["city", "city (no order)"], ["size", "shirt size (ordered)"]], set, (v) => { set = v; update(); });
  const ec = choice("Encoding", [["int", "integer codes"], ["hot", "one-hot columns"]], enc, (v) => { enc = v; update(); });
  const table = h("table", { class: "bench-table" }), dist = h("table", { class: "bench-table" });
  const st = stats([["a", "largest distance"], ["b", "smallest distance"]]);
  body.append(table, dist, st.el, sc.el, ec.el);
  const code = (i, n) => (enc === "int" ? [i] : Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
  function update() { const { names } = SETS[set], n = names.length, V = names.map((_, i) => code(i, n));
    table.textContent = ""; table.append(h("tr", {}, h("th", {}, "category"), h("th", {}, "encoded as")), ...names.map((nm, i) => h("tr", {}, h("td", {}, nm), h("td", {}, "(" + V[i].join(", ") + ")"))));
    const D = (a, b) => Math.hypot(...a.map((x, k) => x - b[k])); dist.textContent = ""; dist.append(h("tr", {}, h("th", {}, "distance"), ...names.map((x) => h("th", {}, x))), ...names.map((nm, i) => h("tr", {}, h("th", {}, nm), ...names.map((_, j) => h("td", {}, fmt(D(V[i], V[j]), 2))))));
    const all = []; for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) all.push(D(V[i], V[j])); st.set("a", fmt(Math.max(...all), 2)); st.set("b", fmt(Math.min(...all), 2)); say(`${enc === "int" ? "Integer codes" : "One-hot"}: distances from ${fmt(Math.min(...all), 2)} to ${fmt(Math.max(...all), 2)}`); }
  update(); return () => {};
}
