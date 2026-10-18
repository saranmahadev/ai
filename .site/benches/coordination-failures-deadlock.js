// Bench: show a circular-wait deadlock and duplicated-work coordination failures, and what fixes each.
import { circularWait, duplicatedWorkUnits } from "./agentkit.js";

export default function mount(root, kit) {
  const { frame, h, toggles, choice, stats, live } = kit;
  const body = frame(root, { title: "Stuck waiting, or doing the same work twice" });
  const say = live(body);
  let mode = "deadlock";
  let aWaits = true, bWaits = true;
  let coordinated = false;

  const list = h("ul", { class: "isai-list" });
  const st = stats([["status", "outcome"]]);
  const extra = h("div", { class: "stage" });
  const ch = choice("Failure mode", [["deadlock", "circular wait"], ["duplicate", "duplicated work"]], mode, (v) => { mode = v; buildControls(); update(); });
  body.append(list, st.el, ch.el, extra);

  function buildControls() {
    extra.textContent = "";
    if (mode === "deadlock") {
      const tg = toggles([["a", "Agent A waits on B's result", aWaits], ["b", "Agent B waits on A's result", bWaits]], (v) => { aWaits = v.a; bWaits = v.b; update(); });
      extra.append(tg.el);
    } else {
      const co = choice("Coordination", [["off", "uncoordinated"], ["on", "coordinated"]], coordinated ? "on" : "off", (v) => { coordinated = v === "on"; update(); });
      extra.append(co.el);
    }
  }
  buildControls();

  function update() {
    list.textContent = "";
    if (mode === "deadlock") {
      const stuck = circularWait(aWaits, bWaits);
      st.set("status", stuck ? "deadlocked" : "proceeds");
      list.append(h("li", {}, `Agent A: ${aWaits ? "blocked, waiting on B" : "proceeds independently"}`));
      list.append(h("li", {}, `Agent B: ${bWaits ? "blocked, waiting on A" : "proceeds independently"}`));
      say(stuck ? "circular wait: neither agent can proceed" : "no circular wait: at least one agent can proceed");
    } else {
      const units = duplicatedWorkUnits(3, !coordinated);
      st.set("status", `${units} work units for 3 subtasks`);
      list.append(h("li", {}, coordinated ? "each of the 3 subtasks is done once" : "both agents independently do all 3 subtasks"));
      say(`${coordinated ? "coordinated" : "uncoordinated"}: ${units} total work units for 3 subtasks`);
    }
  }
  update();
  return () => {};
}
