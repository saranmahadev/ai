Asking for "the 20 most relevant chunks, but only from documents I have permission to see" sounds like one request — but a vector index has to decide *when* to apply that permission check. Do it after finding the top 20 by similarity, and most of them might belong to documents the user can't see at all, leaving almost nothing behind. Do it first, and the search never wastes effort on candidates that were never eligible.

**You need:** [[Vector Databases and Index Management]], [[Metadata Extraction and Enrichment]].

## The question it answers

"Should a metadata filter be applied before or after the similarity search?" **Post-filtering** runs the ANN search first, gets its top-k by similarity, and only then checks each result against the metadata filter — if the filter and similarity are unrelated to each other, most of the top-k can fail the filter, leaving far fewer usable results than requested. **Pre-filtering** applies the metadata filter first, narrowing the collection down to only eligible candidates, and only then searches for the nearest ones among *those* — guaranteeing the requested number of results, as long as enough eligible candidates exist at all.

## Intuition

Asking a restaurant for "the best vegetarian dish on the menu" by first picking the ten best-reviewed dishes overall and only then checking which ones happen to be vegetarian might leave you with one option, if none of the top ten happen to be vegetarian. Asking by first filtering to just the vegetarian dishes, then ranking only those by review score, reliably gets you a real top choice.

## Definition and notation

```text
post-filter:  top-k by similarity  →  then apply metadata filter  →  survivors ≈ k × match_rate
pre-filter:   apply metadata filter first  →  then rank by similarity within survivors  →  up to k results
```

## A worked example

Requesting the top 20 results from a 1,000-chunk collection where only 5% match a metadata filter (say, a permission check):

```text
post-filter: ANN returns its top 20 by similarity (ignoring the filter),
             then filters → only 1 of the 20 survives

pre-filter:  filter first → 50 eligible chunks (5% of 1,000),
             then rank by similarity within those → up to 20 returned
```

Post-filtering a 5%-match-rate filter against the top 20 leaves, on average, only about 1 usable result — nineteen out of twenty requested results get discarded. Pre-filtering guarantees up to the full 20, limited only by how many eligible chunks actually exist in the collection.

## Bench

```bench
id: prefilter-vs-postfilter
title: Filtering after search can come back nearly empty
fallback: Compare how many results actually survive when a metadata filter is applied before vs. after an ANN search.
```

**Try this**

1. Slide the match rate down toward 1% and watch post-filtering's survivor count collapse.
2. Slide it up toward 50% and watch the gap between the two approaches shrink.
3. Think about a permission filter that only 2% of a collection satisfies for a given user — what would post-filtering return for a request of "give me 20 results"?

**What you should notice:** pre-filtering's advantage is largest exactly when the filter is most restrictive — which is often exactly when getting it right matters most (strict permission checks, narrow date ranges).

## Where it appears in AI

* **This directly extends the freshness-filtering problem from [[Metadata Extraction and Enrichment]]** — the same metadata that lets you *identify* a stale chunk also needs to be applied at the right point in the search to actually exclude it reliably.
* **A hybrid index is what makes efficient pre-filtering possible**: combining a metadata index (fast to check "is this eligible?") with the vector index (fast to check "is this similar?") so pre-filtering doesn't itself become a slow linear scan.
* **[[Common RAG Failure Modes]] lists "returned far fewer results than requested" as a recognizable symptom** — frequently traceable to post-filtering against a restrictive metadata condition.

## Common pitfalls

* **Defaulting to post-filtering because it's simpler to implement on top of an existing ANN index.** The worked example shows this can silently return far fewer usable results than requested, with no error raised — just a quietly short result list.
* **Assuming pre-filtering is always better.** A very restrictive filter still needs enough eligible candidates in the collection in the first place — pre-filtering can't conjure up results that don't exist, it only avoids wasting effort on ineligible ones.
* **Building a metadata index as an afterthought, bolted onto an existing vector index.** Efficient pre-filtering depends on the metadata filter itself being fast to check — a slow metadata lookup undermines the whole point of filtering before the (potentially even more expensive) similarity search.

## Quick check

<details><summary>1. In the worked example, why does post-filtering a request for 20 results at a 5% match rate leave only about 1 survivor?</summary>
The ANN search's top 20 were chosen purely by similarity, with no regard for the filter, so only roughly 5% of them — about 1 — happen to also satisfy it; the rest are discarded after the fact.
</details>

<details><summary>2. Does pre-filtering guarantee the requested number of results no matter how restrictive the filter is?</summary>
No — it guarantees up to the requested number, limited by how many eligible candidates actually exist in the collection; an extremely restrictive filter can still leave fewer than requested if there simply aren't enough matching chunks.
</details>

<details><summary>3. What does a hybrid index add that makes pre-filtering practical?</summary>
A fast way to check metadata eligibility combined with the vector index, so narrowing to eligible candidates before the similarity search doesn't itself require a slow scan of the whole collection.
</details>

## Key terms

* **Post-filtering:** applying a metadata filter after an ANN search has already produced its top-k results by similarity.
* **Pre-filtering:** applying a metadata filter before similarity search, ranking only among already-eligible candidates.
* **Hybrid index:** an index combining metadata filtering with vector similarity search, supporting efficient pre-filtering.

## Related

[[Vector Databases and Index Management]] · [[Metadata Extraction and Enrichment]] · [[Common RAG Failure Modes]]
