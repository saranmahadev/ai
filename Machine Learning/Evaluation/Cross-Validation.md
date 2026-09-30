One train/validation split gives one score, and that score depends on which points happened to land where. **Cross-validation** rotates the split: divide the data into `k` folds, train on `k − 1` of them, validate on the remaining one, repeat until every fold has had a turn, and average. You get a steadier estimate, and a sense of how much it varies.

**You need:** [[Train, Validation and Test Sets]], [[Confidence Intervals]] and [[Estimation and Bias]].

## The question it answers

"How much can I trust this score?" With small data, a single validation set is a noisy judge: an easy or hard split can swing accuracy by many points.

## Intuition: everyone takes a turn as the exam

Split the class into five groups. Study with four groups' material, take the test on the fifth's; rotate so each group is the test once. Averaging the five scores is fairer than a single exam that might have been unusually easy, and the spread between scores shows how uncertain the average is.

## Definitions

```text
k-fold          split into k folds; each fold is the validation set once
score           mean of the k validation scores, with their standard deviation
stratified      keep the class proportions the same in every fold
leave-one-out   k = n: the extreme, expensive, high variance
nested          an inner loop to tune settings, an outer loop to estimate performance
```

Typical `k` is 5 or 10. Cost is `k` training runs. Cross-validation is for *choosing and estimating*; a final untouched test set still gives the last word. For time-ordered data use forward-chaining splits (train on the past, validate on the next block).

## A worked example

A 5-nearest-neighbour classifier on 60 noisy points, with the data shuffled three different ways (bench data):

```text
folds   shuffle 1   shuffle 2   shuffle 3    one fold's accuracy, worst to best
  2       85.0%       81.7%       86.7%         80% to 87%
  5       86.7%       83.3%       85.0%         75% to 92%
 10       85.0%       83.3%       85.0%         50% to 100%
```

The averages agree within about three points, but a *single* fold is far less reliable: with 10 folds each holds only 6 points, so one fold's accuracy ranges from 50% to 100%. A single split would have given any of those. The mean over folds pools all 60 predictions, which is why it is steadier. It is still an estimate: shuffles moved the 5-fold mean by three points, so differences of a point or two between models are noise.

## Bench

```bench
id: k-fold
title: Rotate the validation fold
fallback: A nearest-neighbour classifier on sixty points is scored by k-fold cross-validation; a slider sets the number of folds, a bar shows each fold's accuracy against the mean, and a button reshuffles the data.
```

**Try this**

1. Use 5 folds and note the mean and the spread.
2. Reshuffle several times and watch the mean move.
3. Raise the folds to 10 and look at the best and worst fold.
4. Drop to 2 folds and compare.

**What you should notice:** individual folds vary a lot, the mean is much steadier, and more folds mean smaller validation sets and wilder single-fold scores.

## Where it appears in AI

* **Model and hyperparameter selection** on small and medium datasets.
* **Competitions and research:** reported as mean ± standard deviation.
* **Stacking and ensembling** use out-of-fold predictions.

## Common pitfalls

* **Leakage between folds:** duplicates, or preprocessing fitted on all the data first.
* **Random folds on time series or grouped data** (patients, users), which leak.
* **Tuning on the CV score and then reporting it:** use nested CV or a held-out test set.
* **Comparing scores closer than their spread.**

## Quick check

<details><summary>1. In 5-fold cross-validation, how many models are trained?</summary>
Five.
</details>

<details><summary>2. Why is the average over folds more reliable than one split?</summary>
It uses every example for validation once, so it is less affected by an unlucky split.
</details>

<details><summary>3. Why must scaling be fitted inside each training fold?</summary>
Fitting it on all the data leaks information from the validation fold.
</details>

## Key terms

* **Fold:** one of the k parts of the data.
* **k-fold cross-validation:** rotating each fold as the validation set.
* **Stratified:** keeping class proportions equal in each fold.
* **Nested cross-validation:** tuning in an inner loop, estimating in an outer one.

## Related

[[Train, Validation and Test Sets]] · [[Confidence Intervals]] · [[Hyperparameter Tuning]] · [[Common Test Mistakes]] · [[Estimation and Bias]]
