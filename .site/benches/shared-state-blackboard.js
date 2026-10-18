// Bench: compare external calls needed for a piece of shared context, with and without a shared blackboard.
import { externalCallsWithoutSharedState, externalCallsWithSharedState } from "./agentkit.js";

export default function mount(root, kit) {
  const { frame, h, slider, choice, stats, live } = kit;
  const body = frame(root, { title: "Fetching it again, or reading it off the blackboard" });
  const say = live(body);
  let steps = 5, shared = false;

  const list = h("ul", { class: "isai-list" });
  const st = stats([["calls", "external calls made"]]);
  const sSteps = slider({ label: "Task steps", min: 2, max: 8, step: 1, value: steps, onInput: (v) => { steps = v; update(); } });
  const ch = choice("State", [["off", "no shared state"], ["on", "shared blackboard"]], shared ? "on" : "off", (v) => { shared = v === "on"; update(); });
  body.append(list, st.el, sSteps.el, ch.el);

  function update() {
    const calls = shared ? externalCallsWithSharedState() : externalCallsWithoutSharedState(steps);
    st.set("calls", String(calls));
    list.textContent = "";
    for (let s = 1; s <= steps; s++) {
      const fetches = shared ? s === 1 : true;
      list.append(h("li", {}, `step ${s}: ${fetches ? "fetches today's date itself" : "reads today's date from shared state"}`));
    }
    say(`${shared ? "shared blackboard" : "no shared state"}: ${calls} external call${calls === 1 ? "" : "s"} across ${steps} steps`);
  }
  update();
  return () => {};
}
