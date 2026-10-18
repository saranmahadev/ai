An ANN algorithm like HNSW or IVF answers one question well: given a query, which vectors are closest? A real RAG system needs a lot more than that — vectors that can be added and removed as documents change, an index that survives a restart, filtering by metadata, and all of it available to more than one machine at once. That's the gap between a bare search algorithm and a vector database.

**You need:** [[Approximate Nearest Neighbor Search with HNSW]], [[Approximate Nearest Neighbor Search with IVF and Product Quantization]].

## The question it answers

"What does a production system need beyond just an ANN search algorithm?" A bare ANN library is typically built once over a fixed set of vectors and optimized purely for query speed. A vector database wraps that same underlying search algorithm with everything needed to run it as a living system: inserting, updating and deleting vectors after the index already exists; persisting the index so it survives a restart; filtering by metadata alongside similarity; and replicating across machines for availability and scale.

## Intuition

A sorted phone book is a great index for looking up a name — until someone moves, a number changes, or the book needs printing again next year. A phone *company*, as opposed to a single printed book, handles all of that: updates, storage, and keeping multiple copies in sync. A vector database is the company; a bare ANN library is the one printed book.

## Definition and notation

```text
bare ANN library:    optimized to answer "nearest to this query?" over a fixed set of vectors
vector database:      ANN search + inserts/updates/deletes + persistence + metadata filtering + replication
```

## A worked example

Five capabilities, checked against each kind of system:

```text
capability                                          bare ANN library   vector database
compute nearest neighbors for a query                     ✓                  ✓
insert/update/delete vectors after the index is built      ✗                  ✓
persist the index to disk and reload it                    ✗                  ✓
filter by metadata alongside similarity                     ✗                  ✓
replicate across multiple machines                          ✗                  ✓
```

A bare ANN library handles exactly 1 of these 5 capabilities — the core search itself. Everything a real, continuously updated RAG system also needs is the vector database's job, not the search algorithm's.

## Bench

```bench
id: vector-db-capabilities
title: An index structure is only part of the job
fallback: Compare what a bare ANN library handles against what a full vector database adds on top.
```

**Try this**

1. Switch to "bare ANN library" and note how few capabilities are checked.
2. Switch to "vector database" and see every capability covered.
3. Imagine a document collection that changes daily — which of these capabilities would that requirement make non-negotiable?

**What you should notice:** the ANN algorithm (HNSW, IVF, whichever one) is just one row out of five — most of what a production system actually needs from "the vector store" isn't about search speed at all.

## Where it appears in AI

* **A vector database typically lets you choose which ANN algorithm to use underneath** ([[Approximate Nearest Neighbor Search with HNSW]] or [[Approximate Nearest Neighbor Search with IVF and Product Quantization]]) — the database is the wrapper, not a replacement for either.
* **[[Metadata Filtering and Hybrid Indexes]] is specifically about how the "filter by metadata" row actually gets executed alongside similarity search.**
* **[[Caching and Incremental Indexing]] covers the operational side of the "insert/update/delete" row** — how an index actually stays current as a document collection changes continuously, not just in a one-time rebuild.

## Common pitfalls

* **Assuming any ANN library can be dropped directly into production.** The worked example shows it covers only the search itself — a real system also needs updates, persistence, filtering and availability, none of which come free with a search algorithm alone.
* **Rebuilding the entire index from scratch every time a document changes.** Production vector databases are built specifically to support incremental updates, rather than full rebuilds, for exactly this reason.
* **Choosing a vector database by its ANN algorithm alone.** Two vector databases offering the same underlying algorithm can differ enormously in update support, filtering flexibility, and operational maturity — the algorithm is only one of the five rows.

## Quick check

<details><summary>1. In the worked example, what's the one capability a bare ANN library and a vector database both handle?</summary>
Computing nearest neighbors for a query — the core search operation itself.
</details>

<details><summary>2. Why can't a bare ANN library typically handle inserting a new vector after the index is already built?</summary>
Many ANN index structures (especially graph- or cluster-based ones) are optimized for query speed assuming a fixed set of vectors; adding to them efficiently without degrading search quality or requiring a full rebuild is a separate engineering problem a vector database is built to solve.
</details>

<details><summary>3. Why does metadata filtering belong to the vector database layer rather than the ANN algorithm itself?</summary>
The ANN algorithm's job is purely to find vectors close to a query; deciding which of those candidates also satisfy a separate condition (a date range, a permission check) is an additional layer of logic the database adds on top.
</details>

## Key terms

* **Vector database:** a system that wraps an ANN search algorithm with insert/update/delete support, persistence, metadata filtering and replication.
* **Index persistence:** storing a built index to disk so it survives a restart without being rebuilt from scratch.
* **Replication:** maintaining copies of an index across multiple machines for availability and scale.

## Related

[[Approximate Nearest Neighbor Search with HNSW]] · [[Metadata Filtering and Hybrid Indexes]] · [[Caching and Incremental Indexing]]
