// Bench: switch between human oversight tiers and watch how many of a trajectory's actions need approval.
import { oversightApprovalsNeeded } from "./agentkit.js";

const ACTIONS = [
  { name: "search docs", irreversible: false },
  { name: "read file", irreversible: false },
  { name: "summarize", irreversible: false },
  { name: "draft reply", irreversible: false },
  { name: "read calendar", irreversible: false },
  { name: "compute total", irreversible: false },
  { name: "read inbox", irreversible: false },
  { name: "send email", irreversible: true },
  { name: "delete file", irreversible: true },
  { name: "make purchase", irreversible: true },
];
const TIERS = [["in-loop", "human-in-the-loop"], ["on-loop", "human-on-the-loop"], ["out-loop", "human-out-of-the-loop"]];

export default function mount(root, kit) {
  const { frame, h, choice, stats, live } = kit;
  const body = frame(root, { title: "How much review each oversight tier needs" });
  const say = live(body);
  let tier = "on-loop";

  const list = h("ul", { class: "isai-list" });
  const st = stats([["approvals", "actions needing human approval"]]);
  const ch = choice("Oversight tier", TIERS, tier, (v) => { tier = v; update(); });
  body.append(list, st.el, ch.el);

  function update() {
    const r = oversightApprovalsNeeded(ACTIONS, tier);
    list.textContent = "";
    ACTIONS.forEach((a) => {
      const needsApproval = tier === "in-loop" || (tier === "on-loop" && a.irreversible);
      list.append(h("li", {}, `${needsApproval ? "⏸ approval needed" : "▶ runs on its own"} — ${a.name}${a.irreversible ? " (irreversible)" : ""}`));
    });
    st.set("approvals", `${r.approvals} of ${r.of} (${((100 * r.approvals) / r.of).toFixed(0)}%)`);
    say(`${tier}: ${r.approvals} of ${r.of} actions need human approval`);
  }
  update();
  return () => {};
}
