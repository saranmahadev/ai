Precision and recall, already covered as classification metrics, adapt naturally to retrieval — but a ranked list has structure a classifier's yes/no decision doesn't: *where* a relevant result lands matters, not just whether it's present at all. MRR and NDCG are specifically about that ordering, in two different ways.

**You need:** [[Precision, Recall and F1]].

## The question it answers

"How do you score a ranked list of retrieved documents, not just a yes/no classification?" **Precision@k** and **recall@k** apply [[Precision, Recall and F1|the same precision/recall definitions]] to just the top k results. **MRR (mean reciprocal rank)** looks only at where the *first* relevant result lands — 1/(its position) — rewarding a system that puts something useful right at the top, however the rest of the ranking looks. **NDCG (normalized discounted cumulative gain)** goes further: it uses *graded* relevance (not just relevant/irrelevant) and discounts each result by how far down the ranking it sits, normalized against the best possible ordering of the same results.

## Intuition

Judging a search engine's top 5 results only by how many are relevant (precision@5) misses *where* the good ones landed — a search with the single best result at position 1 feels very different from one with it buried at position 5, even if both have the same precision@5. MRR and NDCG are specifically about rewarding that difference.

## Definition and notation

```text
precision@k = (relevant results in top k) / k
recall@k    = (relevant results in top k) / (total relevant results)
MRR         = 1 / (rank of the first relevant result)
NDCG@k      = DCG@k / ideal_DCG@k,   where DCG@k = Σ gain_i / log2(i + 1)
```

## A worked example

A 5-result ranking, with 2 truly relevant documents (graded relevance 3 and 2) out of a 5-document collection:

```text
rank 1: d3 (relevant, gain 3)
rank 2: d1 (not relevant)
rank 3: d5 (relevant, gain 2)
rank 4: d2 (not relevant)
rank 5: d4 (not relevant)

precision@1: 1.000   recall@1: 0.500
precision@3: 0.667   recall@3: 1.000
precision@5: 0.400   recall@5: 1.000

MRR: 1.000  (the very first result is relevant)
NDCG@3: 0.939
NDCG@5: 0.939  (unchanged past k=3, since nothing relevant appears after rank 3)
```

MRR is a perfect 1.0 because the top result happens to be relevant — it doesn't care that the second relevant result is further down. NDCG@3 at 0.939 reflects that the ranking is *close* to ideal but not quite: the higher-gain document (gain 3) is correctly first, but the gap between that and the true ideal ordering (which would put both relevant documents even more favorably) costs a small amount of discounted gain.

## Bench

```bench
id: retrieval-ranking-metrics
title: Different metrics, same ranked list
fallback: Slide k and switch metrics to see precision, recall, MRR and NDCG score the same ranked list differently.
```

**Try this**

1. Slide k from 1 to 5 and watch precision fall while recall rises.
2. Note that MRR doesn't change at all as k changes — it only depends on the first relevant result's position.
3. Compare NDCG@3 and NDCG@5 — why do they come out identical here?

**What you should notice:** these four metrics aren't redundant — each one is sensitive to a different aspect of the same ranked list (how many of the top k are relevant, how much of all relevant content got surfaced, where the first good result landed, how close to ideal the whole ordering is).

## Where it appears in AI

* **Precision@k and recall@k reuse [[Precision, Recall and F1]]'s exact definitions**, just restricted to the top k results — this topic is about the retrieval-specific adaptation and the two new rank-aware metrics, not re-deriving precision and recall themselves.
* **These metrics are exactly what [[Re-Ranking Retrieved Results]] is trying to improve** — a re-ranker's whole job is to push NDCG and MRR up by getting the ordering closer to ideal, even when the same set of documents was already retrieved.
* **[[End-to-End RAG Evaluation Frameworks]] uses these as the "retrieval half" of a full evaluation suite**, paired with generation-side metrics like faithfulness.

## Common pitfalls

* **Using precision@k alone and ignoring recall.** A system that only ever returns 1 result can score a perfect precision@1 while missing most of the truly relevant documents in the collection — recall catches this, precision alone doesn't.
* **Assuming MRR and NDCG measure the same thing.** MRR only cares about the position of the *first* relevant result; NDCG accounts for every result's graded relevance and position — two rankings can tie on MRR while differing substantially on NDCG.
* **Forgetting that NDCG needs a sensible "ideal" ordering to normalize against.** If the graded relevance values themselves are poorly calibrated, NDCG's normalization won't fix that underlying problem.

## Quick check

<details><summary>1. Why does MRR stay the same regardless of which k value you choose, while precision@k and recall@k both change?</summary>
MRR only depends on the position of the single first relevant result in the whole ranking, which doesn't change as you consider more or fewer top results — precision and recall are both computed specifically over the top k, so they shift as k changes.
</details>

<details><summary>2. In the worked example, why is NDCG@3 less than 1.0 even though the highest-gain document is ranked first?</summary>
NDCG compares the actual ranking's discounted gain against the *ideal* ordering's discounted gain; here the second relevant document (gain 2) sits at rank 3 rather than rank 2, so its contribution is discounted slightly more than it would be under the ideal ordering.
</details>

<details><summary>3. When would MRR be a more appropriate metric than NDCG?</summary>
When all that matters is getting at least one good result near the top quickly (as in many search or question-answering use cases) — MRR directly rewards that and ignores the rest of the ranking, which NDCG's full-list weighting doesn't isolate as cleanly.
</details>

## Key terms

* **MRR (mean reciprocal rank):** the reciprocal of the position of the first relevant result in a ranking.
* **NDCG (normalized discounted cumulative gain):** a ranking metric using graded relevance, discounted by position, normalized against the ideal ordering.
* **Graded relevance:** a relevance score with more than two levels (not just relevant/irrelevant), as NDCG uses.

## Related

[[Precision, Recall and F1]] · [[Re-Ranking Retrieved Results]] · [[End-to-End RAG Evaluation Frameworks]]
