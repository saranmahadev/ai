Precision and recall pull against each other: flagging more cases catches more real ones (higher recall) but also admits more false alarms (lower precision). Because you can always trade one for the other by moving the decision threshold, a model must be judged over a range of thresholds, or by a summary such as **F1**.

**You need:** [[Accuracy and the Confusion Matrix]], [[Continuous Distributions]] and [[Logistic Regression as a Classifier]].

## The question it answers

"Where should I set the threshold?" Every score-producing model turns a score into a yes/no by a cut-off, and the cut-off decides the balance between misses and false alarms.

## Intuition: how wide is the net?

Cast a wide net and you catch nearly every fish (high recall) along with plenty of boots (low precision). Cast a narrow net and what you haul up is nearly all fish (high precision) but you leave many behind (low recall). The score distributions of positives and negatives overlap, so no threshold avoids both errors.

## Definitions

```text
precision = TP / (TP + FP)          recall = TP / (TP + FN)
F1        = 2 · precision · recall / (precision + recall)      the harmonic mean
F_β       = (1 + β²) · P · R / (β² · P + R)    β > 1 favours recall, β < 1 favours precision
```

The harmonic mean is dominated by the smaller of the two, so F1 is high only when *both* are decent: precision 100% with recall 1% gives F1 of about 2%, not 50%.

## A worked example

Positives score around 1.5 and negatives around 0 (bell curves of spread 1); 20% of 1,000 cases are positive (200 positives, 800 negatives). Expected counts at three thresholds:

```text
threshold   caught (TP)   false alarms (FP)   precision   recall    F1
  0.75         154.7            181.3           46.0%     77.3%   57.7%
  1.50         100.0             53.4           65.2%     50.0%   56.6%
  2.25          45.3              9.8           82.3%     22.7%   35.5%
```

Raising the threshold from 0.75 to 2.25 lifts precision from 46% to 82% while recall collapses from 77% to 23%. F1 is best in the middle and drops at the ends. Which threshold is "right" depends on cost: catching a rare disease favours recall; sending a legal notice favours precision.

## Bench

```bench
id: pr-tradeoff
title: Precision against recall
fallback: Two overlapping score distributions for positives and negatives with a slider for the threshold; the bench shows precision, recall, F1 and how many cases are flagged, with sliders for the class separation and the share of positives.
```

**Try this**

1. Slide the threshold from low to high and watch precision and recall.
2. Find the threshold that maximises F1.
3. Increase the class separation and see both metrics improve.
4. Lower the share of positives and watch precision fall at the same threshold.

**What you should notice:** precision and recall move in opposite directions along the threshold, better separation lifts both, and rarer positives make precision harder.

## Where it appears in AI

* **Search and retrieval:** precision of the top results against how many relevant items were found.
* **Anomaly and fraud alerts:** alert fatigue (low precision) against missed events (low recall).
* **Language-model evaluation** of retrieval and extraction tasks.

## Common pitfalls

* **Quoting one number at an unstated threshold.**
* **Optimising F1 when costs are unequal.**
* **Averaging F1 across classes without saying how** (micro, macro or weighted).
* **Comparing F1 across datasets** with different prevalence.

## Quick check

<details><summary>1. Precision 0.5 and recall 0.5. What is F1?</summary>
0.5.
</details>

<details><summary>2. What happens to recall when the threshold is raised?</summary>
It falls, because fewer real cases are flagged.
</details>

<details><summary>3. Why the harmonic mean rather than the plain average?</summary>
It punishes a big imbalance: a model with tiny recall cannot look good.
</details>

## Key terms

* **Threshold:** the score cut-off that turns a score into a yes/no.
* **F1 score:** the harmonic mean of precision and recall.
* **F-beta:** F-score weighting recall β times as much as precision.
* **Trade-off:** gaining on one metric costs on the other.

## Related

[[Accuracy and the Confusion Matrix]] · [[ROC and AUC]] · [[Logistic Regression as a Classifier]] · [[Continuous Distributions]] · [[Measuring Performance]]
