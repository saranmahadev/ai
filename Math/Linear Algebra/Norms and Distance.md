A **norm** measures the size of a vector, and the distance between two vectors is the norm of their difference. Different norms (L1, L2, L∞) measure "size" differently, and choosing between them changes how models behave.

**You need:** [[Scalars and Vectors]], [[Vector Operations]] and [[Coordinates and Distance]].

## The question it answers

"How big is this vector, and how far apart are these two?" Prediction error, regularisation and similarity search all rely on a chosen way of measuring size.

## Intuition: different rulers

For a vector `v = (3, 4)`:

```text
L2 norm (Euclidean):  ‖v‖₂ = √(3² + 4²) = 5           straight-line length
L1 norm (Manhattan):  ‖v‖₁ = |3| + |4| = 7             sum of absolute values
L∞ norm (maximum):    ‖v‖∞ = max(|3|, |4|) = 4         largest component
```

The **unit ball** of each norm, all vectors of size 1, has a different shape in the plane: a circle for L2, a diamond for L1, a square for L∞. The general formula covers them all: `‖v‖ₚ = (Σ |vᵢ|ᵖ)^(1/p)`.

## Distance and unit vectors

```text
distance(a, b) = ‖a − b‖
unit vector:     v / ‖v‖        (same direction, length 1)
```

For `v = (3, 4)`, the unit vector is `(3, 4) / 5 = (0.6, 0.8)`, and its length is `√(0.36 + 0.64) = 1` ✓.

Norms obey a few natural rules: a norm is never negative and is zero only for the zero vector, `‖c v‖ = |c| ‖v‖`, and the **triangle inequality** `‖a + b‖ ≤ ‖a‖ + ‖b‖` (a detour is never shorter).

## A worked example

Two predictions `a = (2, 5)` and truth `b = (4, 1)`. The difference is `a − b = (−2, 4)`.

```text
L2 distance: √(4 + 16) = √20 ≈ 4.47
L1 distance: 2 + 4 = 6
L∞ distance: 4
```

L2 punishes one large miss more than several small ones (squares), while L1 treats every unit of miss the same. This is why squared error and absolute error train models differently (see [[Loss Functions]]).

## Bench

```bench
id: norm-shapes
title: Three ways to measure size
fallback: Drag a vector on a grid to see its L1, L2 and L-infinity norms, with the unit circle of each norm drawn as a diamond, circle or square.
```

**Try this**

1. Drag the vector to (3, 4) and read the three norms.
2. Move along an axis: which norms agree?
3. Move along the diagonal: which norm is the largest?
4. Switch on each unit ball and see which vectors have size 1.

**What you should notice:** all norms agree along an axis and differ on a diagonal, and each norm has its own "circle".

## Where it appears in AI

* **Loss functions:** L2 (mean squared error) and L1 (mean absolute error).
* **Regularisation:** L1 penalties push weights toward exactly zero, L2 penalties shrink them smoothly (see [[Regularization as a Constraint]]).
* **Nearest-neighbour search** uses a norm to define "nearest".
* **Gradient clipping** limits a gradient's norm.

## Common pitfalls

* **Comparing norms of different kinds.** L1 and L2 of the same vector differ.
* **Forgetting the square root** in L2.
* **Normalising the zero vector.** It has no direction.
* **Ignoring feature scale** when using distance.

## Quick check

<details><summary>1. What are the L1 and L2 norms of (−6, 8)?</summary>
14 and 10.
</details>

<details><summary>2. What is the unit vector for (0, 5)?</summary>
(0, 1).
</details>

<details><summary>3. What is the L∞ norm of (2, −7, 4)?</summary>
7.
</details>

## Key terms

* **Norm:** a measure of a vector's size.
* **L1 / L2 / L∞:** sum of absolute values, Euclidean length, largest component.
* **Unit vector:** a vector of length 1.
* **Triangle inequality:** `‖a + b‖ ≤ ‖a‖ + ‖b‖`.

## Related

[[Coordinates and Distance]] · [[Dot Product]] · [[Cosine Similarity]] · [[Loss Functions]] · [[Regularization as a Constraint]]
