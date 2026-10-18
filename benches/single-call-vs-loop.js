// Bench: step a multi-hop lookup and compare a single call's answer against a looped agent's.
import { singleCallLookup, loopedLookup } from "./agentkit.js";

const ORG = { Alice: { manager: "Bob" }, Bob: { manager: "Carol" }, Carol: { department: "Engineering" } };

export default function mount(root, kit) {
  const { frame, h, stepper, stats, live } = kit;
  const body = frame(root, { title: "One lookup answers the wrong question" });
  const say = live(body);
  let step = 0;

  const list = h("ol", { class: "isai-list" });
  const st = stats([["single", "single-call answer"], ["loop", "looped-agent answer"]]);
  body.append(list, st.el);

  const single = singleCallLookup(ORG, "Alice");
  const path = ["Alice"];
  let cur = "Alice";
  while (ORG[cur].manager) { cur = ORG[cur].manager; path.push(cur); }
  path.push(ORG[cur].department);

  function render() {
    list.textContent = "";
    for (let i = 0; i <= step && i < path.length; i++) list.append(h("li", {}, path[i]));
    st.set("single", `"${single}" (wrong -- that's just Alice's manager)`);
    st.set("loop", step >= path.length - 1 ? `"${path[path.length - 1]}" (correct)` : "still looking...");
    say(`step ${step + 1}: now at "${path[Math.min(step, path.length - 1)]}"`);
  }
  const sp = stepper({
    stepLabel: "lookup step",
    onStep: () => {
      if (step >= path.length - 1) return false;
      step++;
      render();
      return step < path.length - 1;
    },
    onReset: () => { step = 0; render(); },
  });
  body.append(sp.el);
  render();
  return () => {};
}
