Pooling every token of a document into one vector means a single, strong, exact match can get diluted by everything else in the document — the more unrelated text surrounds it, the weaker its signal looks in the average. Late-interaction retrieval skips the pooling: it keeps one vector per token, and lets the single best match win, no matter how much else is around it.

**You need:** [[Bi-Encoders and Dense Embeddings]], [[Cross-Encoders and Re-Rankers]].

## The question it answers

"Is there a way to get some of a cross-encoder's precision without giving up a bi-encoder's precomputability?" **Multi-vector retrieval** (the ColBERT-style approach) keeps a separate embedding for every token in a document instead of pooling them into one — and because each token vector is still produced independently of the query, they can still be precomputed and stored, just like a bi-encoder's. At query time, **late interaction** scores a document by taking, for each query token, its single best-matching document token (MaxSim), then summing those best-matches across all query tokens.

## Intuition

Judging whether a single paragraph buried inside a long report answers your question by averaging a "relevance score" across the entire report dilutes that one paragraph's strength proportionally to how long the report is. Instead, scanning specifically for the best-matching sentence for each part of your question — and ignoring how much irrelevant text surrounds it — finds the signal regardless of the surrounding noise.

## Definition and notation

```text
MaxSim(query_tokens, doc_tokens) = Σ_q  max_d  cosine_similarity(q, d)
pooled(query_tokens, doc_tokens) = cosine_similarity(mean(query_tokens), mean(doc_tokens))
```

## A worked example

A 2-token query ("refund", "timeline") against a document containing one strongly matching token, with a varying number of unrelated tokens padded in around it:

```text
0 unrelated tokens:  MaxSim 1.580  pooled 0.914
7 unrelated tokens:  MaxSim 1.983  pooled 0.714
```

As unrelated tokens pile up around the one genuinely matching token, the pooled single-vector score drops by about 22% (0.914 → 0.714) — the average gets diluted by everything irrelevant. The MaxSim score doesn't degrade the same way, because it only ever looks at each query token's single *best* match, which the added unrelated tokens can't weaken.

## Bench

```bench
id: multi-vector-maxsim
title: A strong match survives being buried; a pooled average doesn't
fallback: Compare late-interaction MaxSim scoring against single-vector pooled scoring as unrelated document tokens pile up.
```

**Try this**

1. Start at 0 unrelated tokens and note both scores.
2. Slide toward 7 unrelated tokens and watch the pooled score fall while MaxSim holds up.
3. Imagine a 500-word document with just one sentence that answers the question — which scoring method would find it more reliably?

**What you should notice:** pooling is a bottleneck — however strong one token's match is, it has to survive being averaged with every other token in the document; MaxSim never averages anything away.

## Where it appears in AI

* **This sits between [[Bi-Encoders and Dense Embeddings]] (one precomputed vector, cheap but coarser) and [[Cross-Encoders and Re-Rankers]] (no precomputation, finer but expensive)** — multi-vector keeps the precomputability of the first while recovering some of the token-level sensitivity of the second.
* **Storing many vectors per document instead of one is exactly why [[Embedding Quantization for Retrieval]] matters more here** — multi-vector indexes are naturally larger, making compression more valuable.
* **[[Vector Databases and Index Management]] needs specific support for late-interaction scoring**, since it isn't a simple nearest-neighbor lookup against a single vector per document.

## Common pitfalls

* **Assuming multi-vector retrieval is strictly better and should always be used.** It stores and searches many more vectors per document than a bi-encoder, at real memory and compute cost — the worked example's accuracy gain isn't free.
* **Treating MaxSim as equivalent to a cross-encoder.** It's still composed of independently precomputed token vectors with no joint processing — it recovers some token-level precision, not full cross-encoder-level interaction.
* **Forgetting that MaxSim's robustness to distractor tokens isn't unlimited.** It holds up well against unrelated padding, but a document genuinely lacking any strong match for a query token will still score poorly, as it should.

## Quick check

<details><summary>1. Why does the pooled single-vector score drop as unrelated tokens are added, while MaxSim doesn't drop the same way?</summary>
Pooling averages every token's vector together, so more unrelated tokens dilute the one strong match's contribution to the average; MaxSim only ever takes each query token's single best match, which stays just as strong regardless of how many weaker tokens are also present.
</details>

<details><summary>2. Can multi-vector document representations still be precomputed ahead of a query, like a bi-encoder's?</summary>
Yes — each document's token vectors are produced independently of any future query, so they can be computed once and stored, the same precomputation advantage a bi-encoder has.
</details>

<details><summary>3. What's the main cost of multi-vector retrieval compared to a single pooled vector per document?</summary>
Storing and searching many vectors per document instead of one, which increases both memory use and the complexity of the index needed to search them efficiently.
</details>

## Key terms

* **Multi-vector retrieval:** representing a document as multiple token-level embeddings instead of one pooled vector.
* **Late interaction:** comparing query and document representations at the token level at query time, after both were encoded independently.
* **MaxSim:** scoring by summing, for each query token, its single highest similarity to any document token.

## Related

[[Bi-Encoders and Dense Embeddings]] · [[Cross-Encoders and Re-Rankers]] · [[Embedding Quantization for Retrieval]]
