Vectors are **linearly independent** if none of them can be built from the others, and a **basis** is a smallest set of independent vectors that spans a space. A basis is a coordinate system: every point in the space has exactly one way of being written with it.

**You need:** [[Linear Combinations and Span]].

## The question it answers

"Which of my vectors are redundant, and what is the minimum set that describes everything?" Features that duplicate each other add cost but no new information.

## Intuition: no spare parts

Two vectors on the same line are **dependent**: one is a multiple of the other, so one is a spare. Three vectors in a plane are always dependent: the third can be made from the first two. Independent means every vector brings something new.

```text
independent:  c₁v₁ + c₂v₂ + … = 0   only when every cᵢ = 0
dependent:    some non-trivial mix of them adds up to zero
```

## Basis and dimension

A **basis** of a space is a set of independent vectors whose span is the whole space. The number of vectors in a basis is the space's **dimension**: a plane has dimension 2, 3D space has dimension 3.

The **standard basis** is `e₁ = (1, 0)` and `e₂ = (0, 1)` in 2D. But there are many bases: `(1, 0)` and `(1, 1)` form one too. The same point has different **coordinates** in different bases.

## A worked example

Are `(1, 2)` and `(2, 4)` independent? `2·(1, 2) − 1·(2, 4) = (0, 0)` with non-zero coefficients, so they are dependent (one is twice the other).

Are `(1, 0)` and `(1, 1)` independent? Suppose `a(1, 0) + b(1, 1) = (0, 0)`. Then `b = 0` from the second component and `a = 0` from the first, so they are independent, and a basis of the plane.

Coordinates in that basis: the point `(5, 4)` equals `1·(1, 0) + 4·(1, 1)`, so its coordinates in this basis are `(1, 4)` while its standard coordinates are `(5, 4)`.

A quick test for two vectors in 2D: they are independent exactly when the **determinant** of the matrix formed from them is not zero (see [[Determinant]]).

## Bench

```bench
id: independence-tester
title: Independent or dependent?
fallback: Sliders set three vectors in the plane; the bench tests whether each pair is independent, shows the coefficients of a combination reaching zero when dependent, and shows the coordinates of a target in the chosen basis.
```

**Try this**

1. Choose two vectors that clearly point in different directions.
2. Move one until it lines up with the other and watch the test flip.
3. Add a third vector: is the set of three ever independent in the plane?
4. Read a target's coordinates in the new basis.

**What you should notice:** dependence appears exactly when vectors line up, and a third vector in a plane is always redundant.

## Where it appears in AI

* **Redundant features** (highly correlated columns) make models unstable.
* **Dimensionality reduction** finds a smaller basis that keeps most information (see [[SVD and PCA]]).
* **Word embeddings** aim to span a useful space with independent directions.

## Common pitfalls

* **Thinking dependent means equal.** They only need to be a combination of each other.
* **Assuming independent vectors must be perpendicular.** They only need different directions.
* **Counting more than n independent vectors in n dimensions.** It is impossible.
* **Forgetting that coordinates depend on the basis.**

## Quick check

<details><summary>1. Are (1, 1) and (2, 2) independent?</summary>
No: the second is twice the first.
</details>

<details><summary>2. How many vectors form a basis of 3D space?</summary>
Three (independent ones).
</details>

<details><summary>3. Can 4 vectors in the plane be independent?</summary>
No. At most 2 can be.
</details>

## Key terms

* **Linearly independent:** no vector is a combination of the others.
* **Basis:** independent vectors that span the space.
* **Dimension:** the number of vectors in a basis.
* **Coordinates:** the coefficients of a vector in a basis.

## Related

[[Linear Combinations and Span]] · [[Determinant]] · [[Rank and Null Space]] · [[SVD and PCA]]
