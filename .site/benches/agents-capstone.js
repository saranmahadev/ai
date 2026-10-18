// Capstone: step one goal through decomposition, tool selection, shared memory, verification, safety and cost, reusing this planet's own verified functions at each stage.
import { countDependencyViolations, recallAtK, worstCaseToolAccuracy, externalCallsWithoutSharedState, externalCallsWithSharedState, trajectoryVerdict, oversightApprovalsNeeded, planExecuteCalls, interleavedCalls } from "./agentkit.js";
import { apiCostLatency } from "./llmkit.js";

const PRICING = { priceIn: 0.003, priceOut: 0.015, prefillPerTok: 0.0005, decodePerTok: 0.02, fixedOverhead: 0.1 };
const DEPS = { search_flights: [], book_flight: ["search_flights"], email_itinerary: ["book_flight"] };
const DECOMPOSED = ["search_flights", "book_flight", "email_itinerary"];
const FLAT = ["email_itinerary", "book_flight", "search_flights"];
const RANKED = [
  { name: "search_hotels", relevant: false },
  { name: "book_flight", relevant: true },
  { name: "cancel_booking", relevant: false },
  { name: "search_restaurants", relevant: false },
  { name: "track_package", relevant: false },
];
const ACTIONS = [
  { name: "search_flights", irreversible: false },
  { name: "book_flight", irreversible: true },
  { name: "email_itinerary", irreversible: false },
];
const STAGES = ["decompose", "select tool", "share state", "verify", "check safety", "account cost"];

export default function mount(root, kit) {
  const { frame, h, stepper, stats, live } = kit;
  const body = frame(root, { title: "One goal, every stage of this road" });
  const say = live(body);
  let stage = 0;

  const list = h("ol", { class: "isai-list" });
  const st = stats([["stage", "current stage"]]);
  body.append(list, st.el);

  function textFor(i) {
    if (i === 0) {
      return `Goal "book a flight and email the itinerary" decomposed into 3 ordered subtasks. Decomposed order: ${countDependencyViolations(DECOMPOSED, DEPS)} dependency violations. A flat, unordered guess: ${countDependencyViolations(FLAT, DEPS)} violations.`;
    }
    if (i === 1) {
      const k = 3;
      return `Selecting the tool for "book_flight" among 5 candidates, top ${k} shown: recall@${k} = ${recallAtK(RANKED, k, 1)}, worst-case (uninformed) accuracy = ${worstCaseToolAccuracy(RANKED, k).toFixed(3)}.`;
    }
    if (i === 2) {
      return `The destination and dates found in step 1 are needed again in steps 2 and 3. Without shared state: ${externalCallsWithoutSharedState(3)} external calls. With shared state: ${externalCallsWithSharedState()} call.`;
    }
    if (i === 3) {
      const v = trajectoryVerdict([true, true, true], true);
      return `Trajectory-level check: ${(v.trajectoryScore * 100).toFixed(0)}% of steps valid, final outcome ${v.outcomePass ? "correct" : "wrong"} — verdict: ${v.trajectoryPass ? "pass" : "fail"}.`;
    }
    if (i === 4) {
      const onLoop = oversightApprovalsNeeded(ACTIONS, "on-loop");
      return `Under an on-loop oversight tier, only irreversible actions need human sign-off: ${onLoop.approvals} of ${onLoop.of} actions (booking the flight) needs approval.`;
    }
    const planCost = planExecuteCalls(3) * apiCostLatency(500, 120, PRICING).cost;
    const reactiveCost = interleavedCalls(3) * apiCostLatency(500, 120, PRICING).cost;
    return `Planning once then executing 3 steps: ${planExecuteCalls(3)} calls, $${planCost.toFixed(5)}. Interleaving think-then-act every step with no upfront plan: ${interleavedCalls(3)} calls, $${reactiveCost.toFixed(5)}.`;
  }
  const texts = STAGES.map((_, i) => textFor(i));

  function render() {
    list.textContent = "";
    for (let i = 0; i <= stage; i++) list.append(h("li", {}, `${STAGES[i]}: ${texts[i]}`));
    st.set("stage", `${stage + 1} / ${STAGES.length} — ${STAGES[stage]}`);
    say(texts[stage]);
  }
  const sp = stepper({
    stepLabel: "pipeline stage",
    onStep: () => {
      if (stage >= STAGES.length - 1) return false;
      stage++;
      render();
      return stage < STAGES.length - 1;
    },
    onReset: () => { stage = 0; render(); },
  });
  body.append(sp.el);
  render();
  return () => {};
}
