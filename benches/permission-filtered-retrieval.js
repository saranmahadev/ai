// Bench: toggle permission filtering and watch an internal, restricted chunk disappear from a public user's results.
import { permissionFiltered } from "./ragkit.js";

const CHUNKS = [
  { text: "Public FAQ: shipping takes 3-5 days.", permissions: ["public"] },
  { text: "Internal: Q3 revenue was $4.2M.", permissions: ["finance-team"] },
  { text: "Public FAQ: refunds in 5 days.", permissions: ["public"] },
];

export default function mount(root, kit) {
  const { frame, h, toggles, stats, live } = kit;
  const body = frame(root, { title: "Relevant isn't the same as allowed" });
  const say = live(body);
  let filtered = false;
  const userRoles = ["public"];

  const list = h("ul", { class: "isai-list" });
  const st = stats([["returned", "chunks returned to this public user"]]);
  const tg = toggles([["filter", "filter by permission before returning results", filtered]], (v) => { filtered = v.filter; update(); });
  body.append(list, st.el, tg.el);

  function update() {
    const results = filtered ? permissionFiltered(CHUNKS, userRoles, 3) : CHUNKS;
    list.textContent = "";
    CHUNKS.forEach((c) => list.append(h("li", {}, `[${c.permissions.join(",")}] "${c.text}"${results.includes(c) ? "" : "  (would leak!)"}`)));
    st.set("returned", String(results.length));
    say(`${filtered ? "permission-filtered" : "unfiltered"}: ${results.length} of ${CHUNKS.length} chunks returned to a public user`);
  }
  update();
  return () => {};
}
