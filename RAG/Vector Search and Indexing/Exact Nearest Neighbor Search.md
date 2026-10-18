Finding the true closest vectors to a query is conceptually the simplest possible search: compute the similarity between the query and every single vector in the collection, then keep the highest-scoring ones. It's also the first thing that stops being affordable as a collection grows into the millions.

**You need:** [[Bi-Encoders and Dense Embeddings]].

## The question it answers

"What does it cost to guarantee you've found the actual closest vectors, with no approximation?" Exact nearest neighbor search compares the query against every vector in the collection — a linear scan. It's correct by construction (there's no way to miss the true top-k, since every candidate was checked), but its cost scales directly with collection size: twice as many vectors means twice as many comparisons, for every single query.

## Intuition

Finding the best-matching paint sample by holding your target up against every single can in the store, one at a time, guarantees you'll find the exact best match — but it's a process whose time cost scales directly with how many cans the store has, and a warehouse with a million cans makes that guarantee very expensive to keep.

## Definition and notation

```text
cost(exact search) = N comparisons, where N is the collection size
```

## A worked example

The number of comparisons needed for one exact query, at three collection sizes:

```text
N =         1,000   →         1,000 comparisons
N =     1,000,000   →     1,000,000 comparisons
N =   100,000,000   →   100,000,000 comparisons
```

The cost is exactly linear: a 100,000× larger collection means exactly 100,000× more comparisons for every single query — there's no shortcut built into exact search that changes this relationship.

## Bench

```bench
id: exact-nn-cost
title: Checking every single vector, every single query
fallback: Slide collection size and watch exact nearest-neighbor search's comparison count grow with it.
```

**Try this**

1. Slide from 1,000 up to 10,000,000 and watch the comparison count grow in exact proportion.
2. Imagine this cost paid for every single query your system receives, not just once.
3. Consider a system serving 1,000 queries per second against a 10-million-vector collection — what does that multiply out to?

**What you should notice:** there's nothing to tune here — the cost is a direct, unavoidable consequence of checking every vector, which is exactly why approximate methods exist for any collection large enough to matter.

## Where it appears in AI

* **[[Approximate Nearest Neighbor Search with HNSW]] and [[Approximate Nearest Neighbor Search with IVF and Product Quantization]] both exist specifically to avoid this linear cost**, at the price of no longer guaranteeing the exact true nearest neighbors.
* **A bi-encoder's precomputed document vectors ([[Bi-Encoders and Dense Embeddings]]) are what makes even exact search computationally simple at all** — the expensive part (encoding) already happened; what's left is comparison, not encoding.
* **Small collections (a few thousand documents) often don't need approximation at all** — exact search's guarantee is worth keeping whenever its linear cost is still cheap enough in absolute terms.

## Common pitfalls

* **Assuming exact search is always "too slow" and reaching for approximation prematurely.** For collections small enough that linear scanning is still fast in absolute terms, the simplicity and guaranteed correctness of exact search can be the better choice.
* **Forgetting that the comparison cost is paid per query, not once.** A collection that's expensive to search exactly stays expensive for every subsequent query, not just the first one.
* **Conflating "exact" with "fast."** Exact search is exact by definition — correctness, not speed, is what it guarantees; speed is exactly what it gives up as the collection grows.

## Quick check

<details><summary>1. Why does exact nearest neighbor search's cost scale exactly linearly with collection size?</summary>
Because it compares the query against every single vector in the collection with no shortcuts — doubling the collection means doubling the number of comparisons needed to check them all.
</details>

<details><summary>2. Does exact search ever return the wrong top-k result?</summary>
No — because every vector in the collection is checked, it's guaranteed to find the true nearest neighbors; its trade-off is cost, not correctness.
</details>

<details><summary>3. At what point does exact search's linear cost become a practical problem?</summary>
Once the collection size and query volume grow large enough that the total number of comparisons (collection size × queries per second) exceeds what the available hardware can keep up with — exactly when approximate methods become worth the trade-off.
</details>

## Key terms

* **Exact nearest neighbor search:** finding the true closest vectors to a query by comparing against every vector in the collection.
* **Linear scan:** checking every item in a collection one by one, with cost proportional to collection size.
* **Approximation trade-off:** accepting a small risk of missing the true closest results in exchange for a large reduction in search cost.

## Related

[[Bi-Encoders and Dense Embeddings]] · [[Approximate Nearest Neighbor Search with HNSW]] · [[Approximate Nearest Neighbor Search with IVF and Product Quantization]]
