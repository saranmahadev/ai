// Bench: toggle a freshness-based resolution and watch which of two conflicting passages wins.
import { freshnessFilter } from "./ragkit.js";

const CONFLICTING = [{ text: "Shipping takes 3-5 days.", date: "2022-01-01" }, { text: "Shipping takes 2-3 days.", date: "2025-09-01" }];

export default function mount(root, kit) {
  const { frame, h, toggles, stats, live } = kit;
  const body = frame(root, { title: "Two passages, two different answers" });
  const say = live(body);
  let resolve = false;

  const list = h("ul", { class: "isai-list" });
  const st = stats([["used", "passage(s) used for generation"]]);
  const tg = toggles([["resolve", "resolve by freshness (most recent wins)", resolve]], (v) => { resolve = v.resolve; update(); });
  body.append(list, st.el, tg.el);

  function update() {
    const shown = resolve ? freshnessFilter(CONFLICTING, "0000-01-01", 1) : CONFLICTING;
    list.textContent = "";
    CONFLICTING.forEach((c) => list.append(h("li", {}, `[${c.date}] "${c.text}"${shown.includes(c) ? "  (used)" : resolve ? "  (discarded)" : ""}`)));
    st.set("used", shown.map((c) => c.date).join(", "));
    say(`${resolve ? "resolved" : "unresolved"}: generation would see ${shown.length} passage(s) — ${shown.map((c) => `"${c.text}"`).join(", ")}`);
  }
  update();
  return () => {};
}
