**Covariance** measures whether two variables tend to be above or below their means *together*. **Correlation** rescales it to a number between −1 and 1 that does not depend on units: +1 is a perfect rising line, −1 a perfect falling line, and 0 means no *linear* relationship.

**You need:** [[Describing Data]], [[Variance and Standard Deviation]] and [[Dot Product]].

## The question it answers

"Do these two quantities rise and fall together, and how strongly?" Feature selection, portfolio design and PCA all start from this question.

## Intuition: do the deviations agree in sign?

For each pair `(x, y)`, look at how far each is from its own mean. If both are usually above or both below, the products of the deviations are mostly positive: positive covariance. If one is up when the other is down, negative.

```text
cov(X, Y) = Σ (xᵢ − x̄)(yᵢ − ȳ) / (n − 1)
r         = cov(X, Y) / (sₓ · s_y)              always between −1 and 1
```

Covariance has awkward units (units of X times units of Y), so it is hard to compare. Dividing by both standard deviations gives the unit-free correlation `r`. (Notice the resemblance to [[Cosine Similarity]]: `r` is the cosine of the angle between the centred data vectors.)

## A worked example

```text
x = (1, 2, 3, 4, 5)      ȳ = 4, x̄ = 3      y = (2, 4, 5, 4, 5)
deviations x: −2 −1  0  1  2        deviations y: −2  0  1  0  1
products:      4   0  0  0  2        sum = 6
cov = 6 / 4 = 1.5
var x = 10 / 4 = 2.5       var y = 6 / 4 = 1.5
r = 1.5 / √(2.5 × 1.5) = 1.5 / 1.936 = 0.775
```

The covariance matrix collects them: `[[2.5, 1.5], [1.5, 1.5]]`. That symmetric matrix is the input to PCA (see [[SVD and PCA]]).

**Limits of `r`:** it measures only *linear* association. A perfect U-shaped relation (like `y = x²` on symmetric data) can have `r = 0`. One outlier can swing it, and it says nothing about causation (see [[Correlation vs Causation]]).

## Bench

```bench
id: correlation-slider
title: What does r look like?
fallback: Choose a data pattern (rising line, falling line, U-shaped curve, two clusters) or set a target correlation; the scatter plot and the correlation coefficient update, and an outlier control shows how one point changes r.
```

**Try this**

1. Set r to +0.9, 0, then −0.9 and see the cloud change.
2. Choose the U-shaped pattern and read r.
3. Add an outlier to a tight cloud.
4. Find two very different plots with the same r.

**What you should notice:** r captures only straight-line association, a curved pattern can give zero, and one outlier can change it a lot.

## Where it appears in AI

* **Feature selection:** drop redundant, highly correlated features.
* **PCA and covariance matrices** in dimensionality reduction (see [[SVD and PCA]]).
* **Model diagnostics:** correlation between predictions and truth.
* **Gaussian models** are defined by means and covariances.

## Common pitfalls

* **Reading r = 0 as "unrelated".**
* **Trusting r from a few points or with outliers.**
* **Comparing raw covariances** across differently scaled variables.
* **Assuming a high r implies causation.**

## Quick check

<details><summary>1. Can correlation be 1.5?</summary>
No: it always lies between −1 and 1.
</details>

<details><summary>2. If y = −2x exactly, what is r?</summary>
−1.
</details>

<details><summary>3. Why divide covariance by both standard deviations?</summary>
To remove units and get a value between −1 and 1.
</details>

## Key terms

* **Covariance:** the average product of the two variables' deviations.
* **Correlation coefficient (r):** covariance scaled to −1 to 1.
* **Covariance matrix:** a table of all pairwise covariances.
* **Linear association:** a straight-line relationship.

## Related

[[Variance and Standard Deviation]] · [[Cosine Similarity]] · [[Correlation vs Causation]] · [[Joint and Marginal Distributions]] · [[SVD and PCA]]
