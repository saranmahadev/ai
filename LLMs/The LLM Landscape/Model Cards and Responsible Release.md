A model card is a short document that ships alongside a model, stating what it was trained on, what it's good and bad at, and where it's known to fail. A card with half its sections left blank gives a false sense of transparency — it looks like documentation without functioning as documentation.

**You need:** [[Open-Weight vs. Closed Models]].

## The question it answers

"How do you measure whether a model's documentation actually tells users what they need to know?" A model card is complete when every standard section — intended use, known limitations, training data summary, evaluation results, known biases — is actually filled in, not merely present as an empty heading.

## Intuition

A nutrition label with only "calories" filled in and "allergens," "sugar," and "sodium" left blank technically satisfies "there's a nutrition label" while telling you almost nothing that matters. A model card works the same way: its value comes from what's actually written under each heading, not from the headings existing.

## Definition and notation

```text
completeness(card) = |filled sections| / |total expected sections|
```

Five commonly expected sections: intended use, known limitations, training data summary, evaluation results, known biases.

## A worked example

Two versions of a model card, same five sections:

```text
Card A: intended_use ✓, limitations ✓, training_data ✗, evaluation_results ✗, known_biases ✗
  → 2 of 5 filled → completeness = 0.40 (40%)

Card B: intended_use ✓, limitations ✓, training_data ✓, evaluation_results ✓, known_biases ✓
  → 5 of 5 filled → completeness = 1.00 (100%)
```

Card A states what the model is for and where it struggles, but says nothing about what it was trained on or how it was evaluated — a user can't check its claims or spot likely blind spots. Card B lets a user actually verify the model's fitness for their use case.

## Bench

```bench
id: model-card-completeness
title: A model card is only as good as what's filled in
fallback: Toggle which model-card sections are filled in and watch the completeness score change.
```

**Try this**

1. Start with only "Intended use" and "Known limitations" checked and note the completeness score.
2. Fill in "Training data summary" and "Evaluation results" one at a time and watch the score climb.
3. Uncheck everything and notice the score drops to 0% even though the card headings still exist.

**What you should notice:** completeness tracks what's actually written, not which headings are present — an empty section contributes nothing to the score.

## Where it appears in AI

* **Open-weight releases (see [[Open-Weight vs. Closed Models]]) are often accompanied by a model card**, since there's no other way for downstream users to learn what the provider knows about the model's limitations.
* **[[Responsible Scaling Policies and Frontier Safety]] treats documentation completeness as part of what a responsible release requires**, especially for the known-biases and limitations sections.
* **A leaderboard entry (covered in the Evaluating LLMs section of this subject) says nothing about a model's documented limitations** — model-card completeness is a separate, complementary signal to benchmark scores.

## Common pitfalls

* **Treating the existence of a model card as equivalent to transparency.** The worked example's Card A has every heading present but tells a user almost nothing actionable.
* **Assuming a high completeness score means the content is accurate.** Completeness measures coverage, not correctness — a filled-in section can still understate real limitations.
* **Expecting every provider to use the same five sections.** Real model cards vary in structure; the principle (write what you actually know, don't leave gaps) matters more than matching a fixed template.

## Quick check

<details><summary>1. In the worked example, why does Card A's 40% completeness understate its usefulness problem more than a simple percentage suggests?</summary>
The two sections it's missing — training data summary and evaluation results — are exactly the ones a user would need to verify the model's claims or predict where it's likely to fail, so the gap matters more than "60% missing" alone conveys.
</details>

<details><summary>2. Does filling in every section of a model card guarantee the model has no undisclosed limitations?</summary>
No — completeness measures how much of the expected documentation was written, not whether what's written (or omitted) is fully honest or accurate.
</details>

<details><summary>3. Why might a provider ship a model card with some sections deliberately left blank?</summary>
Possible reasons include not having rigorously evaluated the model along some axis yet, competitive sensitivity about training data, or simple release-deadline pressure — none of which make the blank sections less of a transparency gap for users.
</details>

## Key terms

* **Model card:** a document accompanying a model release stating its intended use, limitations, training data and evaluation results.
* **Completeness score:** the fraction of a model card's expected sections that are actually filled in.
* **Known biases section:** the part of a model card documenting measured or suspected systematic biases in the model's outputs.

## Related

[[Open-Weight vs. Closed Models]] · [[Licensing and Model Governance]] · [[Responsible Scaling Policies and Frontier Safety]]
