A model learns whatever its data shows. If some groups are rare in the training data, or their data follows different rules, one model fitted to everyone will serve the majority best and the minority worst, even though nobody intended that. **Data bias** is the gap between the data you trained on and the people or cases the model will meet.

**You need:** [[Datasets, Features and Labels]], [[Sampling and Bias]] and [[Train, Validation and Test Sets]].

## The question it answers

"Who does my model work for?" An overall accuracy number averages over everyone, so it can look excellent while a smaller group is served badly.

## Intuition: the model fits the crowd it saw

Suppose a model learns a single rule from a mix of two groups. Fitting the rule that is right most often naturally favours the larger group. If the second group's data follows a somewhat different rule (different lighting, dialect, symptoms, or history), the shared rule will be systematically off for them. Bias can also enter through *how* data was collected (who was sampled or measured), *what* was measured (proxies), and *labels* that reflect past human decisions.

## Definitions

```text
sampling bias        the training sample over- or under-represents some groups
measurement bias     features or labels are recorded differently for different groups
historical bias      labels encode past unfair decisions
disaggregated eval   report accuracy per group, not only overall
```

The remedies start with looking: measure performance by group. Then collect more representative data, reweight or resample, check that features work equally well for all groups, and where possible test on data from the real deployment population.

## A worked example

A one-feature classifier must learn one threshold. In group A the correct boundary is at 0; in group B, whose feature values run higher, it is at 1.2. Train with different mixes (4,000 examples) and test on 4,000 fresh examples from each group:

```text
share of group B in training    learned threshold    accuracy A    accuracy B
        10%                          0.04              87.1%         66.0%
        20%                          0.20              86.4%         69.9%
        30%                          0.24              86.0%         70.6%
        50%                          0.66              78.1%         81.0%
```

With 10% of the data from group B the threshold sits almost exactly at A's boundary: A gets 87%, B only 66%. Balancing the data moves the threshold to a compromise and closes the gap (78% and 81%), but group A now does worse than before: with one shared rule and different truths, someone loses. A better fix is a feature that tells the groups apart or a model that can use group-specific information, where that is appropriate and lawful.

## Bench

```bench
id: group-share
title: Whose data trained the model?
fallback: Two groups follow different rules with different true boundaries; a slider sets the share of group B in the training data, and the bench shows the single learned threshold and the accuracy for each group.
```

**Try this**

1. Start with 10% of group B and read both accuracies.
2. Raise the share to 20%, 30% and 50%.
3. Watch where the learned threshold sits relative to the two true boundaries.
4. Find the share that gives the smallest gap.

**What you should notice:** the model mirrors whoever dominates the data, balancing the data narrows the gap by moving the compromise, and a shared rule cannot be perfect for both.

## Where it appears in AI

* **Face and speech recognition** that work best for the groups most present in the training data.
* **Medical models** trained on one hospital or population.
* **Language models** that reflect who wrote the text they were trained on.
* **Hiring and lending models** trained on historical decisions.

## Common pitfalls

* **Reporting only overall accuracy.**
* **Assuming "the data is neutral":** data is a record of a process.
* **Treating balancing as a complete fix.**
* **Removing a sensitive feature and thinking the problem is gone:** proxies (postcode, name) carry it back in.

## Quick check

<details><summary>1. Why can a model be 90% accurate overall and poor for a minority group?</summary>
Overall accuracy is dominated by the majority, so the minority's errors are hidden in the average.
</details>

<details><summary>2. Name two sources of data bias.</summary>
For example sampling bias (who is included) and historical bias (labels reflecting past decisions).
</details>

<details><summary>3. Does dropping a sensitive attribute remove bias?</summary>
Not necessarily, since other features can act as proxies for it.
</details>

## Key terms

* **Sampling bias:** a training sample that misrepresents the population.
* **Proxy variable:** a feature that stands in for a sensitive attribute.
* **Disaggregated evaluation:** measuring performance separately for each group.
* **Historical bias:** unfairness carried by past labels and decisions.

## Related

[[Sampling and Bias]] · [[Datasets, Features and Labels]] · [[Fairness Metrics]] · [[Distribution Shift]] · [[Where AI Goes Wrong]]
