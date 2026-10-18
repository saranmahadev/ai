Across this planet's road, the same handful of failure symptoms keep recurring — a stale fact, a result count that's mysteriously short, an answer that confidently cites the wrong thing. Recognizing a symptom quickly, and knowing which earlier topic actually fixes it, turns debugging a RAG system from guesswork into a lookup.

**You need:** [[End-to-End RAG Evaluation Frameworks]].

## The question it answers

"When a RAG system misbehaves, what's the shortest path from the symptom to the fix?" Most RAG failures recur across systems because they trace back to one of a small number of root causes, each already covered earlier on this road: a missing metadata filter, a post-filtering mistake, a vocabulary mismatch, a missing relevance check, or a question requiring more than one retrieval hop. Recognizing the symptom and knowing which earlier topic addresses it is faster than re-deriving the fix from scratch each time.

## Intuition

A mechanic who's seen a thousand cars doesn't start from first principles every time an engine makes a specific noise — a particular knock usually means one of a short list of things, checked in order of likelihood. The same recurring symptoms show up across RAG systems because the same handful of pipeline stages are where things most often go wrong.

## Definition and notation

```text
symptom → likely stage → fix (already covered earlier on this road)
```

## A worked example

Six recurring symptoms, each mapped to its likely stage and fix:

```text
"retrieved a stale version of a fact"
  → retrieval (metadata) → add a freshness filter ([[Metadata Extraction and Enrichment]])

"returned far fewer results than requested"
  → retrieval (filtering) → pre-filter instead of post-filter ([[Metadata Filtering and Hybrid Indexes]])

"missed a query using an exact product code"
  → retrieval (strategy) → add sparse retrieval or hybrid fusion ([[Hybrid Retrieval Fusion]])

"generated a confident answer from irrelevant context"
  → generation (grounding) → add a relevance check ([[Self-RAG and Reflective Retrieval]] / [[Corrective RAG]])

"question needs facts from two different documents"
  → retrieval (strategy) → use multi-hop or graph-based retrieval ([[Multi-Hop and Iterative Retrieval]] / [[Graph-Based RAG]])

"answer doesn't actually use the retrieved context"
  → generation (faithfulness) → measure and enforce faithfulness ([[Grounded Generation and Faithfulness]])
```

Each symptom has a specific, previously-covered cause and fix — none of these require inventing a new technique; they require correctly recognizing which earlier topic the symptom is pointing back to.

## Bench

```bench
id: rag-failure-diagnosis
title: Every symptom points at one stage
fallback: Pick a RAG failure symptom and see which stage and fix it actually points to.
```

**Try this**

1. Pick a symptom and check which stage it points to.
2. Notice two of the symptoms both point to "retrieval (strategy)" for different underlying reasons.
3. Think of a RAG system you've used that exhibited one of these symptoms — does the mapped fix match what you'd expect?

**What you should notice:** several distinct symptoms share the same underlying stage — "retrieval (strategy)" covers both an exact-match miss and a missing multi-hop capability, which are different problems with the same general location in the pipeline.

## Where it appears in AI

* **This is a lookup table over nearly every earlier district on this road** — each row's fix is a specific topic already covered, from [[Metadata Extraction and Enrichment]] in District 2 through [[Grounded Generation and Faithfulness]] in District 7.
* **[[End-to-End RAG Evaluation Frameworks]]'s scorecard is what surfaces which symptom a real system is actually exhibiting**, before this topic's lookup table identifies the likely cause.
* **[[Production RAG Pipeline Architecture]] is where these fixes actually get assembled into a running system**, often addressing several of these failure modes simultaneously by design rather than reactively.

## Common pitfalls

* **Treating every low evaluation score as a generation problem.** Several of the worked example's symptoms are retrieval problems that happen to show up as a bad final answer — fixing generation alone wouldn't help any of them.
* **Assuming a single fix addresses every instance of a given symptom.** "Retrieved a stale fact" could also stem from the document collection simply never being updated at all, which no amount of freshness filtering fixes if the current version was never indexed.
* **Debugging by guesswork instead of checking the evaluation scorecard first.** [[End-to-End RAG Evaluation Frameworks]]'s metrics are what tell you *which* symptom you're actually facing before you reach for a specific fix.

## Quick check

<details><summary>1. Why do "missed a query using an exact product code" and "question needs facts from two different documents" both get mapped to "retrieval (strategy)" despite being different problems?</summary>
Both are fundamentally about the retrieval strategy being insufficient for a specific kind of query — one needs exact-match capability (sparse or hybrid retrieval) and the other needs multi-step retrieval (multi-hop or graph-based) — different fixes, but both located at the retrieval-strategy stage rather than generation.
</details>

<details><summary>2. What's the fastest way to find out which specific symptom a real RAG system is exhibiting?</summary>
Running the scorecard from [[End-to-End RAG Evaluation Frameworks]] — its breakdown by metric points toward which stage (and likely which symptom from this topic's list) is actually responsible, rather than guessing from the final answer alone.
</details>

<details><summary>3. Does every RAG failure trace back to one of these six specific symptoms?</summary>
No — this is a list of commonly recurring symptoms, not an exhaustive taxonomy; a real system can fail in ways specific to its own data or use case that don't match any of these patterns exactly.
</details>

## Key terms

* **Failure mode:** a recurring, recognizable way a RAG system produces a bad result.
* **Symptom-to-fix mapping:** associating an observed problem with the specific pipeline stage and technique that addresses it.
* **Root cause:** the underlying pipeline stage responsible for a surface-level symptom.

## Related

[[End-to-End RAG Evaluation Frameworks]] · [[Metadata Filtering and Hybrid Indexes]] · [[Production RAG Pipeline Architecture]]
