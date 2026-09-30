The **second derivative** is the derivative of the derivative: it says how the slope itself is changing. Positive means the curve bends upward like a bowl, negative means it bends downward like a hill. It tells you whether a flat spot is a minimum or a maximum.

**You need:** [[Derivatives]] and [[Derivative Rules]].

## The question it answers

"Is this flat spot the bottom of a valley, the top of a hill, or neither?" The first derivative finds the flat spots; the second decides what they are.

## Intuition: acceleration of the slope

If position is `s(t)`, velocity is `s′(t)` and acceleration is `s″(t)`: how fast the velocity changes. For a curve, the second derivative `f″(x)` measures **curvature**:

```text
f″(x) > 0     concave up   (bowl, slope increasing)
f″(x) < 0     concave down (hill, slope decreasing)
f″(x) = 0     no bend at that point (possibly a change of bend)
```

## The second-derivative test

At a point where `f′(x) = 0` (flat):

```text
f″ > 0   local minimum          f″ < 0   local maximum
f″ = 0   inconclusive
```

## A worked example

Let `f(x) = x³ − 3x`.

```text
f′(x) = 3x² − 3 = 0    →   x = 1  or  x = −1
f″(x) = 6x
f″(1)  = 6  > 0   →   local minimum,   f(1)  = 1 − 3 = −2
f″(−1) = −6 < 0   →   local maximum,   f(−1) = −1 + 3 = 2
```

Between those points the curve bends upward for `x > 0` (since `f″ = 6x > 0`) and downward for `x < 0`.

For `f(x) = x²`: `f′ = 2x`, `f″ = 2`, always positive: a perfect bowl with one minimum at 0. Large curvature means a sharply curved bowl; small curvature means a wide, flat one. Optimisers care: high curvature means steps must be small (see [[Learning Rate]]).

Higher derivatives (`f‴`, and so on) feed [[Taylor Approximation]].

## Bench

```bench
id: curvature-bender
title: Slope, curvature and flat spots
fallback: Choose a function and slide an input; the bench shows the value, slope and curvature there, marks flat spots, and says whether a flat spot is a minimum or maximum.
```

**Try this**

1. On x³ − 3x, slide to the flat spots and read the curvature's sign.
2. Compare a narrow bowl (2x²) with a wide one (0.5x²).
3. Slide where the curvature is zero.
4. Try sin x and follow the curvature.

**What you should notice:** a flat spot with positive curvature is the bottom of a valley, negative is the top of a hill, and bigger curvature means a tighter bend.

## Where it appears in AI

* **Loss surfaces:** curvature shows how sharp a minimum is (see [[Hessian]]).
* **Learning rates** must be small where curvature is large.
* **Second-order optimisers** use curvature to take smarter steps.

## Common pitfalls

* **Concluding "minimum" from `f′ = 0` alone.** It could be a maximum or saddle.
* **Confusing `f″(x)` with `(f′(x))²`.**
* **Ignoring that `f″ = 0` is inconclusive.**
* **Thinking curvature is the slope.**

## Quick check

<details><summary>1. What is the second derivative of x⁴?</summary>
12x².
</details>

<details><summary>2. If f′(2) = 0 and f″(2) = −3, what is at x = 2?</summary>
A local maximum.
</details>

<details><summary>3. Is x² concave up or down?</summary>
Up (f″ = 2 > 0).
</details>

## Key terms

* **Second derivative:** the derivative of the derivative.
* **Concave up / down:** curving like a bowl / a hill.
* **Curvature:** how quickly the slope changes.
* **Inflection point:** where the bend changes direction.

## Related

[[Derivatives]] · [[Taylor Approximation]] · [[Hessian]] · [[Minima, Maxima and Saddle Points]] · [[Learning Rate]]
