A **polynomial** is a sum of powers of `x` with coefficients: `3x³ − 2x + 5`. The simplest curved one is the **quadratic**, `ax² + bx + c`, which draws a parabola. Its **roots**, the inputs where it equals zero, come from a formula you can always use.

**You need:** [[Graphs and Transformations]], [[Linear Functions]] and [[Exponents and Roots]].

## The question it answers

"How do I describe a curve with a bend, and where does it cross zero?" Loss surfaces near a minimum look like parabolas, so this shape returns throughout [[Optimization]].

## Intuition

A line has no bend. Add an `x²` term and the graph curves into a bowl (if `a > 0`) or a hill (if `a < 0`). Add higher powers and it can wiggle more: a polynomial of degree `n` can turn at most `n − 1` times.

## Quadratics: the toolkit

```text
f(x) = a x² + b x + c

vertex (tip):     x = −b / (2a)
roots:            x = (−b ± √(b² − 4ac)) / (2a)
discriminant:     D = b² − 4ac
```

The discriminant tells you how many real roots exist:

```text
D > 0   two roots          (the curve crosses the axis twice)
D = 0   one root           (it just touches the axis)
D < 0   no real roots      (it never reaches the axis)
```

## A worked example

Solve `x² − 5x + 6 = 0`. Here `a = 1`, `b = −5`, `c = 6`.

```text
D = (−5)² − 4·1·6 = 25 − 24 = 1
x = (5 ± √1) / 2 = (5 ± 1) / 2   →   x = 3 or x = 2
```

Check by factoring: `(x − 2)(x − 3) = x² − 5x + 6` ✓.

The vertex is at `x = 5/2 = 2.5`, where `f(2.5) = 6.25 − 12.5 + 6 = −0.25`. So the lowest point is `(2.5, −0.25)`, halfway between the roots.

## Beyond quadratics

Higher-degree polynomials fit more complicated curves, and a polynomial of high degree can pass through many points exactly. That flexibility is a warning as well as a feature: it can also chase noise (see [[Overfitting in Statistics]]).

## Bench

```bench
id: parabola-roots
title: Parabola, vertex and roots
fallback: Sliders for a, b and c draw a parabola with its vertex and roots marked, along with the discriminant and the quadratic-formula steps.
```

**Try this**

1. Move `c` and watch the roots slide together and vanish.
2. Find a setting where the discriminant is exactly 0.
3. Make `a` negative.
4. Try `a = 1, b = −5, c = 6` and check the roots.

**What you should notice:** the roots and vertex are all controlled by the same three numbers, and the discriminant tells you at a glance whether the curve reaches zero.

## Where it appears in AI

* **Quadratic loss** (squared error) is a parabola in each parameter.
* **Polynomial features** let a linear model fit curves.
* **Second-order methods** approximate a loss by a quadratic bowl (see [[Hessian]]).

## Common pitfalls

* **Dropping the ± in the formula.** There are usually two roots.
* **Sign errors with `b`.** It enters as `−b`.
* **Assuming every quadratic has real roots.** Check `D`.
* **Thinking higher degree means better.** Extra bends can fit noise.

## Quick check

<details><summary>1. How many real roots does x² + 1 have?</summary>
None: D = 0 − 4 = −4.
</details>

<details><summary>2. Where is the vertex of x² − 4x + 1?</summary>
x = −(−4)/(2·1) = 2, and f(2) = −3.
</details>

<details><summary>3. Solve x² − 9 = 0.</summary>
x = 3 or x = −3.
</details>

## Key terms

* **Polynomial:** a sum of powers of x with coefficients.
* **Quadratic:** a degree-2 polynomial, `ax² + bx + c`.
* **Root:** an input where the function is zero.
* **Discriminant:** `b² − 4ac`, which counts the real roots.

## Related

[[Graphs and Transformations]] · [[Linear Functions]] · [[Minima, Maxima and Saddle Points]] · [[Taylor Approximation]] · [[Hessian]]
