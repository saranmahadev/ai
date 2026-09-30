The **expectation** (or mean) of a random variable is its long-run average: each value weighted by its probability. It is the balance point of the distribution, and it turns a whole uncertain outcome into one representative number.

**You need:** [[Random Variables]] and [[Sums and Products]].

## The question it answers

"If I repeat this many times, what do I get on average?" A casino, an insurer and a model trainer all care about averages over many repetitions.

## Intuition: a balance point

Put weights on a ruler at each possible value, with weight equal to its probability. The point where the ruler balances is the expectation.

```text
E[X] = Σ x · P(X = x)
```

A fair die: `E[X] = (1 + 2 + 3 + 4 + 5 + 6)/6 = 3.5`. You can never roll a 3.5, but over many rolls the average approaches it.

## Rules

Expectation is **linear**, which makes it easy to work with:

```text
E[a·X + b] = a·E[X] + b
E[X + Y]   = E[X] + E[Y]          (always, even if X and Y are dependent)
```

For a function of `X`: `E[g(X)] = Σ g(x) · P(X = x)`.

## A worked example

A game pays 10 dollars with probability 0.1 and costs 1 dollar otherwise. The expected gain per play:

```text
E = 0.1 × 10 + 0.9 × (−1) = 1 − 0.9 = +0.10 dollars
```

Average of many plays approaches +0.10. Two dice: `E[X₁ + X₂] = 3.5 + 3.5 = 7` (which is also the middle of the distribution in [[Random Variables]]).

For a mean-squared-error loss, the quantity being minimised is the expectation of the squared error over the data distribution. A good prediction that minimises squared error is the conditional expectation: the **mean**.

## Bench

```bench
id: balance-point
title: Where does the distribution balance?
fallback: Sliders set the weights of five values on a ruler; the bench shows the probabilities and the balance point, the expectation, and compares it with the most likely value.
```

**Try this**

1. Start with equal weights and find the balance point.
2. Move weight to the right end and watch the balance point follow.
3. Make one value very likely and compare with the mean.
4. Try a two-humped setting: the balance point can lie where nothing happens.

**What you should notice:** the expectation is the weighted average, and it can differ from the most likely value or even fall on a value that never occurs.

## Where it appears in AI

* **Loss functions** are expectations of a per-example loss.
* **Reinforcement learning** maximises expected reward.
* **Predictions:** the mean minimises squared error.
* **Monte Carlo** estimates expectations by averaging samples.

## Common pitfalls

* **Treating the mean as the most likely value.**
* **Forgetting to weight by probability.**
* **Assuming `E[X²] = (E[X])²`.** They differ by the variance.
* **Ignoring heavy tails,** where the mean is dominated by rare huge values.

## Quick check

<details><summary>1. What is E[X] for X = 0 or 10, each with probability 0.5?</summary>
5.
</details>

<details><summary>2. If E[X] = 4, what is E[3X + 2]?</summary>
14.
</details>

<details><summary>3. What is the expected value of one roll of a fair die?</summary>
3.5.
</details>

## Key terms

* **Expectation (mean):** the probability-weighted average.
* **Linearity of expectation:** `E[aX + bY] = aE[X] + bE[Y]`.
* **Expected value:** another name for the expectation.
* **Monte Carlo:** estimating an expectation by averaging samples.

## Related

[[Random Variables]] · [[Sums and Products]] · [[Variance and Standard Deviation]] · [[Law of Large Numbers]] · [[Loss Functions]]
