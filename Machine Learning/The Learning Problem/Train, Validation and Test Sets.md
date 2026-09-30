To know whether a model works you must measure it on data it has not learned from. So the data is split three ways: a **training set** to fit parameters, a **validation set** to choose between models and settings, and a **test set**, locked away until the end, for one honest final score.

**You need:** [[What Is Machine Learning]], [[Generalization]] and [[Overfitting in Statistics]].

## The question it answers

"How well will this model do on data it has never seen?" Error on the training data flatters the model: a model can memorise its examples. Only fresh data shows whether it learned something general.

## Intuition: practice exam, mock exam, real exam

* **Training set** = the practice questions you study from.
* **Validation set** = a mock exam you use to decide how to study (which model, how complex).
* **Test set** = the real exam, taken once. If you peek at the real exam to adjust your studying, the score no longer means anything.

## Definitions

```text
typical split          60% train / 20% validation / 20% test   (or 80 / 10 / 10 for big data)
train error            error on data used to fit
validation error       error on data used to pick settings
test error             error on data used once, at the end
k-fold cross-validation  split into k parts; train on k−1, validate on the 1 left out; rotate; average
```

Random splits are usual, but if the future differs from the past (forecasting), split by time: train on earlier data, test on later.

## A worked example

Fit polynomials of increasing degree to 30 noisy points, choosing the degree using 15 validation points. Errors (root mean squared) from the bench's data:

```text
degree    train    validation
   1       1.23       1.03
   3       0.70       0.72      ← chosen: best validation, simple
   6       0.64       0.70
  10       0.61       1.34
```

Training error keeps falling with degree, so it cannot pick the winner. Validation error falls, then rises as the curve chases noise (degree 10). Pick degree 3 and only then look at 15 test points: error 0.39. That number is a fair estimate of future error (it is noisy with only 15 points). Had you tried degrees, looked at test error each time, and kept the best, the test set would have become a second validation set and its number would be too optimistic.

## Bench

```bench
id: split-shuffler
title: Train, validate, test
fallback: A slider sets the degree of a polynomial fitted to training points; the bench shows training and validation error, and a button reveals the test error while counting how many times you looked.
```

**Try this**

1. Raise the degree from 0 to 12 and watch training and validation error.
2. Choose the degree with the lowest validation error.
3. Press **Look at the test error** once.
4. Press it again after trying other degrees and note how the counter grows.

**What you should notice:** training error only falls, validation error turns back up, and every look at the test set makes its score less trustworthy.

## Where it appears in AI

* **Every model comparison:** hyperparameters are chosen on validation data.
* **Leaderboards:** repeated submissions gradually overfit the hidden test set.
* **Time series and recommenders:** splits must respect time or users to avoid leakage.

## Common pitfalls

* **Tuning on the test set,** which turns it into training data.
* **Leakage across the split:** duplicates or the same person appearing in both parts.
* **Random splits of time-ordered data,** which lets the model peek at the future.
* **Tiny validation sets,** whose scores are noisy (see [[Confidence Intervals]]).

## Quick check

<details><summary>1. Which set do you use to choose between two models?</summary>
The validation set.
</details>

<details><summary>2. Why can't training error pick the best degree?</summary>
It keeps falling as complexity grows, even when the model is only memorising noise.
</details>

<details><summary>3. In 5-fold cross-validation, how many models are trained?</summary>
Five, each validated on a different fifth of the data.
</details>

## Key terms

* **Training set:** data used to fit parameters.
* **Validation set:** data used to choose models and settings.
* **Test set:** data used once for a final estimate.
* **Cross-validation:** rotating validation over k parts of the data.

## Related

[[Generalization]] · [[Overfitting in Statistics]] · [[Common Test Mistakes]] · [[The Learning Loop]] · [[Measuring Performance]]
