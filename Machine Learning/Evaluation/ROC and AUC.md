The **ROC curve** shows what a classifier achieves at every possible threshold at once: how many real positives it catches (true positive rate) against how many false alarms it raises (false positive rate). The **AUC**, the area under that curve, compresses it into one number: the chance that the model scores a random positive above a random negative.

**You need:** [[Precision, Recall and F1]] and [[Random Variables]].

## The question it answers

"How good is the model, regardless of threshold?" Precision and recall depend on where you cut. ROC and AUC measure how well the model *ranks* positives above negatives, before any cut is chosen.

## Intuition: trace the threshold

Start with the threshold so high that nothing is flagged: no true positives, no false alarms, the bottom-left corner. Lower it gradually: true positives and false alarms both grow, tracing a curve to the top-right corner, where everything is flagged. A model with no skill climbs along the diagonal (each extra true positive comes with a matching false alarm). A better model bows toward the top-left corner: many true positives before many false alarms.

## Definitions

```text
true positive rate (TPR)   = TP / (TP + FN)  = recall
false positive rate (FPR)  = FP / (FP + TN)  = 1 − specificity
ROC curve    (FPR, TPR) traced as the threshold sweeps from high to low
AUC          area under the curve: 0.5 = coin flip, 1.0 = perfect ranking
             AUC = P(score of a random positive > score of a random negative)
```

ROC is insensitive to how common the positive class is, which is both a strength (comparable across datasets) and a weakness: with very rare positives a model can have a high AUC yet poor precision, so pair it with precision-recall analysis.

## A worked example

Positive scores are bell-shaped around a centre `d` above the negatives' centre (both with spread 1). The AUC depends only on the separation `d`:

```text
separation d    0      1      1.5    2      3
AUC           0.500  0.760  0.856  0.921  0.983
```

With `d = 0` the score is pure noise (0.5). At `d = 1.5` a random positive outranks a random negative 85.6% of the time. At threshold 0.75 with `d = 1.5`, the model sits at the point `TPR = 77.3%`, `FPR = 22.7%` on its ROC curve; sliding the threshold moves along that same curve and never changes the AUC.

## Bench

```bench
id: roc-curve
title: The ROC curve
fallback: A slider sets how far apart the score distributions of positives and negatives are, and the bench draws the ROC curve with its area; a second slider moves a threshold marker along the curve, with the true and false positive rates.
```

**Try this**

1. Set the separation to 0 and read the AUC.
2. Raise it to 1.5, then 3.
3. Move the threshold along the curve and watch the two rates.
4. Find the threshold that gives about 90% recall and note the false positive rate.

**What you should notice:** the curve bows further from the diagonal as separation grows, the threshold moves the point but not the curve, and high recall costs a rising false positive rate.

## Where it appears in AI

* **Comparing classifiers** independent of a chosen threshold.
* **Medical tests and risk scores:** ROC is the standard summary.
* **Ranking systems:** AUC is the chance of ranking a relevant item above an irrelevant one.

## Common pitfalls

* **Reading a high AUC as high precision** on very rare positives.
* **Comparing AUCs** of models with overlapping curves that cross.
* **Ignoring the operating point:** you still must choose a threshold.
* **Using AUC on data with a different score meaning** after calibration or drift.

## Quick check

<details><summary>1. What AUC does a random-guessing model get?</summary>
About 0.5.
</details>

<details><summary>2. What does AUC = 0.9 mean in words?</summary>
A random positive gets a higher score than a random negative 90% of the time.
</details>

<details><summary>3. Does moving the threshold change the ROC curve?</summary>
No, it only moves the operating point along the curve.
</details>

## Key terms

* **ROC curve:** true positive rate against false positive rate across all thresholds.
* **AUC:** the area under the ROC curve.
* **False positive rate:** the share of real negatives that are flagged.
* **Operating point:** the chosen threshold's position on the curve.

## Related

[[Precision, Recall and F1]] · [[Accuracy and the Confusion Matrix]] · [[Random Variables]] · [[Logistic Regression as a Classifier]] · [[Measuring Performance]]
