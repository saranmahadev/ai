**Feature engineering** means creating better inputs from the raw columns: ratios, squares, counts, differences, dates unpacked into weekday and month. A simple model with well-chosen features often beats a complex one on raw data, because it lets a straight line do a curved problem's work.

**You need:** [[Encoding Categories]] and [[Functions AI Loves]].

## The question it answers

"The model can't find the pattern. Can I make the pattern easier to see?" Often the answer is to hand the model a quantity that turns a hard boundary into an easy one.

## Intuition: change the coordinates

Imagine a target with a bullseye class in the middle and a ring class around it. No straight line separates them in the `(x, y)` plane. But look at a new feature: the squared distance from the centre, `r² = x² + y²`. Now the bullseye points all have small `r²` and the ring points large `r²`, and a single cut-off separates them perfectly. The problem did not change; the way it is described did.

## Definitions

```text
interaction     x·y                 effect of one feature depends on another
polynomial      x², x³              curves from a linear model
ratio           debt / income       often more meaningful than either alone
date parts      weekday, month, hour, "days since signup"
aggregate       a user's average purchase in the last 30 days
```

Good features encode domain knowledge. Deep networks learn features automatically from raw data, but for tabular problems handmade features remain powerful.

## A worked example

Two points from the ring problem: inner class at `(0.4, 0)`, outer class at `(1.1, 0)`.

```text
r² of the inner point = 0.4² + 0² = 0.16
r² of the outer point = 1.1² + 0² = 1.21        →  cut at r² ≈ 0.7 separates them
```

On 100 training points the bench's logistic regression reaches:

```text
features x, y          60% on training points,  47% on held-out points   (no better than guessing)
features x, y, r²     100% on training points, 100% on held-out points
```

One extra column moved a linear classifier from useless to perfect. The held-out score confirms the gain is real, not memorisation.

## Bench

```bench
id: feature-lab
title: Feature lab
fallback: Two classes form a core and a ring; tick which features a logistic regression may use, including squares and the squared distance from the centre, and see the learned regions and the training and held-out accuracy.
```

**Try this**

1. With only x and y, read the accuracy.
2. Tick x² and y² and watch the regions change.
3. Untick everything except x² + y².
4. Try adding x·y and see whether it helps.

**What you should notice:** a straight boundary in the new feature space is a curved boundary in the original one, and the right single feature does the job of many.

## Where it appears in AI

* **Tabular competitions and industry models** are often won on features.
* **Kernel methods** (see [[Kernel Methods]]) and **neural networks** build such features implicitly.
* **Time series:** lags, rolling averages and calendar effects.

## Common pitfalls

* **Leaky features,** computed using future information.
* **Feature explosion:** too many features for too little data invites overfitting.
* **Features that cannot be computed at prediction time.**
* **Unscaled new features** (squares get large; see [[Scaling and Normalisation]]).

## Quick check

<details><summary>1. What feature separates a bullseye class from a surrounding ring?</summary>
The squared distance from the centre, x² + y².
</details>

<details><summary>2. Why is a ratio such as debt ÷ income useful?</summary>
It captures a relationship that neither number shows alone.
</details>

<details><summary>3. How do you check a new feature is really helping?</summary>
Compare validation or held-out performance with and without it.
</details>

## Key terms

* **Feature engineering:** creating informative inputs from raw data.
* **Interaction feature:** a product of two features.
* **Polynomial feature:** a power of a feature.
* **Feature space:** the space of all feature values.

## Related

[[Encoding Categories]] · [[Linear Regression in Practice]] · [[Logistic Regression as a Classifier]] · [[Kernel Methods]] · [[The Curse of Dimensionality]]
