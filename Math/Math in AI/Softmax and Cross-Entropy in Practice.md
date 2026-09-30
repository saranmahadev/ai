For questions with many possible answers, a network outputs one raw score (a **logit**) per class. The **softmax** turns those scores into probabilities that are positive and add to 1, and **cross-entropy** scores them against the truth. The pair is the standard output layer and loss for classification and for language models.

**You need:** [[Exponential and Logarithmic Functions]], [[Cross-Entropy]], [[Probability Rules]] and [[Numerical Stability]].

## The question it answers

"How do I turn a list of scores into a probability distribution, and train it?" Scores can be any real numbers, including negative ones; probabilities must be positive and sum to 1.

## Softmax

```text
pᵢ = e^(zᵢ) / Σⱼ e^(zⱼ)
```

Exponentiating makes everything positive and exaggerates differences; dividing by the total makes it sum to 1. Adding the same constant to every score changes nothing (the basis of the stable version; see [[Numerical Stability]]).

A **temperature** `T` reshapes the distribution: use `z / T`. Low `T` (below 1) sharpens it toward the top class; high `T` flattens it toward uniform. Language models sample with a temperature to control how adventurous the text is.

## Cross-entropy and its gradient

With the true class `c` (a one-hot target), the loss is the surprise of the true class:

```text
L = −ln p_c
∂L/∂zᵢ = pᵢ − yᵢ           (probability minus one-hot target)
```

That gradient is the same tidy "prediction minus truth" as logistic regression: it is negative for the true class (push its score up) and positive for the others (push them down), with each push proportional to how wrong the model was.

## A worked example

Scores `z = (2, 1, 0.1)` for three classes.

```text
e^z = (7.389, 2.718, 1.105)          sum = 11.213
p   = (0.659, 0.242, 0.099)          adds to 1 ✓
```

If the true class is the first: `L = −ln 0.659 = 0.417`, and the gradient `p − y = (0.659 − 1, 0.242, 0.099) = (−0.341, 0.242, 0.099)`. If the true class were the third, the model would be badly wrong: `L = −ln 0.099 = 2.31`, gradient `(0.659, 0.242, −0.901)`.

With temperature `T = 0.5` the scores become `(4, 2, 0.2)` and the probabilities `(0.86, 0.12, 0.02)`: sharper. With `T = 4`: `(0.5, 0.25, 0.025)` gives `(0.40, 0.31, 0.29)`: nearly flat.

## Bench

```bench
id: logits-to-loss
title: From scores to probabilities to loss
fallback: Sliders set three scores and a temperature and a choice sets the true class; bars show the softmax probabilities, and the bench reports the cross-entropy loss and the gradient for each score.
```

**Try this**

1. Raise one score and watch the probabilities shift.
2. Change the true class and see the loss and gradient.
3. Lower the temperature to sharpen the distribution.
4. Make the model confidently wrong and read the loss.

**What you should notice:** the gradient is probability minus target, confident mistakes have large loss, and temperature scales how decisive the distribution is.

## Where it appears in AI

* **Classifiers and language models** end in softmax with cross-entropy loss.
* **Attention weights** are a softmax over scores (see [[Attention as Dot Products]]).
* **Sampling temperature** in text generation.
* **Knowledge distillation** uses softened distributions.

## Common pitfalls

* **Exponentiating large scores directly** (use the stable form).
* **Applying softmax twice.**
* **Taking `log(softmax)` in two steps** rather than a fused log-softmax.
* **Confusing temperature direction:** low is sharper.

## Quick check

<details><summary>1. Softmax of (0, 0, 0)?</summary>
(1/3, 1/3, 1/3).
</details>

<details><summary>2. Does softmax change if you add 5 to every score?</summary>
No.
</details>

<details><summary>3. Gradient with respect to a wrong class's score when it has probability 0.2?</summary>
0.2.
</details>

## Key terms

* **Logit:** a raw class score.
* **Softmax:** exponentiate and normalise scores into probabilities.
* **Temperature:** a divisor on the scores that sharpens or flattens the result.
* **Cross-entropy loss:** the negative log of the true class's probability.

## Related

[[Cross-Entropy]] · [[Exponential and Logarithmic Functions]] · [[Numerical Stability]] · [[Logistic Regression and the Sigmoid]] · [[Attention as Dot Products]]
