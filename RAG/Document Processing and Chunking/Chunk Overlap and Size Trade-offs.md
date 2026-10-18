A fact that happens to straddle a chunk boundary disappears — split in half across two chunks, it may be incomplete in both and never score high enough against a query to be retrieved. Overlap, repeating a few characters at the end of one chunk at the start of the next, can rescue a split fact, but every character of overlap is a character stored and embedded twice.

**You need:** [[Fixed-Size and Recursive Chunking]].

## The question it answers

"How much should consecutive chunks overlap, and what does more overlap actually cost?" With zero overlap, a fact that falls across a chunk boundary is split and may never appear whole in any single chunk. Increasing overlap raises the odds that such a fact lands intact in at least one chunk — but every overlapping character is stored, embedded, and indexed in both chunks, so total redundancy grows directly with overlap.

## Definition and notation

```text
chunk starts: 0, (size − overlap), 2·(size − overlap), ...
redundancy = (total characters across all chunks − document length) / document length
```

## A worked example

A 40-character chunk size, with the phrase "original payment method" (23 characters) sitting right across a chunk boundary at zero overlap:

```text
overlap  0:   6 chunks, 0.0% redundancy,  "original payment method" intact: no
overlap 10:   7 chunks, 29.6% redundancy, "original payment method" intact: no
overlap 20:  11 chunks, 90.1% redundancy, "original payment method" intact: yes
```

At overlap 0 and even at overlap 10, the phrase never lands whole inside a single chunk — it keeps falling across whatever boundary happens to be nearby. Only at overlap 20 (half the chunk size) does it finally land intact in some chunk — at the cost of storing and embedding nearly double the document's actual length.

## Bench

```bench
id: chunk-overlap-tradeoff
title: Rescuing a split fact costs redundant tokens
fallback: Slide chunk overlap and watch a boundary-straddling fact get rescued, at a redundancy cost.
```

**Try this**

1. Start at overlap 0 and confirm the fact is split across chunks.
2. Move to overlap 10 and notice the fact is *still* split — more overlap doesn't guarantee rescue at every step.
3. Move to overlap 20 and watch both the fact become intact and the redundancy spike to 90%.

**What you should notice:** going from "fact split" to "fact intact" isn't a smooth, continuous improvement as overlap rises — it happens at whatever overlap value finally shifts a chunk boundary past the fact's own span, and that threshold can require a surprisingly large overlap relative to the chunk size.

## Where it appears in AI

* **This is the quantitative version of the problem [[Fixed-Size and Recursive Chunking]] shows qualitatively** — a split fact is exactly what a broken chunk boundary produces.
* **Every redundant character here is also a redundant embedding and a redundant index entry** ([[Vector Databases and Index Management]]) — overlap's storage cost isn't just document size, it's indexing cost too.
* **[[Multi-Hop and Iterative Retrieval]] is sometimes a better fix for the same underlying problem**: instead of widening overlap to try to capture a whole fact in one chunk, retrieve multiple related chunks and let generation assemble the fact from them.

## Common pitfalls

* **Assuming more overlap always helps, proportionally.** The worked example shows the fact stays split at both 0% and a meaningfully increased 10-character overlap — the benefit only shows up once overlap crosses a specific threshold tied to where the fact actually falls.
* **Treating overlap as free.** 90% redundancy at overlap 20 means the index is storing and searching through almost twice the actual content — a real cost in storage and retrieval latency, not just a parameter to tune upward by default.
* **Picking a chunk size and overlap once and never revisiting them.** Different document types (dense technical specs vs. conversational FAQs) have very different "typical fact length," which changes what overlap is actually needed.

## Quick check

<details><summary>1. In the worked example, why does overlap 10 fail to rescue the fact even though it's larger than overlap 0?</summary>
Increasing overlap shifts where chunk boundaries fall, but it doesn't guarantee a boundary shifts past the exact span of any particular fact — at overlap 10, the boundary still happens to land inside the fact's span.
</details>

<details><summary>2. What's the real cost of raising overlap from 0 to 20 characters in the worked example?</summary>
Redundancy jumps from 0% to 90.1% — nearly double the document's actual content is now duplicated across chunk boundaries, all of which gets stored, embedded and indexed.
</details>

<details><summary>3. Is there a chunk size and overlap combination that guarantees no fact is ever split?</summary>
Not in general — any fixed chunk size can still split a fact longer than the chunk itself, and overlap only helps once it's large enough relative to the specific fact's length and position, which varies fact to fact.
</details>

## Key terms

* **Overlap:** the number of characters (or tokens) repeated between the end of one chunk and the start of the next.
* **Redundancy:** the fraction of total stored characters that are duplicates caused by overlap.
* **Boundary-straddling fact:** a piece of information that falls across where a chunk boundary happens to land, risking being split and lost.

## Related

[[Fixed-Size and Recursive Chunking]] · [[Semantic and Structure-Aware Chunking]] · [[Multi-Hop and Iterative Retrieval]]
