A model is trained on yesterday's data and used on tomorrow's. If the world changes between them (new cameras, new customers, a new season, a pandemic), inputs drift away from what the model saw and its accuracy quietly falls. **Distribution shift** is any difference between the training data and the data met in use.

**You need:** [[Bias in Data]], [[Train, Validation and Test Sets]] and [[Logistic Regression as a Classifier]].

## The question it answers

"Why did a model that tested well stop working?" A test set drawn from the same source as the training data only certifies the model for *that* source. Change the source and the guarantee lapses.

## Intuition: the ground moved

A classifier learned that "bright pixels mean class 1". Deploy it with a camera that produces brighter images across the board, and everything looks like class 1. Nothing in the model is broken; it faithfully applies a rule that no longer matches the world.

## Definitions

```text
covariate shift     the inputs change, the rule from input to label stays          P(x) changes
label (prior) shift the class proportions change                                   P(y) changes
concept drift       the rule itself changes over time (fraud tactics, fashion)     P(y | x) changes
out-of-distribution inputs unlike anything in training
```

Ways to cope: monitor input statistics and accuracy in production, compare recent data with the training data (a drift test), retrain regularly on fresh data, collect labels from the new setting, and use models that are robust to the shifts you expect. Prevention begins with training data that covers the conditions you will really face.

## A worked example

Two classes sit at `x = −1` and `x = +1` (spread 0.8). A logistic regression is trained with no shift. Then every feature value in the test data moves by a fixed amount. Accuracy on 1,000 test points at each shift:

```text
shift of all features      −2      −1     −0.5     0     +0.5     +1     +1.5     +2
fixed model               54.9%  74.5%   86.2%   88.1%  85.1%  74.0%   63.6%   55.1%
retrained on new data     87.7%  88.9%   89.8%   89.2%  88.0%  89.3%   87.6%   89.0%
```

Without any shift the model scores 88.1%. A shift of one unit costs about 14 points (to about 74%), and a shift of two brings it to 55%, barely above guessing. The task itself has not become harder: a model retrained on data from the shifted world gets 88–90% everywhere. The lesson is that the drop is caused by the mismatch, and that fresh labelled data from the new setting cures it.

## Bench

```bench
id: distribution-shift
title: When the world moves
fallback: Two classes are classified by a fixed logistic regression while every feature value is shifted by a slider amount; the bench shows the shifted test points, the decision line and the accuracy against shift, with a switch to retrain on data from the new world.
```

**Try this**

1. Slide the shift to +1 and to +2 and read the accuracy.
2. Watch the decision line stay where it was while the points move.
3. Turn on retraining and see the line follow the data.
4. Try negative shifts.

**What you should notice:** accuracy falls smoothly as the world drifts away from the training data, in either direction, and retraining on data from the new world recovers it.

## Where it appears in AI

* **Deployed models of every kind:** fraud, recommendations, demand forecasts.
* **Vision and speech:** new devices, environments and accents.
* **Language models:** vocabulary and facts that age.
* **MLOps:** drift monitoring and scheduled retraining.

## Common pitfalls

* **Trusting the original test score forever.**
* **Only monitoring accuracy,** which needs labels that arrive late; watch input statistics too.
* **Retraining on drifted data without checking labels.**
* **Assuming shift is always sudden:** slow drift is easy to miss.

## Quick check

<details><summary>1. Which kind of shift changes the class proportions?</summary>
Label (prior) shift.
</details>

<details><summary>2. Why does the fixed model lose accuracy while the task is no harder?</summary>
Its decision rule was fitted to the old data, so it no longer matches where the classes now lie.
</details>

<details><summary>3. Name one way to detect drift without labels.</summary>
Monitor input statistics (means, spreads, category shares) and compare them with the training data.
</details>

## Key terms

* **Distribution shift:** a difference between training and deployment data.
* **Covariate shift:** the inputs change but the input-to-label rule does not.
* **Concept drift:** the input-to-label rule changes over time.
* **Out-of-distribution:** inputs unlike anything seen in training.

## Related

[[Bias in Data]] · [[Anomaly Detection]] · [[Train, Validation and Test Sets]] · [[Deployment and Monitoring]] · [[Where AI Goes Wrong]]
