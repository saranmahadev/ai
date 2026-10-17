// Bench: compare a mental-math-only answer against one that calls a calculator tool mid-reasoning.
const A = 847, B = 293;
const TRUE_PRODUCT = A * B;
const MENTAL_GUESS = 248000;

export default function mount(root, kit) {
  const { frame, h, stepper, stats, live } = kit;
  const body = frame(root, { title: "Thought, action, observation, answer" });
  const say = live(body);
  let shown = 0;
  const STAGES = [
    `Thought: I need ${A} × ${B}. Let me estimate... roughly ${MENTAL_GUESS}.`,
    `Action: call calculator(${A}, ${B})`,
    `Observation: ${TRUE_PRODUCT}`,
    `Answer: ${TRUE_PRODUCT}`,
  ];

  const list = h("ol", { class: "isai-list" });
  const st = stats([["mental", "mental-math-only guess"], ["tool", "tool-augmented answer"]]);

  function report() {
    list.textContent = "";
    STAGES.slice(0, shown).forEach((s) => list.append(h("li", {}, s)));
    st.set("mental", `${MENTAL_GUESS} (${MENTAL_GUESS === TRUE_PRODUCT ? "correct" : "WRONG"})`);
    st.set("tool", shown >= STAGES.length ? `${TRUE_PRODUCT} (correct)` : "—");
    if (shown > 0) say(STAGES[shown - 1]);
  }
  const sp = stepper({
    stepLabel: "Next stage",
    onStep: () => { if (shown >= STAGES.length) return false; shown++; report(); },
    onReset: () => { shown = 0; report(); },
  });
  body.append(list, st.el, sp.el);
  report();
  return () => {};
}
