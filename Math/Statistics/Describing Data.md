A few numbers can summarise a whole data set: where its **centre** is (mean, median, mode) and how **spread out** it is (range, variance, standard deviation, quartiles). Choosing the right summary depends on the data's shape and on whether it has extreme values.

**You need:** [[Sums and Products]], [[Expectation]] and [[Variance and Standard Deviation]].

## The question it answers

"What is a typical value, and how much do values differ?" Reporting a model's typical error, or the typical size of your inputs, needs summaries that are not thrown off by a few odd points.

## Measures of centre

* **Mean:** add everything and divide by the count. It uses every value, so it is pulled by extremes.
* **Median:** the middle value when sorted (or the average of the middle two). It ignores how extreme the ends are.
* **Mode:** the most frequent value.

## Measures of spread

```text
range               = max − min
sample variance     s² = Σ (xᵢ − x̄)² / (n − 1)
standard deviation  s  = √s²
quartiles           Q1 (25% below), Q2 = median, Q3 (75% below)
interquartile range IQR = Q3 − Q1
```

The sample variance divides by `n − 1` rather than `n`, which corrects for having estimated the mean from the same data (see [[Estimation and Bias]]).

## A worked example

Data: `2, 4, 4, 4, 5, 5, 7, 9` (eight values).

```text
mean      = 40 / 8 = 5
median    = (4 + 5) / 2 = 4.5
mode      = 4
sum of squared deviations = 9 + 1 + 1 + 1 + 0 + 0 + 4 + 16 = 32
sample variance = 32 / 7 = 4.571     sample standard deviation = 2.138
(dividing by n = 8 instead gives variance 4 and standard deviation 2)
```

Now add one extreme value, 100. The mean jumps to `140 / 9 = 15.6` (more than tripled), while the median only moves from 4.5 to 5. **For skewed data or data with outliers, the median and IQR describe the typical case better than the mean and standard deviation.**

## Bench

```bench
id: drag-summary
title: Move a point, watch the summary
fallback: Eight points on a number line can be dragged or set with sliders; the bench shows the mean, median, range, standard deviation and interquartile range and how each responds when you move one point far away.
```

**Try this**

1. Drag one point far to the right. Which summaries move a lot?
2. Which one barely moves?
3. Cluster all points together and watch the spread shrink.
4. Make the mean and the median differ as much as you can.

**What you should notice:** the mean, range and standard deviation react strongly to one extreme value, while the median and IQR stay put.

## Where it appears in AI

* **Feature scaling** uses the mean and standard deviation.
* **Robust metrics** report median error when errors have heavy tails.
* **Data checks:** ranges and quartiles reveal impossible values quickly.

## Common pitfalls

* **Reporting the mean for skewed data** (incomes, waiting times).
* **Dividing by `n` when estimating from a sample.**
* **Ignoring the shape** behind the summary numbers.
* **Assuming mean, median and mode agree.** They only do for symmetric, single-peaked data.

## Quick check

<details><summary>1. What is the median of 3, 9, 1, 7, 5?</summary>
5 (sorted: 1, 3, 5, 7, 9).
</details>

<details><summary>2. Which is more affected by an outlier, the mean or the median?</summary>
The mean.
</details>

<details><summary>3. Sample variance of 1, 3, 5?</summary>
Deviations from 3: 4 + 0 + 4 = 8; 8 / 2 = 4.
</details>

## Key terms

* **Mean / median / mode:** average, middle value, most frequent value.
* **Variance / standard deviation:** measures of spread.
* **Quartile:** a value marking 25%, 50% or 75% of the sorted data.
* **IQR:** the range of the middle half of the data.

## Related

[[Expectation]] · [[Variance and Standard Deviation]] · [[Data Distributions and Outliers]] · [[Estimation and Bias]]
