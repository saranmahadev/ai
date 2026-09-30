Real datasets have holes, typos, duplicates and impossible values. **Cleaning** is deciding what to do about each, and the choice is never neutral: dropping, filling or flagging missing values each change what the model learns. The right choice depends on *why* the values are missing.

**You need:** [[Datasets, Features and Labels]], [[Describing Data]] and [[Sampling and Bias]].

## The question it answers

"What do I do when data is missing or wrong?" Most models cannot accept a blank, so something must be decided, and a careless default (such as filling with zero) quietly injects a false pattern.

## Intuition: why is it missing?

* **Missing completely at random:** a sensor glitch, unrelated to the value. Dropping or filling causes little harm.
* **Missing depending on other columns:** younger users skip a question more often. Fill using related columns.
* **Missing because of the value itself:** high earners skip the income question. Any simple fix is biased, and the missingness itself is a clue.

## Definitions

```text
drop rows        remove examples with any blank        loses data; biased if missingness is not random
fill (impute)    replace with mean, median or a model prediction
missing flag     add a 0/1 column "was this blank?"    lets the model use the fact of missingness
median vs mean   the median is not dragged by outliers
```

Always fit the fill value (the mean, say) on the **training** set only, then apply it unchanged to validation and test data; otherwise information leaks across the split.

## A worked example

Six incomes (in thousands), two of them blank:

```text
observed:  30, 35, ?, 40, ?, 120
mean of the four seen   = (30 + 35 + 40 + 120) / 4 = 56.25
median of the four seen = (35 + 40) / 2           = 37.5
```

Suppose the hidden values were 38 and 45, so the true mean of all six is `(30+35+38+40+45+120)/6 = 51.3`.

```text
drop the two rows:      mean of 4 = 56.25             (2 rows lost, outlier weighs more)
fill with the mean:     mean of 6 = 56.25             (adds no information, still pulled up by 120)
fill with the median:   mean of 6 = (30+35+37.5+40+37.5+120)/6 = 50.0   (closer to 51.3)
```

The outlier 120 drags the mean, so the median is the safer fill here. Filling also shrinks the spread, because every filled value sits at the centre: a model may become overconfident.

## Bench

```bench
id: missing-values
title: Handling missing values
fallback: Forty incomes with some values missing, either at random or because high earners skip the question; choose to drop, mean-fill or median-fill and compare the estimated average with the true average.
```

**Try this**

1. With values missing at random, try each strategy.
2. Switch to "high earners skip the question" and try each again.
3. Compare drop with median fill under that setting.

**What you should notice:** when the reason for missingness depends on the value itself, no simple strategy recovers the true average, so understanding why data is missing matters more than which fill you choose.

## Where it appears in AI

* **Tabular pipelines:** imputers and missing-value flags are standard steps.
* **Some tree-based models** handle blanks natively.
* **Data quality audits** before any training run.

## Common pitfalls

* **Filling with 0** when 0 is a real value.
* **Computing the fill value on all the data** including the test set.
* **Ignoring outliers and duplicates,** which are dirt too.
* **Deleting the awkward column** that contains the real signal.

## Quick check

<details><summary>1. Observed values 2, 4, 30 and one blank. What is the median fill?</summary>
4.
</details>

<details><summary>2. Why fit the fill value on the training set only?</summary>
To avoid leaking information from validation or test data into the model.
</details>

<details><summary>3. Why add a "was missing" flag?</summary>
The fact that a value is missing can itself predict the label.
</details>

## Key terms

* **Imputation:** filling missing values with estimates.
* **Missing at random:** blanks unrelated to the value.
* **Outlier:** a value far from the rest.
* **Missing flag:** a column marking which values were blank.

## Related

[[Datasets, Features and Labels]] · [[Describing Data]] · [[Data Distributions and Outliers]] · [[Scaling and Normalisation]]
