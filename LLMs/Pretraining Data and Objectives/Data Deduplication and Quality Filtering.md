A web-scale crawl doesn't just contain low-quality text — it contains the *same* text, copied across mirrors, syndicated articles, and boilerplate, over and over. This note covers finding and removing those near-duplicates before they ever reach training.

**You need:** [[Pretraining Corpora and Data Curation]], [[n-gram Overlap Metrics (BLEU and ROUGE)]].

## The question it answers

"How do you find documents that are essentially the same, when they aren't byte-for-byte identical?" **N-gram Jaccard similarity** compares two documents by the overlap between their sets of n-grams (short, contiguous token sequences): the fraction of combined n-grams that both documents share. Two near-duplicate documents — the same article with a word swapped, a reposted comment with minor edits — share almost all their n-grams even though they aren't identical strings, which exact-match deduplication alone would miss entirely.

## Intuition

Comparing two documents character-by-character for exact equality catches only perfect copies — change one word anywhere and an exact-match check sees two completely different documents. Looking instead at the *set* of short phrases each document contains is far more forgiving of small edits: a one-word change only removes a few overlapping phrases out of potentially hundreds, so the overall similarity barely drops. That's exactly what makes near-duplicate detection possible.

## Definition and notation

```text
n-gram set of a document: every contiguous sequence of n tokens it contains

Jaccard similarity(A, B) = |A ∩ B| / |A ∪ B|
  = 1.0 for identical sets, 0.0 for no shared n-grams at all
```

## A worked example

A reference document compared against a near-duplicate (one word changed) and an unrelated document, using 3-grams:

```text
reference:      "the quick brown fox jumps over the lazy dog"
near-duplicate:  "the quick brown fox jumps over a   lazy dog"   (one word swapped)
unrelated:      "completely different content about something else entirely"

Jaccard(reference, near-duplicate):  0.400
Jaccard(reference, unrelated):       0.000
```

A single word swap drops the similarity from 1.0 to 0.4 — nowhere near zero — because most of the document's 3-grams are untouched by the single change. The unrelated document, sharing no vocabulary at all, scores exactly 0. A deduplication threshold set somewhere between those two values (say, 0.3) would correctly flag the near-duplicate while leaving the unrelated document alone.

## Bench

```bench
id: dedup-jaccard
title: Flagging near-duplicates before training
fallback: Compare a document against a near-duplicate and an unrelated one, and see how a similarity threshold decides which gets flagged.
```

**Try this**

1. Compare against the near-duplicate and note the similarity score.
2. Compare against the unrelated document instead.
3. Adjust the threshold until the near-duplicate is flagged but the unrelated document isn't.

**What you should notice:** a single word change barely moves the similarity score — exact-match deduplication would have missed this pair entirely, while n-gram overlap catches it easily.

## Where it appears in AI

* **Large-scale pretraining pipelines report removing substantial fractions of raw crawled data as near-duplicates**, since web content is heavily repeated (syndicated news, template pages, copy-pasted forum replies).
* **Deduplication directly reduces [[Memorization and Training Data Leakage|memorization risk]]**: a document repeated many times across a training set gives a model many more chances to memorize it verbatim than a document seen once.
* **The exact n-gram length and similarity threshold are real tuning choices**, trading off how aggressively near-duplicates are caught against how many false positives (genuinely different documents that happen to share common phrasing) get removed.

## Common pitfalls

* **Relying on exact string matching alone.** As the worked example shows, that would miss a near-duplicate pair entirely — exact matching only catches byte-identical copies.
* **Setting the similarity threshold too low.** A threshold that's too permissive starts flagging genuinely distinct documents that happen to share a lot of common phrasing (quotes, boilerplate, standard idioms) as duplicates.
* **Deduplicating only within, not across, data sources.** The same article syndicated to multiple news sites is a near-duplicate across sources, not just within one.

## Quick check

<details><summary>1. Why does n-gram Jaccard similarity catch near-duplicates that exact string matching misses?</summary>
It compares the overlap between two documents' sets of short token sequences rather than requiring the documents to be identical — a small edit changes only a few of those sequences, leaving the overall similarity score high.
</details>

<details><summary>2. In the worked example, why didn't a single word swap drop the similarity all the way to 0?</summary>
Because most of the document's 3-grams don't touch the single changed word — only the handful of 3-grams that include that word's position are affected, while the rest remain identical between the two documents.
</details>

<details><summary>3. How does deduplication reduce the risk of a model memorizing specific training examples?</summary>
By removing documents that are heavily repeated across the training set, deduplication reduces how many separate chances a model gets to see (and so memorize) any one piece of content verbatim.
</details>

## Key terms

* **Near-duplicate:** a document that is substantially, but not exactly, the same as another.
* **N-gram Jaccard similarity:** the fraction of two documents' combined short token sequences that they share.
* **Deduplication:** removing exact or near-duplicate documents from a training corpus.

## Related

[[Pretraining Corpora and Data Curation]] · [[n-gram Overlap Metrics (BLEU and ROUGE)]] · [[Memorization and Training Data Leakage]]
