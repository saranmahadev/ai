An agent that takes a forbidden or dangerous action partway through its run, then happens to land on the correct final answer anyway, passes any grader that only checks the final answer. Trajectory-level evaluation checks the whole sequence of actions instead of just where it ended up — and can fail a run that outcome-only grading would wrongly call a clean success.

**You need:** [[Error Attribution Across a Trajectory]].

## The question it answers

"Is a correct final answer enough to call a run successful?" Not always — the path an agent took to get there can matter independently of where it ended up. Trajectory-level evaluation inspects every step of a run (not just its final message or final state) and can flag a run as unsound even when the outcome-only verdict would call it a pass, which matters whenever *how* a goal was reached carries its own risk or cost.

## Intuition

A delivery driver who runs a red light but still arrives on time technically completed the delivery — but a dashcam review of the whole drive would flag the red light as a real problem, independent of the on-time arrival. Grading only "did the package arrive" misses exactly the part of the trip that actually mattered for safety.

## Definition and notation

```text
outcome-only verdict   = pass if final_result is correct
trajectory score       = (valid steps) / (total steps)
trajectory verdict      = pass only if every step is valid
```

## A worked example

A 4-step agent run that reaches the correct final answer despite one invalid step along the way:

```text
step 1: looked up the policy                              — valid
step 2: deleted the user's file (not asked for)            — invalid
step 3: restored from backup                               — valid
step 4: reported done, correct total                       — valid

outcome-only verdict:    pass   (the final answer is correct)
trajectory score:        3 of 4 steps valid = 75%
trajectory verdict:      fail   (step 2 was never acceptable, regardless of the outcome)
```

The outcome-only grader sees a correct final answer and calls the run a clean success. The trajectory-level grader catches step 2 — an action nobody asked for and that carried real risk — and correctly fails the run despite its lucky recovery.

## Bench

```bench
id: trajectory-level-verdict
title: The right final answer, a flawed path there
fallback: Step through a 4-step trajectory and compare its outcome-only verdict against its trajectory-level verdict.
```

**Try this**

1. Read through the 4 steps and spot the invalid one before checking the verdicts.
2. Compare the outcome-only verdict with the trajectory-level verdict.
3. Imagine the invalid step had been step 4 instead of step 2 — would the final answer still have come out correct?

**What you should notice:** the outcome-only verdict is blind to everything except the last line of the transcript — it has no way to notice an invalid step that didn't happen to break the final answer.

## Where it appears in AI

* **This is the evaluation-side counterpart to [[Error Attribution Across a Trajectory]]**: attribution finds *which* step caused a problem; trajectory-level evaluation is what makes that problem visible to a grader in the first place, rather than letting a lucky recovery hide it.
* **[[LLM-as-Judge for Agent Trajectories]], the next topic, is one concrete mechanism for trajectory-level evaluation** — using a model to read the full transcript and render a verdict, rather than a fixed rule-based step checker like the one in this worked example.
* **Safety-relevant agent deployments (anything touching real files, money, or external systems) specifically need trajectory-level checks**, since an outcome-only check has no way to catch a dangerous intermediate action that the run happened to survive.

## Common pitfalls

* **Grading only the final answer when the path to it carries its own risk.** The worked example's invalid file deletion would be invisible to any grader that only checks whether the final total is correct.
* **Assuming trajectory-level evaluation is only about correctness.** It can just as easily be about process — efficiency, safety, following instructions — independent of whether the final answer happens to be right.
* **Conflating a low trajectory score with task failure.** A 75% trajectory score here still produced the correct outcome; trajectory-level evaluation surfaces a *separate* signal about how the outcome was reached, not a replacement for outcome checking.

## Quick check

<details><summary>1. Why does the outcome-only verdict pass the worked example's trajectory?</summary>
It only checks the final reported result, which happens to be correct — it has no visibility into step 2's invalid file deletion, since that step didn't affect the final answer.
</details>

<details><summary>2. What does the trajectory score of 75% represent in the worked example?</summary>
The fraction of the trajectory's steps (3 of 4) that were valid actions — one step out of four (the file deletion) was invalid.
</details>

<details><summary>3. Why would a safety-relevant deployment specifically need trajectory-level evaluation rather than outcome-only checking?</summary>
A dangerous or unauthorized action partway through a run can be invisible to outcome-only grading if the run still produces a correct final answer — trajectory-level evaluation is what catches that action instead of letting a lucky recovery hide it.
</details>

## Key terms

* **Trajectory-level evaluation:** checking every step of an agent's run, not just its final answer or state.
* **Outcome-only verdict:** a pass/fail judgment based solely on the final result, blind to how it was reached.
* **Trajectory score:** the fraction of a run's steps judged valid, independent of whether the final outcome was correct.

## Related

[[Error Attribution Across a Trajectory]] · [[LLM-as-Judge for Agent Trajectories]] · [[Success-Rate Metrics and Their Blind Spots]]
