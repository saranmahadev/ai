For predicting numbers there is no confusion matrix; instead we summarise the size of the errors. **MAE** is the average size of a miss, **RMSE** punishes large misses more heavily, and **R²** compares the model with a trivial one that always predicts the average. Which one you choose changes what the model is pushed to do.

**You need:** [[Linear Regression in Practice]], [[Loss Functions]] and [[Describing Data]].

## The question it answers

"How far off are my predictions, typically?" Different summaries answer different versions of that: the typical miss, the miss you should worry about, or the share of variation explained.

## Intuition: big misses count extra

Suppose your predictions are all off by 1 except one that is off by 10. The average miss is small, but that one error might ruin a decision. Squaring errors before averaging makes the 10 count a hundred times as much as a 1, so RMSE is much larger than MAE whenever a few errors are large.

## Definitions

```text
error       eᵢ = predictionᵢ − actualᵢ
MAE         = (1/n) Σ |eᵢ|                    same units as the target, robust to outliers
MSE         = (1/n) Σ eᵢ²
RMSE        = √MSE                            same units, dominated by large errors
R²          = 1 − Σ eᵢ² / Σ (yᵢ − ȳ)²         1 = perfect, 0 = no better than the mean, < 0 = worse
```

RMSE is always at least as large as MAE. Percentage errors (MAPE) exist but explode near zero actual values. Training on squared error targets the mean; training on absolute error targets the median.

## A worked example

Actual values `3, 5, 7, 9`; predictions `2, 6, 7, 12`, so the errors are `−1, +1, 0, +3`.

```text
MAE  = (1 + 1 + 0 + 3) / 4        = 1.25
RMSE = √((1 + 1 + 0 + 9) / 4)     = √2.75 = 1.66
R²   = 1 − 11 / 20                = 0.45          (mean = 6; total variation = 9+1+1+9 = 20)
```

One error of 3 makes up 82% of the total squared error (9 of 11) but only 60% of the total absolute error (3 of 5), which is why RMSE (1.66) exceeds MAE (1.25). On the bench's eight predictions, with seven errors of at most 1 in size and one error you can set:

```text
error of  1:   MAE 0.75   RMSE 0.83   R² 0.967
error of 12:   MAE 2.13   RMSE 4.31   R² 0.116
```

Growing one error from 1 to 12 nearly triples MAE but multiplies RMSE by over five, and R² collapses from 0.97 to 0.12.

## Bench

```bench
id: error-metrics
title: Measure regression errors
fallback: Eight predictions plotted against actual values, with a slider for the error on the last prediction; the bench shows MAE, RMSE and R² as that one error grows.
```

**Try this**

1. Start with the error on the last prediction at 1.
2. Slide it to 12 and watch all three metrics.
3. Slide to −12 and compare.
4. Find the error at which R² drops below 0.9.

**What you should notice:** one large error moves RMSE far more than MAE, and R² falls as errors grow relative to the natural spread of the data.

## Where it appears in AI

* **Forecasting and pricing:** MAE for typical error, RMSE when big misses are costly.
* **Training losses:** squared error and absolute error give different fits.
* **Reporting:** R² summarises fit, but it can look good while errors are large in absolute terms.

## Common pitfalls

* **Comparing RMSE across targets with different scales.**
* **Trusting R² alone,** since it depends on the spread of the data.
* **Using MAPE when actual values are near zero.**
* **Ignoring the errors' pattern:** plot residuals.

## Quick check

<details><summary>1. Errors are 2 and −2. What are MAE and RMSE?</summary>
Both are 2.
</details>

<details><summary>2. Why is RMSE never smaller than MAE?</summary>
Squaring emphasises large errors, so the root of the mean square is at least the mean absolute value.
</details>

<details><summary>3. What does R² = 0 mean?</summary>
The model predicts no better than always guessing the average.
</details>

## Key terms

* **MAE:** mean absolute error.
* **RMSE:** root mean squared error.
* **R²:** the share of the target's variation the model explains.
* **Residual:** actual minus predicted value.

## Related

[[Linear Regression in Practice]] · [[Loss Functions]] · [[Variance and Standard Deviation]] · [[Describing Data]] · [[Measuring Performance]]
