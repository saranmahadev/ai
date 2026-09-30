**Variance** measures how spread out a random variable is around its mean: the average squared distance from the mean. Its square root, the **standard deviation**, brings the spread back into the variable's own units. Two variables can have the same mean and very different spreads.

**You need:** [[Expectation]] and [[Norms and Distance]].

## The question it answers

"How much does this vary?" A model whose prediction is 10 plus or minus 1 is very different from one whose prediction is 10 plus or minus 8, though both average 10.

## Intuition: the typical distance from the mean

Measure how far each outcome is from the mean, square those distances (so signs do not cancel and big gaps count more), and average them.

```text
μ = E[X]
Var(X) = E[(X − μ)²] = E[X²] − μ²
σ (standard deviation) = √Var(X)
```

## Rules

```text
Var(a·X + b) = a² · Var(X)           shifting changes nothing; scaling by a scales σ by |a|
Var(X + Y)   = Var(X) + Var(Y)        when X and Y are independent
```

Doubling every value multiplies the standard deviation by 2 but the variance by 4.

## A worked example

A fair die: `μ = 3.5`.

```text
E[X²] = (1 + 4 + 9 + 16 + 25 + 36)/6 = 91/6 = 15.1667
Var(X) = 15.1667 − 3.5² = 15.1667 − 12.25 = 2.9167       σ = √2.9167 ≈ 1.708
```

Two independent dice: `Var = 2.9167 + 2.9167 = 5.833`, so `σ ≈ 2.415`. Note that the standard deviation grew only by `√2`, not by 2: independent variation partly cancels.

Compare two datasets with the same mean: `(9, 10, 11)` and `(0, 10, 20)`. Both average 10. Their variances are `(1 + 0 + 1)/3 = 0.667` and `(100 + 0 + 100)/3 = 66.7`. The second is 100 times as spread out in variance terms (10 times in standard deviation).

In data, the sample version divides by `n − 1` instead of `n` to correct for estimating the mean from the same data (see [[Describing Data]]).

## Bench

```bench
id: spread-band
title: Mean, spread and rescaling
fallback: A histogram of 40 values with the mean and one-standard-deviation band; sliders shift and stretch the values and the bench shows how the mean, variance and standard deviation respond.
```

**Try this**

1. Shift all the values and see that the spread does not change.
2. Stretch the values by 2. How do σ and the variance change?
3. Squash them to a small scale.
4. Compare the band width with the histogram.

**What you should notice:** shifting moves the mean but not the spread, while stretching multiplies the standard deviation by the factor and the variance by its square.

## Where it appears in AI

* **Normalisation:** `(x − μ)/σ` puts features on a common scale.
* **Uncertainty:** the spread of a prediction is its confidence.
* **Noise and error:** variance of errors is central in the bias-variance trade-off (see [[Bias, Variance and the Whole Picture]]).
* **Initialisation:** weights are drawn with a chosen variance.

## Common pitfalls

* **Reporting variance in squared units** without saying so.
* **Forgetting that `Var(aX) = a² Var(X)`.**
* **Adding standard deviations** instead of variances for independent sums.
* **Using `n` instead of `n − 1`** for a sample estimate.

## Quick check

<details><summary>1. Var(X) = 9. What is the standard deviation?</summary>
3.
</details>

<details><summary>2. If σ = 2, what is the standard deviation of 5X?</summary>
10.
</details>

<details><summary>3. Two independent variables have variances 4 and 5. What is the variance of their sum?</summary>
9.
</details>

## Key terms

* **Variance:** the mean squared distance from the mean.
* **Standard deviation:** the square root of the variance.
* **Spread:** how far values typically lie from the centre.
* **Normalisation (standardisation):** subtracting the mean and dividing by the standard deviation.

## Related

[[Expectation]] · [[Norms and Distance]] · [[Describing Data]] · [[Central Limit Theorem]] · [[Bias, Variance and the Whole Picture]]
