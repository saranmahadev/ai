// Bench: compare a free-text date field (whatever format the agent happens to produce) against a strict schema.
import { parsesAsIso } from "./agentkit.js";

const FREE_TEXT = ["03/14/2025", "2025-03-14", "March 14, 2025", "14/03/2025", "2025-03-14"];
const STRICT = ["2025-03-14", "2025-03-14", "2025-03-14", "2025-03-14", "2025-03-14"];

export default function mount(root, kit) {
  const { frame, h, choice, stats, live } = kit;
  const body = frame(root, { title: "A field that accepts anything, or a schema that doesn't" });
  const say = live(body);
  let mode = "freetext";

  const list = h("ol", { class: "isai-list" });
  const st = stats([["fail", "calls that fail to parse"]]);
  const ch = choice("Tool design", [["freetext", "free-text date field"], ["strict", "strict ISO-8601 schema"]], mode, (v) => { mode = v; update(); });
  body.append(list, st.el, ch.el);

  function attempts() { return mode === "freetext" ? FREE_TEXT : STRICT; }
  function update() {
    const vals = attempts();
    list.textContent = "";
    vals.forEach((v) => list.append(h("li", {}, `"${v}" — ${parsesAsIso(v) ? "✓ parses" : "✗ fails to parse"}`)));
    const fails = vals.filter((v) => !parsesAsIso(v)).length;
    st.set("fail", `${fails} of ${vals.length}`);
    say(`${mode === "freetext" ? "free-text field" : "strict schema"}: ${fails} of ${vals.length} calls fail to parse`);
  }
  update();
  return () => {};
}
