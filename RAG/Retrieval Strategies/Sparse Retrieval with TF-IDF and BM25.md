Counting how many query words a document shares is the simplest possible retrieval method — and it treats every word as equally informative, which "the" and "cat" obviously aren't. TF-IDF and BM25 are two ways of weighting term matches so that rare, distinctive words count for more than common ones, and each has its own particular way of doing that weighting.

**You need:** [[Anatomy of a RAG Pipeline]].

## The question it answers

"How do you rank documents by matching words, without treating every word equally?" **TF-IDF** scores a term by how often it appears in a document (term frequency) multiplied by how rare it is across the whole collection (inverse document frequency) — a term appearing in every document contributes nothing, since it can't distinguish one document from another. **BM25** computes a similar idea but with two refinements: its term-frequency contribution saturates rather than growing without bound, and its idf formula is smoothed so it never degenerates to exactly zero the way TF-IDF's can.

## Intuition

Scoring how well a résumé matches a job posting by counting shared words treats "and" the same as the one specific skill that actually matters. Down-weighting common words and up-weighting rare, specific ones is the whole idea — TF-IDF and BM25 are just two different formulas for doing that weighting.

## Definition and notation

```text
tf-idf(term, doc)  = count(term, doc) × log(N / (1 + doc_count(term)))
bm25(term, doc)    = idf(term) × count(term, doc) × (k1 + 1) / (count(term, doc) + k1 × length_norm)
```

## A worked example

Three tiny documents, scored against the query "cat mat":

```text
d1: "the cat sat on the mat"    (contains both "cat" and "mat")
d2: "the dog sat on the log"    (contains neither)
d3: "a mat for yoga practice"   (contains "mat" only)

raw word overlap:  d1: 2   d2: 0   d3: 1

TF-IDF:  d1: 0.4055   d2: 0.0000   d3: 0.0000
BM25:    d1: 1.4134   d2: 0.0000   d3: 0.4963
```

"Mat" appears in exactly 2 of these 3 documents, which happens to make TF-IDF's idf formula evaluate to exactly zero for it (log(3/3) = 0) — so TF-IDF gives d3 *no* credit at all for containing "mat," indistinguishable from d2's zero overlap. BM25's smoothed idf formula never hits exactly zero this way, correctly giving d3 partial credit (0.4963) for the one term it does share.

## Bench

```bench
id: sparse-tfidf-bm25
title: Weighting matters: raw overlap isn't the only option
fallback: Compare raw word-overlap, TF-IDF and BM25 scores for the same query across a tiny corpus.
```

**Try this**

1. Switch between raw overlap, TF-IDF and BM25 and watch d3's score change.
2. Notice TF-IDF scores d2 (no overlap) and d3 (one shared word) identically — both zero.
3. Confirm BM25 is the only method that distinguishes d2 from d3.

**What you should notice:** TF-IDF's idf formula can land on exactly zero for a term that appears in close to half the collection, silently erasing any credit for documents containing that term — a real, specific edge case BM25's smoothing is designed to avoid.

## Where it appears in AI

* **[[Dense Retrieval]] solves a different problem these methods can't**: a query and a relevant document that share no vocabulary at all score zero under both TF-IDF and BM25, regardless of how well-weighted the terms are.
* **[[Hybrid Retrieval Fusion]] combines a sparse method like BM25 with dense retrieval**, so exact-term-matching strength and semantic-matching strength both contribute to the final ranking.
* **[[Query Expansion and Rewriting]] is one way to work around sparse retrieval's exact-vocabulary requirement** without switching to dense retrieval at all.

## Common pitfalls

* **Assuming TF-IDF and BM25 are interchangeable.** The worked example shows a real, specific case where they disagree — not just by degree, but by TF-IDF giving literally zero credit where BM25 gives meaningful partial credit.
* **Expecting sparse retrieval to handle synonyms or paraphrasing.** Both methods match exact tokens — a document about "automobiles" scores zero against a query about "cars" unless the exact word appears.
* **Treating a high TF-IDF or BM25 score as a guarantee of relevance.** Both measure term-matching strength, not whether the document actually answers the question — a document can share rare terms with a query while being about something else entirely.

## Quick check

<details><summary>1. In the worked example, why does TF-IDF give d3 a score of exactly zero despite d3 containing "mat"?</summary>
"Mat" appears in 2 of the 3 documents, which makes TF-IDF's idf formula, log(N/(1+document count)), evaluate to log(3/3) = log(1) = 0 — multiplying by this zero idf wipes out any contribution from "mat" regardless of how often it appears.
</details>

<details><summary>2. Why doesn't BM25 have the same problem?</summary>
BM25's idf formula adds smoothing terms (+0.5) that keep it from ever evaluating to exactly zero, so a term appearing in roughly half the collection still contributes some weight rather than none.
</details>

<details><summary>3. Would either TF-IDF or BM25 score a document highly if it discussed the same topic as the query using entirely different words?</summary>
No — both methods only match exact vocabulary overlap; a topically relevant document using no words in common with the query would score zero under either method, which is exactly the gap dense retrieval is designed to fill.
</details>

## Key terms

* **TF-IDF:** a term-weighting scheme combining term frequency and inverse document frequency.
* **BM25:** a smoothed, saturating refinement of TF-IDF widely used as a strong sparse-retrieval baseline.
* **Sparse retrieval:** ranking documents by weighted exact-term overlap with a query, as opposed to embedding-based similarity.

## Related

[[Dense Retrieval]] · [[Hybrid Retrieval Fusion]] · [[Query Expansion and Rewriting]]
