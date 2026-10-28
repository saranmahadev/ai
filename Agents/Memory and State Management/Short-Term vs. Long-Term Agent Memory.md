Everything an agent reads during one run — the request, the tool results so far, its own earlier reasoning — disappears the moment that run ends, unless something deliberately writes it somewhere that outlives the run. **Short-term memory** is whatever fits in the current context; **long-term memory** is whatever gets written to storage that the next run can read back.

**You need:** [[Anatomy of an Agent Architecture]].

## The question it answers

"What's the difference between what an agent remembers and what it forgets the moment the run ends?" Short-term memory is the agent's working context for the current run: the request, intermediate results, anything perceived or reasoned about so far. It's immediate and complete, but it vanishes when the run finishes. Long-term memory is anything deliberately persisted to external storage — a file, a database, a vector store — that a *later*, separate run can read back. Nothing moves from short-term to long-term automatically; a fact only survives past the current run if something explicitly writes it somewhere durable.

## Intuition

A contractor who finishes a job and walks away with nothing written down starts the next visit from zero, no matter how much they learned on the first one. A contractor who jots preferences in a notebook before leaving picks up exactly where they left off next time — the notebook is what makes the difference between "remembered" and "re-asked every visit."

## Definition and notation

```text
short-term memory:  current run's context — gone when the run ends
long-term memory:   written to external storage — read back by a later, separate run
```

## A worked example

A user states a preference once; what happens across the next few sessions depends entirely on whether that preference was ever written to long-term storage:

```text
short-term only (nothing persists):
  session 1: user states preference → used this session → session ends → gone
  session 2: preference is restated          (asked again)
  session 3: preference is restated          (asked again)
  total times restated across 3 sessions: 3

long-term memory (written once, read back each time):
  session 1: user states preference → written to storage
  session 2: read back from storage          (not re-asked)
  session 3: read back from storage          (not re-asked)
  total times restated across 3 sessions: 1
```

Nothing about the model changed between the two cases — the only difference is whether the preference was ever written somewhere that outlives a single run. That one write is what turns three repeated questions into one.

## Bench

```bench
id: short-term-vs-long-term-memory
title: Restating a fact, or remembering it
fallback: Compare how many times a fact must be restated across sessions with and without persistent memory.
```

**Try this**

1. Slide the number of sessions up with memory off and watch the restated count climb with it.
2. Turn persistent memory on and see the count drop to 1 regardless of session count.
3. Imagine a preference that changes over time (the user moves, their deadline shifts) — what does a long-term memory store need to do differently than just "write once, read forever"?

**What you should notice:** the gap between short-term and long-term memory isn't about model capability at all — it's entirely about whether something wrote the fact down somewhere that survives past the current run.

## Where it appears in AI

* **This is the memory component named in [[Anatomy of an Agent Architecture]]**, looked at specifically through the lens of what does and doesn't survive past one run.
* **[[Episodic Memory and Experience Logs]] is a specific, structured kind of long-term memory**: not just facts, but a record of what the agent actually did and what happened.
* **This is a different problem from [[Multi-Turn Conversation State and Memory|managing a single long conversation's context]], already covered in LLMs** — that's about keeping one ongoing conversation's context bounded; this is about whether anything survives at all once a run ends entirely.

## Common pitfalls

* **Assuming a model "remembers" something just because it was mentioned earlier in a long context.** That's still short-term memory — it disappears the moment the run ends unless it was separately written somewhere durable.
* **Writing everything to long-term memory indiscriminately.** Not every fact from a run is worth persisting — a long-term store that saves every detail of every run becomes exactly the problem [[Memory Compression and Forgetting]] exists to solve.
* **Forgetting that long-term memory needs its own retrieval step.** Writing a fact to storage doesn't help unless a later run actually reads it back at the right moment — which is why [[Memory Retrieval as Agent-Time RAG]] exists as its own topic.

## Quick check

<details><summary>1. In the worked example, why does the long-term memory case still ask once, at session 1?</summary>
Session 1 is when the preference is first stated; it has to be captured and written to storage at least once before any later session can read it back — the saving comes from every session *after* that no longer needing to ask again.
</details>

<details><summary>2. What makes a fact "long-term memory" rather than just "something in the context"?</summary>
It was deliberately written to external storage that persists after the current run ends, so a separate, later run can read it back — nothing about being mentioned in context alone makes it long-term.
</details>

<details><summary>3. Does a model automatically decide which facts to persist to long-term memory?</summary>
No — nothing moves from short-term to long-term automatically; a fact only survives past the current run if some part of the system explicitly writes it to durable storage.
</details>

## Key terms

* **Short-term memory:** the current run's working context, gone once the run ends.
* **Long-term memory:** anything deliberately written to external storage that a later, separate run can read back.
* **Persist:** to write a fact somewhere that outlives the current run.

## Related

[[Anatomy of an Agent Architecture]] · [[Episodic Memory and Experience Logs]] · [[Memory Retrieval as Agent-Time RAG]]
