Embedding a query and comparing it to embedded documents is a cosine-similarity problem, already covered in Math. A **bi-encoder** is the specific choice of encoding the query and each document *independently*, so every document's vector can be computed once, stored, and reused across every future query — the whole reason retrieval over millions of documents can be fast at all.

**You need:** [[Embeddings and Similarity Search]], [[Anatomy of a RAG Pipeline]].

## The question it answers

"Why does retrieval scale to huge collections when comparing a query to every document directly wouldn't?" A bi-encoder passes the query through an encoder and each document through the *same* encoder, separately — "bi" for the two independent passes. Because documents never need to be re-encoded once a query arrives, their vectors can be computed ahead of time, indexed, and compared against any future query with nothing more expensive than a dot product.

## Intuition

Looking up a word in a dictionary works because every entry was alphabetized once, in advance — finding "retrieval" doesn't require re-sorting the whole dictionary for every lookup. A bi-encoder's precomputed document vectors are the same idea: the expensive part (encoding) happens once per document, forever, and every query only pays the cheap part (one encode, then fast comparisons).

## Definition and notation

```text
doc_vec  = encode(document)        -- computed once, stored
query_vec = encode(query)          -- computed per query
score(query, doc) = cosine_similarity(query_vec, doc_vec)
```

## A worked example

One query against three precomputed document vectors, ranked by cosine similarity:

```text
query: "how long do refunds take" → [0.90, 0.10]

"refund timeline"   [0.95, 0.05]  →  similarity 0.9983
"returns policy"     [0.85, 0.15]  →  similarity 0.9980
"shipping times"     [0.30, 0.20]  →  similarity 0.8882
```

The compute cost tells the real story: with a 1,000-document collection, a bi-encoder spends roughly 1 query encode plus 1,000 cheap dot products (about 1,001 cost units). A cross-encoder, which must jointly process the query with *each* document from scratch, spends roughly 1,000 full forward passes — each far more expensive than a dot product, totaling around 100,000 cost units in this illustration. The gap only widens as the collection grows.

## Bench

```bench
id: bi-encoder-ranking
title: Precompute the documents once, compare cheaply forever
fallback: Rank documents by bi-encoder cosine similarity and compare the per-query compute cost against a cross-encoder's.
```

**Try this**

1. Look at the ranking — it's the same cosine-similarity computation from Math, applied to retrieval.
2. Slide the collection size up and watch the cost gap between bi-encoder and cross-encoder widen.
3. Imagine a collection of a million documents — would re-encoding every one of them for every query still be feasible?

**What you should notice:** the bi-encoder's cost grows roughly linearly with collection size, driven by cheap dot products; a cross-encoder's cost grows the same way but driven by expensive joint forward passes — the same shape of growth, at a vastly different constant factor.

## Where it appears in AI

* **[[Vector Databases and Index Management]] exists specifically to store and search the precomputed document vectors a bi-encoder produces.**
* **[[Cross-Encoders and Re-Rankers]] covers the more accurate, more expensive alternative** that a bi-encoder's speed makes practical to apply only to a short, already-narrowed shortlist.
* **Multi-vector retrieval ([[Multi-Vector and Late-Interaction Retrieval]]) is a middle ground**: still precomputed like a bi-encoder, but keeping several vectors per document instead of pooling into one.

## Common pitfalls

* **Assuming a bi-encoder's precomputed vectors mean zero cost per query.** Encoding the query itself still has a real cost — the savings come from not having to re-encode every *document* for every query.
* **Expecting bi-encoder similarity to always match true relevance exactly.** Encoding the query and document independently is what makes precomputation possible, but it can miss fine-grained interactions a joint encoding would catch — the trade-off [[Cross-Encoders and Re-Rankers]] covers next.
* **Forgetting that document vectors need re-computing if the embedding model changes.** A bi-encoder's speed advantage assumes the stored vectors and any new query vector come from the same model — swapping models means re-indexing the whole collection.

## Quick check

<details><summary>1. Why can a bi-encoder's document vectors be computed once and reused for every future query?</summary>
Because the query and document are encoded independently — a document's vector doesn't depend on what query will eventually be compared against it, so it never needs to be recomputed.
</details>

<details><summary>2. In the worked example, why does the cross-encoder's cost grow so much faster than the bi-encoder's as the collection size increases?</summary>
Both costs scale linearly with collection size, but the cross-encoder's per-document cost (a full joint forward pass) is far larger than the bi-encoder's (a single dot product against an already-computed vector), so the same linear growth reaches a much larger total.
</details>

<details><summary>3. What has to happen to a collection's stored vectors if the embedding model used to produce them is replaced?</summary>
Every document has to be re-encoded and re-indexed with the new model — a bi-encoder's stored vectors are only comparable to queries encoded by that same model.
</details>

## Key terms

* **Bi-encoder:** an encoder applied independently to the query and to each document, enabling document vectors to be precomputed.
* **Dense embedding:** a vector representation (as opposed to a sparse, word-count-based one) produced by an encoder like a bi-encoder.
* **Precomputation:** computing and storing document vectors once, ahead of any specific query.

## Related

[[Cross-Encoders and Re-Rankers]] · [[Vector Databases and Index Management]] · [[Dense Retrieval]]
