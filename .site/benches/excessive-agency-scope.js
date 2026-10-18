// Bench: compare how many of an attacker's desired actions succeed under broad vs. least-privilege tool grants.
import { grantedActionsSucceed } from "./agentkit.js";

const ATTEMPTED = ["read", "forward", "delete", "pay"];
const SCOPES = [["broad", "broad scope (all 4 tools granted)"], ["least", "least-privilege (read only, matches the task)"]];
const GRANTS = { broad: ["read", "forward", "delete", "pay"], least: ["read"] };

export default function mount(root, kit) {
  const { frame, h, choice, stats, live } = kit;
  const body = frame(root, { title: "Only the tools the task actually needs" });
  const say = live(body);
  let scope = "broad";

  const list = h("ul", { class: "isai-list" });
  const st = stats([["succeed", "attacker-desired actions that succeed"]]);
  const ch = choice("Tool grant", SCOPES, scope, (v) => { scope = v; update(); });
  body.append(list, st.el, ch.el);

  function update() {
    const granted = GRANTS[scope];
    const n = grantedActionsSucceed(ATTEMPTED, granted);
    list.textContent = "";
    ATTEMPTED.forEach((a) => list.append(h("li", {}, `${granted.includes(a) ? "✓ succeeds" : "✗ no tool for this — mechanically impossible"} — ${a}`)));
    st.set("succeed", `${n} of ${ATTEMPTED.length}`);
    say(`${scope === "broad" ? "broad scope" : "least-privilege scope"}: ${n} of ${ATTEMPTED.length} attacker-desired actions succeed`);
  }
  update();
  return () => {};
}
