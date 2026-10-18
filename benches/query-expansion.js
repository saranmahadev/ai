// Bench: toggle query expansion and watch a zero-overlap query gain matching terms against a document.
import { tokenize, expandQuery } from "./ragkit.js";

const SYNONYMS = { automobile: ["car", "vehicle"], repair: ["maintenance", "fix", "servicing"] };
const QUERY = "automobile repair";
const DOC = "car maintenance and servicing guide";

export default function mount(root, kit) {
  const { frame, h, toggles, stats, live } = kit;
  const body = frame(root, { title: "Matching words the query never used" });
  const say = live(body);
  let expand = false;

  const list = h("ul", { class: "isai-list" });
  const st = stats([["overlap", "terms matching the document"]]);
  const tg = toggles([["expand", "expand query with synonyms", expand]], (v) => { expand = v.expand; update(); });
  body.append(list, st.el, tg.el);

  function update() {
    const terms = expand ? expandQuery(QUERY, SYNONYMS) : tokenize(QUERY);
    const docTokens = tokenize(DOC);
    const matching = terms.filter((t) => docTokens.includes(t));
    list.textContent = "";
    terms.forEach((t) => list.append(h("li", {}, `${docTokens.includes(t) ? "✓" : "✗"} ${t}`)));
    st.set("overlap", String(matching.length));
    say(`${expand ? "expanded" : "original"} query: ${matching.length} of ${terms.length} terms match the document`);
  }
  update();
  return () => {};
}
