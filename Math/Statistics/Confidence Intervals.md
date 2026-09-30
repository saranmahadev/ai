A **confidence interval** is a range built from a sample that expresses how uncertain an estimate is: "the average is 52, give or take about 2". A 95% interval is produced by a procedure that, over many repeated samples, captures the true value about 95% of the time.

**You need:** [[Central Limit Theorem]], [[Estimation and Bias]] and [[Continuous Distributions]].

## The question it answers

"How precise is this estimate?" A model that scores 91% on 100 test examples is not the same as one scoring 91% on 100,000: the interval makes the difference visible.

## Intuition: the sample mean has a bell around the truth

By the central limit theorem, a sample mean `x̄` is roughly normal around the true mean `μ`, with standard error `σ / √n`. About 95% of the time `x̄` lands within `1.96` standard errors of `μ`. Turn that around: `μ` is within `1.96` standard errors of `x̄` about 95% of the time.

```text
95% confidence interval for a mean:   x̄ ± 1.96 · (s / √n)
90%: multiplier 1.645          99%: multiplier 2.576
```

(For small samples the multiplier comes from the t-distribution and is a bit larger.)

## How to read it

A 95% interval does **not** mean "there is a 95% chance the truth is in this particular interval". The truth is fixed; the *procedure* captures it in 95% of repeated experiments. A wider interval comes from a smaller sample, more variable data, or a higher confidence level.

## A worked example

A sample of `n = 100` has mean `52` and standard deviation `10`.

```text
standard error = 10 / √100 = 1
95% interval   = 52 ± 1.96 × 1 = [50.04, 53.96]
```

Quadruple the data (`n = 400`): the standard error halves to `0.5` and the interval to `52 ± 0.98`. For a classifier that gets 91 of 100 right, the standard error of the accuracy is `√(0.91 × 0.09 / 100) = 0.0286`, so the 95% interval is about `0.91 ± 0.056`, roughly 85% to 97%: wide enough that two models scoring 91% and 93% are not clearly different.

## Bench

```bench
id: ci-capture
title: Do 95% of intervals capture the truth?
fallback: The bench draws 100 confidence intervals from repeated samples of a population with a known mean; sliders set the sample size and the confidence level, and intervals that miss the true value are marked, with the observed coverage shown.
```

**Try this**

1. At 95%, count the intervals that miss the truth.
2. Raise the confidence to 99%: what happens to widths and misses?
3. Increase the sample size and watch the widths shrink.
4. Draw a new set of 100 and see the coverage vary.

**What you should notice:** roughly the stated fraction of intervals capture the truth, more confidence means wider intervals, and more data means narrower ones.

## Where it appears in AI

* **Error bars on accuracy** and other evaluation metrics.
* **A/B tests:** the interval for the difference between two versions.
* **Uncertainty in predictions** (prediction intervals) and in learned parameters.

## Common pitfalls

* **Misreading 95% as the probability that the truth is in this interval.**
* **Overlapping intervals** do not by themselves prove two things are the same.
* **Ignoring the assumptions** (independent, roughly bell-shaped means).
* **Forgetting that small samples need wider intervals.**

## Quick check

<details><summary>1. Mean 20, standard deviation 5, n = 25. What is the 95% interval?</summary>
SE = 1, so 20 ± 1.96: [18.04, 21.96].
</details>

<details><summary>2. What happens to the interval width if n quadruples?</summary>
It halves.
</details>

<details><summary>3. Which is wider, a 90% or 99% interval?</summary>
99%.
</details>

## Key terms

* **Confidence interval:** a range from a procedure that captures the truth a stated share of the time.
* **Confidence level:** that share, such as 95%.
* **Standard error:** the standard deviation of an estimate.
* **Margin of error:** half the width of the interval.

## Related

[[Central Limit Theorem]] · [[Estimation and Bias]] · [[Hypothesis Testing and P-values]] · [[Measuring Performance]]
