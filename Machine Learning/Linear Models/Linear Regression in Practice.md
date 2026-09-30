**Linear regression** predicts a number as a weighted sum of features plus a constant, with the weights chosen to minimise squared error. It is the simplest learning model, the baseline every other model is compared with, and the building block of neural networks. Using it well means reading its residuals and knowing what one outlier can do.

**You need:** [[Least Squares]], [[Feature Engineering]] and [[The Learning Loop]].

## The question it answers

"How does an output depend on my inputs, and how much?" The fitted weights answer directly: one extra square metre adds this many thousand to the price, holding the other features fixed.

## Intuition: the best straight line through a cloud

Each point misses the line by a vertical gap called a **residual**. Squaring the gaps and adding them up gives the loss; the best line makes that total as small as possible. Squaring punishes big misses more than small ones, which is why a single far-away point can drag the whole line toward itself.

## Definitions

```text
model      ŷ = b + w₁x₁ + w₂x₂ + … + w_d x_d            (in vectors: ŷ = b + w · x)
loss       MSE = (1/n) Σ (ŷᵢ − yᵢ)²
one feature:   w = Σ (x − x̄)(y − ȳ) / Σ (x − x̄)²     b = ȳ − w·x̄
R²         = 1 − (sum of squared residuals) / (total variation in y)     1 = perfect, 0 = no better than the mean
```

With many features the same answer comes from the normal equations (see [[Least Squares]]) or from gradient descent. Residuals should look like shapeless noise; curves or funnels in a residual plot mean the model is missing something.

## A worked example

Ten points that roughly follow `y ≈ x + 0.7`, from the bench:

```text
fit:  slope 0.996   intercept 0.693   RMSE 0.14   R² = 0.993
```

Now add one stray point at `(5.6, 1.2)`, far below the trend:

```text
fit:  slope 0.689   intercept 1.310   RMSE 1.36   R² = 0.446
```

One point out of eleven moved the slope from about 1.0 to 0.69, and R² fell from 0.99 to 0.45. Squared error lets a single large residual dominate. The remedies are to look at the data, remove a clearly erroneous point, or use a loss that is less sensitive to outliers.

## Bench

```bench
id: regression-diagnostics
title: Fit a line, read the residuals
fallback: Ten draggable points with the least-squares line, residual bars, slope, intercept, RMSE and R²; a button adds an outlier and another resets.
```

**Try this**

1. Drag one point far from the line and watch the slope.
2. Press **Add an outlier** and compare R² before and after.
3. Drag points into a curve and see the residuals.
4. Reset and make all the points lie almost exactly on a line.

**What you should notice:** R² measures fit to the line, not truth; a single outlier can wreck it, and a curved cloud leaves residuals with a pattern the line cannot remove.

## Where it appears in AI

* **Baselines:** always try linear regression before anything fancier.
* **Interpretation:** the weights show each feature's effect (with care).
* **Inside networks:** every layer starts as a linear map (see [[A Forward Pass by Hand]]).

## Common pitfalls

* **Extrapolating** far outside the data.
* **Correlated features,** which make individual weights unstable.
* **Outliers,** which pull the line.
* **Reading correlation as causation** (see [[Correlation vs Causation]]).

## Quick check

<details><summary>1. What is a residual?</summary>
The difference between an actual value and the model's prediction for it.
</details>

<details><summary>2. Why can one outlier move the line so much?</summary>
Squaring makes big errors count disproportionately, so the fit bends toward them.
</details>

<details><summary>3. What does R² = 0 mean?</summary>
The model predicts no better than always guessing the average.
</details>

## Key terms

* **Residual:** actual minus predicted value.
* **MSE / RMSE:** mean squared error and its square root.
* **R²:** the share of variation in y the model explains.
* **Baseline:** a simple model other models must beat.

## Related

[[Least Squares]] · [[Linear Regression End to End]] · [[Loss Functions]] · [[Logistic Regression as a Classifier]] · [[Ridge and Lasso]]
