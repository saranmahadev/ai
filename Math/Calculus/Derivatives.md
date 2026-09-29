The **derivative** tells you how fast a function's output is changing at one particular input. It is the mathematics of "which way is uphill, and how steeply?", and it is the tool that lets a model learn from its mistakes.

**You need:** [[Functions]] (a rule that turns an input into an output) and a feel for [[Limits]] (getting closer and closer to a value). This page gives the idea in plain words first.

## The question it answers

You are driving. Your position changes over time, and your speedometer tells you *how fast it is changing right now*. The speedometer is the derivative of position. Every derivative is a speedometer for some function: how fast does the output change when the input moves a tiny bit?

On a graph, that is the **slope of the curve at a point**: steep upward means large and positive, flat means zero, downhill means negative.

## Intuition: zoom in until it looks straight

A curve bends, so its slope keeps changing. But zoom in far enough on one point and any smooth curve looks like a straight line. The slope of that line is the derivative at that point.

To measure it, pick a second point a small distance **h** away and draw the line through both. That line is a **secant**. Its slope is easy to compute:

```text
secant slope = (f(x + h) − f(x)) / h        (rise over run)
```

Now shrink h. The second point slides towards the first, and the secant swings into the **tangent**, the line that just touches the curve. The value the secant slope settles towards is the derivative:

```text
f′(x) = lim (h → 0) of (f(x + h) − f(x)) / h
```

Other notations for the same thing: `df/dx` and `dy/dx`.

## A worked example: f(x) = x²

Let us find the slope of x² at any x.

```text
f(x + h) − f(x) = (x + h)² − x² = 2xh + h²
secant slope    = (2xh + h²) / h = 2x + h
```

As h shrinks to nothing, the leftover h vanishes and the slope becomes **2x**. So `f′(x) = 2x`.

Check at x = 1, where the answer should be 2:

| h | secant slope (2 + h) |
| --- | --- |
| 1 | 3 |
| 0.1 | 2.1 |
| 0.01 | 2.01 |

The secant slopes close in on 2, exactly as promised.

## What the sign tells you

* `f′(x) > 0`: the function is going **up** as x increases.
* `f′(x) < 0`: the function is going **down**.
* `f′(x) = 0`: the tangent is flat, which happens at a peak, a valley or a level stretch.

That last case is why derivatives matter for learning: to find the lowest point of a curve, look for where the slope is zero, or keep stepping downhill.

## Small steps, big idea

If you nudge x by a small amount Δ, the output changes by about the derivative times that nudge:

```text
f(x + Δ) ≈ f(x) + f′(x) · Δ
```

This "the curve is nearly a straight line up close" approximation is behind almost everything that follows in machine learning.

## Bench

```bench
id: derivative-tangent
title: From secant to tangent
fallback: A curve with a second point that slides towards the first. The secant slope approaches the true slope as the distance h shrinks, and a second plot shows the derivative at every x.
```

**Try this**

1. Choose **x²** and set the point to x = 1. Slide h down from its largest value. Compare the secant slope with `2 + h`. Does it match?
2. Move the point to x = 0. What is the true slope there, and what does the picture look like?
3. Choose **sin x**. Watch the right-hand plot as you move the point along the curve. Where is the slope zero? Where is it steepest?
4. Choose **|x|** and move to x = 0. Switch the second point between left and right. What do you see?

**What you should notice:** the right-hand plot is itself a function, the derivative function. For x² it is a straight line, 2x. The derivative is not one number; it is a rule that gives a slope at every input.

## A few derivatives to remember

| Function | Derivative |
| --- | --- |
| a constant, like 7 | 0 |
| xⁿ | n · xⁿ⁻¹ |
| eˣ | eˣ |
| sin x | cos x |
| ln x | 1 / x |

Two rules help you combine them. A constant factor stays: `(3x²)′ = 3 · 2x = 6x`. Derivatives of sums are sums of derivatives: `(x² + x³)′ = 2x + 3x²`. Product and chain rules come later.

## Where it appears in AI

Training a model means making its error, the **loss**, as small as possible. The loss depends on the model's adjustable numbers, its **weights**. The derivative of the loss with respect to a weight says which way to nudge that weight and how sensitive the loss is to it.

A tiny example: suppose the loss is `L(w) = (w − 3)²`, so `L′(w) = 2(w − 3)`. At w = 0 the slope is −6. That is strongly downhill going right, so we should increase w. With a step size of 0.1:

```text
w_new = w − 0.1 × L′(w) = 0 − 0.1 × (−6) = 0.6
```

Repeat, and w walks towards 3, where the slope is 0 and the loss is lowest. This is **gradient descent**, and it is how neural networks are trained. With many weights instead of one, the derivative becomes a [[Gradients]], and finding the best weights is [[Optimization]].

## Common pitfalls

* **A derivative is a function, not a single number.** "The derivative at x = 1" is one number; "the derivative" is the rule for all x.
* **h shrinks towards zero but is never zero.** You cannot divide by zero; the limit describes where the ratio is heading.
* **Zero slope does not always mean a minimum.** It could be a peak or a flat stretch. You have to look further.
* **Not every function has a slope everywhere.** A sharp corner, like |x| at 0, has different slopes on each side, so no derivative there.

## Quick check

<details><summary>1. What is the derivative of x³ at x = 2?</summary>
The derivative is 3x², so at x = 2 it is 3 × 4 = 12.
</details>

<details><summary>2. For f(x) = −x², is the function rising or falling at x = 1?</summary>
f′(x) = −2x, which is −2 at x = 1. It is negative, so the function is falling.
</details>

<details><summary>3. Why has |x| no derivative at 0?</summary>
The slope approaching from the left is −1 and from the right is +1. They disagree, so there is no single tangent line at that corner.
</details>

## Related

[[Functions]] · [[Limits]] · [[Partial Derivatives]] · [[Gradients]] · [[Optimization]]
