**Linear regression** fits a straight line `ŷ = m·x + b` to data by choosing the slope and intercept that minimise the mean squared error. You can get the answer in one step from a formula ([[Least Squares]]), or by walking downhill with gradient descent ([[Gradient Descent]]). Both reach the same line.

**You need:** [[Linear Functions]], [[Loss Functions]], [[Least Squares]] and [[Gradient Descent]].

## The question it answers

"Given examples of an input and a number to predict, what is the best straight-line rule?" It is the simplest model that learns from data, and everything larger builds on the same recipe: model, loss, gradient, update.

## The recipe

1. **Model:** `ŷ = m x + b`, with parameters `m` and `b`.
2. **Loss:** mean squared error, `L = (1/n) Σ (ŷᵢ − yᵢ)²`.
3. **Gradients:** by the chain rule,

```text
∂L/∂m = (2/n) Σ (ŷᵢ − yᵢ) · xᵢ
∂L/∂b = (2/n) Σ (ŷᵢ − yᵢ)
```

4. **Update:** `m ← m − η ∂L/∂m`, `b ← b − η ∂L/∂b`, repeat.

## A worked example

Data `(x, y)`: `(1, 2), (2, 3), (3, 5), (4, 4), (5, 6)`.

**Closed form.** Means `x̄ = 3`, `ȳ = 4`. `Σ (x − 3)(y − 4) = 4 + 1 + 0 + 0 + 4 = 9` and `Σ (x − 3)² = 10`.

```text
m = 9 / 10 = 0.9        b = 4 − 0.9 × 3 = 1.3        line: ŷ = 0.9 x + 1.3
predictions 2.2, 3.1, 4.0, 4.9, 5.8   residuals −0.2, −0.1, 1.0, −0.9, 0.2
SSE = 0.04 + 0.01 + 1 + 0.81 + 0.04 = 1.90        MSE = 0.38
R² = 1 − SSE / SST = 1 − 1.90 / 10 = 0.81           (SST = Σ (y − ȳ)² = 10)
```

**Gradient descent** from `m = 0, b = 0` with `η = 0.01`:

```text
start:   L = (4 + 9 + 25 + 16 + 36) / 5 = 18
gradients: ∂L/∂m = (2/5)(−69) = −27.6     ∂L/∂b = (2/5)(−20) = −8
step 1:  m = 0.276    b = 0.080     L = 10.72
step 2:  m = 0.486    b = 0.142     L = 6.48
step 3:  m = 0.647    b = 0.190     L = 4.00
...
step 1000: m ≈ 0.909  b ≈ 1.267    L ≈ 0.380   (the closed form gives 0.9, 1.3, 0.38)
```

The loss falls at every step and the parameters home in on the closed-form answer. **R²** (0.81 here) says the line explains 81% of the variation in `y`.

## Bench

```bench
id: regression-workshop
title: Fit a line by hand, by formula and by descent
fallback: Five draggable points and sliders for slope and intercept; the bench shows the line, the squared-error loss and R squared, a stepper that runs gradient descent with an adjustable learning rate, and the closed-form best line for comparison.
```

**Try this**

1. Fit the line by hand and note your loss.
2. Press "Closed-form best fit" and compare.
3. Reset and run gradient descent step by step.
4. Raise the learning rate until it becomes unstable.

**What you should notice:** descent walks toward the same line the formula gives, and a learning rate that is too large makes it overshoot.

## Where it appears in AI

* **Baselines:** a linear model is the first thing to try.
* **Neural networks** have linear layers at their core, trained by the same loop.
* **Feature engineering** turns curved problems into linear ones.

## Common pitfalls

* **Extrapolating beyond the data.**
* **Forgetting to scale features,** which slows descent (see [[Conditioning]]).
* **Reading a high R² as proof of a good model** (check on new data).
* **Ignoring outliers,** which squared error magnifies.

## Quick check

<details><summary>1. In the example, what is the prediction at x = 6?</summary>
0.9 × 6 + 1.3 = 6.7.
</details>

<details><summary>2. What does the gradient ∂L/∂b tell you?</summary>
How the loss changes as the intercept changes.
</details>

<details><summary>3. What is R² = 0.81?</summary>
The line explains 81% of the variation in y.
</details>

## Key terms

* **Linear regression:** fitting `ŷ = m x + b` to minimise squared error.
* **Residual:** the difference between the actual and predicted value.
* **R²:** the share of variation explained by the model.
* **Closed-form solution:** an exact formula for the best parameters.

## Related

[[Least Squares]] · [[Gradient Descent]] · [[Loss Functions]] · [[Logistic Regression and the Sigmoid]] · [[A Model Is a Function]]
