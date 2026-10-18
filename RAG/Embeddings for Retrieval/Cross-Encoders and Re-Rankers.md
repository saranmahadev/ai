A bi-encoder's speed comes from encoding the query and a document separately — which means it can never let fine details of one influence how the other gets represented. A cross-encoder gives that up: it feeds the query and a document into the model *together*, letting every word of each attend to every word of the other, at the cost of having to do that fresh for every single pair.

**You need:** [[Bi-Encoders and Dense Embeddings]].

## The question it answers

"When does a bi-encoder's ranking get something wrong that a more careful look would catch?" A document that happens to repeat a query's own words can score a high bi-encoder similarity without actually answering the question — its pooled vector looks close to the query's, even though the content is off-topic. A **cross-encoder** jointly processes the query and that document and outputs a single relevance score, catching exactly this kind of mismatch that two independently pooled vectors can miss. Because a cross-encoder has to run once per candidate pair, it's typically used as a **re-ranker**: applied only to the short list a cheap bi-encoder already narrowed down, not the whole collection.

## Intuition

Judging how well two people would get along by comparing each one's résumé independently misses the chemistry that only shows up once they're actually talking to each other. A cross-encoder is the conversation: it looks at the query and the document together, not two separate summaries of each.

## Definition and notation

```text
bi-encoder score(query, doc)    = cosine_similarity(encode(query), encode(doc))     -- independent
cross-encoder score(query, doc) = model(query ⊕ doc) → single relevance score       -- joint
```

## A worked example

Two candidates for the query "how long do refunds take":

```text
A: repeats "refund" twice but is actually off-topic
B: on-topic, but phrased without reusing the query's exact words

bi-encoder ranking (independent cosine similarity):   A 1.000  >  B 0.989
cross-encoder ranking (joint relevance score):         B 0.950  >  A 0.300
```

The bi-encoder ranks A above B — A's surface-level word overlap with the query pulls its pooled vector closer, even though it's off-topic. The cross-encoder, scoring the pair jointly, correctly flips the ranking: B is far more relevant (0.950) and A is recognized as mostly irrelevant (0.300) despite sharing vocabulary with the query.

## Bench

```bench
id: cross-encoder-rerank
title: Scoring the pair together catches what pooling misses
fallback: Compare a bi-encoder's independent-vector ranking against a cross-encoder's joint-scored ranking for the same two candidates.
```

**Try this**

1. Look at the bi-encoder ranking and note which candidate wins.
2. Switch to the cross-encoder ranking and watch the winner flip.
3. Read both candidates' descriptions again — which one would you actually want cited in an answer?

**What you should notice:** the bi-encoder's error isn't a small numerical wobble — it ranks the wrong candidate first by a comfortable margin (1.000 vs. 0.989), while the cross-encoder's joint view corrects it decisively (0.950 vs. 0.300).

## Where it appears in AI

* **This is exactly why [[Re-Ranking Retrieved Results]] exists as a separate stage**: run a cheap bi-encoder over the whole collection to get a shortlist, then run an expensive cross-encoder only over that shortlist.
* **The compute-cost argument from [[Bi-Encoders and Dense Embeddings]] is what makes re-ranking, rather than cross-encoding everything, the practical choice.**
* **[[Multi-Vector and Late-Interaction Retrieval]] sits between these two extremes**: still precomputable like a bi-encoder, but closer to a cross-encoder's sensitivity to specific token-level matches.

## Common pitfalls

* **Running a cross-encoder over an entire large collection "to be safe."** The whole reason bi-encoders exist is that this doesn't scale — a cross-encoder's cost per query grows with collection size the same way a cross-encoder's score itself does, just much more expensively.
* **Assuming a cross-encoder is always right and a bi-encoder is always wrong.** The worked example is a case specifically designed to expose the bi-encoder's blind spot; on many queries the two methods agree closely.
* **Skipping the bi-encoder stage and going straight to cross-encoding "for accuracy."** Without a bi-encoder's cheap first pass to narrow the field, there's no shortlist small enough for a cross-encoder's cost to be affordable.

## Quick check

<details><summary>1. Why does candidate A score so highly under the bi-encoder but so poorly under the cross-encoder?</summary>
A's pooled embedding ends up close to the query's because it repeats the query's own words, even though its actual content is off-topic — the cross-encoder, processing the pair jointly, can detect that the surface overlap doesn't correspond to real relevance.
</details>

<details><summary>2. Why is a cross-encoder typically applied only to a shortlist rather than an entire collection?</summary>
Its cost scales with the number of query-document pairs it has to jointly process, and that cost per pair is far higher than a bi-encoder's — applying it to a whole large collection would be far too expensive for most systems.
</details>

<details><summary>3. What's lost by encoding the query and document independently, as a bi-encoder does?</summary>
Any fine-grained interaction between specific parts of the query and specific parts of the document — a bi-encoder's two separate, pooled vectors can't capture the kind of mismatch the worked example's candidate A represents.
</details>

## Key terms

* **Cross-encoder:** a model that jointly processes a query and a document together to produce a single relevance score.
* **Re-ranker:** a (typically cross-encoder) model applied to a short list of already-retrieved candidates to reorder them more accurately.
* **Joint encoding:** processing two inputs together, allowing interactions between them, as opposed to encoding each independently.

## Related

[[Bi-Encoders and Dense Embeddings]] · [[Re-Ranking Retrieved Results]] · [[Multi-Vector and Late-Interaction Retrieval]]
