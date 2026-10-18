An agent that runs six actions in sequence, one of which is subtly wrong, finds out it failed only once all six are done — by which point the bad action has already fed into whatever came after it. A verifier that checks each action the moment it's produced, and retries it on the spot if it fails, never lets that bad action leave the loop in the first place.

**You need:** [[Evaluator-Optimizer Loops]].

## The question it answers

"What does the evaluator-optimizer pattern look like generalized across an agent's entire trajectory, rather than a fixed number of workflow rounds?" A verifier-guided loop pairs every action an agent takes with an immediate check: a separate verifier scores the action, and if it fails, the agent retries that one action — not the whole trajectory — before moving on. Unlike [[Self-Critique Loops in Agents|self-critique]], the checking role here is a separate, independent verifier rather than the agent checking itself; unlike the evaluator-optimizer workflow, there's no fixed round count — the loop runs for as long as the trajectory does, checking every single action along the way.

## Intuition

A translator working through a document line by line, with an editor checking each translated line the moment it's produced and sending back just that line for a redo if it's wrong, never has to redo the whole document — only the one line that needed it. A translator working alone, with no one checking until the very end, only finds out a line was wrong once everything built on top of it.

## Definition and notation

```text
without verifier:  action[i] used as produced, even if wrong
with verifier:      action[i] checked immediately; retried (up to a budget) until it passes
                     task succeeds only if every action eventually passes
```

## A worked example

Six actions, one of which (action 3) fails on its first attempt but passes once retried, with a budget of up to 2 retries per action:

```text
without verifier:  action 3 used as produced → fails → task fails overall
with verifier:      action 3 retried once → passes → task succeeds

retries used: 1 of 12 possible (6 actions × 2-retry budget)
```

Without a verifier, action 3's failure is never caught at all — it's simply used, and the task fails. With a verifier checking each action immediately, action 3 is retried exactly once before it passes, and every other action needed no retry at all — spending only 1 of a possible 12 retries across the whole trajectory to turn a failure into a success.

## Bench

```bench
id: verifier-guided-loop
title: Checking each action before moving on
fallback: Compare six agent actions run with and without a verifier that retries a failing action immediately.
```

**Try this**

1. Run without the verifier and see which action's failure sinks the whole task.
2. Turn the verifier on and watch that same action get retried and pass.
3. Imagine two actions needed a retry instead of one — would the retry budget (12) still be enough?

**What you should notice:** the verifier's cost here is small and localized — one retry on one action — compared to the alternative of running the whole trajectory blind and only discovering the failure once everything downstream has already used the bad result.

## Where it appears in AI

* **This generalizes [[Evaluator-Optimizer Loops|the evaluator-optimizer workflow]]** from a fixed number of generate-critique-improve rounds into a continuous check running for as long as the agent's trajectory does.
* **[[Re-Planning on Failure]] uses the same detect-and-recover shape at the level of an entire plan**; a verifier-guided loop applies the identical idea one level down, to each individual action.
* **[[Guardrails for Agent Actions]], covered later, is a stricter relative of the same mechanism** — a verifier scores and retries a questionable action, while a guardrail blocks certain actions from being attempted at all.

## Common pitfalls

* **Letting a verifier retry indefinitely with no budget.** Without some cap on retries per action, a persistently failing action could consume unbounded time and cost instead of eventually escalating or failing cleanly.
* **Checking only the final output instead of every action along the way.** The worked example's whole benefit comes from catching action 3's failure the moment it happens — checking only at the very end would be no better than having no verifier at all.
* **Assuming the verifier itself is infallible.** A verifier that incorrectly passes a bad action, or incorrectly rejects a good one, introduces its own new failure mode on top of whatever it's meant to be checking.

## Quick check

<details><summary>1. Why does the task fail entirely without a verifier, even though only one of six actions was wrong?</summary>
Nothing checks action 3's output before it's used, so its failure isn't caught at all — the task simply proceeds on a bad result and fails overall.
</details>

<details><summary>2. How is a verifier-guided loop different from the evaluator-optimizer workflow covered earlier?</summary>
Evaluator-optimizer runs a fixed number of generate-critique-improve rounds over one output; a verifier-guided loop checks every action across an agent's entire trajectory, for as long as that trajectory runs, with no fixed round count.
</details>

<details><summary>3. In the worked example, why is only 1 of the 12-retry budget actually used?</summary>
Only one of the six actions (action 3) needed a retry at all, and it passed after just a single retry — the other five actions were valid on their first attempt and needed no retries.
</details>

## Key terms

* **Verifier-guided loop:** an agent loop where a separate verifier checks and retries each action immediately, rather than only checking the final result.
* **Retry budget:** the maximum number of retries allowed per action before the loop gives up or escalates.
* **Localized failure:** a problem caught and fixed at the specific action that caused it, rather than requiring the whole trajectory to be redone.

## Related

[[Evaluator-Optimizer Loops]] · [[Re-Planning on Failure]] · [[Guardrails for Agent Actions]]
