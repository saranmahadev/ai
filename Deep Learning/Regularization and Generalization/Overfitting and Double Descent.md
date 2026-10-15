The classical picture of [[Overfitting in Statistics|overfitting]] says test error falls as a model grows, then rises once it has enough capacity to memorise noise — a U-shape. **Double descent** is the empirical finding that for some models, test error does something stranger: it rises to a sharp peak exactly where the model first has *just enough* capacity to fit the training data perfectly, then **falls again** as capacity grows further still.

**You need:** [[Bias, Variance and the Whole Picture]] and [[Overfitting in Statistics]].

## The question it answers

"Does adding more parameters than you have training examples always make overfitting worse?" Surprisingly, past a certain point, no — it is the *boundary* between not-quite-enough and just-enough capacity that is most dangerous, not having far more capacity than needed.

## Intuition: a wobbly plank versus a solid floor

A model with just enough parameters to pass exactly through every training point is forced into one specific fit — and if the data is noisy, that one fit can be wild, swinging wherever it must to hit every noisy point exactly (like a plank balanced to touch several uneven pegs: the fewer pegs' worth of slack it has, the more it has to bend). A model with many more parameters than needed has room to spare: it can fit the training data exactly in many different ways, and the smallest, smoothest among them tends to behave far better on new data — closer to a solid floor than a bending plank.

## Definitions

```text
n            number of training examples
p            number of model parameters (features)
p ≈ n        the "interpolation threshold" — just enough capacity to fit training data exactly

classical regime (p ≪ n):  bias-variance trade-off, the usual U-shape
critical regime (p ≈ n):   the fit is forced and uniquely determined, often badly
overparameterized (p ≫ n): many exact fits exist; the smallest-norm one, in simple models, tends to generalise again
```

## A worked example

Fit `p` random, otherwise meaningless features (only the first one actually relates to the target) to `n = 40` noisy training points, using the minimum-norm solution that fits whatever it can exactly. Average the test error over several random draws:

```text
p (features)     5      20      35      39      40       41       45      60     100     150
test MSE       0.047   0.331   2.339   8.736  160.221  127.180   2.509   0.831   0.812   0.882
```

Test error climbs steadily as `p` approaches `n = 40`, **spikes** to over 150 exactly at `p = 40` — right where the model has exactly enough parameters to fit the 40 training points precisely, forcing one specific (and here, terrible) fit — and then **falls sharply** once `p` exceeds `n`, settling to a much better level by `p = 100` than it ever reached approaching the peak from below.

## Bench

```bench
id: double-descent
title: Test error as model capacity crosses the interpolation threshold
fallback: A slider for the number of features p, averaged over several random trials at n = 40 training points. Test error climbs toward p = n, spikes sharply at the threshold, then falls again as p grows well past n.
```

**Try this**

1. Move `p` slowly up from a small value toward 40 and watch the error climb.
2. Step through `p = 38, 39, 40, 41, 42` and watch the sharp spike right at the threshold.
3. Keep increasing `p` well past 40 and watch the error fall and settle.

**What you should notice:** the worst point on the whole curve is not "the most overparameterized" model — it is the one with exactly as many parameters as training examples, where the fit is forced into one specific, fragile shape.

## Where it appears in AI

* **Why modern deep networks, with far more parameters than training examples, often don't overfit as catastrophically as classical theory predicts** — they live deep in the overparameterized, past-the-peak regime.
* **Why some techniques (early stopping, explicit regularization) matter more right around the interpolation threshold** than either comfortably below or comfortably above it.
* **An active area of theory** connecting this phenomenon to how deep networks generalise at all, despite having enough capacity to memorise their training set outright.

## Common pitfalls

* **Assuming "more parameters than data" is always dangerous.** It is specifically the *boundary* region, not every overparameterized model, that is most at risk.
* **Expecting a clean double-descent curve from every model and dataset.** The effect's sharpness depends on the noise level, the features, and how the extra capacity is used (see [[Dropout]] and [[Data Augmentation]] for techniques that change this picture further).
* **Confusing this with the ordinary bias-variance trade-off.** Double descent is specifically about the extra behaviour *past* the point where classical theory already predicted maximum overfitting.

## Quick check

<details><summary>1. Where on the capacity axis is test error worst in the worked example?</summary>
At `p = 40` — exactly where the number of parameters equals the number of training examples, forcing one specific, fragile exact fit.
</details>

<details><summary>2. Does adding even more parameters past that peak make things worse?</summary>
No — in this example, test error falls sharply once `p` exceeds `n`, continuing to improve as `p` grows further.
</details>

<details><summary>3. Why might a model with many more parameters than data points generalise reasonably well?</summary>
With enough extra capacity, many exact fits to the training data exist, and the smallest / smoothest among them (which minimum-norm fitting selects) tends to avoid the wild behaviour forced on a model with just barely enough capacity.
</details>

## Key terms

* **Interpolation threshold:** the point where a model has just enough capacity to fit its training data exactly.
* **Double descent:** test error falling, rising to a peak at the interpolation threshold, then falling again with further capacity.
* **Minimum-norm solution:** among all parameter settings that fit the training data exactly, the one with the smallest overall size.

## Related

[[Bias, Variance and the Whole Picture]] · [[Overfitting in Statistics]] · [[Dropout]] · [[Early Stopping and Ensembling Deep Nets]]
