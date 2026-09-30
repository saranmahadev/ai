A **loss function** turns "how wrong is the model?" into a single number: small when predictions are good, large when they are bad. Training is the search for the model parameters that make the average loss as small as possible.

**You need:** [[Functions]], [[Rounding, Absolute Value and Modulo]] and [[Norms and Distance]].

## The question it answers

"How do I score a prediction so that a computer can improve it?" The score must be a number, ideally smooth, so that calculus can say which way is better.

## Intuition: a penalty for each miss

For each example, compare the prediction `ŷ` with the truth `y` and compute a penalty. Average over the data set. Different penalties encode different opinions about what matters.

```text
squared error (MSE):   L = (1/n) Σ (ŷᵢ − yᵢ)²        large misses hurt a lot
absolute error (MAE):  L = (1/n) Σ |ŷᵢ − yᵢ|          every unit of miss counts equally
log loss (yes/no):     L = −[ y ln p + (1 − y) ln(1 − p) ]   punishes confident mistakes
```

Squaring makes the loss smooth and gives a unique best fit for lines (see [[Least Squares]]), but it lets one outlier dominate. Absolute error is more robust but has a corner at zero. **Huber loss** blends the two: squared for small misses, absolute for big ones.

## A worked example

Three predictions `ŷ = (2, 6, 10)` against truth `y = (3, 5, 8)`. The errors are `−1, +1, +2`.

```text
MSE  = (1 + 1 + 4) / 3   = 2.0        RMSE = √2 = 1.414
MAE  = (1 + 1 + 2) / 3   = 1.333
```

Now add one bad prediction with error 10: MSE becomes `(1 + 1 + 4 + 100) / 4 = 26.5` (it jumped more than tenfold), while MAE becomes `(1 + 1 + 2 + 10) / 4 = 3.5` (up only about 2.6 times).

Log loss for a true label `y = 1`:

```text
p = 0.9:  −ln 0.9 = 0.105       p = 0.5:  −ln 0.5 = 0.693       p = 0.1:  −ln 0.1 = 2.303
```

The more confident and wrong, the steeper the penalty: `p = 0.01` costs `4.6`. That pushes a classifier away from certain mistakes (see [[Cross-Entropy]]).

## Bench

```bench
id: loss-explorer
title: How different losses punish errors
fallback: A chosen loss (squared, absolute or Huber) is drawn against the size of the error; sliders set five example errors, and the bench shows the average loss for each choice so you can see how an outlier changes the picture.
```

**Try this**

1. Set all five errors small and compare the three averages.
2. Push one error to the maximum: which loss reacts most?
3. Look at the curve shapes near zero.
4. Find where Huber switches from squared to absolute behaviour.

**What you should notice:** squared loss reacts violently to one large error, while absolute and Huber losses stay calm.

## Where it appears in AI

* **Regression** uses squared or absolute error.
* **Classification** uses cross-entropy (log loss).
* **Robust training** uses Huber loss when data has outliers.
* **Custom objectives** encode what a project cares about (for example missing a disease costs more than a false alarm).

## Common pitfalls

* **Optimising the wrong loss.** The loss defines what "good" means.
* **Ignoring outliers** under squared error.
* **Confusing the loss with the evaluation metric.** They can differ.
* **Taking `ln 0`.** Predictions of exactly 0 or 1 break log loss (see [[Numerical Stability]]).

## Quick check

<details><summary>1. Errors (1, −3): MSE and MAE?</summary>
MSE = (1 + 9)/2 = 5; MAE = (1 + 3)/2 = 2.
</details>

<details><summary>2. Which loss is more sensitive to outliers, squared or absolute?</summary>
Squared.
</details>

<details><summary>3. What is log loss for y = 1 and p = 0.5?</summary>
−ln 0.5 ≈ 0.693.
</details>

## Key terms

* **Loss function:** a number measuring how wrong predictions are.
* **MSE / MAE:** mean squared / mean absolute error.
* **Log loss:** the negative log of the probability given to the truth.
* **Huber loss:** squared for small errors, absolute for large ones.

## Related

[[Norms and Distance]] · [[Least Squares]] · [[Cross-Entropy]] · [[Gradient Descent]] · [[Linear Regression End to End]]
