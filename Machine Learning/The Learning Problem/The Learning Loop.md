Training a model is a loop: **predict** with the current parameters, **measure** the loss, work out which way each parameter should move to lower it, **nudge** the parameters, and repeat. This loop, gradient descent, is how almost every model in this planet and the next ones learns.

**You need:** [[What Is Machine Learning]], [[Gradient Descent]] and [[Learning Rate]].

## The question it answers

"How does a model actually improve?" Not by being told the answer, but by repeatedly noticing that a small change to a parameter makes its errors smaller or larger.

## Intuition: walking downhill in fog

The loss is a landscape whose height is the model's error and whose coordinates are the parameters. You cannot see the whole landscape, but you can feel the slope under your feet. Take a step downhill, feel again, repeat. The **learning rate** is the step size: too small and you crawl, too large and you overshoot the valley.

## Definitions

For a line `ŷ = w·x + b` and mean squared error over `n` points:

```text
loss     L = (1/n) Σ (w·xᵢ + b − yᵢ)²
gradient ∂L/∂w = (2/n) Σ (w·xᵢ + b − yᵢ)·xᵢ        ∂L/∂b = (2/n) Σ (w·xᵢ + b − yᵢ)
update   w ← w − η·∂L/∂w         b ← b − η·∂L/∂b      (η is the learning rate)
```

## A worked example

Three points `(1, 2)`, `(2, 3)`, `(3, 5)`; start at `w = 0, b = 0`; learning rate `η = 0.1`.

```text
step 0:  w = 0.000  b = 0.000   loss 12.667   gradient (−15.333, −6.667)
step 1:  w = 1.533  b = 0.667   loss  0.216   gradient ( 1.644,  0.800)
step 2:  w = 1.369  b = 0.587   loss  0.067
step 3:  w = 1.390  b = 0.588   loss  0.065
```

The loss drops from 12.7 to 0.07 in two steps and then settles. The best possible line (found exactly by [[Least Squares]]) has `w = 1.5, b = 0.333`; gradient descent has come close and is still creeping toward it. With a very large learning rate the same loop would overshoot and grow without bound.

## Bench

```bench
id: learning-loop
title: The learning loop
fallback: A line starts in a bad place over a cloud of points; you step the learning loop or play it, watching the line move and the loss curve fall, with a slider for the learning rate.
```

**Try this**

1. Press **One step** several times and watch the line and loss.
2. Reset and play at learning rate 0.05.
3. Reset and raise the learning rate to 0.5.
4. Find the largest learning rate that still settles smoothly.

**What you should notice:** loss drops quickly at first and then slowly; too small a rate is slow, and too large a rate makes the loss bounce or explode.

## Where it appears in AI

* **Everything trained by gradients:** linear models, neural networks and transformers.
* **Variants:** stochastic gradient descent on mini-batches and Adam (see [[Stochastic Gradient Descent]] and [[Momentum and Adam]]).
* **Learning-rate schedules** shrink the step as training proceeds.

## Common pitfalls

* **Learning rate too large,** so the loss diverges.
* **Stopping too early** while the loss is still falling.
* **Watching only training loss;** also watch validation loss.
* **Assuming the loop finds the global best.** On bumpy landscapes it finds a nearby low point.

## Quick check

<details><summary>1. What does the learning rate control?</summary>
The size of each parameter update.
</details>

<details><summary>2. If the gradient of the loss with respect to w is positive, which way should w move?</summary>
Down (decrease), because increasing w would increase the loss.
</details>

<details><summary>3. Why does the loss fall fast and then slowly?</summary>
The gradient shrinks as you approach the bottom, so steps get smaller.
</details>

## Key terms

* **Gradient:** the direction of steepest increase of the loss.
* **Learning rate:** the step size of each update.
* **Epoch:** one pass through the training data.
* **Convergence:** the loss settling near its minimum.

## Related

[[Gradient Descent]] · [[Learning Rate]] · [[Loss Functions]] · [[Least Squares]] · [[Stochastic Gradient Descent]]
