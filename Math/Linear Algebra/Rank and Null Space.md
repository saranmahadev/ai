The **rank** of a matrix is the number of independent directions it keeps, and its **null space** is the set of inputs it sends to zero. Together they say how much information a transformation preserves and how much it throws away.

**You need:** [[Linear Independence and Basis]], [[Matrices as Transformations]] and [[Determinant]].

## The question it answers

"How much does this matrix actually use, and what does it forget?" A wide matrix of features may only carry a few independent directions; the rank counts them.

## Intuition: how flat does it squash space?

A transformation can preserve all directions (a full-rank matrix), squash the plane onto a line (rank 1), or crush everything to a point (rank 0). The set of all possible outputs is the **image** (or column space): the span of the matrix's columns. **Rank = the dimension of the image**.

The inputs that get crushed to the zero vector form the **null space**. If a matrix squashes the plane onto a line, a whole line of inputs collapses to zero, and that line is the null space.

```text
rank(A) + dim(null space of A) = number of columns of A       (rank–nullity)
```

## Examples

```text
[1 0]   rank 2: the columns are independent; the image is the whole plane; null space = {0}
[0 1]

[1 2]   rank 1: the second column is twice the first; the image is a line
[2 4]   null space: inputs (x, y) with x + 2y = 0, i.e. multiples of (−2, 1)
```

Check: `[[1,2],[2,4]] · (−2, 1) = (−2 + 2, −4 + 4) = (0, 0)` ✓. Here `1 + 1 = 2` columns, matching rank–nullity.

## A worked example

Is the matrix below full rank?

```text
[1 2 3]
[4 5 6]
[7 8 9]
```

Notice `row 3 = 2·row 2 − row 1`: `2(4, 5, 6) − (1, 2, 3) = (7, 8, 9)` ✓. So the rows are dependent, and the rank is **2** (not 3). Its determinant is 0, so it has no inverse, and its null space has dimension `3 − 2 = 1`: one direction, `(1, −2, 1)`, is sent to zero (`1 − 4 + 3 = 0`, `4 − 10 + 6 = 0`, `7 − 16 + 9 = 0` ✓).

A matrix with a full set of independent columns is **full rank**. For a square matrix, full rank is the same as being invertible.

## Bench

```bench
id: rank-collapser
title: How flat does the matrix squash space?
fallback: Sliders set a 2 by 2 matrix; the bench shows the transformed grid, reports the rank, describes the image (plane, line or point), and gives a direction that is sent to zero when there is one.
```

**Try this**

1. Start with the identity: rank 2, and nothing is lost.
2. Make the second column a multiple of the first. What does the image become?
3. Find the direction that gets sent to zero.
4. Set all four numbers to zero.

**What you should notice:** when the columns line up, the whole plane collapses onto a line and one direction of inputs vanishes.

## Where it appears in AI

* **Low-rank structure:** weight matrices and data often have far fewer independent directions than their size suggests, which is what makes compression work (see [[SVD and PCA]]).
* **Low-rank adaptation (LoRA)** fine-tunes large models by adding a low-rank update.
* **Redundant features** reduce the rank of a data matrix.
* **Solvability:** a system `A x = b` has a unique solution only for full rank.

## Common pitfalls

* **Confusing rank with size.** A 100 × 100 matrix can have rank 3.
* **Ignoring near-dependence.** Numerically, a tiny singular value behaves like a missing direction.
* **Forgetting the null space** when a solution "is not unique".
* **Reading rank from a determinant** for non-square matrices (not defined).

## Quick check

<details><summary>1. What is the rank of [[1, 1], [2, 2]]?</summary>
1.
</details>

<details><summary>2. A (5 × 5) matrix has rank 3. What is the dimension of its null space?</summary>
2.
</details>

<details><summary>3. Is a full-rank square matrix invertible?</summary>
Yes.
</details>

## Key terms

* **Rank:** the number of independent columns.
* **Image (column space):** all outputs of a matrix.
* **Null space:** the inputs mapped to zero.
* **Full rank:** as much rank as the matrix's smaller dimension allows.

## Related

[[Linear Independence and Basis]] · [[Determinant]] · [[Solving Linear Systems]] · [[SVD and PCA]] · [[Tensors and Shapes]]
