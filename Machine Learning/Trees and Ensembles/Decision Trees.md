A **decision tree** predicts by asking a chain of yes/no questions about the features, like a flowchart: "is income above 50k? is age over 30?". Each question splits the data in two, and each path ends in a leaf that gives the answer. Trees are easy to read, need no scaling, and draw boundaries made of rectangles.

**You need:** [[Trees and Hierarchies]], [[Datasets, Features and Labels]] and [[Train, Validation and Test Sets]].

## The question it answers

"Can I explain the prediction as a short list of rules?" A tree is a set of if-then rules learned from data, so a person can follow exactly why a case landed where it did.

## Intuition: twenty questions

Imagine guessing an animal by asking questions. A good first question splits the possibilities roughly in half ("does it fly?"); a poor one leaves everything mixed. A tree learns its questions the same way: at each step, among all features and all cut-points, it picks the one question that leaves the two sides as pure (one-class) as possible, then repeats inside each side. It stops when a side is pure or a limit such as maximum depth is reached.

## Definitions

```text
node          a question: "feature ≤ threshold?"
branch        yes or no
leaf          a final answer: the majority class (or the average, for regression)
depth         the longest chain of questions from root to leaf
greedy        each split is chosen alone, best right now, with no look-ahead
```

A prediction walks from the root down to a leaf. The regions are axis-aligned rectangles, which makes trees poor at diagonal boundaries unless they use many splits.

## A worked example

A tiny loan tree: "income > 50? if no → decline; if yes → age > 30? yes → approve, no → decline". For an applicant with income 60 and age 25: income > 50 is yes, then age > 30 is no, so the answer is decline. Three leaves, two questions: the whole model fits on a card.

On 120 noisy half-moon training points, with 280 unseen points to test on (bench data), allowing more depth gives:

```text
max depth    leaves    training accuracy    unseen accuracy
    1           2            89%                 80%
    2           4            95%                 85%
    3           6            95%                 85%
    4           9            97%                 80%
    6          12           100%                 81%
```

Depth 2 already captures most of the structure. Beyond depth 3 the tree carves tiny boxes around individual noisy points: training accuracy climbs to 100% while unseen accuracy falls. The next topics explain how to score splits and how to stop the tree growing too far.

## Bench

```bench
id: decision-tree-regions
title: Grow the tree
fallback: A slider sets the maximum depth of a decision tree on noisy half-moon data; the bench draws the rectangles it carves and shows the leaf count and the training and unseen accuracy.
```

**Try this**

1. Start at depth 1 and look at the single cut.
2. Raise the depth one step at a time.
3. Watch the small isolated boxes appear at large depth.
4. Compare training and unseen accuracy at depth 2 and depth 8.

**What you should notice:** each extra level adds more rectangles, training accuracy only rises, and unseen accuracy stops improving and then falls once boxes chase single points.

## Where it appears in AI

* **Tabular data:** trees and forests are the default strong baseline for spreadsheets of features.
* **Explainable decisions:** credit, triage and eligibility rules.
* **Ensembles:** random forests and gradient boosting are built from many trees.

## Common pitfalls

* **Growing until every leaf is pure,** which memorises noise.
* **Reading feature importance as causation.**
* **Expecting smooth predictions:** a tree's output jumps at each threshold.
* **Instability:** small changes in the data can change the top questions completely.

## Quick check

<details><summary>1. What does a leaf contain?</summary>
The prediction: the majority class, or the average value for regression.
</details>

<details><summary>2. Why can a tree have 100% training accuracy yet do badly on new data?</summary>
It can build a leaf for every noisy training point, memorising instead of generalising.
</details>

<details><summary>3. Do trees need scaled features?</summary>
No: they only compare each feature with thresholds.
</details>

## Key terms

* **Node / leaf:** a question / a final answer.
* **Depth:** the longest chain of questions.
* **Greedy splitting:** choosing each split for the best immediate gain.
* **Decision boundary:** the edges between regions of different predictions.

## Related

[[Trees and Hierarchies]] · [[Impurity and Splits]] · [[Pruning and Overfitting]] · [[Random Forests]] · [[Logistic Regression as a Classifier]]
