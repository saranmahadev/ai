A 16-step agent trajectory fails, and the final output is visibly wrong — but the step that actually caused it happened eleven steps earlier, with five more steps run on top of it before anything noticed. Error attribution is the problem of finding *which* earlier step actually broke, not just noticing that the end result did.

**You need:** [[Plan-and-Execute Agents]].

## The question it answers

"Once a trajectory has failed, how do you efficiently find which step actually caused it?" A trajectory is a sequence of steps, each depending on the ones before it. If a failure only surfaces at the end, the obvious approach — scanning forward from step one, checking each step until something looks wrong — works, but costs one check per step up to and including the culprit. A faster approach treats "is everything still valid up to step i?" as a question whose answer flips from true to false exactly once, at the culprit, and finds that flip with a binary search instead of a linear scan.

## Intuition

Searching for the one blown fuse in a long row of them by testing each one in order, left to right, works — but testing the middle one first, then repeatedly halving whichever half still contains the blown fuse, finds it in far fewer tests once the row gets long. The same halving trick applies to a trajectory: check the midpoint step, and the half that broke tells you where to keep looking.

## Definition and notation

```text
linear forward scan:  checks = culprit_index                     (check steps 1, 2, 3, ... until the culprit)
binary search:         checks = ⌈log₂(n)⌉                         (n = total trajectory length)
```

## A worked example

A 16-step trajectory where the actual culprit is step 11 — everything before it is valid, everything from it onward is not:

```text
n = 16, culprit = step 11

linear forward scan:  checks steps 1, 2, 3, ..., 11 → found in 11 checks
binary search:         checks 4 steps total → found in 4 checks

⌈log₂(16)⌉ = 4
```

The linear scan needs exactly as many checks as the culprit's position — if the culprit were step 2, it would only take 2 checks, but if it were step 15, it would take 15. Binary search needs the same 4 checks (⌈log₂(16)⌉) no matter where the culprit actually is, because each check halves the remaining range regardless of which half the culprit turns out to be in.

## Bench

```bench
id: error-attribution-search
title: Finding the one step that broke it
fallback: Compare a linear forward scan against a binary search for the step that broke a 16-step trajectory.
```

**Try this**

1. Run the linear scan and count how many of the 16 steps get checked before step 11 is found.
2. Switch to binary search and see the much smaller set of checked steps.
3. Imagine the culprit were step 2 instead of step 11 — would binary search's check count change?

**What you should notice:** binary search's advantage grows with trajectory length — the gap between 11 checks and 4 checks here would be far larger on a 1000-step trajectory, where linear scanning could need up to 1000 checks but binary search would still need only 10.

## Where it appears in AI

* **This generalizes the per-step check in [[Self-Critique Loops in Agents]]** to the case where nothing caught the error at the time it happened, and it has to be found after the fact instead.
* **Binary search here requires the failure condition to be monotonic** — once a step is broken, every later step built on it is too — the same assumption [[Re-Planning on Failure]] relies on when deciding how far back a plan needs to be revised.
* **[[Trajectory-Level Evaluation]], covered later, is the broader problem this is one tool for**: judging not just whether a trajectory succeeded, but which parts of it were actually responsible for the outcome.

## Common pitfalls

* **Assuming the step where the failure is noticed is the step that caused it.** The worked example's failure doesn't surface until the trajectory's final check, five steps after the actual culprit — blaming the last step would be wrong.
* **Using binary search when the failure condition isn't monotonic.** If a later step could coincidentally "fix" an earlier error back to a valid-looking state, the binary search's halving logic no longer reliably converges on the true culprit.
* **Paying for a linear scan's worst case on a long trajectory without needing to.** The cost gap between the two approaches only grows as trajectories get longer — a long-running agent is exactly where this matters most.

## Quick check

<details><summary>1. In the worked example, why does binary search need only 4 checks regardless of whether the culprit is step 2 or step 15?</summary>
Each check halves the range of steps still being searched, so the number of checks needed depends only on the trajectory's total length (⌈log₂(n)⌉), not on where within that length the culprit happens to be.
</details>

<details><summary>2. What assumption does binary search's correctness depend on here?</summary>
That the failure condition is monotonic — once a step breaks, every step after it stays broken too — so checking a single midpoint reliably tells you which half the culprit is in.
</details>

<details><summary>3. Why would the gap between linear scan and binary search matter more on a longer trajectory?</summary>
Linear scan's cost grows directly with the culprit's position (up to the full trajectory length), while binary search's cost grows only logarithmically — the longer the trajectory, the larger the gap between the two becomes.
</details>

## Key terms

* **Error attribution:** identifying which specific step in a trajectory actually caused an observed failure.
* **Linear forward scan:** checking a trajectory's steps in order until the broken one is found.
* **Monotonic failure:** a condition that, once false, stays false for every later step.

## Related

[[Self-Critique Loops in Agents]] · [[Re-Planning on Failure]] · [[Trajectory-Level Evaluation]]
