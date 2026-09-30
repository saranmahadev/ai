Vectors can be **added**, **subtracted** and **scaled**, all component by component. These three moves are the foundation of everything in linear algebra: every model computation is built from them.

**You need:** [[Scalars and Vectors]].

## The question it answers

"How do I combine vectors?" To average two houses, to move a data point, or to update a model's weights, you add and scale vectors.

## Intuition: arrows end to end

**Adding** vectors places one arrow's tail at the other's tip; the sum is the arrow from the start to the end. Equivalently, add matching components:

```text
(1, 2) + (3, 1) = (1 + 3, 2 + 1) = (4, 3)
```

**Subtracting** gives the arrow from one tip to the other: `b − a` points from `a` to `b`.

```text
(4, 3) − (1, 2) = (3, 1)
```

**Scaling** multiplies every component by a number, stretching or shrinking (and flipping for negatives):

```text
2 · (1, 2) = (2, 4)         −1 · (1, 2) = (−1, −2)       0.5 · (4, 6) = (2, 3)
```

## Rules

```text
a + b = b + a                       order does not matter
(a + b) + c = a + (b + c)
c (a + b) = c a + c b               scaling distributes over adding
```

Vectors must have the **same dimension** to be added. A related operation, **element-wise (Hadamard) product**, multiplies matching components: `(1, 2) ⊙ (3, 4) = (3, 8)`. It is different from the dot product ([[Dot Product]]).

## A worked example

Two houses `a = (90, 3, 12)` and `b = (120, 4, 5)`. Their average is a vector too:

```text
(a + b) / 2 = (210, 7, 17) / 2 = (105, 3.5, 8.5)
```

To move a data point `p = (2, 5)` by `(−1, 3)`: `p + (−1, 3) = (1, 8)`.

The **learning step** in model training is exactly this: `new weights = old weights − step × gradient`, a scaled vector subtracted from a vector. With `w = (0.5, −1)`, gradient `g = (2, −4)` and step `0.1`: `w − 0.1 g = (0.5 − 0.2, −1 + 0.4) = (0.3, −0.6)`.

## Bench

```bench
id: vector-ops
title: Add, subtract and scale arrows
fallback: Two arrows a and b can be dragged or set with sliders; the bench draws their sum, difference, and a scaled copy, with components listed.
```

**Try this**

1. Drag `a` and `b` and watch `a + b` complete the parallelogram.
2. Turn on the difference and see which way it points.
3. Scale `a` by 2, then by −1.
4. Make `a + b` equal the zero vector.

**What you should notice:** addition is arrows end to end, scaling stretches along the same line, and subtraction points from one tip to the other.

## Where it appears in AI

* **Gradient descent** subtracts a scaled gradient from the weights.
* **Embedding arithmetic:** directions such as "king − man + woman" are vector sums.
* **Averaging** examples or predictions is adding and scaling.
* **Residual connections** in networks add vectors.

## Common pitfalls

* **Adding vectors of different dimension.**
* **Confusing scaling with adding.** `2v` is not `v + 2`.
* **Forgetting to scale every component.**
* **Treating the element-wise product as the dot product.**

## Quick check

<details><summary>1. What is (3, −1) + (2, 5)?</summary>
(5, 4).
</details>

<details><summary>2. What is 3 · (1, −2)?</summary>
(3, −6).
</details>

<details><summary>3. What is (5, 5) − (2, 1)?</summary>
(3, 4).
</details>

## Key terms

* **Vector addition:** adding matching components.
* **Scalar multiplication:** multiplying every component by a number.
* **Difference vector:** the arrow from one point to another.
* **Element-wise product:** multiplying matching components.

## Related

[[Scalars and Vectors]] · [[Linear Combinations and Span]] · [[Dot Product]] · [[Gradient Descent]]
