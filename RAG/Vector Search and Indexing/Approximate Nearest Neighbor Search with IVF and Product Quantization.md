Rather than navigating a graph one hop at a time, IVF (inverted file index) takes a different shortcut: group every vector into a cluster ahead of time, and at query time, only search inside the one or few clusters closest to the query — skipping every vector that was never a realistic candidate in the first place.

**You need:** [[Exact Nearest Neighbor Search]], [[Embedding Quantization for Retrieval]].

## The question it answers

"How can clustering avoid searching the whole collection, and what does compressing each cluster add on top of that?" **IVF** partitions a collection into clusters (via k-means or similar), each with a centroid. A query only needs to be compared against the vectors inside whichever cluster's centroid is closest to it — every other cluster is skipped entirely. **Product quantization** (PQ) compresses the vectors *within* each cluster, the same idea as [[Embedding Quantization for Retrieval|embedding quantization]] applied specifically to shrink what IVF has to scan through once it's narrowed down to a cluster.

## Intuition

Looking for a book in a library organized into sections (fiction, history, science) means only browsing one section, not the whole building — IVF's clustering is exactly that sectioning, applied to vectors instead of books. Product quantization is then shrinking each book down to a thinner summary, so browsing that one section goes even faster.

## Definition and notation

```text
cluster(vector)       = nearest centroid, by distance
search(query)         = find query's nearest centroid, then search only vectors in that cluster
```

## A worked example

Eight vectors assigned to three clusters by nearest centroid, then a query searched against only its own cluster:

```text
cluster A (centroid [0.123, 0.133]): a1, a2, a3
cluster B (centroid [0.823, 0.823]): b1, b2, b3
cluster C (centroid [0.125, 0.81]):  c1, c2

query [0.82, 0.84] → nearest centroid: cluster B
→ search only b1, b2, b3 (3 of 8 vectors) instead of all 8
```

The query only ever needs to be compared against the 3 vectors in cluster B — the 5 vectors in clusters A and C are skipped entirely, because their centroids are far enough from the query that nothing inside them could plausibly be the nearest neighbor.

## Bench

```bench
id: ivf-cluster-search
title: Narrow the search to one neighborhood first
fallback: Assign vectors to clusters and search only the query's nearest cluster instead of the whole collection.
```

**Try this**

1. Note which cluster the query falls into and how many vectors get searched.
2. Slide the query toward a different region and watch both the assigned cluster and the searched count change.
3. Imagine a query that falls almost exactly between two clusters — what risk does searching only one cluster introduce?

**What you should notice:** the number of vectors actually compared depends only on the size of the query's own cluster, not on the total collection size — the other clusters' sizes don't matter at all once they're ruled out.

## Where it appears in AI

* **This reuses the same compression idea as [[Embedding Quantization for Retrieval]]**, applied to shrink the vectors inside each cluster rather than the whole collection uniformly.
* **IVF offers a different speed/approximation trade-off than [[Approximate Nearest Neighbor Search with HNSW]]'s graph traversal** — both skip most of the collection, by different mechanisms (clustering vs. graph navigation).
* **[[Vector Databases and Index Management]] typically supports IVF as a configurable index type**, often tunable by how many clusters to search (not just the single nearest one), trading more search time for better recall.

## Common pitfalls

* **Searching only the single nearest cluster when a query falls near a cluster boundary.** A query sitting almost equidistant between two centroids risks having its true nearest neighbor in the *other* cluster — many real IVF systems search several nearby clusters, not just one, to reduce this risk.
* **Assuming cluster sizes are always balanced.** A poorly chosen number of clusters, or naturally uneven data, can leave one cluster far larger than the others, undermining the speedup for queries that land there.
* **Forgetting that cluster assignments need updating as new vectors are added.** A new document's embedding has to be assigned to a cluster at insert time — an index that never rebalances its clusters can drift out of sync with the data's actual distribution.

## Quick check

<details><summary>1. In the worked example, why are clusters A and C skipped entirely for this particular query?</summary>
Their centroids are far from the query's position, so nothing inside them is a realistic candidate for the nearest neighbor — only cluster B's centroid is close enough to be worth searching.
</details>

<details><summary>2. What risk does searching only the single nearest cluster introduce?</summary>
A query that falls near the boundary between two clusters might have its true nearest neighbor sitting just inside the *other* cluster, which would be missed entirely if only one cluster is searched.
</details>

<details><summary>3. What does product quantization add on top of IVF's clustering?</summary>
It compresses the vectors within each cluster (the same idea as embedding quantization), so that once IVF has narrowed the search to one cluster, scanning through that cluster's vectors is also faster and uses less memory.
</details>

## Key terms

* **IVF (inverted file index):** an index that clusters vectors ahead of time and searches only the clusters nearest a query.
* **Centroid:** the representative center point of a cluster, used to decide which cluster a query or vector belongs to.
* **Product quantization:** compressing vectors within a cluster to speed up and shrink the memory of searching inside it.

## Related

[[Exact Nearest Neighbor Search]] · [[Embedding Quantization for Retrieval]] · [[Approximate Nearest Neighbor Search with HNSW]]
