// Bench: compare five attempts at the same task with and without the previous attempt's feedback folded into context.
import { attemptsWithoutFeedback, attemptsWithFeedback } from "./agentkit.js";

const N = 5;

export default function mount(root, kit) {
  const { frame, h, choice, stats, live } = kit;
  const body = frame(root, { title: "Repeating the mistake, or learning from it mid-run" });
  const say = live(body);
  let mode = "without";

  const list = h("ul", { class: "isai-list" });
  const st = stats([["correct", "attempts correct"]]);
  const ch = choice("Mode", [["without", "no feedback carried forward"], ["with", "feedback appended to context"]], mode, (v) => { mode = v; update(); });
  body.append(list, st.el, ch.el);

  function update() {
    const results = mode === "without" ? attemptsWithoutFeedback(N) : attemptsWithFeedback(N);
    list.textContent = "";
    results.forEach((ok, i) => list.append(h("li", {}, `attempt ${i + 1}: ${ok ? "✓ correct" : "✗ wrong"}`)));
    const correct = results.filter(Boolean).length;
    st.set("correct", `${correct} of ${N}`);
    say(`${mode === "without" ? "no feedback" : "feedback appended"}: ${correct} of ${N} attempts correct`);
  }
  update();
  return () => {};
}
