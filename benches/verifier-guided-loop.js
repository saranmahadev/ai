// Bench: compare six agent actions run with and without a verifier that retries a failing action immediately.
import { runVerifierGuided } from "./agentkit.js";

const ACTIONS = [
  { validOnAttempt: 0 }, { validOnAttempt: 0 }, { validOnAttempt: 1 },
  { validOnAttempt: 0 }, { validOnAttempt: 0 }, { validOnAttempt: 0 },
];
const MAX_RETRIES = 2;

export default function mount(root, kit) {
  const { frame, h, choice, stats, live } = kit;
  const body = frame(root, { title: "Checking each action before moving on" });
  const say = live(body);
  let useVerifier = false;

  const list = h("ul", { class: "isai-list" });
  const st = stats([["outcome", "task outcome"], ["retries", "retries used"]]);
  const tg = choice("Verifier", [["off", "no verifier"], ["on", "verifier checks each action"]], "off", (v) => { useVerifier = v === "on"; update(); });
  body.append(list, st.el, tg.el);

  function update() {
    const { results, allOk, retriesUsed } = runVerifierGuided(ACTIONS, useVerifier, MAX_RETRIES);
    list.textContent = "";
    results.forEach((r, i) => list.append(h("li", {}, `action ${i + 1}: ${r.ok ? "✓ passed" : "✗ failed"}${r.attempts > 1 ? ` (attempt ${r.attempts})` : ""}`)));
    st.set("outcome", allOk ? "succeeded" : "failed");
    st.set("retries", `${retriesUsed} of ${ACTIONS.length * MAX_RETRIES} budget`);
    say(`${useVerifier ? "with verifier" : "without verifier"}: task ${allOk ? "succeeded" : "failed"}, ${retriesUsed} retries used`);
  }
  update();
  return () => {};
}
