// Bench: compare how many of a trajectory's intermediate steps are inspectable with and without tracing.
import { visibleIntermediateSteps } from "./agentkit.js";

export default function mount(root, kit) {
  const { frame, h, slider, toggles, stats, live } = kit;
  const body = frame(root, { title: "What a run actually left behind" });
  const say = live(body);
  let nSteps = 12;
  let hasTracing = false;

  const list = h("ol", { class: "isai-list" });
  const st = stats([["visible", "intermediate steps visible"]]);
  const sl = slider({ label: "trajectory length", min: 4, max: 24, step: 1, value: nSteps, format: (v) => `${v} steps`, onInput: (v) => { nSteps = v; update(); } });
  const tg = toggles([["tracing", "tracing enabled", hasTracing]], (v) => { hasTracing = v.tracing; update(); });
  body.append(list, st.el, sl.el, tg.el);

  function update() {
    const visible = visibleIntermediateSteps(nSteps, hasTracing);
    list.textContent = "";
    for (let i = 1; i <= nSteps; i++) {
      const seen = hasTracing;
      list.append(h("li", {}, `step ${i}: ${seen ? "tool, input and output recorded" : "no record — only the final output exists"}`));
    }
    st.set("visible", `${visible} / ${nSteps}`);
    say(`${visible} of ${nSteps} intermediate steps are inspectable${hasTracing ? "" : " — only the final output was ever recorded"}`);
  }
  update();
  return () => {};
}
