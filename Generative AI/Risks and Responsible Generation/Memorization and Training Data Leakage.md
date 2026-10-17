[[Copyright and Training Data Provenance|overlap detection]] checks whether generated output matches training data verbatim. This note covers detecting the underlying cause from the *model's own behavior* instead of its output: a model that has memorized specific training examples tends to be measurably, suspiciously confident about them.

**You need:** [[Copyright and Training Data Provenance]], [[Perplexity as a Generation Metric]].

## The question it answers

"How can you tell, just from a model's own confidence, whether a specific example was in its training data?" This is a **membership inference** question. A model that has memorized a training example tends to assign it unusually high probability — lower [[Perplexity as a Generation Metric|perplexity]] — compared to a genuinely novel, held-out example it never saw. A sizeable, systematic gap between a model's confidence on "likely training" examples versus held-out ones is a real, measurable signal of memorization, not just better general capability.

## Intuition

Ask someone to recite a passage they memorized word-for-word years ago, versus asking them to read a similar but unfamiliar passage aloud for the first time — the first will come out faster, more fluently, with more confidence about exactly which word comes next. A model behaves similarly: on text it has truly memorized, its next-token predictions are unusually sharp and confident, in a way that goes beyond simply being good at predicting that *kind* of text in general.

## Definition and notation

```text
membership-inference signal:
  perplexity(training example) ≪ perplexity(held-out example of similar kind)

→ a large, consistent gap (not just "the model did okay on both")
  suggests the training example was specifically memorized, rather than
  merely well-predicted because it resembles the training distribution
```

## A worked example

A toy model's assigned probabilities on two four-token sequences of a similar kind — one supposedly seen during training, one genuinely never seen:

```text
seen during training:    probabilities [0.95, 0.97, 0.93, 0.96]  →  perplexity 1.050
never seen (held-out):   probabilities [0.40, 0.35, 0.50, 0.30]  →  perplexity 2.627
```

The training example's perplexity sits barely above 1 — the model is almost never surprised by any token in it. The held-out example's perplexity is well over double that, even though both sequences are of a broadly similar kind. That gap — not either number alone — is the actual memorization signal.

## Bench

```bench
id: membership-perplexity-gap
title: Lower perplexity on training data is a memorization signal
fallback: Compare a model's perplexity on an example it supposedly trained on against one it never saw.
```

**Try this**

1. Look at the "seen during training" example's perplexity.
2. Switch to the "never seen" example and compare.
3. Consider how large a gap would need to be before you'd call it suspicious rather than ordinary variation.

**What you should notice:** the gap between the two perplexities, not either value in isolation, is what carries the signal — a model being generally confident isn't suspicious; being *selectively, unusually* confident on specific examples is.

## Where it appears in AI

* **Membership inference attacks are a standard privacy-research technique**, used to audit whether a model leaks information about what specific data it was trained on — relevant well beyond copyright, including personal or sensitive training data.
* **Larger models, trained for longer on smaller or more-repeated datasets, tend to memorize more**, which is why dataset size, deduplication, and number of training epochs are all discussed as memorization risk factors.
* **Extraction attacks go a step further than measuring a gap**: they actively try to get a model to reproduce specific memorized training content verbatim, using exactly the kind of overlap check from [[Copyright and Training Data Provenance]] to confirm success.

## Common pitfalls

* **Treating any confident prediction as evidence of memorization.** A model can be legitimately confident about common, predictable text (like "the" following "of the") without having memorized any specific training example — the signal is a *gap* relative to a comparable held-out example, not confidence alone.
* **Assuming memorization only matters for exact copyright questions.** It's also a genuine privacy concern when training data includes personal information that a model might later reproduce.
* **Forgetting the comparison needs genuinely comparable examples.** Comparing perplexity on a simple sentence against a complex one conflates "this is an easy example" with "this was memorized" — a fair test needs held-out examples of similar difficulty.

## Quick check

<details><summary>1. What specifically signals memorization, rather than just general model competence?</summary>
A large, systematic gap between a model's confidence (low perplexity) on supposedly-seen training examples and its confidence on comparable held-out examples — not high confidence on its own.
</details>

<details><summary>2. In the worked example, how much lower was the training example's perplexity compared to the held-out example's?</summary>
About 1.050 versus 2.627 — the held-out example's perplexity was more than double the training example's.
</details>

<details><summary>3. Why do membership inference tests need to compare against a "comparable" held-out example?</summary>
Because an easy or very typical example will naturally get lower perplexity regardless of memorization — the comparison only reveals memorization if the two examples being compared are of similar inherent difficulty.
</details>

## Key terms

* **Membership inference:** determining whether a specific example was part of a model's training data, based on the model's own behavior.
* **Memorization:** a model reproducing or being unusually confident about specific training examples, rather than generalizing from them.
* **Extraction attack:** deliberately prompting a model to reproduce specific memorized training content.

## Related

[[Copyright and Training Data Provenance]] · [[Perplexity as a Generation Metric]] · [[Watermarking and Synthetic Media Provenance]]
