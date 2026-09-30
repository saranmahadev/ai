The **shape** of a data set, its distribution, tells you which summaries make sense and which models will work. A **histogram** shows the shape, a **box plot** condenses it, and **outliers** are points far from the rest, which need investigating rather than automatically deleting.

**You need:** [[Describing Data]] and [[Continuous Distributions]].

## The question it answers

"What does this data look like, and are there strange points?" Nearly every data-quality problem, from a sensor glitch to a mislabelled example, shows up as an odd shape or an outlier.

## Shapes

* **Symmetric (bell):** mean ≈ median. Heights, measurement noise.
* **Right-skewed:** a long tail to the right; mean > median. Incomes, waiting times, word frequencies.
* **Left-skewed:** a long tail to the left; mean < median.
* **Bimodal:** two humps. Often a mix of two groups that should be analysed separately.

A histogram's **bin width** matters: too wide hides structure, too narrow draws noise.

## Box plots and the outlier rule

A box plot draws Q1, the median and Q3 as a box and extends "whiskers" to the most extreme points that are not outliers. A common rule flags a point as an outlier if it lies outside the **fences**:

```text
lower fence = Q1 − 1.5 × IQR          upper fence = Q3 + 1.5 × IQR
```

Another rule uses z-scores: flag `|z| > 3`, where `z = (x − mean) / sd`.

## A worked example

Data: `12, 13, 14, 15, 15, 16, 17, 18, 45` (nine values). Median 15. Lower half `12, 13, 14, 15` has median 13.5 (that is Q1); upper half `16, 17, 18, 45` has median 17.5 (Q3).

```text
IQR = 17.5 − 13.5 = 4
fences: 13.5 − 6 = 7.5   and   17.5 + 6 = 23.5
45 is above 23.5  →  an outlier
```

The mean is `185 / 9 = 20.6`, higher than every other value except the outlier, while the median 15 sits with the bulk. Ask *why* 45 is there: a typing error (145 recorded as 45?), a different kind of case, or a real extreme? The answer decides what to do.

## Bench

```bench
id: histogram-bins
title: Shape, bins and outliers
fallback: Choose a data shape (bell, skewed or two-humped) and a number of bins; the bench draws the histogram and box plot, flags points outside the fences, and lets you add an outlier to see the effect on the mean and median.
```

**Try this**

1. Change the number of bins from 3 to 60 and see when the shape is clearest.
2. Switch between the three shapes and compare mean and median.
3. Add an outlier and see it flagged.
4. Compare how far the mean and median move.

**What you should notice:** skew pulls the mean away from the median, bin choice can hide or invent structure, and the fences catch the added point.

## Where it appears in AI

* **Data cleaning** starts with distribution plots and outlier checks.
* **Skewed features** are often log-transformed before modelling.
* **Bimodal error** can reveal a hidden subgroup the model handles differently.

## Common pitfalls

* **Deleting outliers automatically.** Some are the most interesting cases.
* **Trusting one histogram** at one bin width.
* **Assuming normality** without looking.
* **Judging outliers on a skewed variable** with a normal-based rule.

## Quick check

<details><summary>1. Right-skewed data: is the mean above or below the median?</summary>
Above.
</details>

<details><summary>2. Q1 = 10, Q3 = 20. What are the fences?</summary>
Lower 10 − 15 = −5; upper 20 + 15 = 35.
</details>

<details><summary>3. What might a bimodal histogram suggest?</summary>
Two groups mixed together.
</details>

## Key terms

* **Histogram:** bars showing how many values fall in each bin.
* **Skew:** asymmetry, with a long tail on one side.
* **Box plot:** a picture of the quartiles and outliers.
* **Outlier:** a value far from the rest.

## Related

[[Describing Data]] · [[Continuous Distributions]] · [[Sampling and Bias]] · [[Where AI Goes Wrong]]
