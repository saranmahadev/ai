An **eigenvector** of a matrix is a direction that the matrix only stretches, without turning: `A v = λ v`. The stretch factor `λ` is its **eigenvalue**. They reveal the natural axes of a transformation, and they are how we find the most important directions in data.

**You need:** [[Matrices as Transformations]], [[Determinant]] and [[Polynomials and Quadratics]].

## The question it answers

"Which directions does this transformation leave pointing the same way?" Most vectors get turned by a matrix. A few special ones are only scaled, and those tell you what the matrix is really doing.

## Intuition: axes that survive the warp

Warp a grid with a matrix. Most arrows swing to new directions. But along certain lines, an arrow stays on the same line, just longer or shorter (or flipped, if `λ` is negative). Those lines are the eigenvector directions, and how much they stretch is the eigenvalue.

```text
A v = λ v
λ > 1  stretches       0 < λ < 1  shrinks       λ < 0  flips       λ = 0  crushes to zero
```

## Finding them

Rewrite `A v = λ v` as `(A − λ I) v = 0`. A non-zero `v` exists only when `A − λ I` is singular, so its determinant is zero:

```text
det(A − λ I) = 0          the characteristic equation
```

For a 2 × 2 matrix this is a quadratic in `λ` (see [[Polynomials and Quadratics]]). Two handy checks:

```text
sum of eigenvalues = trace (sum of the diagonal)
product of eigenvalues = determinant
```

## A worked example

```text
A = [2 1]
    [1 2]

det(A − λI) = (2 − λ)² − 1 = λ² − 4λ + 3 = (λ − 1)(λ − 3) = 0
eigenvalues:  λ = 3  and  λ = 1
```

Find the eigenvectors: for `λ = 3`, `(A − 3I) v = 0` gives `−v₁ + v₂ = 0`, so `v = (1, 1)`. For `λ = 1`: `v₁ + v₂ = 0`, so `v = (1, −1)`.

```text
A (1, 1)  = (2 + 1, 1 + 2) = (3, 3) = 3 · (1, 1)     ✓
A (1, −1) = (2 − 1, 1 − 2) = (1, −1) = 1 · (1, −1)   ✓
```

Checks: trace `2 + 2 = 4 = 3 + 1` ✓ and determinant `4 − 1 = 3 = 3 × 1` ✓. This matrix stretches by 3 along the diagonal and leaves the anti-diagonal alone.

**Symmetric matrices** (equal to their transpose) always have real eigenvalues and perpendicular eigenvectors, as here (`(1, 1) · (1, −1) = 0`). Covariance matrices are symmetric, which is why PCA works.

## Bench

```bench
id: eigen-finder
title: Find the directions that only stretch
fallback: A 2 by 2 matrix set by sliders acts on a test arrow whose angle you rotate; the bench shows the arrow and its image, the angle between them, and marks the eigenvector directions with their eigenvalues.
```

**Try this**

1. Rotate the test arrow and watch the image swing around.
2. Find the angles where the arrow and its image line up.
3. Compare the stretch there with the eigenvalues reported.
4. Choose a rotation matrix. Do any real directions survive?

**What you should notice:** the arrow and its image line up only at the eigenvector directions, and the stretch there equals the eigenvalue.

## Where it appears in AI

* **PCA** uses eigenvectors of the covariance matrix (see [[SVD and PCA]]).
* **PageRank** ranks web pages by an eigenvector.
* **Stability of training:** the eigenvalues of the Hessian describe curvature (see [[Hessian]]).
* **Repeated multiplication** grows or shrinks along eigenvectors, explaining exploding and vanishing signals.

## Common pitfalls

* **Assuming every matrix has real eigenvalues.** Rotations do not.
* **Forgetting eigenvectors are only defined up to scaling.**
* **Confusing eigenvalues with the matrix entries.**
* **Computing by hand for large matrices.** Use numerical routines.

## Quick check

<details><summary>1. What are the eigenvalues of [[3, 0], [0, 5]]?</summary>
3 and 5.
</details>

<details><summary>2. If a 2 × 2 matrix has trace 7 and determinant 10, what are its eigenvalues?</summary>
5 and 2.
</details>

<details><summary>3. What does λ = −1 do to its eigenvector?</summary>
Flips it to the opposite direction, same length.
</details>

## Key terms

* **Eigenvector:** a direction only scaled by a matrix.
* **Eigenvalue:** the scaling factor along an eigenvector.
* **Characteristic equation:** `det(A − λI) = 0`.
* **Trace:** the sum of a matrix's diagonal entries.

## Related

[[Matrices as Transformations]] · [[Determinant]] · [[Polynomials and Quadratics]] · [[SVD and PCA]] · [[Hessian]]
