The **determinant** of a square matrix is a single number telling you how the transformation scales area (or volume): a determinant of 3 makes shapes three times larger, 0.5 halves them, 0 flattens them onto a line, and a negative value also flips orientation.

**You need:** [[Matrices as Transformations]] and [[Transpose, Identity and Inverse]].

## The question it answers

"By how much does this transformation stretch space, and can it be undone?" A determinant of zero means information was destroyed, so no inverse exists.

## Intuition: the fate of the unit square

Draw the unit square with corners `(0, 0)`, `(1, 0)`, `(0, 1)`, `(1, 1)`. Apply a matrix. The square becomes a parallelogram whose sides are the two columns. The **determinant is that parallelogram's signed area**.

```text
det [ a b ] = a d − b c
    [ c d ]
```

* `det > 1`: areas grow.  `0 < det < 1`: areas shrink.
* `det = 0`: the columns line up and the square collapses to a line. There is no way back.
* `det < 0`: the transformation flips orientation (like a mirror image).

## Properties

```text
det(I) = 1
det(AB) = det(A) · det(B)         scalings multiply
det(A⁻¹) = 1 / det(A)
det(Aᵀ) = det(A)
A is invertible  ⇔  det(A) ≠ 0
```

## A worked example

```text
[2 0]   det = 2·3 − 0·0 = 6      stretches x by 2 and y by 3: area × 6
[0 3]

[1 2]   det = 1·4 − 2·2 = 0      second column is twice the first: the square collapses to a line
[2 4]

[0 1]   det = 0·0 − 1·1 = −1     swaps the axes: area unchanged, orientation flipped
[1 0]
```

Check the product rule: `A = [[2,0],[0,3]]` (det 6) and `B = [[0,1],[1,0]]` (det −1). Then `AB = [[0,2],[3,0]]` with `det = 0·0 − 2·3 = −6 = 6 × (−1)` ✓.

Geometrically, `[[1, 1], [0, 1]]` (a shear) has `det = 1`: it slants the square but keeps its area.

## Bench

```bench
id: area-scaler
title: How much does the area change?
fallback: Sliders for a 2 by 2 matrix show the unit square becoming a parallelogram, with the determinant, the new area and the orientation sign displayed.
```

**Try this**

1. Set a stretch of 2 in x and 3 in y. What is the determinant?
2. Move the columns until they line up. What does the square become?
3. Swap the two columns and read the sign.
4. Find a matrix with determinant 1 that is not the identity.

**What you should notice:** the determinant equals the signed area of the transformed unit square, and it hits zero exactly when the columns line up.

## Where it appears in AI

* **Invertibility** checks: a zero determinant signals a degenerate matrix.
* **Normalising flows** track how a transformation changes volume, using determinants.
* **Gaussian distributions** involve the determinant of their covariance matrix.
* **Diagnosing redundant features:** a near-zero determinant warns of near-dependence.

## Common pitfalls

* **Assuming the determinant measures length.** It measures area or volume.
* **Forgetting the sign.** Negative means a flip, not a smaller area.
* **Thinking small determinant is harmless.** It can signal an unstable, nearly non-invertible matrix.
* **Applying the 2 × 2 formula to bigger matrices.** Larger ones have their own methods.

## Quick check

<details><summary>1. What is det [[3, 1], [2, 4]]?</summary>
12 − 2 = 10.
</details>

<details><summary>2. Is [[2, 4], [1, 2]] invertible?</summary>
No: 4 − 4 = 0.
</details>

<details><summary>3. If det A = 5 and det B = 2, what is det(AB)?</summary>
10.
</details>

## Key terms

* **Determinant:** the signed factor by which a matrix scales area or volume.
* **Singular:** a matrix with determinant zero.
* **Orientation:** whether a transformation preserves or flips handedness.
* **Parallelogram:** the image of the unit square.

## Related

[[Matrices as Transformations]] · [[Transpose, Identity and Inverse]] · [[Linear Independence and Basis]] · [[Rank and Null Space]] · [[Eigenvalues and Eigenvectors]]
