// Bench: run an aggregate question as a structured query over a table and compare against what chunk retrieval alone could ever return.
const ORDERS = [
  { id: 1, year: 2023, amount: 50 }, { id: 2, year: 2024, amount: 80 }, { id: 3, year: 2024, amount: 120 },
  { id: 4, year: 2024, amount: 60 }, { id: 5, year: 2023, amount: 90 },
];

export default function mount(root, kit) {
  const { frame, h, slider, stats, live } = kit;
  const body = frame(root, { title: "Counting rows is a query, not a passage" });
  const say = live(body);
  let year = 2024;

  const list = h("ul", { class: "isai-list" });
  const st = stats([["count", "orders matching the filter"]]);
  const sl = slider({ label: "year", min: 2023, max: 2024, step: 1, value: year, format: (v) => String(v), onInput: (v) => { year = v; update(); } });
  body.append(list, st.el, sl.el);

  function update() {
    const matches = ORDERS.filter((o) => o.year === year);
    list.textContent = "";
    ORDERS.forEach((o) => list.append(h("li", {}, `order ${o.id}: year ${o.year}, $${o.amount}${o.year === year ? "  ← counted" : ""}`)));
    st.set("count", String(matches.length));
    say(`how many orders in ${year}: structured query returns ${matches.length} exactly; retrieving a flattened chunk of the table could at best return the whole table's text, not a computed count`);
  }
  update();
  return () => {};
}
