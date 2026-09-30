The **dot product** multiplies two vectors into one number by multiplying matching components and adding: `a · b = a₁b₁ + a₂b₂ + …`. That number measures how much the two vectors *agree*: large and positive when they point the same way, zero when they are perpendicular, negative when they oppose.

**You need:** [[Vector Operations]], [[Norms and Distance]] and [[Sums and Products]].

## The question it answers

"How aligned are these two vectors?" A model's core step, a weighted sum of inputs, is a dot product between the inputs and the weights, so this one operation is done billions of times when a network runs.

## Intuition: how much do they line up?

Think of pushing a box with force `a` while it moves in direction `b`. Only the part of the force along the motion does useful work. The dot product captures exactly that overlap: it is the length of `a`'s shadow on `b`, times the length of `b`.

## Two formulas, one number

```text
algebraic:  a · b = a₁b₁ + a₂b₂ + … + aₙbₙ
geometric:  a · b = ‖a‖ ‖b‖ cos θ          θ = the angle between them
```

The geometric form explains the signs: `cos θ` is positive for angles under 90°, zero at 90°, negative beyond.

```text
a · b > 0    pointing roughly the same way
a · b = 0    perpendicular (orthogonal)
a · b < 0    pointing roughly opposite ways
a · a = ‖a‖²   a vector dotted with itself is its squared length
```

## A worked example

```text
a = (2, 3)      b = (4, −1)
a · b = 2·4 + 3·(−1) = 8 − 3 = 5
```

The lengths are `‖a‖ = √13 ≈ 3.606` and `‖b‖ = √17 ≈ 4.123`, so `cos θ = 5 / (3.606 × 4.123) ≈ 0.336`, an angle of about 70.4°.

Perpendicular check: `(1, 2) · (2, −1) = 2 − 2 = 0`, so they are orthogonal.

A weighted sum is a dot product: with weights `w = (0.5, 2, −1)` and inputs `x = (10, 3, 4)`:

```text
w · x = 0.5·10 + 2·3 + (−1)·4 = 5 + 6 − 4 = 7
```

## Bench

```bench
id: dot-product
title: Dot product playground
fallback: Two vectors can be dragged or set with sliders; the bench shows their dot product, the angle between them, its cosine and the shadow of one on the other.
```

**Try this**

1. Press "Perpendicular". What is the dot product?
2. Press "Same direction", then "Opposite". How does the sign change?
3. Keep the angle fixed and lengthen one vector. What happens to the dot product?
4. Press "Unit length" and compare the dot product with the cosine.

**What you should notice:** the dot product depends on both lengths and the angle, and it is zero exactly at a right angle.

## Where it appears in AI

* **Every neuron** computes a dot product of inputs and weights, plus a bias.
* **Matrix multiplication** is a grid of dot products (see [[Matrix Multiplication]]).
* **Attention** scores compare a query with keys by dot product (see [[Attention as Dot Products]]).
* **Similarity:** normalised, it becomes cosine similarity (see [[Cosine Similarity]]).

## Common pitfalls

* **Expecting a vector back.** The dot product is a single number.
* **Mismatched dimensions.** Both vectors need the same length.
* **Reading the value as an angle.** It also depends on lengths.
* **Confusing it with the element-wise product,** which keeps a list.

## Quick check

<details><summary>1. What is (1, 2, 3) · (4, 5, 6)?</summary>
4 + 10 + 18 = 32.
</details>

<details><summary>2. If a · b = 0 and neither is the zero vector, what is the angle?</summary>
90°.
</details>

<details><summary>3. What is (3, 4) · (3, 4)?</summary>
25, the squared length.
</details>

## Key terms

* **Dot product:** the sum of products of matching components.
* **Orthogonal:** perpendicular, with dot product zero.
* **Projection:** the shadow of one vector on another.
* **Weighted sum:** a dot product of weights and inputs.

## Related

[[Vector Operations]] · [[Norms and Distance]] · [[Cosine Similarity]] · [[Matrix Multiplication]] · [[Orthogonality and Projection]]
