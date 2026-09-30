k-means gives each point to exactly one cluster. A **Gaussian mixture** is softer: it says the data came from several bell-curve groups and gives each point a *probability* of belonging to each. The **EM algorithm** fits it by alternating a soft assignment step (E) with a re-estimation step (M), and each round can only raise the likelihood of the data.

**You need:** [[k-Means Clustering]], [[Continuous Distributions]] and [[Maximum Likelihood]].

## The question it answers

"What if a point is between two groups?" k-means forces a choice; a mixture model admits uncertainty and also learns each group's spread and share, not just its centre.

## Intuition: soft k-means

Take the k-means loop but replace "nearest centre wins" with "each centre takes a share of every point in proportion to how well its bell curve explains it". Then move each centre to the *weighted* average of the points it owns, and update its spread and its weight. Points far from every bell share themselves out; points between two bells belong half to each.

## Definitions

```text
model        p(x) = Σₖ wₖ · Normal(x; μₖ, σₖ)         weights wₖ add up to 1
E step       responsibility  rᵢₖ = wₖ·N(xᵢ; μₖ, σₖ) / Σⱼ wⱼ·N(xᵢ; μⱼ, σⱼ)
M step       nₖ = Σᵢ rᵢₖ ;   wₖ = nₖ / n ;   μₖ = Σᵢ rᵢₖ xᵢ / nₖ ;   σₖ² = Σᵢ rᵢₖ (xᵢ − μₖ)² / nₖ
log-likelihood  Σᵢ log p(xᵢ)   never decreases from step to step
```

With one spread shared by all clusters and hard assignments, EM reduces to k-means. Like k-means, EM finds a *local* optimum and depends on its start. Because the model is a probability distribution it can also score new points (how likely is this?), which is useful for anomaly detection.

## A worked example

Eighty points: half from a bell centred at 1.5 (spread 0.7), half from one at 5 (spread 0.9). Start deliberately badly with both bells near the middle (means 2.5 and 3.5, spread 1.5 each, equal weights):

```text
step   log-likelihood    bell 1 (w, mean, spread)     bell 2 (w, mean, spread)
  0       −175.4         0.47   2.46   1.77            0.53   4.07   1.88
  2       −168.3         0.47   2.30   1.65            0.53   4.21   1.84
  5       −166.0         0.46   1.84   1.28            0.54   4.56   1.61
 10       −143.0         0.48   1.40   0.59            0.52   5.09   0.92
 24       −142.9         0.49   1.41   0.61            0.51   5.11   0.89
```

For the first few steps almost nothing happens, then the two bells suddenly pull apart and lock onto their groups, and the log-likelihood jumps by about 23. The final fit recovers the shares (0.49 / 0.51), the centres (1.41 and 5.11 against the true 1.5 and 5), and the spreads (0.61 and 0.89 against 0.7 and 0.9).

## Bench

```bench
id: gaussian-mixture-em
title: Two bells by EM
fallback: Eighty points from two hidden bell curves start with two poorly placed bells; step or play the EM algorithm and watch the bells separate while the log-likelihood rises and the weights, means and spreads update.
```

**Try this**

1. Press **One EM step** ten times and watch the numbers.
2. Play from the start and note when the sudden jump happens.
3. Compare the final means with the two group centres.
4. Reset and repeat.

**What you should notice:** the likelihood only rises, progress can be slow before it is fast, and the points are shaded by how strongly they belong to each bell.

## Where it appears in AI

* **Soft clustering and density estimation.**
* **Speech and image models** before deep learning (mixtures over features).
* **EM more generally:** hidden Markov models, missing-data problems and topic models.
* **Anomaly detection:** points with low mixture probability are unusual.

## Common pitfalls

* **Choosing too many components,** which fits noise (compare with BIC).
* **Collapsing components:** a bell shrinking onto a single point, giving an infinite likelihood; use a minimum spread.
* **Bad starts** giving poor local optima.
* **Assuming clusters really are Gaussian.**

## Quick check

<details><summary>1. What does the E step compute?</summary>
For each point, the probability that each bell produced it (its responsibilities).
</details>

<details><summary>2. How does a mixture differ from k-means?</summary>
It gives soft probabilities of membership and learns each group's spread and weight.
</details>

<details><summary>3. Can EM's log-likelihood decrease?</summary>
No, each step raises it or leaves it unchanged.
</details>

## Key terms

* **Mixture model:** a distribution formed as a weighted sum of simpler ones.
* **Responsibility:** the probability that a component produced a point.
* **EM algorithm:** alternating expectation and maximisation steps.
* **Log-likelihood:** the log of the probability the model gives the data.

## Related

[[k-Means Clustering]] · [[Maximum Likelihood]] · [[Continuous Distributions]] · [[Bayes Theorem]] · [[Anomaly Detection]]
