Sparse retrieval and dense retrieval fail in different, complementary ways — one misses semantic matches with no shared vocabulary, the other can blur exact matches it should have caught outright. Hybrid fusion runs both and combines their two separate rankings into one, so a candidate only needs to be a top pick for *one* method to make it into the final result.

**You need:** [[Sparse Retrieval with TF-IDF and BM25]], [[Dense Retrieval]].

## The question it answers

"How do you combine a sparse ranking and a dense ranking into one, without one approach's errors sinking an otherwise-good candidate?" **Reciprocal rank fusion (RRF)** doesn't look at either method's raw scores at all — it only uses each candidate's *rank* (1st, 2nd, 3rd...) within each ranking, and sums 1/(k + rank) across all the rankings a candidate appears in. A candidate ranked first by sparse retrieval and second by dense retrieval gets credit from both; it doesn't need to win both rankings to end up near the top of the fused result.

## Intuition

Combining two different critics' top-ten lists for the same set of restaurants by giving credit for how highly each critic ranked each restaurant — rather than averaging their star ratings, which might use entirely different scales — produces a fair combined ranking where a restaurant beloved by either critic alone still ranks well.

## Definition and notation

```text
RRF_score(doc) = Σ_rankings  1 / (k + rank_of(doc, ranking))
```

`k` (commonly 60) softens the effect of exact rank differences near the top.

## A worked example

Three candidates, ranked differently by sparse and dense retrieval:

```text
sparse ranking (exact-term match wins):  A, B, C
dense ranking (semantic match wins):      B, A, C

fused (RRF) scores:
  A: 0.03252
  B: 0.03252
  C: 0.03175
```

A and B end up tied — each was ranked first by one method and second by the other, so each receives the exact same combined credit. Both clearly outrank C, which never ranked better than last in either method. Fusion doesn't require agreement between the two methods; it rewards *either* method's confidence.

## Bench

```bench
id: hybrid-rrf-fusion
title: Either method's top pick survives fusion
fallback: Fuse a sparse ranking and a dense ranking with reciprocal rank fusion and see which candidates survive.
```

**Try this**

1. Look at the default scenario and note A and B tie while C trails behind.
2. Switch to the scenario where C ranks first on both methods instead, and watch C's fused score jump to the top.
3. Imagine a candidate that ranks 2nd on both methods, versus one that ranks 1st on one and last on the other — which would you expect to score higher under RRF?

**What you should notice:** RRF only cares about rank position, not the raw similarity or BM25 scores — a method's confidence (how big the score gap was) doesn't carry over into the fusion, only where each candidate landed in the order.

## Where it appears in AI

* **This is the direct answer to the complementary failure modes shown in [[Sparse Retrieval with TF-IDF and BM25]] and [[Dense Retrieval]]'s own worked examples** — a candidate either method would have missed on its own can still surface if the other method ranks it well.
* **[[Re-Ranking Retrieved Results]] often runs on top of a fused shortlist like this one**, applying a more expensive cross-encoder only to the candidates fusion already judged worth a closer look.
* **Many production RAG systems run hybrid retrieval as their default first stage** ([[Production RAG Pipeline Architecture]]), precisely because neither sparse nor dense retrieval alone reliably covers both kinds of relevance.

## Common pitfalls

* **Assuming fusion requires both methods to agree for a candidate to rank well.** The worked example shows the opposite — A and B each only won one of the two rankings, and both still beat C decisively.
* **Mixing raw similarity scores and BM25 scores directly instead of using rank.** The two methods' raw scores live on completely different, incomparable scales; RRF sidesteps this entirely by only using rank position, never the raw score values.
* **Treating fusion as a fix for a fundamentally broken retrieval method.** Fusion combines two reasonably good rankings into a better one — if one method is consistently bad on a given query, fusion limits but doesn't eliminate the damage.

## Quick check

<details><summary>1. In the worked example, why do candidates A and B receive exactly the same fused score?</summary>
A ranks 1st in the sparse ranking and 2nd in the dense ranking; B ranks 2nd in the sparse ranking and 1st in the dense ranking — the sum of 1/(k+rank) across both rankings comes out identical for each.
</details>

<details><summary>2. Does reciprocal rank fusion use each method's raw similarity or BM25 score?</summary>
No — it only uses each candidate's rank position within each ranking, which avoids the problem of trying to directly compare scores on incompatible scales.
</details>

<details><summary>3. If a candidate ranks 2nd on both sparse and dense rankings, would it score higher or lower than one ranked 1st on one and last on the other?</summary>
It depends on the exact numbers, but RRF is specifically designed so that a strong showing on even one ranking can meaningfully boost a candidate — consistent moderate performance and one-sided strong performance can land close together, which is exactly the trade-off the worked example's tie illustrates.
</details>

## Key terms

* **Hybrid retrieval:** combining sparse and dense retrieval into a single ranking.
* **Reciprocal rank fusion (RRF):** a fusion method that combines rankings using each candidate's rank position, not its raw score.
* **Fusion constant (k):** a smoothing parameter in RRF that softens the effect of small rank differences near the top.

## Related

[[Sparse Retrieval with TF-IDF and BM25]] · [[Dense Retrieval]] · [[Re-Ranking Retrieved Results]]
