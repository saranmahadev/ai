Two RAG systems can score identically on an overall end-to-end quality check and still be broken in completely different places — one failing at retrieval, the other at generation. A single pass/fail number can't tell them apart; a full scorecard, broken out by stage, can.

**You need:** [[Retrieval Metrics: Precision, Recall, MRR and NDCG]], [[Faithfulness and Answer Relevancy Metrics]].

## The question it answers

"How do you combine retrieval-side and generation-side metrics into one evaluation that actually localizes problems?" An end-to-end framework runs a scorecard of several metrics at once — retrieval metrics like context precision and context recall, generation metrics like faithfulness and answer relevancy — and looks at the *lowest* score to identify which specific stage of the pipeline is actually weak, rather than relying on one blended number that could hide the problem.

## Intuition

A car that fails inspection on exactly one system — brakes, say — needs the same single clear flag whether every other system passed with flying colors or barely scraped by. A combined "67% roadworthy" score tells you nothing about which system to actually fix; a full checklist, item by item, does.

## Definition and notation

```text
scorecard = { contextPrecision, contextRecall, faithfulness, answerRelevancy, ... }
weakest_stage = the metric with the lowest score, and whichever pipeline stage it belongs to
```

## A worked example

Two systems, each strong on one half of the pipeline and weak on the other:

```text
System A: contextPrecision 0.90, contextRecall 0.85, faithfulness 0.30, answerRelevancy 0.90
  → weakest metric: faithfulness (0.30) → retrieval is fine, generation is the problem

System B: contextPrecision 0.40, contextRecall 0.35, faithfulness 0.90, answerRelevancy 0.85
  → weakest metric: contextRecall (0.35) → generation is fine, retrieval is the problem
```

Both systems could easily land at a similar *average* score across all four metrics — but their weakest individual metric points at completely different places to fix. System A's retrieval is working well; its generation stage is ignoring good context. System B's generation is working well; it's simply not finding enough of the right context to work with in the first place.

## Bench

```bench
id: rag-scorecard
title: The lowest score names the broken stage
fallback: Compare two RAG systems' full metric scorecards and spot which pipeline stage is actually weak in each.
```

**Try this**

1. Look at System A's full scorecard and find its weakest metric.
2. Switch to System B and find its weakest metric.
3. Imagine averaging all four metrics for each system — would that average alone tell you where to look?

**What you should notice:** the weakest individual metric, not the average, is what actually tells you which stage of the pipeline needs attention — the two systems' averages could be deceptively similar despite having opposite problems.

## Where it appears in AI

* **This combines exactly [[Retrieval Metrics: Precision, Recall, MRR and NDCG]] and [[Faithfulness and Answer Relevancy Metrics]]** into one scorecard — the framework's value is in combining them, not in any new metric of its own.
* **Diagnosing System A's problem (good retrieval, bad generation) points directly at [[Grounded Generation and Faithfulness]] as the place to fix it; System B's problem points at the retrieval strategies covered across this planet's earlier districts.**
* **[[Common RAG Failure Modes]] catalogs the specific symptoms each kind of weak metric tends to produce**, giving a faster first guess before running the full scorecard.

## Common pitfalls

* **Reporting a single blended quality score for a RAG system.** The worked example's two systems show exactly how this can mask which stage actually needs work, even when the overall averages look deceptively similar.
* **Running only generation-side metrics because they're easier to compute.** System B's problem is entirely on the retrieval side — a generation-only evaluation would never surface it, and might even look reasonably healthy.
* **Treating the scorecard as a one-time evaluation rather than a recurring check.** A system that scores well today can regress in just one metric after a change (a new embedding model, an index rebuild) — only re-running the full scorecard would catch which specific metric moved.

## Quick check

<details><summary>1. In the worked example, why does focusing on the lowest-scoring metric matter more than averaging all four?</summary>
Averaging can produce similar-looking overall scores for systems with completely different underlying problems, while the lowest individual metric directly identifies which stage is actually failing.
</details>

<details><summary>2. What does System A's scorecard suggest about where to focus improvement effort?</summary>
Its context precision and recall are both strong, meaning retrieval is finding good context; its faithfulness is weak, meaning the generation stage isn't actually using that good context well — the fix belongs in generation, not retrieval.
</details>

<details><summary>3. Could a system score well on every metric and still produce a bad answer?</summary>
In principle a system could still produce answers a human judges unsatisfying for reasons none of these specific metrics capture (tone, completeness, formatting) — the scorecard measures the dimensions it's designed to measure, not every possible way an answer can fall short.
</details>

## Key terms

* **End-to-end evaluation framework:** a combined scorecard covering both retrieval-side and generation-side metrics.
* **Context precision/recall:** retrieval-side metrics measuring how much of the retrieved context is relevant, and how much of the relevant content was retrieved.
* **Stage localization:** identifying which specific pipeline stage (retrieval vs. generation) a low score points to.

## Related

[[Retrieval Metrics: Precision, Recall, MRR and NDCG]] · [[Faithfulness and Answer Relevancy Metrics]] · [[Common RAG Failure Modes]]
