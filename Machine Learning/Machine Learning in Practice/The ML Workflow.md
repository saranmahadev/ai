Building a model is a sequence of steps, and the *order* matters as much as the choices. Decide what success means, look at the data, split it, prepare features using only the training data, choose models with validation data, and open the test set once at the end. Almost every embarrassing failure of a machine learning project is one of these steps done out of order.

**You need:** [[Train, Validation and Test Sets]], [[Cross-Validation]] and [[Hyperparameter Tuning]].

## The question it answers

"What do I actually do, and in what order?" The steps are individually simple; the discipline is in never letting information from the future (the test set) reach the model or your decisions.

## Intuition: an exam that must stay secret

Everything you do up to the final step is preparation. The test set is the sealed exam paper: once you peek, even to guide small decisions, it stops being a fair test. So each step asks a single question: *which data am I allowed to look at?*

## The steps

```text
1  frame the problem     what is predicted, from what, at what moment; what error costs
2  choose the metric     and a baseline to beat (majority class, last value, a simple rule)
3  inspect and clean     duplicates, impossible values, leakage (before splitting)
4  split                 train / validation / test (by time or by group when needed)
5  build features        scalers, imputers, encoders are fitted on training data only
6  train and compare     baselines first, then models; choices made on validation folds
7  error analysis        look at mistakes and weak slices (on validation data)
8  final exam            train on training + validation, score the test set once
9  deploy and monitor    watch inputs and outcomes (see Deployment and Monitoring)
```

The loop between steps 5 and 7 repeats many times; the loop must never include the test set.

## A worked example

A shop has 10,000 past orders and wants to predict returns.

```text
remove 700 duplicate rows             10,000 − 700 = 9,300 rows
split 70 / 15 / 15                    6,510 train  ·  1,395 validation  ·  1,395 test
median for missing ages               computed from the 6,510 training rows only, then reused
model choices (depth, penalty)        picked using the 1,395 validation rows or cross-validation
error analysis                        looked at validation mistakes, never test mistakes
final exam                            the model is scored on the 1,395 test rows once
```

Suppose duplicates had been removed *after* splitting: an order that appears twice could sit in training and in test, and the model would be marked correct simply for remembering it. Suppose the median age had been computed on all 9,300 rows: the test set would have contributed to the model's inputs. Both errors would inflate the test score without improving the model. The bench below is a small drill in deciding which data each step may touch.

## Bench

```bench
id: workflow-order
title: When may each step touch which data?
fallback: Eight project steps are sorted into three bins: before the split, using training data only, and using the test data once at the end, with an explanation for any wrong placement.
```

**Try this**

1. Sort all eight steps without checking.
2. Check, and read the reason for any miss.
3. Restart and explain each placement in your own words.

**What you should notice:** anything that *learns from data* (a mean, a choice, a model) belongs on training data, and only the final score touches the test set.

## Where it appears in AI

* **Every applied ML project,** from spreadsheets to large models.
* **Competitions:** leaderboards separate a public and a private test set for this reason.
* **MLOps pipelines** automate the steps so the order cannot be broken by accident.

## Common pitfalls

* **Peeking at the test set** "just to check".
* **Fitting preprocessing before splitting.**
* **Skipping the baseline,** so no one knows whether the model adds value.
* **Random splits of time-ordered or grouped data.**

## Quick check

<details><summary>1. On which data are a scaler's mean and spread computed?</summary>
The training data only.
</details>

<details><summary>2. When is the test set scored?</summary>
Once, at the very end.
</details>

<details><summary>3. Why remove duplicates before splitting?</summary>
Otherwise the same example can appear in both training and test data, which leaks.
</details>

## Key terms

* **Baseline:** a simple reference model to beat.
* **Pipeline:** the ordered chain of preparation and modelling steps.
* **Leakage:** information from outside the training data reaching the model.
* **Final exam:** scoring the test set once.

## Related

[[Train, Validation and Test Sets]] · [[Cross-Validation]] · [[Pipelines and Leakage]] · [[Baselines and Error Analysis]] · [[Datasets, Features and Labels]]
