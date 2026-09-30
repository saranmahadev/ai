A model's error on new data comes from three sources: **bias** (the model is too simple to capture the pattern), **variance** (the model is so flexible it changes wildly with the particular training data) and **noise** (randomness no model can predict). Tuning a model is largely a trade between the first two. This topic also pulls the whole planet together.

**You need:** [[Estimation and Bias]], [[Overfitting in Statistics]], [[Variance and Standard Deviation]] and [[Regularization as a Constraint]].

## The question it answers

"Why does my model make errors, and what should I change?" The right remedy depends on which source dominates: a simpler model cannot fix noise, and more data cannot fix a model that is too rigid.

## The decomposition

For a prediction at a point, averaged over many possible training sets:

```text
expected squared error  =  bias²  +  variance  +  noise²

bias²    = (average prediction − true value)²          the systematic miss
variance = how much predictions vary between training sets
noise²   = the irreducible randomness in the data itself
```

* **High bias, low variance** (underfitting): a straight line fitted to a curve gives about the same wrong answer whatever data you show it.
* **Low bias, high variance** (overfitting): a wiggly polynomial fits each dataset's noise, so its predictions swing from dataset to dataset.

## A worked example

Fit polynomials of increasing degree to 15 noisy points from a smooth curve (noise 0.3, so noise² = 0.09), repeating on 30 fresh datasets and measuring at 41 points:

```text
degree   bias²    variance   noise²   total
   0     0.536     0.005     0.090    0.631     far too simple: bias dominates
   1     0.045     0.012     0.090    0.148
   3     0.001     0.028     0.090    0.118     the sweet spot
   5     0.001     0.060     0.090    0.151
   7     0.003     0.167     0.090    0.260
   9     0.125     1.316     0.090    1.531     variance explodes
```

(These numbers come from the bench's own code.) Bias falls and variance rises as the model gets more flexible; the total is smallest in between. The noise floor of `0.09` never goes away.

## How to steer

* **High bias:** use a richer model, add useful features, train longer.
* **High variance:** get more data, simplify the model, regularise (see [[Regularization as a Constraint]]), average many models.
* **Noise-limited:** no model will do better; look for better data.

## The whole picture

Every district fed into this. **Linear algebra** stores data and computes predictions; **calculus** and **optimization** train the parameters; **probability** and **information theory** define what a good prediction and a good loss are; **statistics** tells you how far to trust the result; **numerical computing** keeps it all running on real hardware. A model is a function with parameters, fitted by minimising a loss over data, judged on data it has not seen.

## Bench

```bench
id: bias-variance
title: The bias–variance trade-off
fallback: A slider sets the degree of a polynomial fitted to thirty fresh noisy datasets; thin curves show the individual fits, a thick curve their average and a dashed curve the truth, with bars for bias squared, variance and noise and the total error.
```

**Try this**

1. At degree 0 or 1, note how similar the fits are and how far they are from the truth.
2. Raise the degree and watch the fits fan out.
3. Find the degree with the smallest total.
4. Increase the training points and see how the best degree changes.

**What you should notice:** simple models are consistent but wrong, flexible ones are right on average but erratic, and more data tames the erratic ones.

## Where it appears in AI

* **Model selection** (how big, how deep) is a bias–variance decision.
* **Ensembles** average many high-variance models to cut variance.
* **Regularisation, dropout and early stopping** reduce variance.
* **Scaling laws:** more data and parameters together push the total error down.

## Common pitfalls

* **Chasing lower training error,** which reduces bias but can inflate variance.
* **Blaming the algorithm** when the data is noisy.
* **Assuming more data always fixes bias.** It does not.
* **Ignoring the noise floor** when setting targets.

## Quick check

<details><summary>1. A model gets the same wrong answer on every training set. Is that bias or variance?</summary>
Bias.
</details>

<details><summary>2. Which helps with high variance: more data or a bigger model?</summary>
More data (a bigger model would raise variance).
</details>

<details><summary>3. Can any model beat the noise floor?</summary>
No.
</details>

## Key terms

* **Bias:** the systematic error from a model that is too simple.
* **Variance:** sensitivity of the fit to the particular training data.
* **Irreducible noise:** randomness in the data no model can predict.
* **Bias–variance trade-off:** the tension between the two as flexibility changes.

## Related

[[Estimation and Bias]] · [[Overfitting in Statistics]] · [[Regularization as a Constraint]] · [[Generalization]] · [[Machine Learning]]
