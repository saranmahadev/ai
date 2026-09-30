**Regularization** keeps a model from fitting noise by discouraging large weights: add a penalty such as `λ‖w‖²` to the loss. Equivalently, you can require the weights to stay inside a small region, and the *shape* of that region (round for L2, diamond for L1) decides whether the answer has small weights or exactly zero weights.

**You need:** [[Norms and Distance]], [[Constraints and Lagrange Multipliers]] and [[Loss Functions]].

## The question it answers

"How do I stop a flexible model from memorising the training data?" A model with huge weights can bend to hit every noisy point. Limiting the weights limits how wiggly it can get.

## Intuition: two views of the same idea

**Penalty view:** minimise `loss(w) + λ · size(w)`. A larger `λ` charges more for big weights.

**Constraint view:** minimise `loss(w)` but only over weights with `size(w) ≤ r`. A smaller `r` is a tighter leash.

The two are linked by a Lagrange multiplier ([[Constraints and Lagrange Multipliers]]): each penalty strength `λ` corresponds to some radius `r`.

```text
L2 (ridge):   size(w) = ‖w‖₂² = w₁² + w₂² + …      the allowed region is a ball (a circle)
L1 (lasso):   size(w) = ‖w‖₁  = |w₁| + |w₂| + …    the allowed region is a diamond
```

The best allowed point is where the loss contours first touch the region. The **circle** has no corners, so it touches anywhere and simply shrinks the weights. The **diamond** has corners on the axes, and contours tend to touch at a corner, where one weight is **exactly zero**: L1 gives sparse models that select features.

## A worked example

The unconstrained best weights are `(3, 1)` (loss `(w₁ − 3)² + (w₂ − 1)²`).

```text
L2 penalty λ = 0.5 (ridge):   w = (3, 1) / (1 + λ) = (2, 0.667)      both shrink
L2 constraint ‖w‖ ≤ 2:       w = 2 · (3, 1) / √10 = (1.897, 0.632)   loss 1.351
L1 constraint |w₁| + |w₂| ≤ 2: w = (2, 0)                            loss 2.0; w₂ is exactly 0
```

The last case lands on the corner of the diamond, zeroing the second weight. That is why L1 regularisation (lasso) performs feature selection, while L2 (ridge, "weight decay") just shrinks every weight a little.

The price of regularisation is a small increase in training loss (here 1.351 or 2.0 instead of 0); the hope is a larger drop in error on new data (see [[Overfitting in Statistics]]).

## Bench

```bench
id: penalty-circle
title: The leash on the weights
fallback: A contour map of a loss centred on the best unconstrained weights; choose an L1 diamond or an L2 circle, set its radius, and the bench marks the best allowed point, reports the weights and the loss, and shows when a weight becomes exactly zero.
```

**Try this**

1. Start with L2 and shrink the radius. How do both weights move?
2. Switch to L1 and shrink the radius. What happens to the second weight?
3. Move the unconstrained optimum and watch the solution follow.
4. Make the radius larger than the optimum: what changes?

**What you should notice:** L2 shrinks both weights smoothly, while L1 pushes one to exactly zero once the region is small enough.

## Where it appears in AI

* **Weight decay** (L2) is standard in training networks.
* **Lasso** (L1) selects features in linear models.
* **Dropout, early stopping and data augmentation** are related ways to limit complexity.
* **Bayesian view:** an L2 penalty corresponds to a Gaussian prior on the weights.

## Common pitfalls

* **Setting λ too large,** underfitting.
* **Penalising the bias term** without thought.
* **Forgetting to scale features,** since the penalty depends on weight size.
* **Assuming L1 and L2 solutions look alike.**

## Quick check

<details><summary>1. Which regularisation can give exactly zero weights?</summary>
L1.
</details>

<details><summary>2. Ridge with λ = 1 and unconstrained best weights (4, 2): what are the new weights?</summary>
(4, 2) / (1 + 1) = (2, 1).
</details>

<details><summary>3. What shape is the L1 constraint region in 2D?</summary>
A diamond.
</details>

## Key terms

* **Regularization:** limiting model complexity to reduce overfitting.
* **L2 / ridge / weight decay:** penalising squared weights.
* **L1 / lasso:** penalising absolute weights.
* **Sparse:** having many exactly-zero entries.

## Related

[[Norms and Distance]] · [[Constraints and Lagrange Multipliers]] · [[Loss Functions]] · [[Overfitting in Statistics]] · [[Bias, Variance and the Whole Picture]]
