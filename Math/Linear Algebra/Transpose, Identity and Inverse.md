Three special matrix ideas come up constantly: the **transpose** (flip rows and columns), the **identity** (the matrix that does nothing) and the **inverse** (the matrix that undoes another). Together they let you rearrange and solve matrix equations.

**You need:** [[Matrix Multiplication]].

## The question it answers

"How do I flip a matrix, and how do I undo a transformation?" To recover an input from an output, you apply the inverse.

## Transpose

The **transpose** `Aᵀ` swaps rows and columns: entry `(i, j)` moves to `(j, i)`. A `(2 × 3)` matrix becomes `(3 × 2)`.

```text
A = [1 2 3]      Aᵀ = [1 4]
    [4 5 6]           [2 5]
                      [3 6]
```

Useful rules: `(Aᵀ)ᵀ = A`, `(AB)ᵀ = BᵀAᵀ` (order reverses). A matrix equal to its transpose is **symmetric**.

## Identity

The **identity** matrix `I` has 1s on the diagonal and 0s elsewhere. Multiplying by it changes nothing: `A I = I A = A`, like multiplying a number by 1.

```text
I = [1 0]
    [0 1]
```

## Inverse

The **inverse** `A⁻¹` undoes `A`: `A A⁻¹ = A⁻¹ A = I`. Not every matrix has one. For a 2 × 2 matrix:

```text
A = [a b]      A⁻¹ = 1/(ad − bc) · [ d −b]
    [c d]                          [−c  a]
```

The number `ad − bc` is the **determinant** (see [[Determinant]]). If it is zero, the matrix has no inverse: it is **singular**, and the transformation squashes space so information is lost.

Rule: `(AB)⁻¹ = B⁻¹A⁻¹`. Undo in reverse order, like taking shoes off before socks.

## A worked example

```text
A = [2 1]        determinant = 2·1 − 1·1 = 1
    [1 1]

A⁻¹ = 1/1 · [ 1 −1] = [ 1 −1]
            [−1  2]   [−1  2]

check: A A⁻¹ = [2·1 + 1·(−1)   2·(−1) + 1·2]   [1 0]
               [1·1 + 1·(−1)   1·(−1) + 1·2] = [0 1] = I ✓
```

Use it: to solve `A x = (3, 2)`, compute `x = A⁻¹ (3, 2) = (1·3 − 1·2, −1·3 + 2·2) = (1, 1)`. Check: `A (1, 1) = (2 + 1, 1 + 1) = (3, 2)` ✓.

In practice, software solves `A x = b` directly rather than forming `A⁻¹`, which is faster and more accurate (see [[Conditioning]]).

## Bench

```bench
id: undo-transform
title: Undo a transformation
fallback: A 2 by 2 matrix set by sliders transforms a shape; a button applies its inverse to bring the shape back, and the bench reports the determinant and says when no inverse exists.
```

**Try this**

1. Apply a matrix, then apply its inverse. Does the shape return?
2. Move the sliders until the determinant reaches 0. What happens to the inverse?
3. Transpose the matrix and compare the shapes.
4. Try the identity.

**What you should notice:** a transformation that keeps the shape a proper 2D shape can be undone, and one that flattens it to a line cannot.

## Where it appears in AI

* **Normal equations** in regression use `(XᵀX)⁻¹` (see [[Least Squares]]).
* **Backpropagation** multiplies by transposed weight matrices.
* **Covariance matrices** are symmetric.
* **Whitening** and decorrelation use matrix inverses.

## Common pitfalls

* **Assuming every matrix has an inverse.** A zero determinant means none.
* **Reversing the wrong order:** `(AB)⁻¹ = B⁻¹A⁻¹`.
* **Forming an inverse when a direct solve is better.**
* **Confusing `A⁻¹` with `1/A` entry by entry.**

## Quick check

<details><summary>1. What is the transpose of [[1, 2], [3, 4]]?</summary>
[[1, 3], [2, 4]].
</details>

<details><summary>2. Does [[1, 2], [2, 4]] have an inverse?</summary>
No: its determinant is 4 − 4 = 0.
</details>

<details><summary>3. What is (AB)ᵀ?</summary>
BᵀAᵀ.
</details>

## Key terms

* **Transpose:** swapping rows and columns.
* **Identity matrix:** the matrix that leaves vectors unchanged.
* **Inverse:** the matrix that undoes another.
* **Singular:** having no inverse (determinant zero).

## Related

[[Matrix Multiplication]] · [[Determinant]] · [[Solving Linear Systems]] · [[Least Squares]] · [[Conditioning]]
