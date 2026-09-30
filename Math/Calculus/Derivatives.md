The **derivative** tells you how fast a function's output is changing at one particular input: the slope of the curve at a point. It is the mathematics of "which way is uphill, and how steeply?", and it is the tool that lets a model learn from its mistakes.

**You need:** [[Rate of Change]], [[Limits]] and [[Functions]].

## The question it answers

You are driving. Your position changes over time, and the speedometer tells you *how fast it is changing right now*. The speedometer is the derivative of position. Every derivative is a speedometer for some function.

On a graph, it is the **slope of the curve at a point**: steep upward means large and positive, flat means zero, downhill means negative.

## Intuition: zoom in until it looks straight

A curve bends, but zoom in far enough on one point and any smooth curve looks like a straight line. The slope of that line is the derivative. To measure it, pick a second point a small distance `h` away and take the secant slope; then let `h` shrink.

```text
secant slope = (f(x + h) − f(x)) / h
```

## Definition and notation

The derivative is the limit of the secant slope as `h → 0`:

```text
f′(x) = lim (h → 0) (f(x + h) − f(x)) / h
```

Common ways to write it: `f′(x)`, `df/dx`, or `d/dx f(x)`. The tangent line at `x = a` is `y = f(a) + f′(a)(x − a)`.

## A worked example

Take `f(x) = x²` and find the slope at `x = 3`:

```text
f(3 + h) = 9 + 6h + h²       f(3) = 9
secant slope = (6h + h²) / h = 6 + h      →  6 as h → 0
```

So `f′(3) = 6`. In general `f′(x) = 2x`. The tangent line at `x = 3` passes through `(3, 9)` with slope 6: `y = 9 + 6(x − 3) = 6x − 9`.

At `x = 0` the slope is `2 × 0 = 0`: the bottom of the bowl is flat. Negative `x` gives negative slopes: the curve falls to the left of the bottom.

## Reading a derivative

```text
f′(x) > 0     the function is increasing
f′(x) < 0     the function is decreasing
f′(x) = 0     a flat spot: possibly a minimum, maximum or saddle
```

That last line is why derivatives matter for training: minimising a loss means finding where its derivative is zero.

## Bench

```bench
id: derivative-tangent
title: From secant to tangent
fallback: A curve with two points on it; a slider slides the second point toward the first, and the secant line turns into the tangent line as its slope settles on the derivative.
```

**Try this**

1. Slide the second point toward the first and watch the secant slope settle.
2. Move the point to where the curve is flat. What is the slope?
3. Try a different function and compare the derivative curve.
4. Find where the derivative is zero.

**What you should notice:** the secant slope approaches one number as the gap shrinks, and it is zero exactly at the flat spots.

## Where it appears in AI

* **Gradient descent** steps in the direction the derivative says the loss falls (see [[Gradient Descent]]).
* **Backpropagation** is derivatives computed layer by layer (see [[Automatic Differentiation]]).
* **Sensitivity analysis:** how much an output responds to an input.

## Common pitfalls

* **Confusing `f′(a)` with the function value** `f(a)`.
* **Dividing by zero.** The limit avoids setting `h = 0`.
* **Assuming a derivative exists everywhere.** Corners have none.
* **Reading a derivative as "how big"** rather than "how fast changing".

## Quick check

<details><summary>1. What is the derivative of x² at x = 5?</summary>
10.
</details>

<details><summary>2. If f′(x) is negative, what is the function doing?</summary>
Decreasing.
</details>

<details><summary>3. What is the slope at the bottom of a smooth bowl?</summary>
Zero.
</details>

## Key terms

* **Derivative:** the instantaneous rate of change; the slope of the tangent.
* **Tangent line:** the line that just touches a curve at a point.
* **Secant line:** a line through two points of a curve.
* **Critical point:** a point where the derivative is zero.

## Related

[[Rate of Change]] · [[Limits]] · [[Derivative Rules]] · [[Gradient Descent]] · [[Minima, Maxima and Saddle Points]]
