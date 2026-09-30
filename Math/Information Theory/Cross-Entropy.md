**Cross-entropy** is the average surprise you feel when the world follows distribution `p` but you predicted with distribution `q`: `H(p, q) = −Σ p log q`. It is the standard loss for classification and language models. It is smallest when your prediction matches reality, and it punishes confident wrong answers heavily.

**You need:** [[Entropy]] and [[Surprise and Information]].

Cross-entropy is used as a loss function; the [[Optimization]] district, later on the road, shows how such losses are minimised.

## The question it answers

"How costly is it to describe reality with the wrong model?" If a classifier says 90% cat and the picture is a dog, that should hurt far more than a hesitant 40%.

## Intuition: surprise under the wrong beliefs

Reality draws outcomes from `p`. You pay `−log q(x)` bits of surprise for each outcome `x`, according to *your* belief `q`. Averaged over what actually happens:

```text
H(p, q) = − Σ p(x) · log₂ q(x)
H(p, q) ≥ H(p)          with equality only when q = p
```

The excess over the true entropy, `H(p, q) − H(p)`, is the **KL divergence** (see [[KL Divergence]]): the extra bits wasted by believing `q` instead of `p`.

## Classification: one-hot targets

If the true label is one class, `p` is **one-hot** (probability 1 on the true class, 0 elsewhere). The cross-entropy collapses to a single term:

```text
loss = −log₂ q(true class)        (or −ln q in nats, the usual choice in code)
```

This is exactly the log loss from [[Loss Functions]]: minimising it means giving the true class as high a probability as possible.

## A worked example

True distribution `p = (0.5, 0.5)`, prediction `q = (0.9, 0.1)`:

```text
H(p, q) = −(0.5 · log₂ 0.9 + 0.5 · log₂ 0.1) = 0.5 × 0.152 + 0.5 × 3.322 = 1.737 bits
H(p)    = 1 bit
excess  = 1.737 − 1 = 0.737 bits         (the KL divergence)
```

One-hot example: the truth is class 1 and the model predicts `q = (0.7, 0.2, 0.1)`. Loss `= −log₂ 0.7 = 0.515` bits. If it had predicted 0.1 for the true class, the loss would be `3.32` bits. Confident and wrong is expensive: a prediction of 0.01 costs 6.64 bits.

The gradient of softmax followed by cross-entropy is beautifully simple: `predicted probabilities − true probabilities` (see [[Softmax and Cross-Entropy in Practice]]).

## Bench

```bench
id: cross-entropy-compare
title: True versus predicted distribution
fallback: Sliders set a true distribution and a predicted distribution over three classes; the bench shows both as bars and reports the entropy of the truth, the cross-entropy and their difference, and a one-hot mode shows the log-loss of the true class.
```

**Try this**

1. Make the prediction equal to the truth and read the cross-entropy.
2. Move the prediction away and watch the cross-entropy rise.
3. Switch to one-hot truth and lower the probability of the true class.
4. Give the true class probability near zero.

**What you should notice:** cross-entropy is never below the true entropy and equals it only for a perfect prediction; near-zero probability on the truth is punished severely.

## Where it appears in AI

* **Classification and language-model training** minimise cross-entropy.
* **Softmax outputs** are paired with it.
* **Perplexity** is `2` to the power of the cross-entropy in bits.
* **Knowledge distillation** matches a student's distribution to a teacher's.

## Common pitfalls

* **Predicting exactly 0** for a possible class: infinite loss.
* **Swapping `p` and `q`.** The truth goes in front, the prediction inside the log.
* **Mixing bits and nats** when comparing numbers.
* **Applying it to unnormalised scores** instead of probabilities.

## Quick check

<details><summary>1. True class gets q = 0.5. What is the loss in bits?</summary>
1 bit.
</details>

<details><summary>2. When does H(p, q) equal H(p)?</summary>
When q = p.
</details>

<details><summary>3. Why is confident and wrong so costly?</summary>
The loss is −log of a very small probability, which is large.
</details>

## Key terms

* **Cross-entropy:** the average surprise using prediction `q` when reality is `p`.
* **One-hot:** a target with probability 1 on a single class.
* **Log loss:** cross-entropy with a one-hot target.
* **Perplexity:** the exponential of the cross-entropy.

## Related

[[Entropy]] · [[KL Divergence]] · [[Loss Functions]] · [[Maximum Likelihood]] · [[Softmax and Cross-Entropy in Practice]]
