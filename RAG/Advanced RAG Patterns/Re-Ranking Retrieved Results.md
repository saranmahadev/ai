Running a cross-encoder over an entire 10,000-document collection would cost roughly a million units in this planet's own illustrative units — far too much for a live request. Running it only over the 50 documents a cheap bi-encoder already found promising costs a tiny fraction of that, for most of the accuracy benefit.

**You need:** [[Cross-Encoders and Re-Rankers]].

## The question it answers

"How do you get a cross-encoder's accuracy without paying its cost over an entire collection?" Re-ranking is the two-stage pipeline this trade-off implies: a cheap bi-encoder (or sparse method) retrieves a shortlist — the top 50, say — from the full collection, and only *that* shortlist gets passed to a cross-encoder for a more careful, accurate re-score. The expensive stage never sees the documents the cheap stage already ruled out.

## Intuition

A hiring pipeline doesn't have a senior interviewer review every single résumé submitted — a fast initial screen narrows thousands of applicants down to a shortlist, and only that shortlist gets the time-intensive, careful attention a senior interviewer can actually afford to give.

## Definition and notation

```text
cross-encode everything:      N documents × cross-encoder cost per document
funnel (retrieve + re-rank):  N documents × bi-encoder cost  +  shortlist × cross-encoder cost
```

## A worked example

A 10,000-document collection, re-ranking a shortlist of 50:

```text
cross-encoding the entire collection:         10,000 × 100 = 1,000,000 cost units
bi-encoder retrieval + cross-encoder re-rank:  10,000 × 1  +  50 × 100  =  15,000 cost units

speedup: 1,000,000 / 15,000 ≈ 66.7×
```

The funnel costs roughly 1.5% of what cross-encoding the entire collection would — a two-orders-of-magnitude saving, for an accuracy improvement that only matters within the shortlist the cheap first stage already narrowed things down to.

## Bench

```bench
id: rerank-funnel-cost
title: Expensive scoring, saved for a short list
fallback: Compare the cost of cross-encoding an entire collection against a bi-encoder-then-re-rank funnel.
```

**Try this**

1. Slide the shortlist size up and watch the funnel's total cost grow, but stay far below cross-encoding everything.
2. Slide it down toward 10 and watch the speedup increase further.
3. Imagine a shortlist so large it approaches the full collection size — what happens to the speedup?

**What you should notice:** the funnel's cost is dominated by the cheap bi-encoder pass over the *whole* collection, plus a comparatively small cross-encoder cost over just the shortlist — shrinking the shortlist barely changes the total, since the bi-encoder term already dominates.

## Where it appears in AI

* **This is the practical justification for keeping [[Bi-Encoders and Dense Embeddings]] and [[Cross-Encoders and Re-Rankers]] as separate stages**, rather than ever using a cross-encoder as the primary retrieval mechanism.
* **[[Hybrid Retrieval Fusion]] is often the shortlist-producing first stage** that feeds a re-ranker, combining sparse and dense signals before the expensive re-ranking step ever runs.
* **A re-ranked shortlist is exactly what [[Context Assembly and Ordering]] has to decide how to arrange** — re-ranking determines which passages make it into the final context, and roughly in what order of confidence.

## Common pitfalls

* **Assuming a bigger shortlist is always safer.** A larger shortlist does slightly reduce the risk of the cheap first stage missing a truly relevant document, but the worked example shows the funnel's total cost barely changes — the real risk to manage is the first stage's recall, not the re-ranking cost.
* **Skipping the first stage and cross-encoding everything "to be thorough."** The worked example's two-orders-of-magnitude cost gap is exactly why this doesn't scale past small collections.
* **Forgetting that the funnel's final ranking is only as good as the first stage's recall.** If the true best document never makes it into the shortlist, no amount of careful re-ranking can recover it.

## Quick check

<details><summary>1. In the worked example, why does the funnel's total cost stay low even as the shortlist size grows?</summary>
The bi-encoder pass over the full 10,000-document collection (10,000 cost units) dominates the total; the cross-encoder's cost over the shortlist only adds 100 units per document kept, which stays small relative to the bi-encoder term for any reasonable shortlist size.
</details>

<details><summary>2. What's the risk of making the shortlist too small?</summary>
If the true most relevant document scores just outside the shortlist cutoff under the cheap first-stage method, it never reaches the cross-encoder at all — no amount of accurate re-ranking can recover a document that was never passed through.
</details>

<details><summary>3. Why is re-ranking not simply "run a cross-encoder on everything, but faster"?</summary>
It's a structurally different approach — a cheap method handles the full collection first, and only the resulting shortlist gets the expensive treatment; the cross-encoder itself isn't optimized to be cheaper, it's just applied to far fewer documents.
</details>

## Key terms

* **Re-ranking:** applying a more accurate (and more expensive) scoring method to a shortlist a cheaper method already produced.
* **Shortlist:** the reduced set of candidates passed from a cheap retrieval stage to an expensive re-ranking stage.
* **Two-stage retrieval:** a pipeline combining a fast, broad first pass with a slow, narrow second pass.

## Related

[[Cross-Encoders and Re-Rankers]] · [[Hybrid Retrieval Fusion]] · [[Context Assembly and Ordering]]
