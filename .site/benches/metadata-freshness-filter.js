// Bench: toggle a freshness filter and watch stale duplicate chunks disappear from the results.
import { freshnessFilter } from "./ragkit.js";

const CHUNKS = [
  { text: "Shipping takes 3-5 days.", date: "2022-01-01" },
  { text: "Shipping takes 3-5 days.", date: "2023-06-01" },
  { text: "Shipping takes 2-3 days.", date: "2025-09-01" },
];
const CUTOFF = "2024-01-01";

export default function mount(root, kit) {
  const { frame, h, toggles, stats, live } = kit;
  const body = frame(root, { title: "Three near-duplicates, only one still true" });
  const say = live(body);
  let filtered = false;

  const list = h("ul", { class: "isai-list" });
  const st = stats([["returned", "chunks returned"]]);
  const tg = toggles([["filter", "filter by freshness (date ≥ 2024-01-01)", filtered]], (v) => { filtered = v.filter; update(); });
  body.append(list, st.el, tg.el);

  function update() {
    const results = filtered ? freshnessFilter(CHUNKS, CUTOFF, 1) : CHUNKS;
    list.textContent = "";
    results.forEach((c) => list.append(h("li", {}, `[${c.date}] "${c.text}"`)));
    st.set("returned", String(results.length));
    say(`${filtered ? "freshness-filtered" : "unfiltered"}: ${results.length} chunk(s) returned — ${results.map((c) => c.date).join(", ")}`);
  }
  update();
  return () => {};
}
