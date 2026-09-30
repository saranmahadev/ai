The **central limit theorem** says that the average (or sum) of many independent random values follows a bell curve, whatever shape the individual values have. Its spread shrinks as `σ / √n`. It explains why the normal distribution appears everywhere, and why we can attach error bars to averages.

**You need:** [[Law of Large Numbers]], [[Continuous Distributions]] and [[Variance and Standard Deviation]].

## The question it answers

"Why are so many quantities bell-shaped, and how far can I trust an average?" Heights, measurement errors and test scores are all sums of many small independent influences.

## Intuition: many small pushes add up to a bell

Each individual value may be lopsided: waiting times pile near zero, income has a long tail. But the *average* of, say, 30 of them is pulled toward the middle: extremes are rare because they require many values to be extreme in the same direction. Repeat the averaging many times and the collection of averages is bell-shaped.

```text
if X₁ … Xₙ are independent with mean μ and standard deviation σ, then
the sample mean X̄ₙ is approximately Normal( μ , (σ/√n)² )      for large n
```

The typical size of the error of a sample mean, `σ / √n`, is called the **standard error**.

## A worked example

A fair die has `μ = 3.5` and `σ = 1.708`. Average 30 rolls:

```text
standard error = 1.708 / √30 = 1.708 / 5.477 = 0.312
about 95% of such averages lie within  3.5 ± 1.96 × 0.312 = 3.5 ± 0.61   →  [2.89, 4.11]
```

Even though a single roll is uniform (flat), the average of 30 is bell-shaped around 3.5 with spread 0.31. Averaging 120 rolls halves the spread to 0.156.

This is how a poll works: for a yes/no question with true share `p = 0.5` and `n = 1,000` people, the standard error is `√(0.25/1000) = 0.0158`, so a poll result is typically within about ±3% of the truth (`1.96 × 0.0158 ≈ 0.031`).

## Bench

```bench
id: sample-means-bell
title: Averages turn into bell curves
fallback: Choose a source distribution (flat, skewed or two-humped) and a sample size; the bench draws thousands of sample means as a histogram with the matching normal curve and shows the mean and standard error.
```

**Try this**

1. With sample size 1, look at the source shape.
2. Raise the sample size to 5, 10, 30 and watch the histogram.
3. Try the skewed source and see how many samples it takes to look bell-shaped.
4. Compare the histogram's spread with σ divided by the square root of n.

**What you should notice:** the histogram of averages becomes a bell centred on the true mean, and it narrows as n grows.

## Where it appears in AI

* **Confidence intervals** and error bars on model accuracy rely on it.
* **Hypothesis tests and A/B tests** use normal approximations to averages.
* **Weight initialisation and noise models** often assume normality.
* **Mini-batch gradient noise** is roughly normal.

## Common pitfalls

* **Applying it to a tiny sample** of a very skewed variable.
* **Forgetting independence.**
* **Confusing the spread of the data with the spread of the mean** (σ versus σ/√n).
* **Assuming individual values become normal.** Only their averages do.

## Quick check

<details><summary>1. What is the standard error of a mean of 100 values with σ = 20?</summary>
20 / 10 = 2.
</details>

<details><summary>2. Does the CLT say individual values are bell-shaped?</summary>
No, the averages are.
</details>

<details><summary>3. About what share of sample means lie within 2 standard errors of the true mean?</summary>
About 95%.
</details>

## Key terms

* **Central limit theorem:** sample means become normal as n grows.
* **Standard error:** `σ / √n`, the spread of a sample mean.
* **Sampling distribution:** the distribution of a statistic over repeated samples.
* **Normal approximation:** using the bell curve as a stand-in.

## Related

[[Law of Large Numbers]] · [[Continuous Distributions]] · [[Variance and Standard Deviation]] · [[Confidence Intervals]] · [[Hypothesis Testing and P-values]]
