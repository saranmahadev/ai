When a system of equations has more equations than unknowns, it usually has no exact solution. **Least squares** finds the values that come *closest*, by minimising the total squared error. It is the foundation of linear regression.

**You need:** [[Solving Linear Systems]], [[Transpose, Identity and Inverse]] and [[Orthogonality and Projection]].

## The question it answers

"If I cannot hit every point exactly, what is the best compromise?" Real data is noisy, so no straight line passes through every point, but one line has the smallest overall error.

## Intuition: the closest reachable point

The equation `A x = b` asks whether `b` lies in the span of the columns of `A`. With noisy data it does not. Least squares picks `x` so that `A x` is the point in that span **closest** to `b`, which is the projection of `b` onto the span. The leftover error, `b − A x`, is perpendicular to the span.

That perpendicularity gives the **normal equations**:

```text
Aᵀ A x = Aᵀ b        →      x = (Aᵀ A)⁻¹ Aᵀ b
```

The quantity minimised is the sum of squared residuals: `‖A x − b‖² = Σ (predictionᵢ − targetᵢ)²`.

## A worked example

Fit a line `y = c + m x` to the points `(1, 1)`, `(2, 2)`, `(3, 2)`. Each row of `A` is `(1, x)` and `b` holds the `y` values:

```text
A = [1 1]      b = [1]
    [1 2]          [2]
    [1 3]          [2]

AᵀA = [3  6]      Aᵀb = [ 5]
      [6 14]            [11]

det(AᵀA) = 3·14 − 6·6 = 6
x = (1/6) [14 −6] [ 5]  = (1/6) (70 − 66, −30 + 33)  = (0.667, 0.5)
          [−6  3] [11]
```

The best line is `y = 0.667 + 0.5 x`. Predictions: `1.167, 1.667, 2.167`. Residuals: `−0.167, +0.333, −0.167` (they add to 0, as the perpendicularity requires). Sum of squared errors: `0.028 + 0.111 + 0.028 = 0.167`, and no other line does better.

## Bench

```bench
id: least-squares-fit
title: The line with the smallest squared error
fallback: Drag points on a plot; the bench draws the least-squares line, shows each squared error as a square, and lets you tilt the line away from the best one to watch the total error grow.
```

**Try this**

1. Drag a point far from the line. How does the best line respond?
2. Use the tilt slider to move away from the best slope. How does the total error change?
3. Add an outlier and watch its pull.
4. Check that the residuals add to about zero.

**What you should notice:** the best line minimises the total area of the error squares, and a single far-away point can pull it noticeably.

## Where it appears in AI

* **Linear regression** is least squares (see [[Linear Regression End to End]]).
* **Mean squared error** is the same quantity divided by the count.
* **Ridge regression** adds a penalty to the normal equations (see [[Regularization as a Constraint]]).
* **Numerical methods** solve least squares with decompositions rather than the normal equations, for stability (see [[Conditioning]]).

## Common pitfalls

* **Forgetting outliers have large influence** because errors are squared.
* **Inverting `AᵀA` when it is nearly singular.** Use a stable solver.
* **Confusing vertical and perpendicular error.** Ordinary least squares measures vertical gaps.
* **Extrapolating far outside the data.**

## Quick check

<details><summary>1. What does least squares minimise?</summary>
The sum of the squared differences between predictions and targets.
</details>

<details><summary>2. Why are the residuals orthogonal to the columns of A?</summary>
The best fit is the projection of b onto the columns' span.
</details>

<details><summary>3. Why does one outlier pull the line so much?</summary>
Squaring makes a large error count disproportionately.
</details>

## Key terms

* **Least squares:** choosing parameters that minimise the sum of squared errors.
* **Residual:** the difference between a target and its prediction.
* **Normal equations:** `AᵀA x = Aᵀb`.
* **Outlier:** a point far from the pattern.

## Related

[[Orthogonality and Projection]] · [[Solving Linear Systems]] · [[Loss Functions]] · [[Linear Regression End to End]] · [[Regularization as a Constraint]]
