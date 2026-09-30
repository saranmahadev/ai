**Naive Bayes** classifies by asking, for each class, how well the observed features fit it, then combining the answers with Bayes' rule. The "naive" assumption is that features are independent within a class, so the evidence just multiplies. That assumption is usually false, yet the method is fast, needs little data and often works surprisingly well.

**You need:** [[Bayes Theorem]], [[Independence]] and [[Conditional Probability]].

## The question it answers

"Given what I see, which class most likely produced it?" Naive Bayes flips the question: it learns how each class *generates* features, then uses Bayes' rule to go backwards to the class.

## Intuition: evidence adds up

Start from how common each class is (the prior). Every feature you observe then nudges the odds: the word "free" is far more common in spam than in ordinary mail, so seeing it multiplies the odds of spam; the word "meeting" multiplies them down. Assuming features are independent given the class, each feature's nudge is a simple multiplication.

## Definitions

```text
Bayes' rule      P(class | features) ∝ P(class) · P(f₁ | class) · P(f₂ | class) · …
odds form        posterior odds = prior odds × Π  P(fᵢ | spam) / P(fᵢ | ham)
likelihood ratio the factor  P(f | spam) / P(f | ham): above 1 favours spam, below 1 favours ham
```

The product form is where "naive" enters: the true joint probability of features given a class would need every interaction; independence collapses it to one term per feature. The probabilities are just counted from training data.

## A worked example

Take a prior of `P(spam) = 0.4`. An email contains the words "free" and "urgent". From training counts: `P(free | spam) = 0.6`, `P(free | ham) = 0.05`, `P(urgent | spam) = 0.35`, `P(urgent | ham) = 0.1`.

```text
prior odds        = 0.4 / 0.6                      = 0.667
"free"   ratio    = 0.60 / 0.05                    = 12
"urgent" ratio    = 0.35 / 0.10                    = 3.5
posterior odds    = 0.667 × 12 × 3.5               = 28.0
P(spam | words)   = 28 / (1 + 28)                  = 0.966
```

Add the word "meeting" (`0.05` in spam, `0.40` in ham; ratio 0.125): odds become `28 × 0.125 = 3.5`, so `P(spam) = 3.5 / 4.5 = 0.78`. Evidence for ham pulled the probability from 97% down to 78%. The independence assumption means words that tend to appear together ("free" and "winner") are counted as separate evidence, so naive Bayes tends to be overconfident: its ranking is good, its probabilities are exaggerated.

## Bench

```bench
id: naive-bayes-calc
title: Multiply the evidence
fallback: Tick which words appear in an email and set the prior probability of spam; the bench multiplies the likelihood ratios step by step and shows the resulting odds and probability.
```

**Try this**

1. Tick only "free" and read the probability.
2. Add "winner", then "urgent".
3. Add "meeting" and "thanks".
4. Change the prior and see how much it matters once several words are present.

**What you should notice:** each word multiplies the odds by its ratio, several strong words overwhelm the prior, and words common in both classes barely matter.

## Where it appears in AI

* **Spam filters and text classification** (see [[Text Classification with Naive Bayes]]).
* **Quick baselines** when there is little data or many features.
* **The Bayesian idea** of combining a prior with evidence runs through modern machine learning.

## Common pitfalls

* **Trusting the probabilities:** they are usually too extreme.
* **Zero counts:** a word never seen in a class gives probability zero, killing the whole product (see the next topic).
* **Strongly correlated features,** which double-count evidence.
* **Ignoring the prior** when classes are very unbalanced.

## Quick check

<details><summary>1. Prior odds 1 : 1 and a word with likelihood ratio 4. What are the posterior odds?</summary>
4 : 1, that is a probability of 0.8.
</details>

<details><summary>2. What does "naive" refer to?</summary>
Assuming features are independent given the class.
</details>

<details><summary>3. A word has ratio 0.5. Does it raise or lower the odds of spam?</summary>
It lowers them, halving the odds.
</details>

## Key terms

* **Prior:** the probability of a class before seeing any features.
* **Likelihood:** the probability of a feature given a class.
* **Likelihood ratio:** the likelihood in one class divided by that in another.
* **Posterior:** the probability of a class after seeing the features.

## Related

[[Bayes Theorem]] · [[Independence]] · [[Text Classification with Naive Bayes]] · [[Generative vs Discriminative Models]]
