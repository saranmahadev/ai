A **learning curve** plots a model's training error and validation error against the amount of training data. Its shape says what is wrong: if both errors are high and close together, the model is too simple (**high bias**) and more data will not help; if training error is low and validation error is high, the model is too flexible (**high variance**) and more data probably will.

**You need:** [[Cross-Validation]], [[Overfitting in Statistics]] and [[Bias, Variance and the Whole Picture]].

## The question it answers

"Should I collect more data, or change the model?" Guessing is expensive: data costs money, and a bigger model on the same data may only overfit. The curve tells you which lever is worth pulling.

## Intuition: two ways to be bad

A straight line fitted to a wiggly pattern is wrong however many points you give it: it is limited by its shape. Its training and validation errors both settle at the same high value. A flexible curve can bend to fit anything, so with few points it memorises noise (tiny training error, large validation error) but with more points it gets pinned down by the pattern and the two errors close in on the noise floor: the best any model could do.

## Definitions

```text
noise floor        error that no model can remove (random variation in the target)
high bias          curves converge to a high error: the model cannot represent the pattern
high variance      a large gap between training and validation error: it fits noise
diagnosis          gap large            → more data, simpler model, or regularisation
                   both high, no gap    → a more flexible model or better features
```

Learning curves are built by training on growing subsets, usually averaged over several random subsets, and scoring on a fixed validation set.

## A worked example

Points from a wavy curve plus noise of spread 0.5 (so the noise floor is an RMS error of 0.5). Average error over 20 random training sets of each size, comparing a straight line with a degree-6 polynomial:

```text
training examples     line: train / validation       degree 6: train / validation
       12                 0.94 / 1.13                    0.37 / 2.74
       20                 0.95 / 1.08                    0.43 / 1.26
       40                 0.97 / 1.04                    0.47 / 0.62
       80                 0.98 / 1.02                    0.49 / 0.56
      160                 1.00 / 1.01                    0.50 / 0.52
```

The line's curves meet at about 1.0, twice the noise floor: more data cannot fix a model that is too simple. The flexible curve starts badly (validation error 2.74 with 12 points) and its gap closes steadily until both errors reach the 0.5 floor by 160 points. Same data, opposite diagnoses.

## Bench

```bench
id: learning-curves
title: Learning curves
fallback: Training and validation error are plotted against training set size for a straight line and a degree-six curve fitted to noisy wavy data; a slider marks a training set size and shows both models' errors there.
```

**Try this**

1. Slide from 12 to 160 examples and watch both models' numbers.
2. Compare where the line's two errors settle with the noise floor.
3. Find the size at which the flexible curve's gap has nearly closed.
4. Decide which model you would choose with 20 examples, and with 160.

**What you should notice:** the simple model plateaus above the noise floor no matter what, while the flexible one is terrible when data is scarce and excellent when it is plentiful.

## Where it appears in AI

* **Deciding whether to gather more data** before an expensive labelling effort.
* **Scaling studies:** error as a function of data and model size.
* **Debugging training runs:** the gap between training and validation loss.

## Common pitfalls

* **Buying more data for a model with high bias.**
* **Judging from one random subset:** curves are noisy, so average several.
* **Ignoring the noise floor** and chasing zero error.
* **Reading a big gap as certain overfitting** when the validation set is small or unrepresentative.

## Quick check

<details><summary>1. Training error 0.05, validation error 0.40. Diagnosis?</summary>
High variance (overfitting): consider more data, regularisation or a simpler model.
</details>

<details><summary>2. Both errors are 0.30 and equal, but you need 0.10. What now?</summary>
The model is too simple (high bias): use a more flexible model or better features; more data will not help.
</details>

<details><summary>3. What is the noise floor?</summary>
The error that even a perfect model would make because of randomness in the target.
</details>

## Key terms

* **Learning curve:** error against training set size.
* **High bias (underfitting):** error stays high because the model is too simple.
* **High variance (overfitting):** large gap between training and validation error.
* **Noise floor:** the irreducible error.

## Related

[[Bias, Variance and the Whole Picture]] · [[Cross-Validation]] · [[Pruning and Overfitting]] · [[Overfitting in Statistics]] · [[Train, Validation and Test Sets]]
