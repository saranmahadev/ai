A **partial derivative** measures how a function of several variables changes when you nudge **one** variable and hold the others fixed. Models have millions of parameters, and each one gets its own partial derivative telling it which way to move.

**You need:** [[Derivatives]] and [[Derivative Rules]].

## The question it answers

"If I change just this one input, how does the output respond?" A house price depends on size and age together; the partial derivative with respect to size isolates the effect of size alone.

## Intuition: slice the surface

A function of two variables `f(x, y)` is a surface, like terrain. Walk along the `x` direction while keeping `y` fixed: you trace a curve, a slice of the surface. Its slope is the partial derivative with respect to `x`. Do the same in the `y` direction for the other one.

```text
∂f/∂x   treat y as a constant, differentiate with respect to x
∂f/∂y   treat x as a constant, differentiate with respect to y
```

The curly `∂` (say "partial") signals that other variables are being held still.

## A worked example

Let `f(x, y) = x² + 3xy`.

```text
∂f/∂x: treat y as a constant   →   2x + 3y
∂f/∂y: treat x as a constant   →   3x
```

At the point `(x, y) = (1, 2)`:

```text
∂f/∂x = 2·1 + 3·2 = 8        ∂f/∂y = 3·1 = 3
```

Meaning: at that point, increasing `x` by a small `ε` raises `f` by about `8ε`, and increasing `y` by `ε` raises it by about `3ε`. Check numerically: `f(1, 2) = 1 + 6 = 7`; `f(1.01, 2) = 1.0201 + 6.06 = 7.0801`, a rise of `0.0801 ≈ 8 × 0.01` ✓.

For a model with loss `L(w₁, w₂)`, the pair `(∂L/∂w₁, ∂L/∂w₂)` says how the loss responds to each weight separately.

## Bench

```bench
id: surface-slicer
title: Slice a surface
fallback: A shaded map of a two-variable function with a chosen point; a control picks whether to slice along x or y, and a side plot shows the slice curve and its slope, which is the partial derivative.
```

**Try this**

1. Move the point and read both partial derivatives.
2. Switch the slice direction and see how the curve changes.
3. Find a point where one partial derivative is zero and the other is not.
4. Find where both are zero.

**What you should notice:** each partial derivative is the ordinary slope of a one-variable slice of the surface.

## Where it appears in AI

* **Training** computes the partial derivative of the loss for every parameter.
* **Feature sensitivity:** how a prediction responds to one input.
* **The gradient** stacks all partial derivatives into one vector (see [[Gradients]]).

## Common pitfalls

* **Forgetting to hold the others constant.**
* **Differentiating `y` too** while taking `∂/∂x`.
* **Assuming variables act separately** when they interact (the `3xy` term couples them).
* **Mixing up `∂` and `d`.**

## Quick check

<details><summary>1. For f = x²y, what is ∂f/∂x?</summary>
2xy.
</details>

<details><summary>2. For f = 5x + 2y², what is ∂f/∂y?</summary>
4y.
</details>

<details><summary>3. What does ∂f/∂x mean in words?</summary>
The rate of change of f as x changes, with the other variables held fixed.
</details>

## Key terms

* **Partial derivative:** the derivative in one variable, others held fixed.
* **Slice:** a one-variable cross-section of a surface.
* **Surface:** the graph of a two-variable function.
* **Holding fixed:** treating other variables as constants.

## Related

[[Derivatives]] · [[Gradients]] · [[Jacobian]] · [[Hessian]] · [[Gradient Descent]]
