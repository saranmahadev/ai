Every mechanism this planet covered separately — decomposing a goal, picking a tool, sharing state across steps, checking a trajectory, gating a risky action, accounting for cost — is usually described one at a time, with its own worked example. This capstone follows one real goal through all six of those mechanisms in order, reusing the exact same functions each earlier topic already verified, so the whole pipeline's numbers connect end to end.

**You need:** [[Goal Decomposition into Subtasks]], [[Tool Selection Among Many Candidates]], [[Shared State Across a Multi-Step Task]], [[Trajectory-Level Evaluation]], [[Autonomy Levels and Human Oversight Tiers]], [[Cost and Latency of Agent Loops]].

## The question it answers

"What does a single goal actually go through, in order, from arriving as a request to being executed and checked?" Six stages, each already covered in depth on this road: breaking the goal into ordered subtasks; selecting the right tool for a step among several candidates; sharing state fetched once across the steps that all need it; verifying the finished trajectory step by step, not just its final answer; checking which of its actions need a human's sign-off before running; and totaling what the whole thing actually cost.

## Intuition

A travel agent handling "book me a flight and send me the itinerary" does roughly these same six things in order: figures out search-then-book-then-email is the only order that makes sense, picks up the phone meant for bookings rather than the one meant for restaurant reservations, keeps the destination and dates in mind instead of asking the client to repeat them at every step, double-checks the whole plan actually went through before calling it done, knows the booking itself is the one step that needs the client's go-ahead first, and can tell you afterward what the whole errand cost in time and calls.

## Definition and notation

```text
stage 1: decompose       — order subtasks so no step runs before what it depends on
stage 2: select tool     — pick the right tool for a step among several candidates
stage 3: share state     — fetch shared context once, not once per step that needs it
stage 4: verify          — check every step's validity, not just the final answer
stage 5: check safety    — gate irreversible actions behind human approval
stage 6: account cost    — total what the whole trajectory actually cost
```

## A worked example

The goal "book a flight to Denver and email the itinerary," traced through all six stages using the exact functions already verified earlier on this planet:

```text
stage 1 (decompose): search_flights → book_flight → email_itinerary
  decomposed order: 0 dependency violations
  flat/guessed order: 2 dependency violations

stage 2 (select tool): "book_flight" among 5 candidates, top 3 shown
  recall@3: 1.0 (the right tool survived the shortlist)
  worst-case (uninformed) accuracy: 0.333

stage 3 (share state): destination + dates needed by all 3 steps
  without shared state: 3 external calls
  with shared state: 1 call

stage 4 (verify): all 3 steps valid, final answer correct
  trajectory score: 100% · verdict: pass

stage 5 (check safety): under an on-loop oversight tier
  1 of 3 actions (booking the flight, irreversible) needs human approval

stage 6 (account cost): planning once then executing 3 steps
  plan-execute: 4 calls, $0.01320
  interleaved (no upfront plan): 6 calls, $0.01980
```

Nothing in this trace is new mechanics — decomposition's 0-versus-2 violations is exactly [[Goal Decomposition into Subtasks]]'s own comparison, the tool-selection numbers are [[Tool Selection Among Many Candidates]]'s own recall calculation, and so on through every stage. What's new is seeing them connect: the shared state stage 3 sets up is exactly what stage 1's ordering made available at the right time, and stage 6's cost accounting is cheaper specifically because stage 1 planned ahead instead of reasoning step by step with no plan.

## Bench

```bench
id: agents-capstone
title: One goal, every stage of this road
fallback: Step one goal through decomposition, tool selection, shared state, verification, a safety check and cost accounting, reusing this planet's own verified functions at each stage.
```

**Try this**

1. Step through all six stages and read each one's own number.
2. Compare stage 1's decomposed-order violations (0) against the flat guess (2) — notice decomposition is what made every later stage's assumptions valid in the first place.
3. Reset and imagine stage 5's safety check didn't exist — would the irreversible booking action have run without anyone approving it first?

**What you should notice:** each stage's number was independently verified earlier on this planet's own road — this capstone doesn't introduce new mechanics, it chains six already-verified mechanisms together in the order a real agent run would actually hit them.

## Where it appears in AI

* **Stage 1 reuses [[Goal Decomposition into Subtasks]] exactly**, stage 2 reuses [[Tool Selection Among Many Candidates]]'s own worked example, stage 3 reuses [[Shared State Across a Multi-Step Task]]'s mechanism, stage 4 reuses [[Trajectory-Level Evaluation]]'s verdict function, stage 5 reuses [[Autonomy Levels and Human Oversight Tiers]]'s approval-tier logic, and stage 6 reuses [[Cost and Latency of Agent Loops]]'s cost model — nothing here is new mechanics, only the ordering.
* **[[Production Agent Architecture]] is this same shape at the level of one loop iteration**, with observability layered on top so every one of these six stages can actually be traced.
* **[[Coordination Failures and Deadlock]] names what can go wrong if this single-agent trace were instead split across multiple uncoordinated agents** — this capstone is the single-agent reference case those failures deviate from.

## Common pitfalls

* **Skipping decomposition and hoping the steps happen to land in a workable order anyway.** The worked example's flat guess produces 2 dependency violations out of 3 possible — a real agent attempting steps in that order would try to book a flight before it had been searched for.
* **Treating a passing final answer as proof every step along the way was valid.** Stage 4's trajectory-level check exists specifically because [[Trajectory-Level Evaluation]] already showed a correct final answer can hide an invalid step that happened to not matter this time.
* **Granting broad tool access upfront instead of gating the one genuinely irreversible action.** Stage 5's result — only 1 of 3 actions needs approval — only holds because the safety check is scoped to irreversible actions specifically, not applied as a blanket requirement on every step.

## Quick check

<details><summary>1. Why does stage 1's decomposition matter for every stage that comes after it?</summary>
Every later stage assumes the steps run in a dependency-respecting order — stage 3's shared state assumes the destination was already found before it's needed again, and stage 4's trajectory check assumes each step builds on a valid prior step. A flat, undecomposed guess (2 violations) would break those assumptions.
</details>

<details><summary>2. In stage 6, why does the plan-execute approach cost less than the interleaved approach?</summary>
Plan-execute pays for one planning call plus one call per step (4 calls for 3 steps); interleaving a fresh think-then-act call at every step costs two calls per step (6 calls) with no upfront plan to amortize — the same call-count comparison [[Plan-and-Execute Agents]] already established.
</details>

<details><summary>3. What would it mean if stage 5's safety check had been skipped entirely?</summary>
The irreversible booking action would have executed without any human approval, exactly the excessive-agency failure [[Excessive Agency and Scope Limits]] describes — granting an agent the ability to take a consequential, hard-to-reverse action with no gate in front of it.
</details>

## Key terms

* **End-to-end trace:** following one goal through every stage of a pipeline in order, rather than examining each stage in isolation.
* **Dependency-respecting order:** a sequence of subtasks where every task runs only after everything it depends on has already completed.
* **Oversight tier:** which category of an agent's actions require a human's approval before running, scoped specifically to irreversible or high-risk ones.

## Related

[[Goal Decomposition into Subtasks]] · [[Trajectory-Level Evaluation]] · [[Autonomy Levels and Human Oversight Tiers]]
