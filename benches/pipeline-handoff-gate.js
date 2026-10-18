// Bench: compare stages wasted on a flawed handoff with and without a per-stage validation gate.
import { wastedStagesWithoutGate } from "./agentkit.js";

const STAGES = ["research", "draft", "review", "finalize"];

export default function mount(root, kit) {
  const { frame, h, slider, choice, stats, live } = kit;
  const body = frame(root, { title: "A flaw caught at handoff, or three stages later" });
  const say = live(body);
  let failStage = 2, gated = false;

  const list = h("ul", { class: "isai-list" });
  const st = stats([["wasted", "stages wasted on the flaw"]]);
  const sFail = slider({ label: "Stage where the flaw appears", min: 1, max: 3, step: 1, value: failStage, onInput: (v) => { failStage = v; update(); } });
  const ch = choice("Handoff", [["off", "no validation gate"], ["on", "gate between stages"]], gated ? "on" : "off", (v) => { gated = v === "on"; update(); });
  body.append(list, st.el, sFail.el, ch.el);

  function update() {
    const wasted = gated ? 0 : wastedStagesWithoutGate(STAGES.length, failStage);
    st.set("wasted", String(wasted));
    list.textContent = "";
    STAGES.forEach((s, i) => {
      const idx = i + 1;
      let status;
      if (idx < failStage) status = "runs normally";
      else if (idx === failStage) status = "produces the flaw";
      else status = gated ? "never runs (caught at handoff)" : "runs anyway, on flawed input";
      list.append(h("li", {}, `${idx}. ${s}: ${status}`));
    });
    say(`flaw at stage ${failStage} of ${STAGES.length}: ${gated ? "caught at handoff, 0 stages wasted" : `${wasted} stage${wasted === 1 ? "" : "s"} wasted running on it anyway`}`);
  }
  update();
  return () => {};
}
