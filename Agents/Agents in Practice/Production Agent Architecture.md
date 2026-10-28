Every topic in this subject so far has zoomed into one piece of an agent — planning, a tool call, a memory lookup. Running the whole thing means those pieces fit into one repeating loop, and the time each stage of that loop takes adds up into a single number a real request actually waits on.

**You need:** [[Anatomy of an Agent Architecture]], [[Observability and Tracing for Agent Runs]].

## The question it answers

"How do the pieces this subject covered separately fit into one running loop?" A production agent loop repeats four stages every iteration: **observe** the current state of the environment, **reason** about what to do next (typically an LLM call), **act** by calling a tool, and **verify** the result before deciding whether to continue. Each stage is individually fast or slow for different reasons, and — just like a RAG pipeline's latency is dominated by generation — one stage usually dominates an agent loop's latency too.

## Intuition

A single round of a kitchen line check isn't one task — it's look at the ticket (observe), decide what to cook next (reason), actually cook it (act), and taste it before it goes out (verify). The chef's actual thinking is usually the slowest part of that cycle, not reading the ticket or plating the dish.

## Definition and notation

```text
one loop iteration = observe + reason + act + verify
total = sequentialTotal([observe, reason, act, verify])
```

## A worked example

One iteration's latency, broken down by stage:

```text
observe (read current state):      5ms  ( 0.2%)
reason  (LLM call, decide action): 1800ms ( 88.9%)
act     (execute tool call):       200ms  ( 9.9%)
verify  (check the result):        20ms  ( 1.0%)
total:                             2025ms
```

The reason stage — a single LLM call deciding what to do next — dominates the iteration by a wide margin, the same way generation dominates a RAG pipeline's latency. Observing, acting and verifying together add up to barely more than 11% of the total; a user waiting on this loop is mostly waiting on the model to think, not on the tool it eventually calls.

## Bench

```bench
id: agent-loop-latency
title: One loop iteration, four stages
fallback: See where one agent-loop iteration's latency actually goes, and how that changes as the reasoning call gets slower or faster.
```

**Try this**

1. Look at the default breakdown and note how small observe, act and verify are compared to reason.
2. Slide the reason stage's latency down toward 200ms — watch its share of the total shrink.
3. Imagine a tool call (act) that takes 5 seconds instead of 200ms — would reasoning still dominate?

**What you should notice:** which stage dominates isn't fixed — it depends on both how slow the reasoning call is and how slow the specific tool being called happens to be; the worked example's "reasoning dominates" conclusion holds for a typical fast tool call, not universally.

## Where it appears in AI

* **The reason stage is exactly one augmented-LLM call, [[The Augmented LLM|already covered]] in this subject** — this topic is about where it sits in a repeating loop, not a new mechanism.
* **[[Observability and Tracing for Agent Runs]] is what makes this stage-by-stage breakdown visible in the first place** — without tracing, you'd only see the loop's total time, not which stage spent it.
* **[[Cost and Latency of Agent Loops]] takes this same four-stage shape and adds up what happens across many iterations**, not just one.

## Common pitfalls

* **Optimizing the act or verify stage first.** The worked example shows they're a small fraction of the total — the reason stage is almost always the bigger lever, the same way generation dominates a RAG pipeline.
* **Assuming every iteration's reason stage costs the same.** A growing transcript (more context to reason over) tends to make later iterations' reason stage slower than earlier ones, not constant.
* **Treating the loop's four stages as fixed for every tool.** A tool that itself takes several seconds (a web search, a long-running computation) can flip which stage actually dominates.

## Quick check

<details><summary>1. In the worked example, why does the reason stage dominate the loop's total latency?</summary>
It's a full LLM call generating a decision about what to do next, which — like any LLM generation — is far slower than reading current state, executing a tool call, or checking a result against an expectation.
</details>

<details><summary>2. Does the worked example's "reasoning dominates" conclusion always hold?</summary>
No — it holds for a typical fast tool call. A tool that itself takes several seconds (a slow API, a long search) could make the act stage dominate instead.
</details>

<details><summary>3. What's the minimum four stages this topic's loop repeats each iteration?</summary>
Observe the current state, reason about what to do next, act by calling a tool, and verify the result — repeated every iteration until the task is done.
</details>

## Key terms

* **Production agent loop:** the repeating observe-reason-act-verify cycle a running agent executes each iteration.
* **Reason stage:** the LLM call deciding what to do next, typically the loop's dominant latency cost.
* **Stage breakdown:** how a loop iteration's total latency divides among its constituent stages.

## Related

[[Observability and Tracing for Agent Runs]] · [[Cost and Latency of Agent Loops]] · [[The Augmented LLM]]
