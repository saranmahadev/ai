Retrieving the right passages doesn't guarantee the generated answer actually uses them. A model can still fall back on what it already "knows" from pretraining, blending retrieved facts with unretrieved ones in a way that's indistinguishable from the outside — unless each individual claim is checked against what was actually retrieved.

**You need:** [[Citation and Source Attribution]].

## The question it answers

"How do you measure whether an answer is actually grounded in what was retrieved, as a whole?" **Faithfulness** aggregates [[Citation and Source Attribution|the per-claim citation check]] into a single score for the entire answer: the fraction of its claims that have some retrieved passage supporting them above a similarity threshold. An answer where every claim traces back to a retrieved passage is fully grounded; one with claims that don't match anything retrieved has, to that same degree, drawn on something other than what was actually given to it.

## Intuition

Grading an essay for whether it actually uses the assigned readings (as opposed to being well-written in general) means checking, sentence by sentence, whether each claim traces back to something in those readings — a single unsupported claim doesn't necessarily make the whole essay bad, but it does mean the essay isn't fully grounded in the material it was supposed to be based on.

## Definition and notation

```text
faithfulness(answer) = (claims with supporting passage above threshold) / (total claims in answer)
```

## A worked example

A three-claim answer, checked against two retrieved passages at a 0.8 similarity threshold:

```text
"Refunds are issued within 5 business days."  → supported (similarity 1.000)
"Shipping takes 3-5 days."                     → supported (similarity 1.000)
"The company was founded in 1998."             → unsupported (best similarity only 0.781)

faithfulness: 2 of 3 claims supported = 0.667

if the unsupported claim were dropped from the answer: 2 of 2 claims supported = 1.000
```

Two-thirds of this answer is grounded in what was actually retrieved; the third claim appears to have come from somewhere else entirely — the model's own pretrained knowledge, most likely, rather than the passages it was given. Removing that one claim would make the remaining answer fully faithful.

## Bench

```bench
id: faithfulness-score
title: What fraction of the answer is actually grounded?
fallback: Toggle an unsupported claim in/out of an answer and watch the faithfulness score respond.
```

**Try this**

1. Look at the faithfulness score with all three claims included.
2. Remove the unsupported claim and watch the score reach 1.0.
3. Consider what a faithfulness score of exactly 0.0 would mean about an answer.

**What you should notice:** faithfulness measures whether an answer is grounded in its retrieved context — it says nothing about whether the answer is otherwise correct, well-written, or even helpful; a fully faithful answer can still be an unhelpful or incomplete one.

## Where it appears in AI

* **This directly aggregates [[Citation and Source Attribution]]'s per-claim check** into a single number for the whole answer, rather than a list of individual citations.
* **[[Faithfulness and Answer Relevancy Metrics]] covers how this score fits into a broader RAG evaluation suite** — faithfulness measures groundedness specifically, separate from whether the answer actually addresses the question (relevancy).
* **A low faithfulness score is a strong, specific signal pointing to exactly the kind of problem [[Common RAG Failure Modes]] catalogs as "generation ignored or went beyond the retrieved context."**

## Common pitfalls

* **Treating a high faithfulness score as proof the answer is correct.** Faithfulness only measures whether claims trace back to retrieved passages — if those passages are themselves wrong, a fully faithful answer would faithfully repeat that wrongness.
* **Treating a low faithfulness score as proof of a "bad" answer in every sense.** An unsupported claim could be the model correctly adding well-known general knowledge that happens not to be in the retrieved passages — faithfulness flags this as unsupported regardless of whether the claim itself is true.
* **Measuring faithfulness without a sensible similarity threshold.** Too low a threshold credits unsupported claims with false citations (as the worked example's 0.781-scoring claim would be if the threshold were set below that); too high a threshold can mark genuinely supported claims as unfaithful.

## Quick check

<details><summary>1. In the worked example, why is the faithfulness score 0.667 rather than some other fraction?</summary>
Two of the answer's three claims have a supporting passage above the 0.8 threshold, and one doesn't — 2 divided by 3 is approximately 0.667.
</details>

<details><summary>2. Does a faithfulness score of 1.0 guarantee the answer is factually correct?</summary>
No — it only means every claim traces back to a retrieved passage above the similarity threshold; if the retrieved passages themselves contain errors, a fully faithful answer would still repeat those errors.
</details>

<details><summary>3. What's the difference between a faithfulness problem and a relevancy problem for a generated answer?</summary>
Faithfulness measures whether the answer's claims are grounded in what was retrieved; relevancy measures whether the answer actually addresses the question asked — an answer can be fully faithful to irrelevant retrieved passages, or relevant to the question while including ungrounded claims.
</details>

## Key terms

* **Faithfulness:** the fraction of a generated answer's claims that are supported by retrieved context.
* **Grounded generation:** generation that draws its claims from retrieved context rather than unretrieved, pretrained knowledge.
* **Unsupported claim:** a generated claim with no sufficiently similar retrieved passage backing it.

## Related

[[Citation and Source Attribution]] · [[Faithfulness and Answer Relevancy Metrics]] · [[Common RAG Failure Modes]]
