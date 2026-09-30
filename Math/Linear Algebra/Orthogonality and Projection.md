Two vectors are **orthogonal** when their dot product is zero (they meet at a right angle), and the **projection** of one vector onto another is its shadow: the closest point to it along the other's direction. Projection is the geometric core of fitting and of dimensionality reduction.

**You need:** [[Dot Product]] and [[Norms and Distance]].

## The question it answers

"How much of this vector lies along that direction, and what is left over?" Splitting a vector into a part along a line and a part at right angles to it is how models separate signal from residual.

## Intuition: the shadow

Shine a light straight down onto the line through `b`. The shadow of `a` on that line is the **projection** of `a` onto `b`. What is left, `a` minus its shadow, sticks out at a right angle: it is the **residual**.

```text
proj_b(a) = ( (a · b) / (b · b) ) · b
residual  = a − proj_b(a)              orthogonal to b:  residual · b = 0
```

The scalar `(a · b) / (b · b)` says how many copies of `b` fit in the shadow. If `b` has length 1 the formula simplifies to `(a · b) b`.

## Orthogonal sets

Vectors that are pairwise orthogonal and have length 1 form an **orthonormal** set. These are the ideal coordinate axes: coordinates are found just by dot products, with no equations to solve. A matrix whose columns are orthonormal is a rotation (or reflection) and its inverse is simply its transpose.

## A worked example

Project `a = (3, 4)` onto `b = (1, 0)`:

```text
a · b = 3      b · b = 1       proj = 3 · (1, 0) = (3, 0)
residual = (3, 4) − (3, 0) = (0, 4)         (0, 4) · (1, 0) = 0 ✓
```

Project `a = (3, 4)` onto `b = (1, 1)`:

```text
a · b = 7      b · b = 2       proj = 3.5 · (1, 1) = (3.5, 3.5)
residual = (3, 4) − (3.5, 3.5) = (−0.5, 0.5)     residual · b = −0.5 + 0.5 = 0 ✓
```

The Pythagorean theorem holds: `‖a‖² = ‖proj‖² + ‖residual‖²`, here `25 = 24.5 + 0.5` ✓.

## Bench

```bench
id: projection-shadow
title: Project one vector onto another
fallback: Two draggable vectors a and b show the projection of a onto the line through b and the residual, with the dot product, the projection length and a check that the residual is at a right angle.
```

**Try this**

1. Drag `a` so it is perpendicular to `b`. What is the projection?
2. Make `a` parallel to `b`. What is the residual?
3. Rotate `a` around and watch the projection's length.
4. Check that residual · b stays at zero.

**What you should notice:** the shadow shrinks to zero at a right angle, and the leftover part always meets `b` at exactly 90°.

## Where it appears in AI

* **Least squares** is a projection onto the span of the features (see [[Least Squares]]).
* **PCA** projects data onto the directions of greatest variance (see [[SVD and PCA]]).
* **Gram–Schmidt** builds orthogonal directions.
* **Residual analysis:** what a model has not explained is orthogonal to what it has.

## Common pitfalls

* **Dividing by `‖b‖` instead of `b · b`.** Check the formula.
* **Projecting onto the zero vector.**
* **Assuming orthogonal means unrelated.** It means no *linear* overlap.
* **Confusing the projection with the residual.**

## Quick check

<details><summary>1. What is the projection of (2, 5) onto (0, 1)?</summary>
(0, 5).
</details>

<details><summary>2. Are (1, 2, 2) and (2, 1, −2) orthogonal?</summary>
Yes: 2 + 2 − 4 = 0.
</details>

<details><summary>3. What do you get from a − proj_b(a)?</summary>
The residual, perpendicular to b.
</details>

## Key terms

* **Orthogonal:** perpendicular, dot product zero.
* **Projection:** the shadow of one vector on another.
* **Residual:** the part left after projecting.
* **Orthonormal:** orthogonal and of length 1.

## Related

[[Dot Product]] · [[Norms and Distance]] · [[Least Squares]] · [[SVD and PCA]] · [[Lines, Planes and Circles]]
