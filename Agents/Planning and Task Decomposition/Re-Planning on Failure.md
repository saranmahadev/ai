A plan to book a trip hits a hotel that's sold out on step 3 of 5. An agent that never checks its own results just keeps going — booking a transfer to a hotel address that was never actually confirmed, then "confirming" an itinerary that was never real. An agent that notices the failure and re-plans picks a different hotel and finishes every remaining step successfully.

**You need:** [[Plan-and-Execute Agents]].

## The question it answers

"What happens when a step in an already-committed plan fails, and how does an agent recover?" Re-planning means detecting that a step didn't produce the result the plan assumed, and generating a new plan for the remaining steps instead of blindly continuing the old one. Without it, every later step that depended on the failed one's result either silently fails too or produces output built on a false premise.

## Intuition

A road trip's GPS route hits a closed bridge. A driver who doesn't notice and keeps following the original turn-by-turn directions ends up stuck at the bridge, with every subsequent direction now meaningless. A driver whose GPS notices the closure and recalculates a new route from the current position reaches the destination anyway — the original plan's failure doesn't have to mean the whole trip fails.

## Definition and notation

```text
plan: step₁ → step₂ → ... → stepₙ
failure at stepₖ:
  without re-planning: steps 1..k-1 complete, step k fails, steps k+1..n depend on it and also fail
  with re-planning:    steps 1..k-1 complete, step k's failure is detected, a new plan for steps k..n is made and completes
```

## A worked example

A 5-step trip-booking plan where step 3 (book hotel) fails because the hotel is sold out:

```text
plan: book flight, get visa, book hotel, book transfer, confirm itinerary
failure: step 3 ("book hotel") — the hotel is sold out

without re-planning: 2 of 5 steps complete (flight, visa) — transfer and itinerary both depend on
                      a hotel that was never actually booked, so they fail too
with re-planning:     5 of 5 steps complete — the failure at step 3 is detected, a new hotel is
                      found, and the remaining steps (transfer, itinerary) proceed against it
```

The difference isn't that re-planning avoids the failure itself — the first hotel is still sold out either way. It's that re-planning contains the damage to the one step that actually failed, instead of letting it silently propagate through every step that assumed it had succeeded.

## Bench

```bench
id: replan-on-failure
title: Notice the failure, or plough on
fallback: Step through a 5-step plan where step 3 fails, comparing outcomes with and without re-planning.
```

**Try this**

1. With replanning off, step through all 5 steps and watch steps 4 and 5 get marked as depending on a step that never actually succeeded.
2. Turn replanning on and step through again — notice steps 4 and 5 now complete.
3. Imagine the failure happened at step 1 instead of step 3 — would re-planning still recover all 5 steps?

**What you should notice:** re-planning doesn't require predicting every possible failure in advance — it only requires noticing, after the fact, that a step's actual result didn't match what the plan assumed, which is the same closed-loop check already covered in [[Open-Loop vs. Closed-Loop Behavior]].

## Where it appears in AI

* **Re-planning is [[Open-Loop vs. Closed-Loop Behavior|closed-loop checking]] applied specifically to a multi-step plan**, rather than to a single action — the loop still has to check its own results, just now at the level of "did this step's actual outcome match the plan's assumption."
* **[[Verifier-Guided Agent Loops]], covered later, generalizes the same detect-and-recover mechanism** into a continuous check running throughout an agent's trajectory, not only at a single plan's failure points.
* **A plan-and-execute agent (the previous topic) specifically needs re-planning** to recover the adaptability it gave up by committing to a plan up front.

## Common pitfalls

* **Assuming a failed step's consequences stay contained to that one step.** The worked example shows the opposite — two further steps fail too, purely because they depended on a result that never materialized.
* **Re-planning the entire task from scratch instead of just the remaining steps.** The completed early steps (booking the flight, getting the visa) don't need to be redone — only the steps from the failure point onward need a new plan.
* **Detecting failure too late.** If the failure at step 3 isn't noticed until step 5 is attempted, the agent has already wasted effort executing steps built on a false premise, rather than catching it at step 3 itself.

## Quick check

<details><summary>1. Why do steps 4 and 5 fail in the worked example even though nothing is wrong with them individually?</summary>
Both depend on step 3 (the hotel booking) having actually succeeded — booking a transfer to an address that was never confirmed, or confirming an itinerary around a hotel that was never booked, doesn't make sense once step 3 failed.
</details>

<details><summary>2. What does re-planning actually change about the outcome of step 3's failure?</summary>
It doesn't prevent the original failure (the first hotel really is sold out), but it stops that failure from silently propagating — a new plan for the remaining steps (built around a different hotel) lets steps 4 and 5 complete successfully instead of failing too.
</details>

<details><summary>3. What's the minimum an agent needs to re-plan successfully?</summary>
It needs to detect that a step's actual result doesn't match what the plan assumed — the same closed-loop check as open-loop vs. closed-loop behavior, just applied to one step of a larger plan rather than a single action.
</details>

## Key terms

* **Re-planning:** detecting that a plan's step failed and generating a new plan for the remaining steps instead of continuing the original one.
* **Failure propagation:** later steps failing because they depended on an earlier step's result that never actually materialized.
* **Detection point:** the moment a failure is actually noticed, which determines how much wasted effort happens before recovery begins.

## Related

[[Plan-and-Execute Agents]] · [[Open-Loop vs. Closed-Loop Behavior]] · [[Verifier-Guided Agent Loops]]
