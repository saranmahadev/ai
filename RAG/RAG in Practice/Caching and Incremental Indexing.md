Asking the same question twice shouldn't cost the full pipeline twice — caching the first answer makes the second one nearly free. And adding ten new documents to a hundred-thousand-document index shouldn't mean rebuilding the other 99,990 — incremental indexing updates only what actually changed.

**You need:** [[Production RAG Pipeline Architecture]], [[Vector Databases and Index Management]].

## The question it answers

"How does a production RAG system avoid repeating work it's already done?" **Caching** stores the result of a previous query (or an intermediate step, like an embedding) and serves it again at near-zero cost when the same or a very similar query comes in. **Incremental indexing** adds new documents to an existing index directly, at a cost proportional only to what's being added — rather than rebuilding the entire index from scratch, at a cost proportional to the whole collection, every time anything changes.

## Intuition

A barista who remembers a regular's usual order can make it the moment they walk in, instead of asking every question from scratch each time — that's caching. Expanding a library's catalog by filing ten new books doesn't require re-cataloging the other hundred thousand already on the shelves — that's incremental indexing.

## Definition and notation

```text
cache savings = total_queries × hit_rate × cost_per_query     (approximately free on a cache hit)
incremental index cost  = O(documents added)
full rebuild cost       = O(total documents in the collection)
```

## A worked example

10,000 queries at ~2,620ms each (the full pipeline cost from [[Production RAG Pipeline Architecture]]), at two different cache hit rates:

```text
30% hit rate:  without cache 26,200s total, with cache 18,340s total — 7,860s saved
70% hit rate:  without cache 26,200s total, with cache  7,860s total — 18,340s saved

adding 10 new documents to a 100,000-document index:
  incremental cost: 10 units
  full rebuild cost: 100,000 units
```

A higher cache hit rate saves proportionally more total time, since more of the 10,000 queries skip the full pipeline cost entirely. Adding 10 documents incrementally costs ten-thousandths of what a full rebuild would — rebuilding from scratch every time a handful of documents change is wildly disproportionate to the actual change.

## Bench

```bench
id: cache-incremental-savings
title: A repeated question shouldn't cost the full pipeline twice
fallback: Slide cache hit rate and watch total time saved across a batch of queries; compare incremental indexing against a full rebuild.
```

**Try this**

1. Slide the hit rate up and watch total time saved grow.
2. Compare the incremental and full-rebuild costs for adding 10 documents.
3. Imagine a document collection that changes hourly — what would happen to system cost without incremental indexing?

**What you should notice:** caching's benefit scales with how often queries actually repeat; incremental indexing's benefit scales with how large the existing collection already is relative to what's changing — both exploit the same basic idea of not redoing work that's already settled.

## Where it appears in AI

* **Caching directly reduces the total cost computed in [[Production RAG Pipeline Architecture]]**, by letting a fraction of requests skip the pipeline's full cost entirely.
* **Incremental indexing is a requirement for the "insert/update/delete" capability [[Vector Databases and Index Management]] already identified as something a bare ANN library doesn't handle** — this topic is about why that capability matters operationally.
* **[[Metadata Extraction and Enrichment]]'s freshness filtering depends on new documents actually making it into the index promptly** — a system that can only reindex periodically delays how quickly a freshness filter can reflect new information.

## Common pitfalls

* **Caching without considering when a cached result goes stale.** A cached answer to a question about current information needs some invalidation strategy — caching forever isn't free of the same freshness problems [[Metadata Extraction and Enrichment]] already covers.
* **Rebuilding the full index on every document update "to keep things simple."** The worked example's 10,000x cost gap between incremental and full-rebuild shows this can turn a trivial update into a disproportionately expensive operation.
* **Assuming every ANN index structure supports incremental updates equally well.** Some index types (certain IVF configurations, for instance) handle incremental additions more gracefully than others — this is part of what [[Vector Databases and Index Management]] has to account for when choosing an index type.

## Quick check

<details><summary>1. In the worked example, why does a higher cache hit rate save more total time?</summary>
A higher hit rate means a larger fraction of the 10,000 queries skip the full pipeline cost and are instead served near-instantly from the cache, so the total time spent across all queries drops proportionally more.
</details>

<details><summary>2. Why is a full index rebuild disproportionate to adding 10 documents to a 100,000-document collection?</summary>
A full rebuild reprocesses every document in the collection, including the 99,990 that didn't change at all — its cost scales with the whole collection's size, not with how much actually changed.
</details>

<details><summary>3. What risk does caching introduce that incremental indexing doesn't share?</summary>
A cached result can become stale if the underlying information changes after it was cached — incremental indexing, by contrast, is specifically about keeping the index itself current as documents change, not about serving a potentially outdated cached answer.
</details>

## Key terms

* **Caching:** storing and reusing the result of a previous computation (a query's answer, an embedding) instead of recomputing it.
* **Incremental indexing:** adding new documents to an existing index at a cost proportional to what's added, not the whole collection.
* **Cache hit rate:** the fraction of requests that can be served from the cache rather than requiring full computation.

## Related

[[Production RAG Pipeline Architecture]] · [[Vector Databases and Index Management]] · [[Metadata Extraction and Enrichment]]
