// Bench: compare a flat, non-dependency-aware task order against a decomposed, topologically ordered one.
import { countDependencyViolations } from "./agentkit.js";

const DEPS = { spec: [], backend: ["spec"], frontend: ["spec"], integration: ["backend", "frontend"], launch: ["integration"] };
const LABEL = { spec: "write spec", backend: "build backend", frontend: "build frontend", integration: "integration test", launch: "launch" };
const ORDERS = {
  naive: ["launch", "spec", "integration", "backend", "frontend"],
  decomposed: ["spec", "backend", "frontend", "integration", "launch"],
};

export default function mount(root, kit) {
  const { frame, h, choice, stats, live } = kit;
  const body = frame(root, { title: "Decomposed order, or a flat guess" });
  const say = live(body);
  let mode = "naive";

  const list = h("ol", { class: "isai-list" });
  const st = stats([["violations", "dependency violations"]]);
  const ch = choice("Order", [["naive", "flat (as first mentioned)"], ["decomposed", "decomposed (topological)"]], mode, (v) => { mode = v; update(); });
  body.append(list, st.el, ch.el);

  function update() {
    const order = ORDERS[mode];
    const done = new Set();
    list.textContent = "";
    for (const task of order) {
      const missing = DEPS[task].filter((d) => !done.has(d));
      list.append(h("li", {}, `${LABEL[task]}${missing.length ? ` — ✗ needs ${missing.map((d) => LABEL[d]).join(", ")} first` : " — ✓"}`));
      done.add(task);
    }
    const v = countDependencyViolations(order, DEPS);
    st.set("violations", String(v));
    say(`${mode === "naive" ? "flat order" : "decomposed order"}: ${v} dependency violation${v === 1 ? "" : "s"}`);
  }
  update();
  return () => {};
}
