A **tensor** is a grid of numbers with any number of dimensions: a scalar is 0-dimensional, a vector 1-dimensional, a matrix 2-dimensional, and a stack of images 4-dimensional. Its **shape** lists the size of each dimension, and getting shapes to line up is the everyday work of writing model code.

**You need:** [[Scalars and Vectors]] and [[Matrix Multiplication]].

## The question it answers

"How do I store and combine data that has more than two axes?" A batch of colour images has a batch axis, a height, a width and colour channels, and operations must know which axis is which.

## Intuition: nested lists with a fixed size

```text
scalar   5                           shape ()
vector   [3, 1, 4]                   shape (3)
matrix   [[1, 2, 3], [4, 5, 6]]      shape (2, 3)     2 rows, 3 columns
tensor   a stack of 32 images        shape (32, 224, 224, 3)
```

The number of dimensions is the **rank** (or "ndim"), and the total number of entries is the **product of the shape**. Rearranging without changing the entries is **reshaping**: `(2, 3)` can become `(6)` or `(3, 2)`, since `2 × 3 = 6 = 3 × 2`.

## Broadcasting

To add or multiply tensors of different shapes, libraries **broadcast**: compare shapes from the **last** dimension backwards; two sizes are compatible if they are equal or one of them is 1 (or missing), and the size-1 side is stretched.

```text
(3, 4) + (4)      →  (3, 4)      the row of 4 is added to each of the 3 rows
(3, 1) + (1, 4)   →  (3, 4)      an outer combination
(3, 4) + (3)      →  error       last sizes 4 and 3 do not match
```

Matrix multiplication has its own rule: `(m, n) @ (n, p) → (m, p)`.

## A worked example

A batch of 32 colour images, each 224 × 224 pixels with 3 channels, has shape `(32, 224, 224, 3)`:

```text
entries = 32 × 224 × 224 × 3 = 32 × 150,528 = 4,816,896
```

Flatten each image into one vector (`reshape` to `(32, 150528)`) and multiply by a weight matrix of shape `(150528, 10)`: the result has shape `(32, 10)`, ten scores per image.

Add a bias of shape `(10)`: the shapes `(32, 10)` and `(10)` broadcast to `(32, 10)`, adding the same bias to every row.

## Bench

```bench
id: shape-puzzle
title: Do these shapes fit?
fallback: A set of puzzles shows two tensor shapes and an operation; choose the resulting shape or say it is an error, then read why.
```

**Try this**

1. Solve the easy broadcasting cases first.
2. For each error, find the two dimensions that clash.
3. Try the matrix-multiplication cases: check the inner sizes.
4. Predict the result before choosing.

**What you should notice:** shapes are compared from the right, sizes must match or be 1, and matrix products need equal inner sizes.

## Where it appears in AI

* **Every framework** (PyTorch, TensorFlow, NumPy) works on tensors, and shape errors are the most common bugs.
* **Batching** adds a leading dimension.
* **Attention** uses tensors of shape (batch, heads, tokens, features).
* **Memory** is the number of entries times bytes per entry.

## Common pitfalls

* **Mixing up axis order** (channels-first versus channels-last).
* **Relying on silent broadcasting** that gives a wrong but valid shape.
* **Reshaping into the wrong layout**, scrambling which entry is which.
* **Forgetting the batch dimension.**

## Quick check

<details><summary>1. What shape is a batch of 10 sentences, each 50 tokens with 64 features?</summary>
(10, 50, 64).
</details>

<details><summary>2. Can (2, 3) be reshaped to (4, 2)?</summary>
No: 6 entries versus 8.
</details>

<details><summary>3. What is (5, 3) @ (3, 7)?</summary>
(5, 7).
</details>

## Key terms

* **Tensor:** a grid of numbers with any number of dimensions.
* **Shape:** the size of each dimension.
* **Broadcasting:** stretching size-1 dimensions to fit.
* **Reshape:** changing the shape while keeping the entries.

## Related

[[Scalars and Vectors]] · [[Matrix Multiplication]] · [[Order of Operations and Properties]] · [[A Forward Pass by Hand]] · [[Attention as Dot Products]]
