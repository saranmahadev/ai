Every query in a basic RAG pipeline gets retrieved for, whether it needs it or not — "what is 2 + 2" triggers the exact same search-then-generate routine as a question about a company's confidential Q3 numbers. Self-RAG adds judgment to that routine: the model itself decides whether retrieval is even necessary, and afterward, whether what came back is actually worth using.

**You need:** [[Anatomy of a RAG Pipeline]].

## The question it answers

"Does every query really need to trigger retrieval, and is every retrieved passage automatically trustworthy?" Self-RAG uses two self-assessment checks instead of always retrieving unconditionally: first, whether the model's own confidence in answering directly is already high enough that retrieval would add little; second, if it does retrieve, whether the retrieved passage actually looks relevant before using it to generate an answer. Both checks can be made by the same model, trained or prompted to produce this kind of self-judgment.

## Intuition

A knowledgeable person answering "what's 2 plus 2" doesn't pause to look anything up — their own confidence is already more than enough. Asked something they're genuinely unsure about, they do look it up — but a good researcher also checks whether what they found actually answers the question before citing it, rather than using the first thing that came back regardless of relevance.

## Definition and notation

```text
retrieve?  = parametric_confidence < threshold
use_passage?  = retrieved_passage.relevance ≥ threshold
```

## A worked example

Two questions, routed by the model's own confidence, followed by a relevance check on what gets retrieved:

```text
"What is 2 + 2?" (confidence 0.98) → answer directly, no retrieval needed
"What were last quarter's returns figures?" (confidence 0.25) → retrieve first

after retrieving for the second question:
  "Q3 returns were up 4%." (relevance 0.91) → used
  "Unrelated HR policy update." (relevance 0.12) → discarded
```

The first question never triggers retrieval at all — the model's own confidence is already well above the threshold. The second question does retrieve, and then applies a second check: one retrieved passage clears the relevance bar and gets used; another, clearly off-topic, gets discarded before it ever reaches generation.

## Bench

```bench
id: self-rag-routing
title: Deciding whether to look something up at all
fallback: Slide a model's own confidence and watch Self-RAG decide whether to retrieve at all, then whether to trust what it found.
```

**Try this**

1. Slide confidence above the retrieval threshold and watch the system skip retrieval entirely.
2. Slide it below, forcing retrieval, then adjust the relevance slider to see the passage get used or discarded.
3. Consider what happens to answer quality if the confidence threshold is set too high, so retrieval almost never triggers.

**What you should notice:** Self-RAG adds two separate decision points to the basic pipeline, not one — skipping unnecessary retrieval and discarding irrelevant retrieved content are each their own judgment call, made independently.

## Where it appears in AI

* **This is a direct refinement of [[Anatomy of a RAG Pipeline]]'s fixed five-stage sequence** — Self-RAG makes the "retrieve" and "assemble" stages conditional rather than automatic.
* **[[Corrective RAG]] takes the relevance-checking idea further**, triggering an actual fallback action (not just discarding) when retrieval quality looks poor.
* **This reuses the same confidence-decay reasoning from [[Hallucination and Knowledge Cutoff]]**: a model's own confidence is exactly the signal Self-RAG checks before deciding whether retrieval is worth the cost.

## Common pitfalls

* **Setting the confidence threshold too low, so retrieval almost always triggers.** This defeats the purpose of skipping retrieval for genuinely easy questions, adding cost and latency with little benefit.
* **Setting it too high, so the model skips retrieval for questions it's only falsely confident about.** A model's own confidence isn't a perfect signal — [[Hallucination and Knowledge Cutoff]] already showed confidence can stay misleadingly high well past where it should be trusted.
* **Trusting the relevance check as infallible.** It's still a model's own judgment, which can itself be wrong — a genuinely relevant passage phrased unusually could be discarded, or an irrelevant one that superficially resembles the query could pass.

## Quick check

<details><summary>1. Why does the "What is 2 + 2?" question skip retrieval entirely in the worked example?</summary>
Its parametric confidence (0.98) is above the retrieval threshold, so the system judges that looking anything up wouldn't meaningfully improve an answer it's already essentially certain about.
</details>

<details><summary>2. What happens to the "Unrelated HR policy update" passage after it's retrieved?</summary>
Its relevance score (0.12) falls below the relevance threshold, so it's discarded before reaching the generation stage, rather than being used as context for the answer.
</details>

<details><summary>3. Does Self-RAG eliminate the risk of a model answering confidently but incorrectly?</summary>
No — both of its decision points rely on the model's own self-assessment, which can itself be wrong; it reduces unnecessary retrieval and some irrelevant-context use, but doesn't guarantee correctness.
</details>

## Key terms

* **Self-RAG:** a RAG variant where the model itself decides whether to retrieve and whether to trust what was retrieved.
* **Parametric confidence:** the model's own estimate of how likely its unretrieved answer is to be correct.
* **Relevance check:** a self-assessment of whether a retrieved passage actually bears on the question asked.

## Related

[[Anatomy of a RAG Pipeline]] · [[Corrective RAG]] · [[Hallucination and Knowledge Cutoff]]
