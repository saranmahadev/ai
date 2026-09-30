When there are many features and little data, a linear model can fit noise with huge, contradictory weights. **Regularisation** adds a penalty on the weights so the model prefers small ones. **Ridge** penalises the sum of squared weights and shrinks everything smoothly; **lasso** penalises the sum of absolute weights and pushes some weights exactly to zero, selecting features.

**You need:** [[Logistic Regression as a Classifier]], [[Regularization as a Constraint]] and [[The Curse of Dimensionality]].

## The question it answers

"How do I stop a flexible model from chasing noise?" By making large weights expensive, you accept a little more error on the training data in exchange for a steadier model on new data.

## Intuition: a budget on the weights

Without a penalty, the model may give one feature a huge positive weight and a correlated feature a huge negative one, cancelling on the training data but exploding on new data. A penalty is a budget: every unit of weight costs something, so weights are spent only where they clearly reduce error.

## Definitions

```text
ridge   minimise  Σ (ŷ − y)² + λ · Σ wⱼ²       shrinks all weights, rarely to exactly 0
lasso   minimise  Σ (ŷ − y)² + λ · Σ |wⱼ|      sets some weights exactly to 0
λ       the penalty strength: 0 = no penalty, large = weights forced toward 0
```

Standardise features first ([[Scaling and Normalisation]]) so the penalty treats them fairly, and do not penalise the intercept. Choose `λ` on validation data. The geometric picture: the constraint region is a circle for ridge and a diamond for lasso, and the diamond's corners lie on the axes, where a weight is zero.

## A worked example

One feature, no intercept, points `x = (1, 2, 3)`, `y = (2, 4, 6)`. The unpenalised weight is `Σxy / Σx² = 28 / 14 = 2`.

```text
ridge:  w = Σxy / (Σx² + λ)
        λ = 0 → 2.00     λ = 7 → 28/21 = 1.33     λ = 14 → 28/28 = 1.00
lasso:  w = max(Σxy − λ, 0) / Σx²      (for this one-feature case)
        λ = 0 → 2.00     λ = 14 → 14/14 = 1.00    λ = 28 → 0
```

Ridge shrinks the weight smoothly and never reaches zero; lasso subtracts a fixed amount and hits exactly zero once the penalty exceeds the evidence. With eight features (three real, five pure noise) and 24 training points, the bench's error on 400 new points is:

```text
no penalty:           error 2.82, 8 features used
ridge, strength 0.3:  error 2.76, 8 features used (all weights shrunk)
lasso, strength 0.3:  error 2.70, 6 features used
lasso, strength 0.6:  error 2.94, 3 features used
```

A little penalty helps; too much removes real signal and the error climbs.

## Bench

```bench
id: ridge-lasso-path
title: Coefficient paths, ridge and lasso
fallback: Eight features, three of which matter, are fitted with a ridge or lasso penalty; coefficient paths show each weight as the penalty grows, and readouts give the number of features kept and the error on new data.
```

**Try this**

1. With ridge, slide the penalty up and watch every weight shrink together.
2. Switch to lasso and watch weights drop to zero one at a time.
3. Find the penalty that gives the lowest error on new data.
4. Push the penalty too high and see the error rise.

**What you should notice:** ridge shrinks without deleting, lasso deletes, and the best penalty sits between "no penalty" and "too much".

## Where it appears in AI

* **Weight decay** in neural networks is the ridge penalty.
* **Lasso** is used for feature selection on wide tabular data.
* **Elastic net** blends both.

## Common pitfalls

* **Forgetting to scale features,** so the penalty punishes some more than others.
* **Choosing λ on the training data,** which always prefers zero.
* **Expecting lasso to pick the "true" features** when features are strongly correlated.
* **Penalising the intercept.**

## Quick check

<details><summary>1. Which penalty can set weights exactly to zero?</summary>
Lasso (the sum of absolute values).
</details>

<details><summary>2. What does λ = 0 give?</summary>
Ordinary unpenalised regression.
</details>

<details><summary>3. Where should λ be chosen?</summary>
On validation data (or by cross-validation).
</details>

## Key terms

* **Regularisation:** a penalty that discourages large weights.
* **Ridge (L2):** penalty on the sum of squared weights.
* **Lasso (L1):** penalty on the sum of absolute weights.
* **Weight decay:** the neural-network name for an L2 penalty.

## Related

[[Regularization as a Constraint]] · [[Norms and Distance]] · [[Overfitting in Statistics]] · [[Scaling and Normalisation]] · [[Support Vector Machines]]
