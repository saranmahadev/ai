Before building anything clever, build something trivial and measure it: that is your **baseline**, and any model must beat it to be worth keeping. After a model exists, **error analysis** means reading its mistakes and grouping them: which kinds of inputs does it fail on, and which failures are worth fixing? An overall accuracy number cannot tell you that.

**You need:** [[Accuracy and the Confusion Matrix]], [[Regression Metrics]] and [[Bias in Data]].

## The question it answers

"Is my model any good, and what should I improve next?" Without a baseline you cannot tell whether 88% is impressive. Without error analysis you improve at random.

## Intuition: compare, then dissect

A baseline is the cheapest sensible rule: always predict the majority class, the average value, yesterday's value, or a hand-written rule. If a sophisticated model barely beats it, the problem or the data may be the limit, not the algorithm. Then take the model's mistakes and sort them into slices (short messages, another language, a rare category, a certain period). Two numbers matter for each slice: the error *rate* (how bad) and the error *count* (how much it costs overall). A slice with a bad rate but few examples may matter less than a mediocre rate on a huge slice.

## Definitions

```text
baseline         majority class · mean/median · last value · a simple rule · a linear model
slice            a subset defined by a property: input length, category, group, time
error mass       number of examples × error rate = mistakes coming from that slice
error analysis   list slices, rank by error mass, read examples, decide: more data? better features? a rule?
```

Slices overlap in real data; the bench treats them as separate groups so the arithmetic is clear. Read actual examples: the pattern behind a slice's errors is often a label problem or a data gap, not a model problem.

## A worked example

A text classifier is scored on 1,000 held-out messages. Overall accuracy is 87.8%, which looks fine. Splitting by kind of message:

```text
slice                     examples   accuracy   mistakes   share of all mistakes
messages in another language   90       61%       35.1            29%
long messages                 300       92%       24.0            20%
short messages                380       94%       22.8            19%
messages with typos            70       70%       21.0            17%
messages with numbers         160       88%       19.2            16%
total                        1000               122.1
```

The smallest slice, other-language messages (9% of the data), causes the most mistakes (29% of the total). Raising that slice to 95% accuracy removes 30.6 mistakes and lifts overall accuracy from 87.8% to 90.9%. Raising the *largest* slice, short messages, from 94% to 95% would gain only 0.4 points. The overall number hid where the effort should go.

## Bench

```bench
id: error-slices
title: Where are the mistakes?
fallback: A table of five slices of a classifier's test messages with their examples, accuracy, mistakes and share of all mistakes, sorted by number of mistakes; buttons raise a slice to 95% accuracy and show the new overall accuracy.
```

**Try this**

1. Note which slice has the most mistakes and which has the worst accuracy.
2. Fix the worst-accuracy slice and read the overall change.
3. Reset and fix the largest slice instead.
4. Try fixing two slices.

**What you should notice:** the slice with the most mistakes is not the biggest or necessarily the worst rate, and fixing it moves the overall score far more than polishing a strong slice.

## Where it appears in AI

* **Every model-improvement loop** in industry: rank slices, fix the biggest, repeat.
* **Fairness audits,** which are error analysis by group.
* **Evaluation of language models,** reported by category and difficulty.

## Common pitfalls

* **Skipping the baseline.**
* **Ranking slices only by error rate** and chasing tiny groups.
* **Doing error analysis on the test set,** which turns it into a second validation set.
* **Never reading actual examples.**

## Quick check

<details><summary>1. Why build a trivial baseline first?</summary>
To know whether the model adds real value and to have a reference for how hard the problem is.
</details>

<details><summary>2. A slice has 50 examples at 60% accuracy. How many mistakes?</summary>
20 (40% of 50).
</details>

<details><summary>3. Which data should you run error analysis on?</summary>
Validation data, not the test set.
</details>

## Key terms

* **Baseline:** a trivial model any real model must beat.
* **Slice:** a subset of examples defined by a shared property.
* **Error mass:** the number of mistakes a slice contributes.
* **Error analysis:** studying mistakes by slice to decide what to fix.

## Related

[[Accuracy and the Confusion Matrix]] · [[Regression Metrics]] · [[Bias in Data]] · [[The ML Workflow]] · [[Learning Curves]]
