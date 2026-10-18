// Bench: step through a 5-step plan where step 3 fails, with and without noticing and replanning.
import { planFailureOutcome } from "./agentkit.js";

const STEPS = ["book flight", "get visa", "book hotel (sold out)", "book transfer", "confirm itinerary"];
const FAIL_STEP = 2;

export default function mount(root, kit) {
  const { frame, h, toggles, stepper, stats, live } = kit;
  const body = frame(root, { title: "Notice the failure, or plough on" });
  const say = live(body);
  let replan = false, i = 0;

  const list = h("ol", { class: "isai-list" });
  const st = stats([["done", "steps completed"]]);
  const tg = toggles([["replan", "Replan after a failure", replan]], (v) => { replan = v.replan; reset(); });
  body.append(list, st.el, tg.el);

  function render() {
    list.textContent = "";
    for (let s = 0; s < STEPS.length; s++) {
      let status = "pending";
      if (s < FAIL_STEP && s < i) status = "done";
      else if (s === FAIL_STEP && s < i) status = "failed";
      else if (s > FAIL_STEP && s < i) status = replan ? "done (replanned)" : "skipped (depended on the failed step)";
      list.append(h("li", {}, `${STEPS[s]} — ${status}`));
    }
    const finished = i >= STEPS.length;
    const shown = finished ? planFailureOutcome(STEPS.length, FAIL_STEP, replan) : Math.min(i, replan ? STEPS.length : FAIL_STEP);
    st.set("done", `${shown} of ${STEPS.length}`);
  }
  function update() {
    render();
    say(`step ${Math.min(i, STEPS.length)} of ${STEPS.length}, ${replan ? "replanning enabled" : "replanning disabled"}`);
  }
  const sp = stepper({
    stepLabel: "Advance one step",
    onStep: () => { if (i >= STEPS.length) return false; i++; update(); return i < STEPS.length; },
    onReset: () => reset(),
  });
  function reset() { i = 0; update(); }
  body.append(sp.el);
  update();
  return () => {};
}
