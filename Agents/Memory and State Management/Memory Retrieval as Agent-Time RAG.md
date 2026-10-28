An agent with thousands of stored memories can't dump all of them into context on every step — it needs to pull back only the handful actually relevant to what it's doing right now. That's retrieval, running at agent time instead of at answer-a-question time: the exact mechanism already covered in RAG, applied to an agent's own memory store instead of a document collection.

**You need:** [[Short-Term vs. Long-Term Agent Memory]].

## The question it answers

"Once an agent has a large memory store, how does it find the few memories actually relevant right now?" The answer is retrieval: embed the current situation into a vector, embed every stored memory the same way, and rank memories by similarity — identical in mechanism to [[Bi-Encoders and Dense Embeddings|dense retrieval]] in RAG, just retrieving from a store of the agent's own past facts and experiences instead of a document corpus.

## Intuition

A doctor with a thick patient file doesn't re-read the whole file before every question — they pull up the specific entries relevant to today's complaint. Which entries are relevant changes with the question being asked right now, which is exactly why this has to be a *retrieval* step at the moment it's needed, not something decided once in advance.

## Definition and notation

```text
cosine similarity(q, m) = (q · m) / (‖q‖ ‖m‖)
retrieved memories = top-K stored memories by similarity to the current query
```

## A worked example

A query vector against four stored memories, ranked by cosine similarity exactly as in RAG:

```text
query:  "what units does the user want?"           q = (0.8, 0.6)

m1  "the user prefers metric units"                 v = (1, 0)   similarity = 0.800
m2  "the user's deadline is Friday"                 v = (0, 1)   similarity = 0.600
m3  "the user prefers metric and works in km"       v = (1, 1)   similarity = 0.990
m4  "the user prefers imperial units"                v = (-1, 0)  similarity = -0.800

top 2 retrieved: m3 (0.990), m1 (0.800)
```

m2's deadline fact and m4's directly contradicted preference both score low or negative — exactly what should happen, since neither is relevant to a question about units. The ranking does the filtering automatically; nothing had to specially mark m2 and m4 as irrelevant in advance.

## Bench

```bench
id: memory-retrieval-rag
title: Pulling the right memory back out
fallback: Rank an agent's stored memories against the current query by cosine similarity.
```

**Try this**

1. Read the ranked list and check that the two memories about units score highest.
2. Slide K down to 1 and notice which single memory wins.
3. Imagine the query were instead "when is this due?" — which memory should now score highest, and why does the embedding step have to change for that?

**What you should notice:** the same similarity mechanism that ranks documents against a question in RAG ranks an agent's own memories against whatever it's currently doing — nothing about retrieval itself changes when the store is memories instead of documents.

## Where it appears in AI

* **This is exactly [[Bi-Encoders and Dense Embeddings|dense retrieval]] from RAG**, applied to a store of the agent's own memories rather than an external document collection — the embedding and ranking mechanism is identical.
* **[[Memory Compression and Forgetting]] determines what's even left in the store to retrieve from** — a memory that was compressed away or dropped can't be retrieved no matter how relevant it would have been.
* **A [[Anatomy of a RAG Pipeline|RAG pipeline]]'s retrieval step runs once per user question; this runs continuously, at every point in an agent's own task** where it needs to recall something relevant to the step it's on.

## Common pitfalls

* **Treating memory retrieval as a one-time lookup at the start of a task.** Relevance changes as the task progresses — the right memories to retrieve partway through a multi-step task can be completely different from the ones relevant at the start.
* **Retrieving too few memories (missing something relevant) or too many (burying the genuinely relevant ones in noise).** K is a real tuning knob here exactly as it is in RAG retrieval generally — there's no single right value independent of the memory store's size and redundancy.
* **Assuming a high similarity score guarantees usefulness.** A memory can be topically similar but outdated or contradicted by a more recent one (m4 contradicts m1 directly) — similarity ranks relevance to the query's wording, not correctness or recency on its own.

## Quick check

<details><summary>1. In the worked example, why does m3 score higher than m1, even though m1 is also about metric units?</summary>
m3's vector (1, 1) has a direction closer to the query's (0.8, 0.6) than m1's (1, 0) does — cosine similarity measures the angle between vectors, and m3 happens to point more directly toward the query's direction.
</details>

<details><summary>2. Why does m4 score negative instead of just low?</summary>
m4's vector (-1, 0) points in roughly the opposite direction from the query — it directly contradicts the metric-units preference the query is about, and cosine similarity can go negative exactly when two vectors point in substantially opposite directions.
</details>

<details><summary>3. What's the key difference between this topic and retrieval in RAG?</summary>
The mechanism (embed, rank by cosine similarity, take the top K) is identical — the only difference is what's being retrieved from: the agent's own memory store of facts and past experience, instead of an external document collection.
</details>

## Key terms

* **Agent-time retrieval:** running a retrieval step continuously during an agent's task, rather than once per external question.
* **Memory store:** the collection of an agent's embedded past facts and experiences that retrieval ranks against.
* **Top-K:** the number of highest-similarity memories actually pulled back for use.

## Related

[[Bi-Encoders and Dense Embeddings]] · [[Memory Compression and Forgetting]] · [[Anatomy of a RAG Pipeline]]
