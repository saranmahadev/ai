Shipping a model is the start of its life, not the end. The world changes, so a deployed model must be watched. Its **inputs** can be checked immediately (are they still like the training data?), while its **accuracy** can only be measured once the true outcomes arrive, often weeks later. Monitoring the inputs gives an early warning that the labels cannot.

**You need:** [[Distribution Shift]] and [[Precision, Recall and F1]].

## The question it answers

"How will I know the model has stopped working?" Models fail silently: they keep returning confident predictions long after they have become wrong.

## Intuition: smoke alarm and post-mortem

An input monitor is a smoke alarm: cheap, instant, but it only says something changed, not that the model is wrong. Accuracy from labelled outcomes is the post-mortem: definitive, but it arrives late. A healthy setup uses both: alert on input drift right away, confirm with outcomes when they arrive, and retrain if the damage is real.

## Definitions

```text
input drift       summary statistics of features drift from the training values
                  (mean, spread, category shares, missing rate)
drift test        compare today's batch with the training data: z-score of the mean,
                  population stability index, Kolmogorov–Smirnov test
label delay       true outcomes arrive days or weeks after the prediction
performance drift accuracy or another metric measured on outcomes decays
responses         alert → investigate → retrain, roll back, or route to a human
```

A daily batch of `n` examples has a mean whose standard error is `σ/√n`, so a shift of a few standard errors can be flagged even when it is far too small to notice by eye. Set the threshold to balance false alarms against slow detection ([[Precision, Recall and F1]]).

## A worked example

A classifier separates two groups centred at −1 and +1 (spread 0.8); each day it scores 200 cases. On day 40 every input shifts by 1.0. Accuracy was 88.9% before. With an alert when the daily mean moves more than 3 standard errors, and true labels arriving 14 days late:

```text
                                  sudden shift of 1.0      gradual shift (over 30 days)
input alert fires on day               40                          46
accuracy drop visible in labels        54                          67
accuracy at day 120                    75.0%                       75.0%
```

With a sudden shift the input alert fires on the first affected day, two weeks before the labelled accuracy reveals the fall (day 54). With a gradual shift it fires on day 46 and the labels confirm on day 67, three weeks later. A small shift (0.3) still trips the alert on day 42, but its effect on accuracy is tiny; not every alert deserves a retrain. Without the input monitor the damage would go unseen for the whole label delay.

## Bench

```bench
id: drift-monitor
title: Notice the drift
fallback: A deployed classifier's daily accuracy over 120 days with an input change on day 40, either sudden or gradual; sliders set the size of the shift and the alert threshold, and the bench shows the day the input monitor fires and the day the drop becomes visible in delayed labels.
```

**Try this**

1. Use a sudden shift of 1.0 and note the two days.
2. Switch to a gradual shift.
3. Reduce the shift to 0.3 and watch the accuracy and the alert.
4. Raise the alert threshold to 5 and see whether detection is delayed.

**What you should notice:** input monitoring reacts within days while labelled accuracy lags by the label delay, and a stricter threshold trades earlier warnings for fewer false alarms.

## Where it appears in AI

* **MLOps platforms:** dashboards for drift, latency, errors and business metrics.
* **Fraud and credit models,** whose labels arrive months later.
* **Language-model applications:** tracking user feedback and output quality.
* **Safety nets:** fallback rules and human review when confidence drops.

## Common pitfalls

* **Monitoring only accuracy,** which arrives too late.
* **Alert fatigue** from thresholds that fire constantly.
* **Retraining automatically on drifted data** without checking labels.
* **No rollback plan** for a bad model.

## Quick check

<details><summary>1. Why monitor inputs as well as accuracy?</summary>
Input statistics are available at once, while true labels arrive late.
</details>

<details><summary>2. What does a drift alert prove?</summary>
Only that the inputs changed; performance must be confirmed with outcomes.
</details>

<details><summary>3. What happens to detection speed if the threshold is raised?</summary>
Detection is slower or misses small drifts, in exchange for fewer false alarms.
</details>

## Key terms

* **Input (covariate) drift:** feature distributions moving away from training.
* **Label delay:** the lag before true outcomes are known.
* **Performance drift:** decay in a metric measured on outcomes.
* **Rollback:** returning to a previous model version.

## Related

[[Distribution Shift]] · [[Anomaly Detection]] · [[Precision, Recall and F1]] · [[The ML Workflow]] · [[Where AI Goes Wrong]]
