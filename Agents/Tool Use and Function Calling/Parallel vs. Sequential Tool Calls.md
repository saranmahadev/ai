Checking flight prices, the weather at the destination, and today's exchange rate are three tool calls that have nothing to do with each other — running them one after another wastes however long the fastest two spent waiting for no reason. Booking a flight, then sending a confirmation for that exact booking, can't be reordered or parallelized at all: the second call needs a result the first one hasn't produced yet.

**You need:** [[Parallelization: Sectioning and Voting]].

## The question it answers

"When can an agent's tool calls run at the same time, and when must they run one after another?" The answer turns entirely on **data dependency**: if no call needs another call's result as an input, they can run in parallel, finishing in however long the *slowest* one takes. If any call's input depends on another call's output, that pair — and everything chained to it — has no choice but to run sequentially, no matter how fast each individual call is.

## Intuition

Three separate errands — mailing a letter, buying groceries, and picking up dry cleaning — can be done in any order or even delegated to three different people at once, because none of them depends on how any other turns out. Baking a cake can't be parallelized the same way: you can't frost it before it's baked, because frosting needs the baked cake as an input.

## Definition and notation

```text
independent calls: sequential total = Σ latencies      parallel total = max(latencies)
dependent chain:    sequential total = Σ latencies      parallel total = not possible
```

## A worked example

Three independent lookups, and a three-step dependent booking chain, each with real per-call latencies:

```text
independent (flight search 800ms, weather check 300ms, exchange rate 150ms):
  sequential total: 800 + 300 + 150 = 1250ms
  parallel total:   max(800, 300, 150) = 800ms

dependent (search flight 800ms → book flight 400ms → send confirmation 200ms):
  sequential total: 800 + 400 + 200 = 1400ms
  parallel total:   not possible — each step needs the previous step's result
```

The independent calls save 450ms just by recognizing they don't need to wait on each other. The dependent chain can't be sped up the same way at all — the only way to shorten it is to make an individual step faster, not to reorder or parallelize the calls themselves.

## Bench

```bench
id: parallel-vs-sequential-tools
title: Run them together, or one after another
fallback: Compare total latency for independent tool calls run in parallel against a dependent chain that can only run sequentially.
```

**Try this**

1. Look at the independent calls and note the gap between sequential and parallel totals.
2. Switch to the dependent chain and see that no parallel option exists at all.
3. Imagine the "check weather" call also needed the flight search's destination city as an input — would it still be independent?

**What you should notice:** the saving from parallelizing has nothing to do with how many calls there are — it comes entirely from whether any of them actually needs another's result, which is a property of the task, not a setting to toggle.

## Where it appears in AI

* **This is exactly [[Parallelization: Sectioning and Voting|sectioning]] from the previous district**, applied specifically to tool calls instead of whole sub-prompts — the mechanism (independent work finishes in the time of its slowest piece) doesn't change.
* **[[Goal Decomposition into Subtasks]]'s dependency graph is what actually determines which tool calls are independent** — a correct decomposition identifies this before any call is made, rather than discovering it by trial and error.
* **A chain of dependent tool calls is a small instance of [[Plan-and-Execute Agents|plan-and-execute]]'s step-by-step execution**, where each step genuinely needs the step before it.

## Common pitfalls

* **Running calls sequentially out of habit even when nothing connects them.** The worked example's independent case wastes 450ms this way — time that bought nothing, since none of the three calls needed to wait for another.
* **Trying to parallelize calls that are actually dependent.** Attempting to send a booking confirmation before the booking call has returned a confirmation number doesn't just fail to save time — it fails outright, because the second call has nothing valid to send yet.
* **Misjudging independence because two calls look unrelated on the surface.** Two calls can still be dependent through a shared input (both needing a destination city determined by a first call) even if neither obviously depends on the other's full output.

## Quick check

<details><summary>1. Why does the independent case's parallel total equal 800ms rather than something smaller?</summary>
Even running all three calls at once, the overall wait is bounded by whichever single call takes the longest — here, the 800ms flight search — so nothing can finish before that, no matter how fast the other two are.
</details>

<details><summary>2. Why can't the dependent chain's total time be reduced by reordering or parallelizing its three calls?</summary>
Each call in the chain needs a specific result from the call before it (a booking needs a flight search result, a confirmation needs a booking result) — there's no valid order to run them in except the one the dependencies require, and no way to start two of them at once.
</details>

<details><summary>3. What property of a set of tool calls determines whether they can be parallelized?</summary>
Whether any call's input depends on another call's output — calls with no such dependency between them can run in parallel; any dependency at all forces that part of the sequence to run one after another.
</details>

## Key terms

* **Data dependency:** one tool call needing another call's result as an input.
* **Independent calls:** tool calls with no data dependency between them, which can run in parallel.
* **Dependent chain:** a sequence of tool calls where each one needs the previous one's result, forcing sequential execution.

## Related

[[Parallelization: Sectioning and Voting]] · [[Goal Decomposition into Subtasks]] · [[Plan-and-Execute Agents]]
