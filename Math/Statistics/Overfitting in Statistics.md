**Overfitting** happens when a model fits the quirks and noise of its training data instead of the underlying pattern, so it does well on the data it saw and badly on new data. A flexible enough model can always drive the training error to zero; the test error tells you whether it actually learned anything.

**You need:** [[Polynomials and Quadratics]], [[Least Squares]] and [[Estimation and Bias]].

## The question it answers

"Why can a model that fits my data perfectly still be useless?" Because data is signal plus noise, and a model with enough flexibility can memorise the noise as well.

## Intuition: connecting the dots too faithfully

Ten noisy points lie roughly on a smooth curve. Fit a straight line and it misses the bend (**underfitting**: too simple). Fit a degree-9 polynomial and it passes through every point exactly, wiggling wildly between them (**overfitting**: too flexible). An intermediate degree captures the trend and ignores the noise.

```text
training error   falls steadily as flexibility grows
test error       falls at first (learning the pattern), then rises (learning the noise)
```

The best model sits near the bottom of the test-error curve. This is the **bias–variance** trade-off in action: simple models have high bias and low variance, flexible ones the reverse (see [[Bias, Variance and the Whole Picture]]).

## Detecting and preventing it

* **Hold out data:** measure error on examples the model never saw (a validation or test set).
* **Cross-validation:** rotate which part is held out, to use data efficiently.
* **Get more data:** more points make it harder to fit noise.
* **Reduce flexibility:** fewer parameters, simpler model.
* **Regularise:** penalise large weights (see [[Regularization as a Constraint]]).
* **Stop early:** halt training when validation error starts to rise.

## A worked example

Fit polynomials to 10 noisy points from a smooth curve (noise 0.25), and measure the average squared error on the training points and on 200 fresh points:

```text
degree 1:   training error 0.096    test error 0.113     underfit: a line misses the bend
degree 3:   training error 0.036    test error 0.057     about right: the lowest test error
degree 6:   training error 0.005    test error 0.183     starting to chase noise
degree 9:   training error 0.000    test error 2.211     overfit: perfect on training, terrible on new points
```

(These numbers come from the bench's own fitting code with 10 training points and noise 0.25.) A degree-9 polynomial has 10 coefficients for 10 points, so it can pass through all of them exactly, including their noise.

## Bench

```bench
id: polynomial-overfit
title: Fit polynomials to noisy points
fallback: A slider sets the polynomial degree fitted to noisy points from a smooth curve; the bench draws the fit, shows the error on the training points and on fresh points, and plots both errors against the degree.
```

**Try this**

1. Start at degree 1 and raise the degree one step at a time.
2. Watch the training error fall and the test error turn back up.
3. Add more points and see how the overfitting eases.
4. Increase the noise and find the best degree again.

**What you should notice:** training error only ever falls, but test error has a minimum, and overfitting is worst when points are few and flexibility is high.

## Where it appears in AI

* **Every model** faces it: deep networks with more parameters than examples included.
* **Validation sets and early stopping** are standard defences.
* **Regularisation, dropout and data augmentation** limit flexibility.
* **Test-set discipline:** evaluating on training data hides overfitting (see [[Generalization]]).

## Common pitfalls

* **Judging a model by its training error.**
* **Tuning on the test set** until it looks good.
* **Assuming a bigger model is always better.**
* **Blaming the data** when the real issue is too much flexibility.

## Quick check

<details><summary>1. Training error is 0 and test error is huge. What is happening?</summary>
Overfitting.
</details>

<details><summary>2. Does adding more training data usually reduce overfitting?</summary>
Yes.
</details>

<details><summary>3. Which is more flexible, degree 2 or degree 8?</summary>
Degree 8.
</details>

## Key terms

* **Overfitting:** fitting noise, so performance on new data is worse.
* **Underfitting:** a model too simple to capture the pattern.
* **Validation / test set:** data held back to measure generalisation.
* **Cross-validation:** rotating the held-out part.

## Related

[[Least Squares]] · [[Estimation and Bias]] · [[Regularization as a Constraint]] · [[Generalization]] · [[Bias, Variance and the Whole Picture]]
