Self-RAG discards an individual irrelevant passage; Corrective RAG asks a broader question about the *whole* retrieval — is this collection of results even worth generating from, or should the system take a completely different action instead? A classifier scores the retrieval as a whole and routes to a different fallback depending on how bad it looks.

**You need:** [[Self-RAG and Reflective Retrieval]].

## The question it answers

"What should happen when an entire retrieval looks weak, not just one passage?" Corrective RAG classifies a retrieval's overall quality — by the best relevance score among its results — into three buckets: **correct** (confidently relevant, safe to generate from directly), **ambiguous** (some signal, but not strong enough to trust outright — worth refining the query and trying again), or **incorrect** (nothing relevant found at all — fall back to a broader search, such as a web search, rather than generating from what's clearly the wrong context).

## Intuition

A research assistant handed a weak stack of sources for a report doesn't just write the report anyway using whatever's there — if the sources look thin but plausible, they go back and search more specifically; if the sources are clearly about the wrong topic entirely, they start over with a different search strategy altogether. Writing from bad sources regardless isn't on the list of options.

## Definition and notation

```text
classify(scores) = "correct"    if max(scores) ≥ 0.7
                  = "ambiguous"  if 0.3 ≤ max(scores) < 0.7
                  = "incorrect"  if max(scores) < 0.3
```

## A worked example

Three retrieval scenarios for the same query, classified by their best relevance score:

```text
good retrieval (scores: 0.85, 0.3, 0.1):   best 0.85  →  correct    →  generate from retrieved context
weak retrieval (scores: 0.45, 0.4, 0.2):   best 0.45  →  ambiguous  →  refine query and retrieve again
bad retrieval  (scores: 0.15, 0.1, 0.05):  best 0.15  →  incorrect  →  fall back to a broader search
```

Each scenario triggers a genuinely different action, not just a different confidence label — "ambiguous" tries again with a better query, while "incorrect" abandons the current retrieval strategy entirely rather than trying to patch it.

## Bench

```bench
id: corrective-rag-classifier
title: Checking the retrieval before trusting it
fallback: Classify a retrieval's quality and watch which corrective action it triggers.
```

**Try this**

1. Look at the "good retrieval" scenario and note it proceeds straight to generation.
2. Switch to "weak retrieval" and see it triggers a re-query instead of generating.
3. Switch to "bad retrieval" and see it abandons retrieval-based generation entirely.

**What you should notice:** the classification depends only on the *best* score among the retrieved passages — a retrieval with several mediocre results and one strong one is judged "correct," the same as a retrieval with one spectacular result and nothing else.

## Where it appears in AI

* **This extends [[Self-RAG and Reflective Retrieval]]'s passage-level relevance check to the whole retrieval**, adding genuinely different fallback actions rather than just discarding individual results.
* **The "fall back to a broader search" action is itself just another retrieval strategy** ([[Query Expansion and Rewriting]], or an entirely different data source) — Corrective RAG decides *when* to reach for it, not *how* it works.
* **[[Common RAG Failure Modes]] includes "generated a confident answer from irrelevant retrieved context" as exactly the failure Corrective RAG is designed to intercept before generation ever happens.**

## Common pitfalls

* **Setting the "correct" threshold so low that weak retrievals get treated as trustworthy.** The thresholds in the worked example are a design choice — too permissive a cutoff defeats the purpose of checking at all.
* **Treating "ambiguous" and "incorrect" the same way.** The worked example deliberately gives them different corrective actions — refining a query is a much smaller intervention than abandoning the retrieval strategy altogether, and conflating them wastes the distinction.
* **Relying only on the best score and ignoring how the rest of the results look.** A retrieval with one lucky high-scoring passage and nothing else coherent might still warrant more scrutiny than a single number captures.

## Quick check

<details><summary>1. In the worked example, why does the "weak retrieval" scenario trigger a re-query rather than generation or a full fallback?</summary>
Its best score (0.45) falls between the two thresholds — high enough to suggest some real signal exists, but not high enough to trust directly, which is exactly the "ambiguous" bucket's definition and corrective action.
</details>

<details><summary>2. Why does Corrective RAG classify based on the best score among results, rather than the average?</summary>
A single strong, relevant passage can be enough to answer a question even if the rest of the retrieved results are irrelevant noise — averaging would unfairly penalize a good retrieval just for also returning some weak candidates alongside the right one.
</details>

<details><summary>3. What distinguishes Corrective RAG's "incorrect" action from Self-RAG's passage-discarding?</summary>
Self-RAG discards an individual irrelevant passage but still proceeds with whatever else was retrieved; Corrective RAG's "incorrect" verdict abandons the current retrieval approach for the whole query, switching to a different strategy entirely.
</details>

## Key terms

* **Corrective RAG:** classifying a retrieval's overall quality and routing to different corrective actions based on that classification.
* **Retrieval verdict:** the bucket (correct, ambiguous, incorrect) a retrieval is classified into.
* **Fallback action:** an alternative strategy (query refinement, broader search) triggered when a retrieval is judged too weak to generate from directly.

## Related

[[Self-RAG and Reflective Retrieval]] · [[Query Expansion and Rewriting]] · [[Common RAG Failure Modes]]
