Two agents can share the exact same success rate and still be nowhere near equally good. A binary pass/fail outcome per run throws away *how close* each failing run actually got — and an agent whose failures land at 90% of the way there is a very different agent from one whose failures land at 10%, even when both fail the same number of times.

**You need:** [[Agent Benchmarks and Task Suites]].

## The question it answers

"Does a single success-rate number tell you everything you need to know about an agent?" No — a success rate only records whether each run crossed the pass/fail line, not by how much it missed when it didn't. Two agents with an identical success rate can have very different **average partial credit** on their failing runs, which matters enormously for deciding which one is actually closer to being deployable.

## Intuition

Two students who each fail 3 of 5 exam questions could be in very different positions: one got those 3 questions almost entirely right with one small slip each, the other left them nearly blank. A grade book that only records pass/fail per question treats both students identically, even though one of them is clearly closer to mastering the material.

## Definition and notation

```text
success rate    = (runs with credit ≥ 1) / (total runs)
average credit  = mean(credit across all runs), where credit ∈ [0, 1] is partial progress
```

## A worked example

Two agents, each passing 2 of 5 runs and failing the other 3, but with very different credit on those failures:

```text
Agent A: credits = [1.0, 1.0, 0.1, 0.1, 0.1]
  success rate: 2/5 = 40%        average credit: 46%

Agent B: credits = [1.0, 1.0, 0.9, 0.9, 0.9]
  success rate: 2/5 = 40%        average credit: 94%
```

Both agents report an identical 40% success rate. But Agent A's failures are almost complete misses (10% progress each), while Agent B's failures land at 90% progress — one small gap away from passing. Looking only at the success rate, these two agents are indistinguishable; looking at average credit, they're clearly in very different states of readiness.

## Bench

```bench
id: partial-credit-blind-spot
title: Same success rate, very different near-misses
fallback: Compare two agents with the identical 40% success rate but very different average partial credit on their failing runs.
```

**Try this**

1. Check Agent A's success rate and average credit.
2. Switch to Agent B and compare — notice the success rate hasn't moved.
3. Imagine you could only improve one agent with a small fix — which one's failures look more fixable from this chart alone?

**What you should notice:** the success-rate stat alone can't tell these two agents apart at all — it's identical for both — while the average-credit stat immediately shows which agent's failures are close calls and which are far misses.

## Where it appears in AI

* **[[Trajectory-Level Evaluation]], the next topic, is a different way of recovering information a bare success rate throws away**: instead of partial credit on the final state, it looks at which specific steps in the run were sound.
* **Partial-credit scoring connects back to the reward-shaping and subgoal ideas in [[Goal Decomposition into Subtasks]]** — a task broken into checkable subgoals naturally produces a partial-credit signal instead of one binary verdict.
* **Benchmark leaderboards that report only a single aggregate success rate hide exactly this distinction** — two agents tied on the leaderboard can be in very different states of practical readiness.

## Common pitfalls

* **Reporting success rate as if it were the whole evaluation.** The worked example shows two agents that are identical by that one number and completely different by any measure of how close their failures came.
* **Assuming a lower success rate always means a worse agent.** An agent with a 35% success rate but consistently high partial credit on its failures might be one small fix away from a much higher score than an agent stuck at 50% with near-zero credit on its misses.
* **Averaging partial credit without also reporting the success rate.** The two numbers answer different questions — credit alone hides whether a run actually crossed the finish line, exactly the blind spot in the other direction.

## Quick check

<details><summary>1. Why do Agent A and Agent B report the identical success rate in the worked example?</summary>
Both pass exactly 2 of their 5 runs — success rate only counts runs that cross the pass/fail threshold, so it can't distinguish a near-miss failure from a far miss.
</details>

<details><summary>2. What does average partial credit capture that success rate alone doesn't?</summary>
How close each failing run actually got to succeeding — a run that reached 90% of the way there contributes very differently to average credit than one that reached only 10%, even though both count as the same single failure under success rate.
</details>

<details><summary>3. Why might two agents tied on success rate still differ a lot in practical readiness?</summary>
One agent's failures might be near-misses that a small fix could resolve, while the other's failures are far from the goal — information the success rate alone cannot reveal, which is exactly what average partial credit is for.
</details>

## Key terms

* **Success rate:** the fraction of runs that cross the pass/fail threshold, with no information about how close the rest came.
* **Partial credit:** a continuous measure, between 0 and 1, of how much progress a run made toward the goal.
* **Blind spot (in evaluation):** information a single summary metric discards, here the distance between a failing run and success.

## Related

[[Agent Benchmarks and Task Suites]] · [[Trajectory-Level Evaluation]] · [[Goal Decomposition into Subtasks]]
