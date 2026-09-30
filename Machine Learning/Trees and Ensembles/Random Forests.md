A single tree is unstable: change a few training points and its questions change. A **random forest** trains many trees on slightly different versions of the data and lets them vote. Individual trees make different mistakes, and votes cancel much of the noise, so the forest is steadier and more accurate than any one tree.

**You need:** [[Pruning and Overfitting]], [[Law of Large Numbers]] and [[Variance and Standard Deviation]].

## The question it answers

"How do I get a strong model from weak, unstable ones?" Average many that are individually noisy but not identically wrong.

## Intuition: the wisdom of a crowd

Ask one person to guess the weight of an ox and they may be far off. Average a hundred independent guesses and the errors largely cancel. That works only if the guessers are different from each other. A forest makes trees different in two ways:

* **Bootstrap sampling ("bagging"):** each tree trains on a sample of the data drawn with replacement, so it sees about 63% of the distinct examples, some repeated.
* **Random feature choice:** at each split a tree may consider only a random subset of the features, so trees do not all copy the same strong feature.

## Definitions

```text
forest prediction     classification: the majority vote (or the average probability)
                      regression:     the average
bagging               bootstrap aggregating: train on resamples, average the results
out-of-bag error      each example is tested only by the trees that did not train on it,
                      a free validation estimate
```

If each of `T` roughly independent trees has variance `σ²`, their average has variance `σ²/T`. Real trees are correlated, so the reduction is smaller, but it is large. Forests reduce **variance**, not bias: the trees can be deep and overfit individually.

## A worked example

On the half-moon data (120 training points, 280 unseen), full-depth trees (up to depth 10):

```text
one tree grown to the end:         training 100%   unseen 81%
forest of 1 (bootstrap + random feature): training  93%   unseen 77%
forest of 5 trees:                 training  99%   unseen 84%
forest of 25 trees:                training 100%   unseen 86%
forest of 100 trees:               training 100%   unseen 87%
```

A single randomised tree is worse than a careful one, but averaging just five already beats it, and returns diminish after a few dozen trees. Adding more trees never overfits by itself: it only smooths the vote. Note the 100% training accuracy: it comes from each point being memorised by many trees; only unseen accuracy matters.

## Bench

```bench
id: random-forest
title: A forest votes
fallback: A slider sets the number of trees in a random forest on noisy half-moon data; the bench shows the smooth probability regions and the forest's training and unseen accuracy next to a single fully grown tree.
```

**Try this**

1. Set one tree and look at the jagged regions.
2. Increase to 5, 25 and 100 trees.
3. Compare the unseen accuracy with the single full tree.
4. Watch how the region edges soften as trees are added.

**What you should notice:** the boundary smooths out as trees are added, unseen accuracy rises above one tree's, and the last trees add little.

## Where it appears in AI

* **Tabular prediction:** a strong default that needs little tuning.
* **Feature importance:** how much each feature improves splits across the forest.
* **Out-of-bag estimates** for quick validation.

## Common pitfalls

* **Correlated trees:** if one feature dominates and every tree uses it, averaging helps less.
* **Interpretability lost:** a hundred trees are not a short rule list.
* **Slow predictions and large models** with thousands of deep trees.
* **Extrapolation:** trees cannot predict beyond the range of training targets.

## Quick check

<details><summary>1. What is bagging?</summary>
Training each model on a bootstrap resample of the data and averaging their predictions.
</details>

<details><summary>2. Why choose random subsets of features at each split?</summary>
To make the trees different from each other so their errors cancel.
</details>

<details><summary>3. Does adding more trees cause overfitting?</summary>
No, extra trees only smooth the average; the gain simply levels off.
</details>

## Key terms

* **Ensemble:** a group of models whose predictions are combined.
* **Bootstrap sample:** a sample drawn with replacement.
* **Bagging:** averaging models trained on bootstrap samples.
* **Out-of-bag error:** error measured on the examples each tree did not see.

## Related

[[Decision Trees]] · [[Pruning and Overfitting]] · [[Law of Large Numbers]] · [[Gradient Boosting]] · [[Bias, Variance and the Whole Picture]]
