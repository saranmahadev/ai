A five-step task that needs today's date can fetch it five separate times, once per step — or fetch it once and write it somewhere every later step can just read. That shared somewhere, a **blackboard**, is what lets a long task's steps build on each other instead of each starting from nothing.

**You need:** [[Memory Compression and Forgetting]].

## The question it answers

"How do the different steps of one long task share information with each other?" Without shared state, each step only has whatever's in its own immediate context — anything another step already figured out or fetched has to be rediscovered or re-fetched from scratch. With a shared blackboard, any step can write a value once and every later step can read it back, without needing to know which earlier step produced it.

## Intuition

A relay team where each runner has to independently figure out the race conditions from scratch wastes effort every single leg; a team with a shared whiteboard at the exchange zone — wind direction, the competition's pace — lets every runner benefit from what the earlier ones already learned, without needing to ask them directly.

## Definition and notation

```text
no shared state:    each step fetches the needed value independently     → n fetches for n steps
shared blackboard:   first step fetches and writes it once; later steps read it → 1 fetch total
```

## A worked example

A 5-step research task where every step needs to know today's date:

```text
no shared state:
  step 1: fetches today's date itself
  step 2: fetches today's date itself
  step 3: fetches today's date itself
  step 4: fetches today's date itself
  step 5: fetches today's date itself
  total external calls: 5

shared blackboard:
  step 1: fetches today's date, writes it to shared state
  steps 2-5: read today's date from shared state
  total external calls: 1
```

Every one of the five calls in the first case returns exactly the same value — the repetition buys nothing, since the date hasn't changed between steps 1 and 5. The shared blackboard removes exactly that redundancy, at the cost of needing somewhere both to write to and to read consistently from across steps.

## Bench

```bench
id: shared-state-blackboard
title: Fetching it again, or reading it off the blackboard
fallback: Compare external calls needed for a piece of shared context, with and without a shared blackboard.
```

**Try this**

1. Slide the step count up with shared state off and watch external calls climb one-for-one.
2. Turn shared state on and see the total drop to 1 regardless of step count.
3. Imagine two steps run in parallel (as in [[Parallelization: Sectioning and Voting|sectioning]]) and both need to write to the same blackboard entry — what has to be true about how writes are handled to avoid one step's write silently overwriting the other's?

**What you should notice:** the saving here isn't from any step doing less work on its own problem — it's from not repeating a fetch whose answer was already available from an earlier step in the same task.

## Where it appears in AI

* **This is [[Memory Compression and Forgetting|memory]] at the scale of a single task rather than across sessions** — a shared blackboard is a short-lived, task-scoped store, built and torn down within one run rather than persisted long-term.
* **[[Coordination Failures and Deadlock]] covers what goes wrong when shared state is read or written inconsistently** by multiple agents or steps working on it at once.
* **[[Supervisor-Orchestrator Patterns|Supervisor/Orchestrator Patterns]]'s orchestrator often owns exactly this shared state**, handing each worker only the piece of it that worker's step actually needs.

## Common pitfalls

* **Re-fetching a value every step "to be safe."** The worked example shows this costs real external calls for no benefit when the value genuinely hasn't changed — the safety concern is valid only when the value actually *can* change mid-task.
* **Sharing state that does change mid-task without any staleness check.** A blackboard entry written once and trusted forever can go stale if the underlying value changes after it was written — shared state removes redundant fetches, not the need to know when a cached value is no longer valid.
* **Using a shared blackboard as a substitute for episodic or long-term memory.** A blackboard is scoped to one task's run; nothing on it survives the task ending unless it's separately written to the kind of persistent store covered by [[Short-Term vs. Long-Term Agent Memory]].

## Quick check

<details><summary>1. In the worked example, why is five separate fetches wasteful when the shared-blackboard version only needs one?</summary>
Today's date doesn't change across the five steps of the task, so every one of the five independent fetches returns the identical value — the blackboard removes exactly that repeated, redundant work.
</details>

<details><summary>2. What distinguishes shared state here from long-term memory?</summary>
Shared state is scoped to a single task's run and disappears once that run ends, unless separately persisted — long-term memory is specifically about writing something to storage that a later, different run can still read.
</details>

<details><summary>3. When would re-fetching a value on every step actually be the right choice?</summary>
When the value can genuinely change during the task — a cached value trusted for the whole run would then go stale, so the redundant-looking re-fetch is actually necessary freshness checking rather than waste.
</details>

## Key terms

* **Shared state (blackboard):** a store any step of a task can write to and any other step can read from, scoped to that one task's run.
* **Redundant fetch:** re-retrieving a value another step already obtained, when nothing about that value has changed.
* **Staleness:** a cached shared value no longer matching the current true value, because something changed after it was written.

## Related

[[Memory Compression and Forgetting]] · [[Coordination Failures and Deadlock]] · [[Supervisor-Orchestrator Patterns|Supervisor/Orchestrator Patterns]]
