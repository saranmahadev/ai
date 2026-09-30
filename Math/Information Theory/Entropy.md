**Entropy** is the average surprise of a distribution: `H = −Σ p log₂ p`. It measures how uncertain an outcome is before you see it. A certain outcome has zero entropy; a fair coin has one bit; and among distributions on a given set of outcomes, the flat one has the most.

**You need:** [[Surprise and Information]], [[Expectation]] and [[Sums and Products]].

## The question it answers

"How unpredictable is this?" and, equivalently, "how many yes/no questions, on average, would I need to learn the outcome?" It sets the limit for lossless compression and appears in decision-tree learning as a measure of impurity.

## Intuition: average surprise

Each outcome `x` has surprise `−log₂ p(x)`. Weight each by how often it occurs and add:

```text
H(X) = − Σ p(x) · log₂ p(x)       (in bits)
```

A predictable distribution (one outcome very likely) has low entropy. A flat distribution (everything equally likely) has the highest entropy for its size, `log₂ n` bits for `n` outcomes.

## A worked example

```text
fair coin (0.5, 0.5):        H = −(0.5·(−1) + 0.5·(−1))                 = 1 bit
biased coin (0.9, 0.1):      H = −(0.9·log₂ 0.9 + 0.1·log₂ 0.1)
                               = 0.9 × 0.152 + 0.1 × 3.322              = 0.469 bits
fair die (six × 1/6):        H = log₂ 6                                 = 2.585 bits
(0.5, 0.25, 0.125, 0.125):   H = 0.5·1 + 0.25·2 + 0.125·3 + 0.125·3     = 1.75 bits
```

The biased coin is more predictable than the fair coin, so its entropy is lower. The last distribution is the classic coding example: give the four symbols codes of length 1, 2, 3 and 3 bits and the average message costs exactly `1.75` bits per symbol, matching the entropy, whereas a naive fixed 2-bit code costs 2.

For a decision tree, splitting on a feature is good if it lowers the average entropy of the labels (the drop is called **information gain**; see [[Mutual Information]]).

## Bench

```bench
id: entropy-bars
title: Entropy of a distribution
fallback: Sliders set the weights of four outcomes; bars show the probabilities and their surprise, and the entropy in bits is shown next to the maximum possible for four outcomes.
```

**Try this**

1. Make all four equal: what is the entropy?
2. Put nearly all the weight on one outcome.
3. Make two outcomes likely and two impossible.
4. Find the distribution with the largest entropy and the smallest.

**What you should notice:** entropy is largest for a flat distribution (log₂ 4 = 2 bits) and falls toward zero as one outcome takes over.

## Where it appears in AI

* **Decision trees** choose splits that reduce entropy.
* **Model confidence:** the entropy of a predicted distribution measures uncertainty.
* **Data compression** is bounded by entropy.
* **Exploration in reinforcement learning** sometimes rewards high-entropy behaviour.

## Common pitfalls

* **Taking `0 · log 0`.** By convention it is 0.
* **Confusing entropy with variance.** They measure different things.
* **Mixing bits and nats.**
* **Expecting entropy to depend on the labels** rather than the probabilities.

## Quick check

<details><summary>1. What is the entropy of a certain outcome (probability 1)?</summary>
0 bits.
</details>

<details><summary>2. What is the entropy of 8 equally likely outcomes?</summary>
3 bits.
</details>

<details><summary>3. Which has higher entropy, (0.5, 0.5) or (0.9, 0.1)?</summary>
(0.5, 0.5).
</details>

## Key terms

* **Entropy:** the average surprise of a distribution.
* **Bit:** a unit of information (log base 2).
* **Uniform distribution:** all outcomes equally likely, with maximum entropy.
* **Information gain:** the reduction in entropy after learning something.

## Related

[[Surprise and Information]] · [[Expectation]] · [[Joint and Conditional Entropy]] · [[Cross-Entropy]] · [[Mutual Information]]
