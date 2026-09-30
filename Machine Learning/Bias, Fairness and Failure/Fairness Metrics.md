Once you measure a model's results for different groups, you must decide what "fair" means. There are several reasonable definitions, such as equal selection rates, equal true positive rates, or equal precision, and when the groups differ in how common the outcome is, they **cannot all be satisfied at once**. Choosing among them is a values decision, not a technical one.

**You need:** [[Precision, Recall and F1]], [[Bias in Data]] and [[Conditional Probability]].

## The question it answers

"Is the model treating groups equally?" The honest answer is "equal in which sense?", because the natural measures disagree.

## Intuition: three tests for "the same treatment"

Suppose a model approves loans and there are two groups. You could ask: do both groups get approved at the same rate? (**demographic parity**) Among people who would repay, are both groups approved equally often? (**equal opportunity**, equal true positive rates) Of the people approved, does the same share repay in both groups? (**predictive parity**, equal precision). If one group has more repayers than the other, fixing one of these breaks another.

## Definitions

```text
demographic parity     selection rate equal across groups           P(flagged | group)
equal opportunity      true positive rate equal                      P(flagged | positive, group)
equalised odds         true and false positive rates both equal
predictive parity      precision equal                               P(positive | flagged, group)
calibration            a score of 0.7 means 70% for every group
```

When base rates differ (the groups have different shares of positives), a non-perfect model cannot satisfy calibration/predictive parity and equalised odds together. Metrics also depend on what counts as the "positive" outcome and on who the reference group is; none of them proves fairness alone.

## A worked example

One score model for two groups with identical score behaviour (positives around 1.5, negatives around 0, spread 1), but group A has 40% positives and group B has 20%. Expected results per 1,000 people ("caught" is the true positive rate, "false alarms" the false positive rate):

```text
single threshold 0.75            selected    caught (TPR)    false alarms (FPR)    precision
group A (40% positive)            44.5%           77.3%           22.7%                69.5%
group B (20% positive)            33.6%           77.3%           22.7%                46.0%
```

The model treats individuals identically (same score, same threshold), and both true and false positive rates match, so equalised odds holds. But group A is selected far more often (44.5% against 33.6%) and flagged people are much more likely to be true positives in A (69.5%) than in B (46.0%). To equalise selection rates, lower B's threshold to 0.41:

```text
group B at threshold 0.41:   selected 44.5%   true positive rate 86.2%   false positive rate 34.1%   precision 38.7%
```

Now the selection rates match, but B's true positive rate is 8.9 points higher, its false positive rate is 11.4 points higher, and precision has dropped to 38.7%. Each fix trades away another measure.

## Bench

```bench
id: fairness-metrics
title: Two groups, one score
fallback: Two groups have different shares of positives and one score; separate thresholds for each group change the selection rate, true and false positive rates and precision, with the gaps between the groups shown for three fairness measures.
```

**Try this**

1. With the same threshold, read the three gaps.
2. Untick the same-threshold box and lower B's threshold until the selection gap is zero.
3. Note what happens to the true positive rate and precision gaps.
4. Raise the share of positives in B to 40% and see the gaps close.

**What you should notice:** you can drive one gap to zero, but only at the cost of another, and the gaps vanish only when the groups' base rates are equal.

## Where it appears in AI

* **Lending, hiring, admissions and criminal-justice risk scores.**
* **Regulation and audits:** many laws require reporting group outcomes.
* **Content moderation and health triage.**

## Common pitfalls

* **Picking the metric that flatters the model.**
* **Treating one metric as a certificate of fairness.**
* **Ignoring the base-rate difference** that makes the metrics conflict.
* **Forgetting people are not their group:** metrics describe averages, not individual cases.

## Quick check

<details><summary>1. What does demographic parity require?</summary>
The same share of each group receives the positive decision.
</details>

<details><summary>2. Why can't all fairness measures hold when base rates differ?</summary>
Their definitions constrain the same counts in incompatible ways, so satisfying one forces a gap in another.
</details>

<details><summary>3. Who decides which fairness measure to use?</summary>
It is a value judgement that depends on context and stakeholders, not a purely technical choice.
</details>

## Key terms

* **Demographic parity:** equal selection rates across groups.
* **Equal opportunity:** equal true positive rates across groups.
* **Predictive parity:** equal precision across groups.
* **Base rate:** how common the positive outcome is in a group.

## Related

[[Precision, Recall and F1]] · [[Bias in Data]] · [[Conditional Probability]] · [[Bayes Theorem]] · [[Where AI Goes Wrong]]
