The **chain rule** finds the derivative of a function built from other functions: `d/dx f(g(x)) = f′(g(x)) · g′(x)`. Rates multiply along the chain, like gears turning one another. It is the rule behind backpropagation, since a network is a long chain of functions.

**You need:** [[Derivative Rules]] and [[Composition and Inverses]].

## The question it answers

"If `y` depends on `u`, and `u` depends on `x`, how does `y` respond to `x`?" A network's loss depends on its output, which depends on the layer before it, which depends on the weights.

## Intuition: gears

Gear A turns 3 times for each turn of a handle; gear B turns 2 times for each turn of gear A. One turn of the handle turns B `3 × 2 = 6` times. Rates of change along a chain **multiply**:

```text
dy/dx = (dy/du) · (du/dx)
```

## The rule

```text
h(x) = f(g(x))       h′(x) = f′(g(x)) · g′(x)
                             ↑ outer derivative,        ↑ inner derivative
                               evaluated at the inner value
```

Steps: name the inner function `u = g(x)`, differentiate the outer function with respect to `u`, differentiate the inner one with respect to `x`, and multiply.

## A worked example

Differentiate `h(x) = (3x + 1)²`. Inner `u = 3x + 1` (so `du/dx = 3`), outer `u²` (so `d/du = 2u`):

```text
h′(x) = 2u · 3 = 2(3x + 1) · 3 = 6(3x + 1) = 18x + 6
at x = 1:  18 + 6 = 24
```

Check by expanding: `(3x + 1)² = 9x² + 6x + 1`, whose derivative is `18x + 6` ✓.

Another: `sin(x²)`. Inner `x²` (derivative `2x`), outer `sin` (derivative `cos`):

```text
d/dx sin(x²) = cos(x²) · 2x
at x = 1:  cos 1 · 2 = 0.5403 × 2 = 1.0806
```

And `e^(2x)`: outer `eᵘ`, inner `2x`, so the derivative is `e^(2x) · 2`.

For longer chains, keep multiplying: `f(g(h(x)))` has derivative `f′(g(h(x))) · g′(h(x)) · h′(x)`.

## Bench

```bench
id: gear-chain
title: Rates multiply along a chain
fallback: Choose an inner and an outer function and an input; the bench shows the value at each stage, the derivative of each, their product, and a numerical check of the total.
```

**Try this**

1. Pick inner 3x + 1 and outer u², and read the two derivatives.
2. Compare their product with the numerical derivative of the whole chain.
3. Change the input: which derivative changes?
4. Try sin as the outer function.

**What you should notice:** the outer derivative is evaluated at the *inner value*, and the two factors multiply to give the chain's slope.

## Where it appears in AI

* **Backpropagation** applies the chain rule layer by layer (see [[Automatic Differentiation]]).
* **Vanishing gradients:** a product of many small factors (like sigmoid slopes) shrinks toward zero.
* **Exploding gradients:** a product of large factors grows quickly.

## Common pitfalls

* **Forgetting the inner derivative** (a very common slip).
* **Evaluating the outer derivative at `x` instead of `g(x)`.**
* **Adding the two derivatives** instead of multiplying.
* **Applying it to a product** (that needs the product rule as well).

## Quick check

<details><summary>1. Differentiate (2x + 5)³.</summary>
3(2x + 5)² · 2 = 6(2x + 5)².
</details>

<details><summary>2. Differentiate e^(x²).</summary>
e^(x²) · 2x.
</details>

<details><summary>3. If dy/du = 4 and du/dx = 0.5, what is dy/dx?</summary>
2.
</details>

## Key terms

* **Chain rule:** the derivative of a composition is a product of derivatives.
* **Inner / outer function:** the function applied first / last.
* **Composite function:** a function built by chaining others.
* **Backpropagation:** the chain rule applied through a network.

## Related

[[Derivative Rules]] · [[Composition and Inverses]] · [[Derivatives of Exp, Log and Sigmoid]] · [[Automatic Differentiation]] · [[Backpropagation by Hand]]
