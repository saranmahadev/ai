Accuracy, the share of predictions that are right, is the first number everyone reaches for and often the most misleading. When one class is rare, a model can score 98% by never finding it. The **confusion matrix** lays out the four ways a prediction can be right or wrong, and every better metric is built from its four counts.

**You need:** [[Measuring Performance]], [[Logistic Regression as a Classifier]] and [[Conditional Probability]].

## The question it answers

"How is my classifier actually wrong?" A single accuracy number hides whether it misses real cases, raises false alarms, or both, and those errors rarely cost the same.

## Intuition: two ways to be right, two ways to be wrong

For a yes/no question there are four outcomes: the model says yes and it is yes (**true positive**), says yes but it is no (**false positive**, a false alarm), says no but it is yes (**false negative**, a miss), or says no and it is no (**true negative**). Accuracy lumps the two right outcomes together and ignores which wrong outcome happened.

## Definitions

```text
                    predicted yes      predicted no
actually yes           TP                 FN
actually no            FP                 TN

accuracy    = (TP + TN) / total
sensitivity = recall = TP / (TP + FN)     of the real positives, how many were caught
specificity = TN / (TN + FP)              of the real negatives, how many were cleared
precision   = TP / (TP + FP)              of the flagged cases, how many were real
prevalence  = (TP + FN) / total           how common the positive class is
```

The **baseline** to beat is the majority-class predictor: on data with 2% positives, "always say no" is already 98% accurate.

## A worked example

A screening test on 1,000 people; 2% (20 people) have the condition. The test catches 90% of cases and clears 95% of healthy people.

```text
TP = 20 × 0.90  = 18      FN = 20 − 18  = 2
TN = 980 × 0.95 = 931     FP = 980 − 931 = 49

accuracy  = (18 + 931) / 1000 = 94.9%       "always say no" = 980 / 1000 = 98.0%
precision = 18 / (18 + 49)    = 26.9%       recall = 18 / 20 = 90%
```

The test is *less* accurate than doing nothing, yet it catches 18 of 20 real cases, which the do-nothing rule never does. And only about one in four positive results is real, because healthy people vastly outnumber sick ones: 49 false alarms swamp 18 true ones. This is the base-rate effect of [[Bayes Theorem]].

## Bench

```bench
id: confusion-matrix
title: Build a confusion matrix
fallback: Sliders set the prevalence, sensitivity and specificity of a test on 1000 cases; the bench shows the four counts of the confusion matrix with accuracy, the accuracy of always saying no, precision and recall.
```

**Try this**

1. Start at 2% prevalence, 90% sensitivity, 95% specificity and compare accuracy with the always-no baseline.
2. Raise prevalence to 30% and watch precision.
3. Keep prevalence low and raise specificity to 99%.
4. Find settings where accuracy beats the baseline yet precision is poor.

**What you should notice:** accuracy barely moves while precision swings widely with prevalence, and rare classes need a much higher specificity to keep false alarms below true hits.

## Where it appears in AI

* **Fraud, disease and defect detection:** all with rare positives.
* **Content moderation:** the balance between missing harm and wrongly removing content.
* **Every classifier evaluation,** starting from these four counts.

## Common pitfalls

* **Reporting accuracy on imbalanced data.**
* **Forgetting the baseline** of predicting the majority class.
* **Mixing up precision and recall,** or sensitivity and specificity.
* **Ignoring that the two error types cost different amounts.**

## Quick check

<details><summary>1. What is a false negative?</summary>
A real positive the model failed to flag.
</details>

<details><summary>2. 1% of cases are positive. What accuracy does "always say no" get?</summary>
99%.
</details>

<details><summary>3. TP = 30, FP = 10, FN = 20. What are precision and recall?</summary>
Precision 30/40 = 75%; recall 30/50 = 60%.
</details>

## Key terms

* **Confusion matrix:** the table of TP, FP, FN and TN counts.
* **Precision:** the share of flagged cases that are real.
* **Recall (sensitivity):** the share of real cases that are flagged.
* **Base rate (prevalence):** how common the positive class is.

## Related

[[Measuring Performance]] · [[Bayes Theorem]] · [[Precision, Recall and F1]] · [[Logistic Regression as a Classifier]] · [[Where AI Goes Wrong]]
