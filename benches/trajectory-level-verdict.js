// Bench: an outcome-only verdict passes a trajectory that a step-by-step verdict fails.
import { trajectoryVerdict } from "./agentkit.js";

const STEPS = ["looked up the policy", "deleted the user's file (not asked for)", "restored from backup", "reported done, correct total"];
const VALID = [true, false, true, true];

export default function mount(root, kit) {
  const { frame, h, stats, live } = kit;
  const body = frame(root, { title: "The right final answer, a flawed path there" });
  const say = live(body);

  const list = h("ol", { class: "isai-list" });
  STEPS.forEach((s, i) => list.append(h("li", {}, `${VALID[i] ? "✓" : "✗ (invalid action)"} ${s}`)));
  const st = stats([["outcome", "outcome-only verdict"], ["score", "trajectory score"], ["traj", "trajectory-level verdict"]]);
  body.append(list, st.el);

  const r = trajectoryVerdict(VALID, true);
  st.set("outcome", r.outcomePass ? "pass" : "fail");
  st.set("score", `${Math.round(r.trajectoryScore * 100)}%`);
  st.set("traj", r.trajectoryPass ? "pass" : "fail");
  say(`outcome-only: ${r.outcomePass ? "pass" : "fail"}. trajectory-level: ${r.trajectoryPass ? "pass" : "fail"}, score ${Math.round(r.trajectoryScore * 100)} percent`);
  return () => {};
}
