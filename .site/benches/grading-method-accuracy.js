// Bench: compare grading an agent run by exact text match vs. by checking environment state.
import { gradingAccuracy } from "./agentkit.js";

const REFERENCE_TEXT = "Added 2 items to cart.";
const RUNS = [
  { finalText: "Done! Added 2 items.", resultState: 2, expectedState: 2 },
  { finalText: "I added two items to your cart.", resultState: 2, expectedState: 2 },
  { finalText: "Added 2 items to cart.", resultState: 2, expectedState: 2 },
  { finalText: "Your cart now has 2 items in it.", resultState: 2, expectedState: 2 },
].map((r) => ({ ...r, referenceText: REFERENCE_TEXT }));

export default function mount(root, kit) {
  const { frame, h, choice, stats, live } = kit;
  const body = frame(root, { title: "Grading a run by its words, or by its result" });
  const say = live(body);
  let mode = "text";

  const list = h("ul", { class: "isai-list" });
  const st = stats([["correct", "graded correct"]]);
  const ch = choice("Grading method", [["text", "exact text match"], ["state", "environment state check"]], mode, (v) => { mode = v; update(); });
  body.append(list, st.el, ch.el);

  function update() {
    const r = gradingAccuracy(RUNS, mode);
    list.textContent = "";
    RUNS.forEach((run) => {
      const ok = mode === "text" ? run.finalText === run.referenceText : run.resultState === run.expectedState;
      list.append(h("li", {}, `${ok ? "✓" : "✗"} "${run.finalText}"`));
    });
    st.set("correct", `${r.correct} of ${r.of}`);
    say(`${mode === "text" ? "exact text match" : "environment state check"}: ${r.correct} of ${r.of} graded correct`);
  }
  update();
  return () => {};
}
