Every feature you add is a new dimension, and high-dimensional space behaves strangely: it is enormous, data points end up far from everything, and "nearest" stops meaning much. Meanwhile the amount of data needed to cover the space grows exponentially. This is the **curse of dimensionality**.

**You need:** [[Feature Engineering]], [[Geometry in Many Dimensions]] and [[Norms and Distance]].

## The question it answers

"Why does adding more features sometimes make a model worse?" Because each extra feature spreads the same number of examples over a far larger space, so the model has less evidence for every region.

## Intuition: filling a room

Divide each axis into 10 intervals. In one dimension there are 10 cells; 200 points fill them well. In two dimensions there are 100 cells, still fine. In ten dimensions there are `10¹⁰` cells: ten billion. Two hundred points occupy a vanishing fraction, and most cells contain nothing to learn from. Data does not fill the space; it floats in it, sparse.

## Definitions

```text
cells with b bins per axis and d dimensions:   b^d
distance concentration:  as d grows, (farthest − nearest) / nearest → 0
                         every point is roughly equally far from every other
```

Two consequences: methods that rely on distance to a neighbour lose their signal, and models with many features can fit noise easily. The usual remedies are fewer, better features ([[Feature Engineering]]), **dimensionality reduction** such as [[SVD and PCA]], regularisation, and more data.

## A worked example

Take 200 random points in the unit cube and one query point (the bench's fixed seed). Compare the farthest and nearest distances:

```text
dimensions     (farthest − nearest) ÷ nearest
    2                  43
   10                   2.3
   50                   0.56
  200                   0.22
```

In two dimensions the farthest point is 44 times as far as the nearest, so "nearest" is meaningful. In 200 dimensions the farthest is only 1.2 times as far as the nearest: everything is about equally distant, and a nearest-neighbour vote is close to random. The cell count tells the same story: `10²` cells in 2D against `10²⁰⁰` in 200D.

## Bench

```bench
id: sparse-space
title: Distances in many dimensions
fallback: A slider sets the number of dimensions of 200 random points; the bench draws the histogram of distances from one point to the rest and shows the nearest-to-farthest spread and the number of grid cells per data point.
```

**Try this**

1. Start at 2 dimensions and note the spread of distances.
2. Slide to 10, then 50, then 200.
3. Watch the cells-per-data-point readout.

**What you should notice:** the distance histogram narrows into a spike as dimensions grow, and the count of empty cells explodes.

## Where it appears in AI

* **Nearest-neighbour search** degrades in raw high dimensions, so it works on compressed embeddings.
* **Feature selection and PCA** exist to reduce dimensions.
* **Deep learning** works despite huge input dimensions because real data lies on much lower-dimensional shapes.

## Common pitfalls

* **Adding every available feature** "just in case".
* **Trusting distance-based methods** on hundreds of raw features.
* **Assuming more data always cures it;** the needed amount grows exponentially.
* **Believing all high-dimensional data is hopeless;** structure in the data saves us.

## Quick check

<details><summary>1. How many cells does a grid with 10 bins per axis have in 6 dimensions?</summary>
10⁶ = 1,000,000.
</details>

<details><summary>2. What happens to the nearest and farthest distances as dimensions grow?</summary>
They become almost equal.
</details>

<details><summary>3. Name one remedy.</summary>
Dimensionality reduction (PCA), feature selection, regularisation or more data.
</details>

## Key terms

* **Curse of dimensionality:** the troubles of sparse, distance-blind high-dimensional data.
* **Sparsity:** most of the space containing no data.
* **Distance concentration:** distances becoming nearly equal.
* **Dimensionality reduction:** compressing to fewer, informative dimensions.

## Related

[[Geometry in Many Dimensions]] · [[SVD and PCA]] · [[Feature Engineering]] · [[k-Nearest Neighbours]] · [[Ridge and Lasso]]
