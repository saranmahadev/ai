// Bench: the exact position-bias mechanism from the LLMs planet, now comparing two full trajectories.
import { judgeScoreWithPositionBias } from "./llmkit.js";

const QUALITY_A = 0.60, QUALITY_B = 0.65;

export default function mount(root, kit) {
  const { frame, choice, stats, live } = kit;
  const body = frame(root, { title: "Which trajectory the judge reads first" });
  const say = live(body);
  let firstShown = "A";

  const st = stats([["scoreA", "trajectory A score"], ["scoreB", "trajectory B score"], ["winner", "judge prefers"]]);
  const ch = choice("Shown first", [["A", "Trajectory A"], ["B", "Trajectory B"]], firstShown, (v) => { firstShown = v; update(); });
  body.append(st.el, ch.el);

  function update() {
    const scoreA = judgeScoreWithPositionBias(QUALITY_A, firstShown === "A" ? "first" : "second");
    const scoreB = judgeScoreWithPositionBias(QUALITY_B, firstShown === "B" ? "first" : "second");
    st.set("scoreA", scoreA.toFixed(2));
    st.set("scoreB", scoreB.toFixed(2));
    const winner = scoreA > scoreB ? "A" : "B";
    st.set("winner", `Trajectory ${winner}${winner === "A" ? " (wrong -- B is the better trajectory)" : " (correct)"}`);
    say(`trajectory ${firstShown} shown first: A scores ${scoreA.toFixed(2)}, B scores ${scoreB.toFixed(2)}, judge prefers ${winner}`);
  }
  update();
  return () => {};
}
