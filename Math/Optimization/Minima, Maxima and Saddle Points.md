A **minimum** is a low point of a function, a **maximum** a high point, and a **saddle point** is flat but rises in some directions and falls in others. Flat spots, where the derivative is zero, are candidates for all three, and telling them apart is a job for the second derivative.

**You need:** [[Derivatives]], [[Higher Derivatives and Curvature]] and [[Hessian]].

## The question it answers

"Where is the best value, and how do I know a flat spot really is the bottom?" Training aims for a minimum of the loss, but flat spots come in several kinds.

## Intuition: hills, valleys and mountain passes

Walk over a landscape. At the bottom of a valley every direction climbs (a **minimum**); on a summit every direction falls (a **maximum**); on a mountain pass you climb one way and descend the other (a **saddle**). All three have zero slope.

* **Local** minimum: the lowest point in its neighbourhood.
* **Global** minimum: the lowest point everywhere.

A landscape can have many local minima, and only one (or a few) of them is global.

## Finding and classifying them

**Step 1:** solve `f′(x) = 0` (for many variables, `∇f = 0`). **Step 2:** look at the curvature.

```text
f″(x) > 0    local minimum
f″(x) < 0    local maximum
f″(x) = 0    inconclusive (may be an inflection, like x³ at 0)
many variables: eigenvalues of the Hessian
   all > 0 → minimum, all < 0 → maximum, mixed signs → saddle
```

## A worked example

Take `f(x) = x⁴ − 2x²`.

```text
f′(x) = 4x³ − 4x = 4x(x² − 1) = 0   →   x = −1, 0, 1
f″(x) = 12x² − 4
f″(0)  = −4  → local maximum,   f(0)  = 0
f″(±1) =  8  → local minima,    f(±1) = −1     (both are global minima)
```

For `f(x) = x³`: `f′(0) = 0` and `f″(0) = 0`, and the curve keeps rising through zero: a flat **inflection**, neither minimum nor maximum. In two variables `f = x² − y²` has a saddle at the origin (Hessian eigenvalues 2 and −2).

In the huge loss landscapes of neural networks, saddle points are far more common than bad local minima, because every direction would have to curve upward for a true minimum.

## Bench

```bench
id: critical-points
title: Find and classify the flat spots
fallback: Choose a curve; the bench marks where the slope is zero, labels each flat spot as a minimum, maximum or inflection, notes which is the global minimum, and lets you slide a marker to read the slope and curvature.
```

**Try this**

1. On the quartic, find the two valleys and the hill between them.
2. Compare their heights: which is the global minimum?
3. Switch to x³ and look at the flat spot at zero.
4. Slide the marker to a valley bottom and read the curvature.

**What you should notice:** every flat spot has zero slope, but only the curvature (and the shape around it) tells you what kind it is.

## Where it appears in AI

* **Training** searches for a (hopefully good) minimum of the loss.
* **Saddle points** slow optimisers with their long, flat stretches.
* **Local minima** may be acceptable if their loss is low enough.

## Common pitfalls

* **Assuming zero slope means minimum.**
* **Confusing local with global.**
* **Trusting `f″ = 0` as "flat forever".** Check nearby.
* **Overlooking the boundary** where the function may have its smallest value.

## Quick check

<details><summary>1. f(x) = x² − 4x. Where is the minimum?</summary>
f′ = 2x − 4 = 0 at x = 2, and f″ = 2 > 0, so it is a minimum (f = −4).
</details>

<details><summary>2. Hessian eigenvalues 5 and −2: what kind of point?</summary>
A saddle.
</details>

<details><summary>3. Is a local minimum always the global minimum?</summary>
No.
</details>

## Key terms

* **Critical point:** where the gradient is zero.
* **Local / global minimum:** lowest nearby / lowest overall.
* **Saddle point:** a flat spot that is a minimum in some directions and a maximum in others.
* **Inflection point:** where curvature changes sign.

## Related

[[Higher Derivatives and Curvature]] · [[Hessian]] · [[Convex vs Non-Convex]] · [[Gradient Descent]]
