A **matrix** is a grid of numbers, and multiplying a vector by a matrix **transforms** it: stretching, rotating, flipping or shearing space. Each column of the matrix says where one basis arrow lands, which is enough to describe the whole transformation.

**You need:** [[Vector Operations]], [[Linear Combinations and Span]] and [[Linear Independence and Basis]].

## The question it answers

"What does a grid of numbers *do*?" A neural-network layer is a matrix: it takes an input vector and produces a new vector, and the matrix decides how the space is reshaped.

## Intuition: a machine that warps a grid

Imagine the plane drawn as a square grid. A matrix warps that grid, keeping lines straight and the origin fixed. To know the warp, follow just two arrows: where `(1, 0)` lands and where `(0, 1)` lands. Those two landing points are the two **columns** of the matrix.

```text
A = [ a  b ]        A · (1, 0) = (a, c)   first column
    [ c  d ]        A · (0, 1) = (b, d)   second column
```

## The rule

To transform `(x, y)`, take a combination of the columns:

```text
A (x, y) = x · (a, c) + y · (b, d) = (a x + b y,  c x + d y)
```

Each output component is a dot product of a **row** with the input vector.

## Common transformations

```text
stretch x by 2:     [ 2 0 ]         reflect in the x-axis:   [ 1  0 ]
                    [ 0 1 ]                                  [ 0 −1 ]

rotate by θ:        [ cos θ  −sin θ ]      shear:            [ 1 1 ]
                    [ sin θ   cos θ ]                        [ 0 1 ]
```

## A worked example

Rotate `(1, 0)` by 90° (θ = π/2, so `cos θ = 0`, `sin θ = 1`):

```text
[ 0 −1 ] [1]   [ 0·1 + (−1)·0 ]   [0]
[ 1  0 ] [0] = [ 1·1 +   0·0  ] = [1]
```

The point `(1, 0)` moves to `(0, 1)`, a quarter turn. The second column `(−1, 0)` says `(0, 1)` moves to `(−1, 0)`, also a quarter turn.

Try the stretch `[[2, 0], [0, 1]]` on `(3, 4)`: `(2·3 + 0, 0 + 1·4) = (6, 4)`. Only the x-part doubled.

The transformation is **linear**: `A(u + v) = Au + Av` and `A(c v) = c Av`. Grids stay grids, and lines stay lines.

## Bench

```bench
id: grid-warper
title: Warp the grid with a matrix
fallback: Sliders for the four numbers of a 2 by 2 matrix draw the original grid and the transformed one, along with the two column vectors and the unit square's new shape; presets give stretch, rotation, shear and flip.
```

**Try this**

1. Press "Rotate" and see the grid turn without stretching.
2. Change only the first column and watch where (1, 0) lands.
3. Make the two columns point along the same line. What happens to the grid?
4. Try a flip and see the orientation reverse.

**What you should notice:** the columns are where the basis arrows land, and the whole grid follows them.

## Where it appears in AI

* **Dense layers** apply a weight matrix to their input vector.
* **Embedding lookups** are matrix operations.
* **Data augmentation** rotates and scales images with transformation matrices.
* **PCA** rotates data to new axes (see [[SVD and PCA]]).

## Common pitfalls

* **Confusing rows and columns.** Columns show where the basis arrows land.
* **Assuming a matrix can shift the origin.** Adding a bias vector does that.
* **Forgetting that order matters** when combining matrices.
* **Treating any grid as a transformation** without checking its shape matches the vector.

## Quick check

<details><summary>1. What does [[1, 0], [0, 1]] do to a vector?</summary>
Nothing: it is the identity.
</details>

<details><summary>2. Apply [[2, 0], [0, 3]] to (1, 1).</summary>
(2, 3).
</details>

<details><summary>3. Where does (1, 0) go under [[a, b], [c, d]]?</summary>
To (a, c), the first column.
</details>

## Key terms

* **Matrix:** a rectangular grid of numbers.
* **Linear transformation:** a warp that keeps lines straight and fixes the origin.
* **Column:** where a basis vector lands.
* **Rotation / shear / stretch:** common transformations.

## Related

[[Linear Independence and Basis]] · [[Matrix Multiplication]] · [[Determinant]] · [[Eigenvalues and Eigenvectors]] · [[A Forward Pass by Hand]]
