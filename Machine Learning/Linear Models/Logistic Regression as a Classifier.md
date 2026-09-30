**Logistic regression** turns a linear score into a probability with the sigmoid and predicts a class by comparing that probability with a threshold. Despite its name it is a classifier. Its outputs are probabilities, and moving the threshold trades false alarms against misses.

**You need:** [[Linear Regression in Practice]], [[Logistic Regression and the Sigmoid]] and [[Cross-Entropy]].

## The question it answers

"How likely is it that this example is in class 1, and what should I do about it?" A yes-or-no answer hides uncertainty; a probability lets you decide how cautious to be.

## Intuition: a linear score squeezed into 0–1

Compute a score `z = b + w · x`. A large positive score means "very likely class 1", a large negative means "very likely class 0", and zero means "unsure". The sigmoid squeezes the score into a probability between 0 and 1. The set of points where the probability equals the threshold is a straight line (a flat plane in higher dimensions): the **decision boundary**.

## Definitions

```text
score          z = b + w · x
probability    p = 1 / (1 + e^(−z))                    p = 0.5 exactly where z = 0
prediction     class 1 if p ≥ t   (t = 0.5 by default)
loss           cross-entropy: −[y log p + (1−y) log(1−p)] averaged over the data
precision      TP / (TP + FP)      how many alarms were right
recall         TP / (TP + FN)      how many real cases were caught
```

Raising the threshold demands more confidence, so fewer alarms (higher precision) but more misses (lower recall).

## A worked example

Eighty points in two overlapping classes (forty each) fitted by logistic regression. Counting outcomes at three thresholds, from the bench:

```text
threshold   caught   false alarms   missed   correct negatives   precision   recall
   0.2        37          14           3            26              72.5%     92.5%
   0.5        34           6           6            34              85.0%     85.0%
   0.8        23           0          17            40             100.0%     57.5%
```

At 0.2 almost every real case is caught, at the price of 14 false alarms. At 0.8 there are no false alarms but 17 of 40 real cases slip through. The right threshold depends on costs: a cancer screen wants high recall, a system that freezes bank accounts wants high precision.

## Bench

```bench
id: logistic-threshold
title: Probability, threshold, errors
fallback: Two overlapping classes with a fitted logistic regression shown as probability shading; a slider sets the decision threshold and the bench counts caught cases, false alarms, misses and correct negatives with precision and recall.
```

**Try this**

1. Start at threshold 0.5 and read the counts.
2. Slide the threshold down to 0.2, then up to 0.8.
3. Find a threshold that gives zero false alarms.
4. Find one that misses nobody.

**What you should notice:** the boundary line slides across the data as the threshold moves, and every gain in recall costs precision.

## Where it appears in AI

* **Spam, fraud, medical screening:** probabilities with a threshold chosen for the cost of errors.
* **Neural networks:** a final layer with a sigmoid is logistic regression on learned features.
* **Calibration:** whether "70%" really means right 70% of the time.

## Common pitfalls

* **Always using 0.5** without asking what errors cost.
* **Reading accuracy alone** when classes are imbalanced (see [[Measuring Performance]]).
* **Unscaled features,** which slow training and distort regularisation.
* **Separable data,** where weights grow without bound unless regularised.

## Quick check

<details><summary>1. At what score is the probability exactly 0.5?</summary>
z = 0.
</details>

<details><summary>2. What happens to recall as the threshold rises?</summary>
It falls, because fewer cases are flagged.
</details>

<details><summary>3. What shape is a logistic regression's decision boundary?</summary>
A straight line (a hyperplane in more dimensions).
</details>

## Key terms

* **Sigmoid:** the function 1 / (1 + e^(−z)) that maps scores to probabilities.
* **Decision boundary:** where the predicted probability equals the threshold.
* **Precision:** the share of flagged cases that are real.
* **Recall:** the share of real cases that are flagged.

## Related

[[Logistic Regression and the Sigmoid]] · [[Cross-Entropy]] · [[Linear Regression in Practice]] · [[Measuring Performance]] · [[Ridge and Lasso]]
