// Bench: toggle an action-level guardrail and watch it block proposed actions matching a high-risk pattern.
import { actionGuardrailResult } from "./agentkit.js";

const ACTIONS = [
  "SELECT * FROM users",
  "UPDATE profile SET name='x'",
  "DROP TABLE orders",
  "wire_transfer(5000, 'external_acct')",
  "search('refund policy')",
  "send_email(summary)",
];
const HIGH_RISK = ["DROP TABLE", "wire_transfer"];

export default function mount(root, kit) {
  const { frame, h, toggles, stats, live } = kit;
  const body = frame(root, { title: "Checking the action, not the explanation" });
  const say = live(body);
  let guarded = false;

  const list = h("ul", { class: "isai-list" });
  const st = stats([["execute", "actions that execute"], ["blocked", "actions blocked"]]);
  const tg = toggles([["guard", "check each proposed action against high-risk patterns before running it", guarded]], (v) => { guarded = v.guard; update(); });
  body.append(list, st.el, tg.el);

  function update() {
    const results = guarded ? actionGuardrailResult(ACTIONS, HIGH_RISK) : ACTIONS.map((a) => ({ action: a, blocked: false }));
    list.textContent = "";
    results.forEach((r) => list.append(h("li", {}, `${r.blocked ? "⛔ blocked" : "▶ executes"} — ${r.action}`)));
    const executed = results.filter((r) => !r.blocked).length;
    st.set("execute", `${executed} of ${ACTIONS.length}`);
    st.set("blocked", String(results.filter((r) => r.blocked).length));
    say(`${guarded ? "guardrail on" : "guardrail off"}: ${executed} of ${ACTIONS.length} actions execute`);
  }
  update();
  return () => {};
}
