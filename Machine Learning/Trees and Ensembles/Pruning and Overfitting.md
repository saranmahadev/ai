Left alone, a tree keeps splitting until every leaf is pure, which means it memorises noise. **Pruning** limits or trims the tree so it captures the pattern and not the accidents: cap the depth, require a minimum number of points per leaf, or cut back branches that do not pay for themselves.

**You need:** [[Decision Trees]], [[Impurity and Splits]] and [[Overfitting in Statistics]].

## The question it answers

"How big should the tree be?" Too small and it misses real structure (underfitting); too big and it fits noise (overfitting). The right size is found on validation data, never on the training data.

## Intuition: a rule needs enough evidence

A leaf holding one point says "everything like this is class 1", based on a single example. A leaf holding thirty points has evidence behind it. Restricting leaf size, or stopping splits that barely help, demands that each rule be backed by enough data.

## Definitions

```text
max depth          stop splitting below this many levels
min leaf size      never create a leaf with fewer than m points
min gain           skip splits whose impurity drop is below a threshold
cost-complexity    grow big, then remove the branches that add least accuracy per leaf
```

The first three are **pre-pruning** (stop early); the last is **post-pruning** (grow, then cut). All are knobs (hyperparameters), tuned on validation data or by cross-validation ([[Cross-Validation]]).

## A worked example

On the bench's half-moon data (120 training points, 280 unseen), allow depth up to 10 and vary the minimum leaf size:

```text
min leaf    leaves    training    unseen
    1         12       100%        81%
    3         10        96%        86%
    5          8        93%        83%
   10          7        91%        84%
   20          5        89%        80%
```

With a leaf size of 1 the tree reaches 100% on the training data and 81% on new data. A modest minimum of 3 gives up four points of training accuracy and gains five on unseen data. At 20 the tree is too crude and unseen accuracy falls again. Differences of a few points are within noise for 280 test points, so the lesson is the shape (rise then fall), not the exact winner.

## Bench

```bench
id: pruning-overfitting
title: Depth, leaf size and overfitting
fallback: Two sliders set a tree's maximum depth and minimum leaf size on noisy data; a chart shows training and unseen accuracy against depth for the chosen leaf size, with the current depth marked.
```

**Try this**

1. With leaf size 1, raise the depth and watch the two curves separate.
2. Raise the minimum leaf size to 5 and to 20.
3. Find the depth and leaf size with the best unseen accuracy.
4. Note how the gap between the curves changes.

**What you should notice:** the training curve keeps rising while the unseen curve peaks and falls, and pruning narrows the gap at the cost of some training accuracy.

## Where it appears in AI

* **Every tree-based model** has these hyperparameters.
* **The same idea** is early stopping, dropout and weight decay in neural networks.
* **Model selection** in general: complexity is chosen on validation data.

## Common pitfalls

* **Choosing the size on training accuracy.**
* **Over-tuning on one validation set,** which then overfits it.
* **Judging on tiny test sets:** a few points of difference is noise.
* **Believing small trees are always better:** underfitting is also failure.

## Quick check

<details><summary>1. What does raising the minimum leaf size do to the tree?</summary>
It makes the tree smaller and smoother by forbidding leaves with few points.
</details>

<details><summary>2. Why does training accuracy always rise with depth?</summary>
More questions can fit the training points ever more closely, including noise.
</details>

<details><summary>3. Where should the best depth be chosen?</summary>
On validation data (or cross-validation), not on training data.
</details>

## Key terms

* **Pruning:** limiting or trimming a tree to prevent overfitting.
* **Pre-pruning:** stopping growth early with limits.
* **Post-pruning:** growing a large tree, then cutting branches.
* **Hyperparameter:** a setting chosen by the modeller, not learned from data.

## Related

[[Decision Trees]] · [[Impurity and Splits]] · [[Overfitting in Statistics]] · [[Train, Validation and Test Sets]] · [[Random Forests]]
