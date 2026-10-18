A memory store that keeps every fact and every logged episode forever grows without bound — eventually too large to search efficiently, let alone fit anywhere near a context window. Compression keeps the store usable by periodically folding old entries into a smaller summary and, deliberately, forgetting whatever didn't make the cut.

**You need:** [[Episodic Memory and Experience Logs]].

## The question it answers

"What happens once an agent's memory store itself gets too large to use?" Left alone, a raw log of everything an agent has ever done grows linearly with how long it's been running — nothing about an ever-growing store collapses it back down on its own. Memory compression periodically summarizes older entries into a bounded budget, trading detail from the past for a store that stays usable no matter how long the agent keeps running.

## Intuition

A doctor's chart that keeps every visit's full notes forever becomes unwieldy after decades of care — a good chart periodically folds older visits into a brief summary ("stable hypertension since 2019, no other chronic conditions") and keeps only recent visits in full detail. Something is genuinely lost in that folding, but the chart stays usable precisely because it doesn't try to keep everything.

## Definition and notation

```text
raw store size(turns) = turns × tokens_per_turn          — grows without bound
summarized size        = a fixed cap, regardless of turns
compression ratio       = raw store size / cap
```

## A worked example

A transcript growing at 120 tokens per turn, against a fixed 400-token summary budget:

```text
10 turns:   raw = 1,200 tokens   cap = 400   ratio =  3.0×
50 turns:   raw = 6,000 tokens   cap = 400   ratio = 15.0×
200 turns:  raw = 24,000 tokens  cap = 400   ratio = 60.0×
```

The raw store keeps growing in direct proportion to how long the agent has been running; the summarized version doesn't grow at all past the first compression. The ratio between them is exactly how much detail compression is discarding to keep the store at a fixed size — a ratio that itself keeps climbing the longer the agent runs.

## Bench

```bench
id: memory-compression
title: Keeping everything, or keeping a summary
fallback: Compare raw transcript size against a fixed summarization budget as a conversation grows.
```

**Try this**

1. Slide turns up from 10 to 200 and watch the raw bar grow while the summary bar stays fixed.
2. Read off the compression ratio at a few different turn counts.
3. Imagine a specific detail from turn 3 (an exact number the user mentioned) is needed again at turn 180 — what has to be true about the summarization step for that detail to still be recoverable?

**What you should notice:** the summary budget staying fixed is exactly what keeps the store usable — but that fixed budget is also exactly why detail from the past gets lost, which is the actual trade compression is making, not a bug in how it's implemented.

## Where it appears in AI

* **This is the same trade-off as [[Multi-Turn Conversation State and Memory|summarization-based conversation memory]] on the LLMs planet**, applied to an agent's whole long-term memory store rather than just one conversation's context.
* **[[Memory Retrieval as Agent-Time RAG]] can only retrieve what the store still has** — a detail compressed away or dropped during forgetting is gone from retrieval too, no matter how relevant it would have been.
* **[[Memory Compression and Forgetting|Forgetting]] deliberately, bounded by a budget, is different from losing information by accident** — the budget is a design decision about how much of the past to keep, not a failure to keep anything at all.

## Common pitfalls

* **Never compressing at all.** The worked example's 60× ratio at 200 turns shows exactly where an uncompressed store ends up — eventually too large to search efficiently or fit in any reasonable context budget.
* **Compressing too aggressively and losing details that matter later.** A fixed small budget that discards specifics (exact numbers, names, decisions) can make the store confidently wrong rather than just incomplete, if the summary states a vague approximation as if it were the original fact.
* **Assuming compression is lossless.** Folding detail into a summary is a genuine trade, not a free optimization — something always has the possibility of being dropped, which is exactly why what to keep (and for how long) is a real design decision.

## Quick check

<details><summary>1. In the worked example, why does the compression ratio keep climbing as turns increase, rather than staying constant?</summary>
The raw store's size grows in direct proportion to the number of turns, while the summary budget is fixed — so the ratio between a growing numerator and a constant denominator keeps increasing.
</details>

<details><summary>2. What's actually being traded away when a store is compressed?</summary>
Detail from older entries — compression keeps the overall store at a fixed, usable size specifically by giving up the ability to recall older information with full fidelity.
</details>

<details><summary>3. Is forgetting, in this sense, a failure of the memory system?</summary>
No — it's a deliberate design choice, trading detail for a bounded, usable store size; the alternative (keeping everything forever) isn't actually free, since the worked example shows it growing without bound.
</details>

## Key terms

* **Memory compression:** periodically folding older memory entries into a bounded summary.
* **Compression ratio:** the raw store size divided by the fixed summarized size.
* **Forgetting (deliberate):** discarding detail on purpose, as the cost of keeping the overall store at a usable, bounded size.

## Related

[[Multi-Turn Conversation State and Memory]] · [[Memory Retrieval as Agent-Time RAG]] · [[Shared State Across a Multi-Step Task]]
