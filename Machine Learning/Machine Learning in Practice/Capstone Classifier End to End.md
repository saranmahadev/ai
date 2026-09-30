This capstone builds a small classifier from start to finish and brings the whole planet together: scaling, feature engineering, a choice of models compared by cross-validation, and a single look at a sealed test set. The data is designed so that each earlier lesson matters: a huge-scale noise column, a pattern no straight line can find, and a label with some noise.

**You need:** [[The ML Workflow]], [[Pipelines and Leakage]], [[Feature Engineering]], [[Scaling and Normalisation]] and [[Random Forests]].

## The question it answers

"Do the pieces really add up?" Each choice (scale or not, engineer a feature or not, which model) changes the score by many points, and only honest cross-validation tells you which choices help.

## The problem

Four hundred training rows and 200 sealed test rows, four features:

```text
x₁, x₂    two informative features: the class is "outside a circle" (x₁² + x₂² > 1.4), with 10% of labels flipped
x₃        pure noise, multiplied by 1000 (a huge scale)
x₄        a weak signal (its mean shifts slightly with the label)
```

Every model is scored by 5-fold cross-validation on the training rows. Any preprocessing is refitted inside each fold.

## The results

Cross-validated accuracy (mean over folds):

```text
model                      raw features   standardised   + feature x₁²+x₂²   + drop x₃ too
logistic regression           43.3%          59.7%            86.0%              84.7%
7 nearest neighbours          46.5%          80.7%            83.2%              86.3%
decision tree (depth 4)       83.0%          83.0%            88.3%              88.8%
random forest (25 trees)      83.0%          83.0%            90.5%              90.5%
```

Read the table row by row:

* **Logistic regression** is hopeless on raw features (the huge-scale column dominates, below chance) and mediocre after scaling (59.7%: a straight line cannot separate a ring), but jumps to 86.0% once given the squared-distance feature: the same lesson as [[Feature Engineering]].
* **Nearest neighbours** depends on scaling (46.5% → 80.7%) and improves again when the noise column is dropped (86.3%).
* **Trees and forests** ignore scale entirely (same score raw and standardised) and profit from the engineered feature (88.3%, 90.5%).
* Differences of a couple of points are inside the fold-to-fold spread (about ±2 to ±7 points), so do not over-read them.

## The final exam

Choose by cross-validation: the random forest on standardised features plus the squared-distance feature (90.5% ± 2.1). Train it on all 400 rows and score the sealed 200 once:

```text
random forest, standardised, with x₁²+x₂²:   test accuracy 91.0%
for comparison, logistic regression on raw features:   test accuracy 55.5%
```

The 91.0% agrees with the cross-validated 90.5%, which is what an honest process should give. Had the test set been used to choose among the twenty combinations above, the best of them would look better than it really is, and the agreement would have been luck.

## Bench

```bench
id: end-to-end
title: A small project, start to finish
fallback: Choose a model and preprocessing options (standardising, adding the squared-distance feature, dropping a huge-scale column) for a four-feature classification problem, see the cross-validated accuracy on 400 training rows, and open the sealed 200-row test set once.
```

**Try this**

1. Start with logistic regression and no options; then add them one at a time.
2. Switch to the random forest and repeat.
3. Pick the configuration you trust from cross-validation only.
4. Open the test set once and compare its score with the cross-validated one.

**What you should notice:** scaling rescues distance-based methods, an engineered feature rescues linear ones, trees are robust to both, and a test score close to the cross-validated one shows the process was honest.

## Where it appears in AI

* **Every applied tabular project** follows this pattern, at larger scale.
* **The same comparison discipline** decides among neural network designs.
* **Reproducible pipelines** bundle the chosen steps so serving matches training.

## Common pitfalls

* **Choosing among many variants using the test set.**
* **Stopping at the first good score** without a baseline or an error analysis.
* **Over-reading small differences** between models.
* **Leaving a step outside the pipeline,** which invites leakage.

## Quick check

<details><summary>1. Why is the raw-features logistic regression below chance?</summary>
The huge-scale noise column dominates the gradient updates, so the model fits noise instead of the real signal.
</details>

<details><summary>2. Why do trees not need standardised features?</summary>
They only compare each feature with thresholds, so scale does not matter.
</details>

<details><summary>3. How many times may you score the test set while choosing a model?</summary>
Zero: choose with cross-validation and open the test set once at the end.
</details>

## Key terms

* **Capstone:** a project that combines the lessons of a whole planet.
* **Sealed test set:** data kept unseen until the final score.
* **Engineered feature:** a new input built from existing ones.
* **Honest estimate:** a score not influenced by decisions made on the test data.

## Related

[[The ML Workflow]] · [[Pipelines and Leakage]] · [[Feature Engineering]] · [[Random Forests]] · [[Cross-Validation]]
