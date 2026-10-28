Recursive chunking keeps sentences whole, but a sentence boundary isn't the same thing as a topic boundary — five sentences in a row about the same subject will still get split wherever the size limit happens to land, right through the middle of a coherent idea. Semantic chunking looks at *meaning* instead of character count: it places a boundary exactly where the topic actually shifts.

**You need:** [[Fixed-Size and Recursive Chunking]], [[Embeddings and Similarity Search]].

## The question it answers

"How do you split a document at the points where its meaning actually changes, instead of an arbitrary size limit?" Each sentence gets embedded, and the cosine similarity between consecutive sentences is checked — a high similarity means they're still on the same topic, and a sharp drop marks a real topic shift. A chunk boundary is placed exactly where that drop happens, however long or short the resulting chunks turn out to be. **Structure-aware chunking** uses the same idea at a coarser level, splitting at document structure the author already provided — markdown headings, paragraph breaks — instead of computing similarity at all.

## Intuition

Reading a document and noticing "everything up to here was about returns, and everything after is about shipping" is a judgment about meaning, not a character count. Semantic chunking automates exactly that judgment: it measures how similar each sentence is to the one before it, and calls a sharp drop in similarity the sign of a real topic change.

## Definition and notation

```text
sims[i] = cosine_similarity(sentence_i, sentence_{i+1})
boundary after sentence i   if  sims[i] < threshold
```

## A worked example

Five sentences — two about returns, three about shipping — with their consecutive-sentence similarities:

```text
sentence 0: "Returns are accepted within 30 days."        \ similar (0.998)
sentence 1: "Items must be in original packaging."        /
                                                             ← similarity drops to 0.281
sentence 2: "Shipping takes 3-5 business days."            \
sentence 3: "Orders over $50 ship free."                    | similar (0.998, 0.996)
sentence 4: "Tracking is emailed once shipped."             /

similarities between consecutive sentences: 0.998, 0.281, 0.998, 0.996
→ boundary placed after sentence 1 (the only drop below a 0.5 threshold)
```

Every similarity except one sits above 0.99 — these sentence pairs are clearly on the same topic. The one pair that drops to 0.281 is exactly the pair spanning the actual topic change, from returns to shipping, and that's precisely where the chunk boundary lands.

## Bench

```bench
id: semantic-chunk-boundary
title: A boundary where the topic actually shifts
fallback: Slide a similarity threshold and watch where semantic chunking places its boundary.
```

**Try this**

1. Start with the threshold around 0.5 and note the boundary falls after sentence 1.
2. Lower the threshold toward 0.1 and watch the boundary disappear — 0.281 no longer counts as a "drop."
3. Raise the threshold above 0.99 and watch every gap start to look like a boundary.

**What you should notice:** the threshold has to sit meaningfully below the "same topic" similarity (≈0.99 here) and above the "topic shift" similarity (0.281) for the boundary to land in the one place that actually reflects a real change in subject.

## Where it appears in AI

* **The similarity computation itself is exactly [[Embeddings and Similarity Search|cosine similarity]]**, already covered in Math — this topic is about using it to decide *where* to cut, not re-deriving the metric.
* **Structure-aware chunking is the cheaper, no-embedding alternative**: splitting at a document's own markdown headings or paragraph breaks instead of computing sentence-by-sentence similarity.
* **A badly placed threshold produces the same symptom as naive fixed-size chunking** ([[Fixed-Size and Recursive Chunking]]) — a chunk that straddles two unrelated topics, diluting whatever gets embedded from it.

## Common pitfalls

* **Picking a threshold without checking what "same topic" and "different topic" actually look like in your own data.** The worked example's 0.99-vs-0.28 gap is unusually clean; real text often has a narrower gap, making the threshold choice far more sensitive.
* **Assuming semantic chunking always beats recursive chunking.** It costs an embedding call per sentence just to decide where to cut — for short, already-well-structured documents, that cost may not be worth the improvement.
* **Treating a similarity drop as proof of a *meaningful* topic change, rather than just *a* change.** A drop can also come from a stylistic shift, a quoted aside, or noisy sentence embeddings, not only a genuine subject change.

## Quick check

<details><summary>1. In the worked example, why does the similarity between sentence 1 and sentence 2 drop so much more than any other consecutive pair?</summary>
Sentences 0 and 1 are both about returns, and sentences 2 through 4 are all about shipping — sentence 1 and sentence 2 are the only consecutive pair that actually straddles the topic change, so their embeddings are far less similar than any same-topic pair.
</details>

<details><summary>2. What happens to the detected boundary if the similarity threshold is set to 0.1, below the real topic-shift value of 0.281?</summary>
No pair would fall below 0.1, so no boundary would be detected at all — the chunker would treat the whole passage as one chunk, missing the real topic change.
</details>

<details><summary>3. How does structure-aware chunking avoid the cost of computing sentence embeddings just to find a boundary?</summary>
It uses structure the document's author already provided — headings, paragraph breaks — as a proxy for topic boundaries, skipping the similarity computation entirely.
</details>

## Key terms

* **Semantic chunking:** placing chunk boundaries where consecutive sentences' embedding similarity drops, rather than at a fixed size.
* **Structure-aware chunking:** splitting at a document's own structural markers (headings, paragraphs) instead of computing similarity.
* **Similarity threshold:** the cutoff below which two consecutive sentences are considered different enough to warrant a chunk boundary.

## Related

[[Fixed-Size and Recursive Chunking]] · [[Embeddings and Similarity Search]] · [[Chunk Overlap and Size Trade-offs]]
