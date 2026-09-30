**Anomaly detection** looks for the rare points that do not fit: a fraudulent payment, a failing machine, a corrupt record. With few or no labelled examples, the usual approach is to model what *normal* looks like and flag whatever is unlikely under that model. How you measure "unusual" decides which anomalies you find.

**You need:** [[Gaussian Mixtures and EM]], [[Data Distributions and Outliers]] and [[Covariance and Correlation]].

## The question it answers

"Which examples should a human look at?" Anomalies are too rare and too varied to learn as a class, so we learn normality and treat departures as suspects.

## Intuition: unusual in which sense?

A point can be far from the centre, extreme in one feature, or ordinary in every feature separately yet an odd *combination*: a person who is tall and light, when height and weight normally rise together. Measuring only distance from the centre, or each feature on its own, misses that last kind. **Mahalanobis distance** accounts for how the features move together, stretching space along the data's own axes so "far" means far in the data's terms.

## Definitions

```text
z-score           (x − mean) / std for one feature; flag a point if any feature is extreme
distance          ‖x − mean‖, ignores scale and correlation
Mahalanobis       √((x − mean)ᵀ Σ⁻¹ (x − mean))      Σ is the covariance matrix
density model     flag points whose probability under a fitted model is very low
other methods     isolation forests, nearest-neighbour distance, autoencoder reconstruction error
```

The threshold sets the balance between missed anomalies and false alarms, exactly as in [[Precision, Recall and F1]]. In practice anomalies are so rare that even a small false-alarm rate produces more false alerts than real ones.

## A worked example

A correlated cloud of 150 normal points (features move together) plus six planted anomalies: two that break the correlation but sit within each feature's usual range, and four that are extreme. Setting each score's threshold so exactly 3 of the 150 normal points are falsely flagged:

```text
score                          threshold    anomalies caught (of 6)
distance from the centre         3.56              2
largest feature z-score          2.29              3
Mahalanobis distance             2.39              6
```

Distance from the centre catches only the two farthest points; z-scores catch three; Mahalanobis catches all six at the same false-alarm cost, because it knows the two "quiet" anomalies violate the usual correlation. Allowing 6 false alarms instead of 3 changes nothing for any of the three scores.

## Bench

```bench
id: anomaly-detection
title: Which points are unusual?
fallback: A correlated cloud of 150 normal points with six planted anomalies; choose distance, per-feature z-score or Mahalanobis distance, set a threshold, and see which points are flagged, how many anomalies are caught and how many false alarms result.
```

**Try this**

1. With Mahalanobis distance at 2.4, count caught anomalies and false alarms.
2. Switch to distance from the centre and find a threshold that catches all six.
3. Count the false alarms it then costs.
4. Repeat with the z-score.

**What you should notice:** the two anomalies that break the correlation are invisible to simple distance but obvious to Mahalanobis distance, and catching everything with a cruder score costs many false alarms.

## Where it appears in AI

* **Fraud, security and predictive maintenance.**
* **Data cleaning:** find corrupt or mislabelled records.
* **Out-of-distribution detection** for deployed models (see [[Distribution Shift]]).

## Common pitfalls

* **Setting the threshold without considering the base rate:** false alerts swamp real ones.
* **Assuming anomalies look alike.**
* **Training the "normal" model on data that already contains anomalies.**
* **Static baselines in changing systems,** where normal drifts.

## Quick check

<details><summary>1. Why can a point be unusual though every feature is ordinary?</summary>
The combination of values can violate how the features normally move together.
</details>

<details><summary>2. What does Mahalanobis distance add over plain distance?</summary>
It accounts for the spread and correlation of the features.
</details>

<details><summary>3. What does raising the threshold do?</summary>
Fewer false alarms, but more anomalies missed.
</details>

## Key terms

* **Anomaly (outlier):** a point that does not fit the normal pattern.
* **Mahalanobis distance:** distance measured in units of the data's own covariance.
* **Density estimation:** modelling how likely each point is.
* **False alarm:** a normal point wrongly flagged.

## Related

[[Gaussian Mixtures and EM]] · [[Data Distributions and Outliers]] · [[Covariance and Correlation]] · [[Precision, Recall and F1]] · [[Distribution Shift]]
