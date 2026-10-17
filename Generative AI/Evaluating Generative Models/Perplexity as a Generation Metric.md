A classifier's accuracy is easy to check: right or wrong. A language model's quality is harder to pin down with one number — but one very old, very simple metric captures something real: how surprised the model was by what it actually saw.

**You need:** [[Self-Consistency and Best-of-N Sampling]].

## The question it answers

"How confidently does a language model predict the text it's being evaluated on?" **Perplexity** takes the probability a model assigned to each token of a sequence (given everything before it), averages their log-probabilities, and exponentiates the result — producing a single number that can be read as "on average, about how many equally-likely choices did the model seem to be choosing between at each step?" Lower perplexity means the model assigned higher probability to what actually happened — it was less surprised.

## Intuition

If a weather forecaster says "90% chance of rain" the day before it rains, they weren't very surprised; if they said "25% chance of rain" (close to a coin flip among four options) the day before it rains, they were considerably more surprised, even though both forecasts technically "allowed" for rain. Perplexity is exactly that notion of surprise, averaged over every token in a sequence and converted back into an intuitive scale — a perplexity of 4 reads, roughly, as "about as surprised as if choosing uniformly among 4 options every time."

## Definition and notation

```text
perplexity(sequence) = exp( −(1/n) · Σ log P(tokenᵢ | prefix) )

equivalently: perplexity = exp(average cross-entropy, in nats)
  lower perplexity → higher assigned probability → less "surprised"
  perplexity = V for a model that assigns uniform probability 1/V to every token
```

## A worked example

Three toy models' token-by-token probabilities on the same 4-token sequence:

```text
confident & correct:     [0.90, 0.85, 0.80, 0.90]  →  perplexity 1.161
uniform guess (4 tokens): [0.25, 0.25, 0.25, 0.25]  →  perplexity 4.000
unconfident / wrong:     [0.20, 0.15, 0.10, 0.25]  →  perplexity 6.043
```

A model that always assigns exactly 1/4 to a 4-way uniform guess gets perplexity exactly 4 — confirming the "as surprised as choosing among V equally likely options" reading directly. The confident, correct model scores near 1 (almost never surprised); the unconfident, wrong model scores above the uniform baseline — worse than just guessing uniformly would have been.

## Bench

```bench
id: perplexity-metric
title: How surprised was the model?
fallback: Compare the perplexity of three toy models' token probabilities on the same short sequence.
```

**Try this**

1. Compare the confident model's perplexity against the uniform baseline.
2. Notice the unconfident model actually scores *worse* than uniform guessing.
3. Consider what probability sequence would give a perplexity of exactly 1.

**What you should notice:** perplexity near 1 means near-certainty and near-correctness simultaneously — getting it that low requires both confidently assigning probability *and* being right to assign it to.

## Where it appears in AI

* **Perplexity on held-out text is a standard way to compare language models during pretraining**, since lower perplexity on the same evaluation set means the model is systematically less surprised by real text.
* **It only measures how well a model predicts existing text — it says nothing about originality, coherence of generated output, or usefulness**, which is why it's used alongside, not instead of, other evaluation methods.
* **[[n-gram Overlap Metrics (BLEU and ROUGE)|BLEU and ROUGE]] evaluate *generated* text against a reference**; perplexity instead evaluates how well a model predicts *existing* text — a genuinely different question, even though both are often discussed as "language generation metrics."

## Common pitfalls

* **Comparing perplexity across different tokenizers or vocabularies.** Perplexity is sensitive to vocabulary size and how text is split into tokens — two models using different tokenization aren't directly comparable by perplexity alone.
* **Assuming lower perplexity always means better generated text.** A model can achieve very low perplexity by memorizing training data (see [[Memorization and Training Data Leakage]]) without that implying its *novel* generations are good.
* **Forgetting perplexity needs ground-truth text to evaluate against.** It measures how well a model predicts text that actually exists; it can't be computed on a model's own free-form generations with nothing to compare them to.

## Quick check

<details><summary>1. What does a perplexity of exactly 4 tell you about a model's predictions?</summary>
On average, the model was about as "surprised" by what it saw as if it had been choosing uniformly at random among 4 equally likely options at each step.
</details>

<details><summary>2. In the worked example, why did the "unconfident / wrong" model score worse than the uniform baseline?</summary>
Its average assigned probability to what actually happened was lower than the uniform guess of 0.25 at every step, meaning it was systematically more surprised than even a flat, uninformed guess would have been.
</details>

<details><summary>3. What does perplexity fail to measure about a language model's generations?</summary>
It only measures how well a model predicts existing (reference) text — it says nothing about the quality, coherence, or usefulness of text the model generates on its own with no reference to compare against.
</details>

## Key terms

* **Perplexity:** the exponentiated average negative log-probability a model assigns to a sequence; lower means less surprised.
* **Cross-entropy:** the average negative log-probability itself, before exponentiating; perplexity is literally e raised to this value.
* **Held-out text:** text not used during training, used to measure how well a model generalizes.

## Related

[[Self-Consistency and Best-of-N Sampling]] · [[n-gram Overlap Metrics (BLEU and ROUGE)]] · [[Human Evaluation of Generated Content]]
