**Leakage** is when information the model should not have sneaks into training, making test scores look wonderful and real performance poor. The most surprising kind comes from preparing data before splitting it: choose the "best" features using all the data, and even pure noise will appear predictable. A **pipeline** fixes this by packaging each preparation step so it is refitted inside every training fold.

**You need:** [[The ML Workflow]], [[Cross-Validation]] and [[The Curse of Dimensionality]].

## The question it answers

"Why did the model collapse in production after scoring so well?" Very often a step, such as scaling, imputing, selecting features or removing outliers, was fitted on data that included the examples it was later tested on.

## Intuition: peeking through a side door

Imagine choosing the ten features most correlated with the label. If you make that choice on all 60 examples and *then* cross-validate, each validation example already helped pick the features. With hundreds of useless features, some will correlate with the label by chance, and the selection step finds exactly those; cross-validation then rewards the model for a coincidence that was baked in. The fix is simple in principle: everything that learns from data must be learned inside the training fold.

## Definitions

```text
leakage types    preprocessing fitted on all data · duplicates across splits
                 · features from the future (a column recorded after the outcome)
                 · the label hidden in an ID, a timestamp or a proxy
pipeline         [scale → select features → model] treated as one unit and refitted per fold
warning signs    accuracy that is too good · a feature with implausible importance
                 · a big drop between validation and production
```

Time also leaks: with time-ordered data, train on the past and test on the future, never shuffle.

## A worked example

Sixty examples with a random 50/50 label and 300 features that are pure noise: there is nothing to learn, so honest accuracy is 50%. Pick the top 10 features by correlation with the label, then run 5-fold cross-validation with a nearest-centroid classifier. Average over 20 random datasets:

```text
300 noise features, keep 10:    select on all data first (leaky)   80.1%    select inside each fold (proper)   50.6%
300 noise features, keep 20:    leaky 85.2%                        proper 50.6%
1000 noise features, keep 10:   leaky 85.4%                        proper 48.0%
50 noise features, keep 10:     leaky 68.4%                        proper 46.8%
```

The leaky pipeline "finds" 80–85% accuracy in nothing but noise, and does better the more useless features it can choose from. The proper pipeline stays at chance, which is the truth. Nothing about the classifier differs, only *when* the selection was done.

## Bench

```bench
id: leak-demo
title: A signal in pure noise?
fallback: Sixty examples with random labels and hundreds of noise features are cross-validated with feature selection done either on all the data first or inside each training fold; the bench shows the accuracy of each pipeline on twenty random datasets, with sliders for the number of noise features and features kept.
```

**Try this**

1. In the leaky pipeline, read the average accuracy on noise.
2. Switch to the proper pipeline.
3. Raise the number of noise features to 1000.
4. Reduce it to 20 and see the leak shrink.

**What you should notice:** with the leak, accuracy far above 50% appears from nothing, growing with the number of useless features, and correct nesting removes it.

## Where it appears in AI

* **Genomics and other wide data** with thousands of features and few samples.
* **Kaggle-style competitions,** where leaks in IDs or timestamps decide leaderboards.
* **Production ML,** where a pipeline object guarantees the same steps in training and serving.

## Common pitfalls

* **Selecting features, scaling or imputing before the split.**
* **Duplicates and near-duplicates across splits.**
* **Random splits of time-ordered data.**
* **Trusting results that seem too good.**

## Quick check

<details><summary>1. Why did the leaky pipeline beat chance on random labels?</summary>
Feature selection used the labels of all examples, including those later used for validation, so chance correlations were locked in.
</details>

<details><summary>2. What does a pipeline ensure?</summary>
Every learned preparation step is refitted on the training fold only.
</details>

<details><summary>3. Name a warning sign of leakage.</summary>
Suspiciously high accuracy, or a large drop between validation and production.
</details>

## Key terms

* **Data leakage:** information from outside the training data influencing the model.
* **Pipeline:** preparation and model steps bundled and refitted together.
* **Nested validation:** doing selection inside the training fold.
* **Target leakage:** a feature that encodes the outcome.

## Related

[[The ML Workflow]] · [[Cross-Validation]] · [[Common Test Mistakes]] · [[The Curse of Dimensionality]] · [[Datasets, Features and Labels]]
