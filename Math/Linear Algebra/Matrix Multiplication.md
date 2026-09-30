**Matrix multiplication** combines two matrices into one that does both transformations in a row. Each entry of the result is a dot product of a row of the first matrix with a column of the second. It is the most-performed operation in machine learning.

**You need:** [[Matrices as Transformations]] and [[Dot Product]].

## The question it answers

"If I apply one transformation and then another, what single matrix does the same job?" A network is a chain of layers, and multiplication is how chained matrices combine.

## Intuition: rows meet columns

To find the entry in row `i`, column `j` of `AB`, take **row `i` of `A`** and **column `j` of `B`**, multiply matching entries and add. That is a dot product.

```text
(AB)ᵢⱼ = Σₖ Aᵢₖ · Bₖⱼ
```

For this to work, the number of **columns of A** must equal the number of **rows of B**. Shapes combine like this:

```text
(m × n) · (n × p)  =  (m × p)
```

## The rules

```text
associative:      (AB)C = A(BC)
distributive:     A(B + C) = AB + AC
NOT commutative:  AB ≠ BA in general
identity:         A I = I A = A
```

`AB` means "apply `B` first, then `A`": the matrix on the right acts first on the vector.

## A worked example

```text
A = [1 2]      B = [0 1]
    [3 4]          [1 0]

AB:  row 1 · col 1 = 1·0 + 2·1 = 2      row 1 · col 2 = 1·1 + 2·0 = 1
     row 2 · col 1 = 3·0 + 4·1 = 4      row 2 · col 2 = 3·1 + 4·0 = 3

AB = [2 1]                BA = [3 4]
     [4 3]                     [1 2]
```

`B` swaps things, so `AB` swaps the *columns* of `A` and `BA` swaps its *rows*. Since `AB ≠ BA`, the order matters, like putting on socks then shoes.

A layer example: weights `W` of shape `(3 × 2)` and an input vector `x` of shape `(2 × 1)` give an output of shape `(3 × 1)`. The number of multiplications is `3 × 2 = 6`. For an `(m × n)` times `(n × p)` product, the cost is `m · n · p` multiplications.

## Bench

```bench
id: matrix-multiply
title: Rows meet columns
fallback: Choose a pair of matrices and step through the product; each step highlights a row of the first matrix and a column of the second and shows the dot product that fills one entry of the result.
```

**Try this**

1. Step through the 2 by 2 example and watch the row and column.
2. Switch to the non-square pair. Which shape does the result have?
3. Compare AB with BA for the swapping matrix.
4. Try the identity and see that nothing changes.

**What you should notice:** each result entry is one dot product, the shapes decide whether the product exists, and swapping the order changes the answer.

## Where it appears in AI

* **Every layer** of a neural network multiplies an input by a weight matrix.
* **Batches:** stacking many inputs as rows lets one product process them all.
* **GPUs** are built to do matrix multiplication quickly.
* **Attention** is a chain of matrix products.

## Common pitfalls

* **Mismatched shapes.** Inner dimensions must agree.
* **Assuming commutativity.** `AB ≠ BA`.
* **Multiplying entry by entry** (that is the Hadamard product).
* **Reading the order backwards.** In `AB v`, `B` acts first.

## Quick check

<details><summary>1. Can a (2 × 3) matrix multiply a (2 × 3) matrix?</summary>
No: the inner dimensions (3 and 2) differ.
</details>

<details><summary>2. What shape is (4 × 5)(5 × 2)?</summary>
(4 × 2).
</details>

<details><summary>3. How many multiplications for (3 × 4)(4 × 2)?</summary>
3 · 4 · 2 = 24.
</details>

## Key terms

* **Matrix product:** the matrix combining two transformations.
* **Inner dimension:** the shared size that must match.
* **Non-commutative:** the order changes the result.
* **Batch:** many inputs multiplied at once.

## Related

[[Matrices as Transformations]] · [[Dot Product]] · [[Transpose, Identity and Inverse]] · [[Tensors and Shapes]] · [[A Forward Pass by Hand]]
