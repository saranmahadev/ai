Deciding every step of a trip itinerary up front, then just following it, takes one planning conversation and one action per stop. Deciding each stop fresh, in the moment, right before taking it, takes roughly twice as many conversations — one to think, one to act — at every single stop. Plan-and-execute agents choose the first shape: decompose the goal into an ordered plan once, then execute each step with no further planning call, unless something goes wrong.

**You need:** [[Goal Decomposition into Subtasks]].

## The question it answers

"Should an agent decide its whole sequence of steps up front, or decide each next step as it goes?" A **plan-and-execute** agent makes one planning call that decomposes the goal into an ordered list of steps, then makes one additional call per step to execute it — no further reasoning about *what* to do next, just doing what the plan already said. An **interleaved** agent (the [[Tool-Augmented Reasoning (ReAct-Style)|ReAct-style]] pattern already covered in LLMs) instead reasons about what to do at every single step, which costs roughly twice as many calls for the same number of steps but can react to new information the plan never anticipated.

## Intuition

A tourist who plans an entire day's itinerary over breakfast, then just follows it stop by stop, needs one planning conversation and one action at each stop. A tourist who stops to think "what should I do next?" before every single stop is doing the same amount of deciding, just spread across every stop instead of concentrated once — at roughly double the total thinking.

## Definition and notation

```text
plan-and-execute calls(n steps) = 1 (planning) + n (one per step)
interleaved calls(n steps)      = 2n (think + act, every step)
```

## A worked example

Total calls for a task broken into a varying number of steps, under both approaches:

```text
n = 3 steps:  plan-and-execute = 4 calls   interleaved = 6 calls
n = 5 steps:  plan-and-execute = 6 calls   interleaved = 10 calls
n = 8 steps:  plan-and-execute = 9 calls   interleaved = 16 calls
```

The gap widens as the number of steps grows — plan-and-execute adds exactly one call per extra step, while interleaving adds two. The saving only holds, though, as long as the original plan stays good; a plan that goes stale partway through needs [[Re-Planning on Failure|re-planning]] to recover, which spends some of that saved budget back.

## Bench

```bench
id: plan-execute-calls
title: One plan then act, or think at every step
fallback: Compare total LLM calls for plan-and-execute against interleaving a think-then-act call at every step.
```

**Try this**

1. Slide the number of steps up and watch both call counts grow.
2. Notice the gap between the two bars widening as steps increase.
3. Imagine a task where step 3's outcome changes what step 4 should be — would plan-and-execute still work as written?

**What you should notice:** the call-count saving is real and grows with plan length, but it comes with a cost the bench doesn't show directly: a plan-and-execute agent can't adapt mid-plan to something it didn't anticipate, which is exactly the gap [[Re-Planning on Failure|re-planning]] exists to close.

## Where it appears in AI

* **Interleaved planning is the [[Tool-Augmented Reasoning (ReAct-Style)|ReAct pattern]] from LLMs**, applied here as the alternative to committing to a full plan up front.
* **[[Re-Planning on Failure]] is what a plan-and-execute agent needs when the world doesn't match the plan it committed to** — without it, a stale plan just keeps executing anyway.
* **[[Hierarchical Task Planning]] extends the same idea** by planning at more than one level of detail, rather than producing one flat list of steps.

## Common pitfalls

* **Assuming plan-and-execute is simply "better" because it costs fewer calls.** The call-count saving only pays off when the plan stays valid — in a fast-changing environment, the saved calls can be dwarfed by the cost of acting on a now-wrong plan.
* **Using plan-and-execute for a task whose later steps genuinely depend on earlier results in ways that can't be anticipated.** If step 4 truly can't be decided until step 3's result is known, the plan has to leave it open, which is closer to interleaving than to a full upfront plan.
* **Forgetting that interleaving's extra cost buys real adaptability.** The comparison isn't "cheap but rigid vs. expensive and pointless" — interleaving's extra think step is what lets it notice and react to things the plan never anticipated.

## Quick check

<details><summary>1. Why does plan-and-execute need only 1 + n calls for n steps?</summary>
One call produces the entire ordered plan up front, and then each step is executed with a single call that just carries out what the plan already decided — no further "what should I do" reasoning is needed per step.
</details>

<details><summary>2. Why does interleaving cost roughly twice as many calls as plan-and-execute for the same number of steps?</summary>
Interleaving makes a separate thinking call and a separate acting call at every step, rather than deciding the whole sequence once — so each step costs two calls instead of plan-and-execute's roughly one.
</details>

<details><summary>3. What does plan-and-execute give up in exchange for its lower call count?</summary>
The ability to reconsider what to do next in light of something the original plan didn't anticipate — a plan-and-execute agent just keeps executing the plan it already committed to, unless something explicitly triggers re-planning.
</details>

## Key terms

* **Plan-and-execute:** an agent pattern that decomposes a goal into a full ordered plan once, then executes each step without further planning calls.
* **Interleaved (ReAct-style):** an agent pattern that reasons about what to do at every step, rather than committing to a plan in advance.
* **Call budget:** the number of LLM calls an approach needs for a given number of steps.

## Related

[[Goal Decomposition into Subtasks]] · [[Tool-Augmented Reasoning (ReAct-Style)]] · [[Re-Planning on Failure]]
