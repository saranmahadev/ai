An **estimator** is a recipe for guessing an unknown quantity from data, such as using the sample mean to estimate the population mean. A good estimator is right on average (**unbiased**) and does not vary much from sample to sample (**low variance**). The two goals can pull against each other.

**You need:** [[Sampling and Bias]], [[Expectation]] and [[Variance and Standard Deviation]].

## The question it answers

"How do I turn data into a good guess, and how do I judge the guess?" A model's parameters are estimates, so the same questions apply to training.

## Intuition: repeated shots at a target

Imagine drawing many samples and computing the estimator on each. The results form a cloud. Its **centre** relative to the truth is the **bias**; its **spread** is the **variance**.

```text
bias(θ̂)     = E[θ̂] − θ            (θ = the true value, θ̂ = the estimate)
variance(θ̂) = spread of θ̂ across samples
```

* Unbiased and low variance: shots clustered on the bullseye.
* Biased but low variance: tight cluster, off target.
* Unbiased but high variance: scattered around the bullseye.

## The classic example: variance itself

For the variance of a population, two natural recipes:

```text
divide by n:      (1/n)   Σ (xᵢ − x̄)²      biased: on average too small
divide by n − 1:  (1/(n−1)) Σ (xᵢ − x̄)²    unbiased
```

The `n` version is too small because the sample mean `x̄` sits closer to the data than the true mean does, so deviations from it are a bit too small. On average the divide-by-`n` version equals `(n − 1)/n` times the truth.

## A worked example

Take samples of size `n = 5` from a population with variance `σ² = 4`.

```text
average of the divide-by-n estimates:   4 × (5 − 1)/5 = 3.2      (too low by 0.8)
average of the divide-by-(n−1) estimates: 4                     (right on average)
```

The unbiased estimator can be a little more spread out from sample to sample. A slightly biased estimator with less variance can have a smaller overall error, since the total mean squared error is `bias² + variance`. That trade-off returns in the [[Bias, Variance and the Whole Picture]].

The sample mean is unbiased for the population mean, with standard error `σ / √n`.

## Bench

```bench
id: estimator-shootout
title: Two ways to estimate a variance
fallback: Many small samples are drawn from a population with known variance; two estimators, dividing by n and by n minus 1, are computed on each and shown as histograms with their averages compared to the truth.
```

**Try this**

1. With small n (say 5), compare the two averages with the true variance.
2. Increase n and watch the gap between them shrink.
3. Compare the spreads of the two histograms.
4. Try n = 2.

**What you should notice:** dividing by n is too small on average, especially for small samples, while dividing by n − 1 is right on average.

## Where it appears in AI

* **Every learned parameter** is an estimate with bias and variance.
* **Batch normalisation** uses sample means and variances.
* **Regularisation** deliberately accepts a little bias for lower variance.
* **Evaluation:** a metric on a test set estimates true performance.

## Common pitfalls

* **Using the biased variance** for small samples.
* **Confusing unbiased with accurate.** A single estimate can still be far off.
* **Ignoring variance** when comparing estimators.
* **Judging an estimator from one sample.**

## Quick check

<details><summary>1. What is the bias of an estimator with E[θ̂] = θ?</summary>
Zero.
</details>

<details><summary>2. With n = 10, the divide-by-n variance estimate is on average what fraction of the truth?</summary>
9/10.
</details>

<details><summary>3. Total mean squared error equals what?</summary>
Bias squared plus variance.
</details>

## Key terms

* **Estimator:** a rule for estimating an unknown from data.
* **Bias:** the average error of an estimator.
* **Variance (of an estimator):** how much it varies between samples.
* **Unbiased:** having zero bias.

## Related

[[Sampling and Bias]] · [[Expectation]] · [[Maximum Likelihood]] · [[Confidence Intervals]] · [[Bias, Variance and the Whole Picture]]
