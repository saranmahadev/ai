A chunk's text alone often can't say whether it's still true. Three versions of the same shipping policy, written almost identically, differ only in when each one was published — information the chunk's own words don't carry at all. Metadata (a date, a source, a section) attaches exactly that extra context, so a retrieval system can filter on it without re-reading the text.

**You need:** [[Semantic and Structure-Aware Chunking]].

## The question it answers

"What has to be attached to a chunk beyond its own text?" Metadata is structured information about a chunk that isn't part of its searchable content but is essential for deciding whether to use it: the document it came from, the date it was last updated, its section or author, access permissions. Without it, near-duplicate chunks that differ only in currency are indistinguishable to similarity search alone — a retrieval system can rank them all equally relevant and return a stale one right alongside the current one.

## Intuition

Three near-identical memos about an office policy, stapled together with no dates on any of them, are useless for figuring out which one is actually still in effect — the memos read almost the same. Stamp each one with its date, and suddenly "which one is current" becomes a one-line filter instead of a judgment call.

## Definition and notation

```text
freshnessFilter(chunks, cutoffDate) = chunks with date ≥ cutoffDate, most recent first
```

## A worked example

Three near-duplicate chunks about the same shipping policy, differing only in date:

```text
[2022-01-01] "Shipping takes 3-5 days."
[2023-06-01] "Shipping takes 3-5 days."
[2025-09-01] "Shipping takes 2-3 days."

unfiltered top-3 (similarity search alone can't distinguish them): all 3 returned
freshness-filtered (date ≥ 2024-01-01): only [2025-09-01] "Shipping takes 2-3 days."
```

All three chunks are about equally similar to a query like "how long does shipping take" — their text is nearly identical. Without a date filter, a retrieval system has no reason to prefer the current policy over the two outdated ones it happens to also find. With the date attached as metadata, the two stale chunks are excluded before similarity ever comes into play.

## Bench

```bench
id: metadata-freshness-filter
title: Three near-duplicates, only one still true
fallback: Toggle a freshness filter and watch stale duplicate chunks disappear from the results.
```

**Try this**

1. Look at the unfiltered results and notice all three near-identical chunks are returned.
2. Turn on the freshness filter and watch it keep only the most recent one.
3. Imagine a user's answer coming from the 2022 chunk instead of the 2025 one — what would be wrong with it?

**What you should notice:** the three chunks' text alone gives a similarity-based retriever no reason to prefer one over another — the date metadata is what makes "prefer the current one" possible at all.

## Where it appears in AI

* **[[Metadata Filtering and Hybrid Indexes]] covers how a vector database actually executes a metadata filter alongside a similarity search**, combining both into one query.
* **This is a second, independent fix for the staleness problem [[Hallucination and Knowledge Cutoff]] describes at the model level** — here the staleness lives in the document collection itself, not in the model's training data.
* **[[Common RAG Failure Modes]] lists "retrieved the wrong (stale) version of a fact" as one of the recurring ways a RAG system fails** — exactly what this topic's metadata filter prevents.

## Common pitfalls

* **Assuming similarity search alone will prefer the most relevant version.** The worked example shows near-duplicate chunks can score almost identically regardless of which one is actually current — similarity measures topical closeness, not correctness or recency.
* **Extracting metadata inconsistently across a document collection.** A freshness filter is only as reliable as every chunk actually having an accurate date attached — a few chunks missing it undermines the whole mechanism.
* **Filtering so aggressively that relevant older content disappears entirely.** Not every older chunk is wrong — a cutoff needs to reflect when the information in question actually changed, not an arbitrary recency preference.

## Quick check

<details><summary>1. In the worked example, why can't cosine similarity alone distinguish the three chunks?</summary>
Their text is nearly identical (two have the exact same wording), so their embeddings are extremely close together — the signal that would distinguish "current" from "outdated" isn't present in the text at all, only in each chunk's date metadata.
</details>

<details><summary>2. What's required for a freshness filter to work reliably across a whole document collection?</summary>
Accurate, consistently extracted date metadata on every chunk — a filter can only exclude what it can correctly identify as stale, so any chunk missing or carrying wrong date metadata silently escapes the filter.
</details>

<details><summary>3. Is a freshness cutoff always the right kind of metadata filter?</summary>
No — recency is just one example; the same mechanism applies to filtering by source, access permission, or section, whatever dimension actually distinguishes which chunks should be eligible for a given query.
</details>

## Key terms

* **Metadata:** structured information about a chunk (date, source, section, permissions) kept separate from its searchable text.
* **Near-duplicate chunks:** chunks with very similar or identical text that differ in some attribute, such as when they were last updated.
* **Freshness filter:** a metadata-based filter that excludes chunks older than a given cutoff date.

## Related

[[Semantic and Structure-Aware Chunking]] · [[Metadata Filtering and Hybrid Indexes]] · [[Hallucination and Knowledge Cutoff]]
