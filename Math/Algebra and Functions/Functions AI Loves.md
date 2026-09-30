A few specific functions turn up in almost every neural network: the **sigmoid**, **tanh**, **ReLU**, its **leaky** variant and **softplus**. Each takes any number and reshapes it, and they exist to make a network's layers *non-linear*, which lets it learn curves instead of just lines.

**You need:** [[Graphs and Transformations]], [[Exponential and Logarithmic Functions]] and [[Composition and Inverses]].

## The question it answers

"Why can't a network just stack linear functions, and what do the 'activation' functions add?" Stacking linear functions gives another linear function: `2(3x + 1) + 4` is still a straight line. A non-linear function between layers is what gives depth its power.

## The functions

```text
sigmoid   σ(x) = 1 / (1 + e⁻ˣ)          squashes to (0, 1)
tanh      tanh(x) = (eˣ − e⁻ˣ)/(eˣ + e⁻ˣ)   squashes to (−1, 1)
ReLU      max(0, x)                      0 for negatives, x for positives
leaky ReLU  x if x > 0, else 0.01·x     a small slope for negatives
softplus  ln(1 + eˣ)                     a smooth version of ReLU
```

* **Sigmoid** turns a score into something like a probability. Large positive inputs approach 1, large negative approach 0, and `σ(0) = 0.5`.
* **tanh** is a sigmoid rescaled to be centred on zero.
* **ReLU** ("rectified linear unit") is cheap and keeps gradients alive for positive inputs; it is the default in many networks.
* **Softplus** is a smooth ReLU that is never exactly flat.

## A worked example

```text
σ(0)   = 1 / (1 + 1)        = 0.5
σ(2)   = 1 / (1 + e⁻²)      = 1 / (1 + 0.1353) ≈ 0.8808
tanh(1)                     ≈ 0.7616
ReLU(−3) = 0       ReLU(2) = 2
softplus(0) = ln 2          ≈ 0.6931
```

The slope of sigmoid at 0 is `σ(0)(1 − σ(0)) = 0.25`, the steepest it ever gets; far from 0 the curve is nearly flat, which is why very confident sigmoid outputs learn slowly (see [[Derivatives of Exp, Log and Sigmoid]]).

## Bench

```bench
id: activation-plotter
title: Activation functions and their slopes
fallback: Choose sigmoid, tanh, ReLU, leaky ReLU or softplus; an input slider marks the output and the slope on the plotted function and its derivative.
```

**Try this**

1. Slide the input from −6 to 6 on the sigmoid and watch the slope.
2. Find where ReLU's slope changes.
3. Compare tanh with sigmoid: same shape, different range?
4. Look for regions where the slope is nearly zero.

**What you should notice:** sigmoid and tanh flatten at both ends, so their slope vanishes there, while ReLU keeps a constant slope for positive inputs.

## Where it appears in AI

* **Hidden layers** apply ReLU or a relative after each linear step.
* **Sigmoid** produces a yes/no probability in the output of [[Logistic Regression and the Sigmoid]].
* **Softmax** generalises sigmoid to many classes (see [[Softmax and Cross-Entropy in Practice]]).
* **Vanishing gradients** arise where these functions are flat.

## Common pitfalls

* **Stacking linear layers without an activation.** It collapses to one linear layer.
* **Using sigmoid deep in a network.** Gradients shrink.
* **Confusing tanh's range** (−1 to 1) with sigmoid's (0 to 1).
* **Treating ReLU as differentiable at 0.** It has a corner; implementations pick a convention.

## Quick check

<details><summary>1. What is ReLU(−5) + ReLU(4)?</summary>
0 + 4 = 4.
</details>

<details><summary>2. What is σ(0)?</summary>
0.5.
</details>

<details><summary>3. Why put a non-linear function between layers?</summary>
Otherwise the layers collapse into a single linear function.
</details>

## Key terms

* **Activation function:** a non-linear function applied inside a network.
* **Sigmoid:** a smooth S-curve from 0 to 1.
* **ReLU:** `max(0, x)`.
* **Non-linear:** not describable by a straight line.

## Related

[[Exponential and Logarithmic Functions]] · [[Derivatives of Exp, Log and Sigmoid]] · [[Logistic Regression and the Sigmoid]] · [[A Forward Pass by Hand]] · [[Deep Learning]]
