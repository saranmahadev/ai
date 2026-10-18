An arithmetic mistake made at step two of a four-step calculation doesn't stay contained to step two — every later step builds on the wrong number, and the final answer comes out wrong even though steps three and four were each computed correctly. Self-critique is an agent pausing after its own output, checking that output against what it should have been, and correcting it on the spot before anything downstream ever sees the mistake.

**You need:** [[Evaluator-Optimizer Loops]].

## The question it answers

"Can an agent catch its own mistakes without a separate evaluator role or an external verifier?" A self-critique loop has the agent examine its own last action or output — re-deriving it, checking it against a constraint, or simply asking "does this look right?" — before moving on to the next step. It's the single-role version of the generate-critique-improve cycle: the same agent that produced the output is the one checking it, inline, as part of its own trajectory, rather than handing the check to a second evaluator call.

## Intuition

A careful arithmetic student doesn't just write down each line of a multi-step calculation and move on — they glance back at the line they just wrote, re-derive it in their head, and fix it immediately if it doesn't match, rather than discovering three lines later that the final answer is wrong and having no idea which line broke it.

## Definition and notation

```text
without self-critique:  step[i] = produced(step[i-1])            (used as-is, even if wrong)
with self-critique:     step[i] = produced(step[i-1])
                         if produced(step[i-1]) ≠ recompute(step[i-1]): step[i] = recompute(step[i-1])
```

## A worked example

A 4-step calculation starting from 12: multiply by 4, subtract 10, divide by 2. Step 1 (the multiply) contains an injected error — it should produce 48 but actually produces 52:

```text
without self-critique:  12 → 52 → 42 → 21   (error at step 1 propagates to the final answer)
with self-critique:     12 → 48 → 38 → 19   (step 1's error caught and corrected immediately)

corrections caught: 1
```

Without self-critique, 52 (not 48) feeds into every later step, so the final answer — 21 — is wrong even though the subtract-10 and divide-by-2 steps were each computed correctly from what they were given. With self-critique, the agent recomputes step 1 from its own formula, notices 52 doesn't match the recomputed 48, substitutes the corrected value, and every later step proceeds from the right number.

## Bench

```bench
id: self-critique-loop
title: Catching the error before it spreads
fallback: Step through a 4-step trajectory with self-critique on or off and watch where an injected error gets caught.
```

**Try this**

1. Step through all 4 steps with self-critique off and watch the wrong value propagate.
2. Turn self-critique on, reset, and step through again — watch the correction happen at step 1.
3. Imagine the error were injected at step 3 instead of step 1 — would self-critique still need to catch it at every step, or just that one?

**What you should notice:** self-critique only needs to catch an error once, at the step where it actually happened — it doesn't need to understand the whole trajectory, just whether its own last output matches what it should have produced.

## Where it appears in AI

* **This is the single-agent version of [[Evaluator-Optimizer Loops|the evaluator-optimizer loop]]** covered as a workflow pattern — there, a second call plays the evaluator; here, the same agent plays both roles inline, as part of one continuous trajectory.
* **[[Error Attribution Across a Trajectory]] covers what happens when self-critique isn't run at every step** and a mistake is only noticed much later — attribution is the harder problem of finding which earlier step actually caused it.
* **[[LLM-as-Judge for Agent Trajectories]], covered later, is a more thorough version of the same checking instinct**, applied by an evaluator after the fact rather than by the agent itself mid-trajectory.

## Common pitfalls

* **Trusting self-critique to catch errors it has no way to detect.** The worked example's check works because each step has an independently recomputable formula — a step whose correctness can't be checked this way (a subjective judgment call, say) can't be caught by simply recomputing it.
* **Running critique so late that the cost of the mistake has already been paid.** Catching an error immediately after it happens, as in the worked example, costs far less than discovering it only once the whole trajectory is done.
* **Assuming self-critique replaces an external verifier entirely.** An agent checking its own work is still subject to the same blind spots that produced the mistake in the first place — [[Verifier-Guided Agent Loops]], covered next, adds an independent checking role for exactly this reason.

## Quick check

<details><summary>1. In the worked example, why does the error at step 1 affect the final answer even though steps 2 and 3 are computed correctly?</summary>
Each step's formula is correct, but it's applied to whatever value the previous step produced — if that input value is already wrong, a correctly applied formula still produces a wrong output.
</details>

<details><summary>2. What does self-critique need in order to catch a step's error?</summary>
A way to independently recompute or check that step's own output — without some recomputable formula or constraint to compare against, there's nothing for the critique to notice a mismatch with.
</details>

<details><summary>3. How is self-critique different from the evaluator-optimizer loop covered earlier?</summary>
Evaluator-optimizer uses two separate roles (an optimizer and an evaluator, typically two separate calls) in a fixed workflow; self-critique has the same agent check its own output inline, as part of one continuous trajectory, with no second role involved.
</details>

## Key terms

* **Self-critique loop:** an agent checking its own last output against what it should have produced, before proceeding.
* **Error propagation:** a mistake at one step silently feeding into and corrupting every step that depends on it.
* **Inline correction:** fixing a detected mistake immediately, before it can affect later steps.

## Related

[[Evaluator-Optimizer Loops]] · [[Error Attribution Across a Trajectory]] · [[Verifier-Guided Agent Loops]]
