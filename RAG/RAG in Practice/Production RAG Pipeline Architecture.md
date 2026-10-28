Every topic in this subject so far has zoomed into one stage of a RAG system. Running the whole thing means those stages have to actually fit together into one pipeline, each one handing its output to the next — and the time each stage takes adds up into a single number a real user actually waits for.

**You need:** [[Anatomy of a RAG Pipeline]], [[Re-Ranking Retrieved Results]].

## The question it answers

"How do all the pieces this subject covered separately fit into one running system?" A production pipeline chains together everything from earlier sections: embed the query, search the vector index, re-rank the shortlist, assemble the context, and generate an answer — each stage built from a specific technique this subject already covered, run in sequence for every single request.

## Intuition

A restaurant kitchen doesn't just have a chef — it has a specific sequence of stations (prep, grill, plating) each handing off to the next, and the total time a diner waits is the sum of however long each station actually takes, not just however good any one station is at its job.

## Definition and notation

```text
total latency = embed_query + vector_search + rerank + assemble + generate
```

## A worked example

A typical request's latency, broken down by stage:

```text
embed query:          15ms   ( 0.6%)
vector search:         20ms   ( 0.8%)
re-rank:                80ms   ( 3.1%)
assemble context:        5ms   ( 0.2%)
generate (LLM call):  2,500ms  (95.4%)
total:                2,620ms
```

Generation dominates the total by a wide margin — everything retrieval contributes (embedding, searching, re-ranking, assembling) adds up to barely 5% of the total request time. The retrieval stages are individually fast; it's the generation call at the end that a user is mostly waiting on.

## Bench

```bench
id: pipeline-latency-breakdown
title: One request, five stages, very unequal shares
fallback: See where a RAG request's total latency actually goes, stage by stage.
```

**Try this**

1. Look at the default breakdown and note how small retrieval's total share is.
2. Slide the re-rank shortlist size up and watch re-ranking's share grow.
3. Imagine re-ranking a shortlist large enough that it actually rivals generation's latency — what shortlist size would that take?

**What you should notice:** even as re-ranking's cost grows with shortlist size, generation stays the dominant cost across a wide range — retrieval has to get dramatically more expensive before it meaningfully changes the total latency a user experiences.

## Where it appears in AI

* **Every stage in this pipeline is a specific technique from an earlier section**: embedding ([[Bi-Encoders and Dense Embeddings]]), searching ([[Approximate Nearest Neighbor Search with HNSW]] or similar), re-ranking ([[Re-Ranking Retrieved Results]]), assembling ([[Context Assembly and Ordering]]), generating ([[Grounded Generation and Faithfulness]]).
* **[[Cost and Latency of RAG Systems]] takes this same breakdown and adds the dollar cost side**, not just timing.
* **[[Caching and Incremental Indexing]] is where this architecture gets optimized further**, specifically targeting the stages whose cost can be avoided on repeated or near-duplicate requests.

## Common pitfalls

* **Optimizing retrieval latency aggressively while generation dominates the total.** The worked example shows retrieval's total share is small enough that even halving it barely moves the overall request time — generation is usually the bigger lever.
* **Assuming every request needs every stage.** [[Self-RAG and Reflective Retrieval]] already showed some queries don't need retrieval at all — a production architecture can route around stages a given request doesn't need.
* **Treating the pipeline as a fixed, one-size-fits-all sequence.** Different query types (a simple lookup vs. a multi-hop question) can benefit from different stage configurations, not the exact same five-stage chain every time.

## Quick check

<details><summary>1. In the worked example, why does generation dominate total latency so heavily?</summary>
A single LLM call (2,500ms) is far slower than any of the retrieval-side stages combined (120ms total) — generating text token by token is inherently more time-consuming than the comparison and ranking operations retrieval performs.
</details>

<details><summary>2. Does optimizing the re-ranking stage meaningfully reduce total latency in this worked example?</summary>
Only modestly — re-ranking is already a small fraction (3.1%) of the total, so even a significant improvement there barely changes the overall request time compared to the dominant generation stage.
</details>

<details><summary>3. Does every RAG request need to go through all five stages?</summary>
Not necessarily — as [[Self-RAG and Reflective Retrieval]] showed, some queries can skip retrieval entirely if the model's own confidence is already high enough.
</details>

## Key terms

* **Production pipeline:** the full chain of stages (embed, search, re-rank, assemble, generate) a real RAG system runs per request.
* **Latency breakdown:** how a request's total time is divided among its constituent stages.
* **Pipeline architecture:** the overall design of how a RAG system's stages connect and hand off to each other.

## Related

[[Anatomy of a RAG Pipeline]] · [[Cost and Latency of RAG Systems]] · [[Caching and Incremental Indexing]]
