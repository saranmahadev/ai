**Gradient descent** finds a minimum by repeatedly stepping downhill: compute the gradient (the uphill direction), move a little the opposite way, and repeat. It is the engine that trains almost every model in machine learning.

**You need:** [[Gradients]], [[Vector Operations]] and [[Loss Functions]].

## The question it answers

"How do I find good parameter values when I cannot solve for them directly?" You cannot see the whole loss landscape, but you can always feel the slope under your feet.

## Intuition: walking down a foggy hill

Stand on a hill in thick fog. You cannot see the valley, but you can feel which way the ground slopes. Take a small step downhill, feel again, step again. Eventually you reach flat ground.

## The algorithm

```text
repeat:
    g = gradient of the loss at the current parameters w
    w = w − η · g                       η (eta) is the learning rate: the step size
```

Stop when the gradient is tiny, the loss stops improving, or a step limit is reached. The step `−η g` points opposite the gradient and gets shorter as the ground flattens.

## A worked example

Minimise `f(w) = w²` (gradient `2w`), starting at `w = 4` with `η = 0.1`:

```text
step 0:  w = 4          f = 16        gradient 8
step 1:  w = 4 − 0.8    = 3.2         f = 10.24
step 2:  w = 3.2 − 0.64 = 2.56        f = 6.5536
step 3:  w = 2.56 − 0.512 = 2.048     f = 4.194
```

Each step multiplies `w` by `1 − 2η = 0.8`, so `w` shrinks toward the minimum at 0.

In two variables, `f(x, y) = x² + y²` from `(3, 4)` with `η = 0.1` gives `(3, 4) − 0.1·(6, 8) = (2.4, 3.2)`, and the loss drops from 25 to 16 (see [[Gradients]]).

For a model, the parameters `w` are a vector with millions of entries and `f` is the average loss over the data, but the update is exactly the same line.

## Bench

```bench
id: descent-path
title: Roll downhill
fallback: A contour map of a bowl with a starting point; a stepper takes gradient-descent steps with an adjustable learning rate, drawing the path and showing the loss at each step.
```

**Try this**

1. Press Step repeatedly and watch the path curve toward the minimum.
2. Change the start point and compare paths.
3. Make the bowl elongated and see the path zig-zag.
4. Raise the learning rate until steps overshoot.

**What you should notice:** steps shrink as the slope flattens, the path crosses contour lines at right angles, and a stretched bowl makes the walk zig-zag.

## Where it appears in AI

* **Training every neural network** uses a form of gradient descent.
* **Linear and logistic regression** can be trained by it.
* **Variants** such as SGD, momentum and Adam build on this loop (see [[Stochastic Gradient Descent]], [[Momentum and Adam]]).

## Common pitfalls

* **Stepping uphill** by using `+g`.
* **A learning rate too large** overshoots or diverges (see [[Learning Rate]]).
* **Stopping too early** on a flat plateau.
* **Assuming it finds the global minimum.** It finds a nearby low point.

## Quick check

<details><summary>1. What is one step from w = 5 with gradient 2 and η = 0.5?</summary>
5 − 0.5·2 = 4.
</details>

<details><summary>2. Which direction does gradient descent move?</summary>
Opposite the gradient (downhill).
</details>

<details><summary>3. What does η control?</summary>
The step size.
</details>

## Key terms

* **Gradient descent:** repeatedly stepping against the gradient.
* **Learning rate (η):** the step-size multiplier.
* **Iteration / step:** one update of the parameters.
* **Convergence:** settling near a minimum.

## Related

[[Gradients]] · [[Learning Rate]] · [[Stochastic Gradient Descent]] · [[Momentum and Adam]] · [[Linear Regression End to End]]
