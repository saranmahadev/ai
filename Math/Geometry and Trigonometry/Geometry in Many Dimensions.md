Data in AI often has hundreds or thousands of coordinates, so points live in spaces we cannot picture. The formulas carry over unchanged, but the intuition does not: in high dimensions almost all the volume sits near the surface, and distances between random points become almost the same. This is the **curse of dimensionality**.

**You need:** [[Coordinates and Distance]] and [[Areas, Volumes and Scaling]].

## The question it answers

"What happens to distance and volume when there are many coordinates?" Methods based on closeness, like nearest neighbours, work well in a few dimensions and struggle in many.

## Intuition: same formulas, strange behaviour

Distance extends directly. In `n` dimensions the distance between `x` and `y` is:

```text
d = √( (x₁ − y₁)² + (x₂ − y₂)² + … + (xₙ − yₙ)² )
```

Two things change as `n` grows.

**1. Volume moves to the edge.** Take a unit cube and ask what fraction lies within 0.05 of any face. Its inner core has side `1 − 2 × 0.05 = 0.9`, so the core's volume is `0.9ⁿ`.

```text
n = 2:    0.9² = 0.81       (81% is in the core)
n = 10:   0.9¹⁰ ≈ 0.349
n = 100:  0.9¹⁰⁰ ≈ 0.000027   (almost everything is near the surface)
```

**2. A ball fills less and less of its cube.** The fraction of a cube (side 2) taken up by the ball of radius 1 is:

```text
n = 2:   π/4  ≈ 0.785
n = 3:   π/6  ≈ 0.524
n = 10:  π⁵/120 ÷ 1024 ≈ 0.0025
```

In high dimensions the corners of the cube hold almost all the volume.

**3. Distances concentrate.** For random points, the nearest and farthest neighbours end up almost the same distance away, so "nearest" carries little information.

## A worked example

Take random points in the unit cube. In 2 dimensions the typical distance between two points is about 0.52, and it varies a lot between pairs. In 1,000 dimensions the typical distance is about `√(1000/6) ≈ 12.9`, and the spread relative to that is only a few percent: nearly every pair is about equally far apart.

## Bench

```bench
id: dimension-distances
title: Distances in many dimensions
fallback: A slider sets the number of dimensions; a histogram of distances between random points shows the average distance and how narrow the spread becomes as dimensions grow.
```

**Try this**

1. Start at 2 dimensions and read the spread of distances.
2. Increase to 10, 50, 500. What happens to the histogram?
3. Compare the relative spread (spread ÷ average) across settings.
4. Read the fraction of the cube's volume near its surface.

**What you should notice:** the histogram narrows around a typical distance, so points become nearly equidistant.

## Where it appears in AI

* **Nearest-neighbour search and clustering** weaken as features multiply.
* **Embeddings** live in hundreds of dimensions, where direction (cosine) is usually more useful than raw distance (see [[Cosine Similarity]]).
* **Dimensionality reduction** (see [[SVD and PCA]]) projects data to fewer dimensions.
* **Data needs** grow quickly with dimension, since space fills up slowly.

## Common pitfalls

* **Trusting 2D or 3D intuition.** It fails in high dimensions.
* **Using raw distance on many features** without scaling or reducing them.
* **Assuming more features always help.** They can dilute the signal.
* **Confusing "far" with "different".** Everything becomes far.

## Quick check

<details><summary>1. In 100 dimensions, where is most of a cube's volume?</summary>
Near its surface (the core is a tiny fraction).
</details>

<details><summary>2. What is the distance from (0, 0, 0) to (1, 2, 2)?</summary>
√(1 + 4 + 4) = 3.
</details>

<details><summary>3. Why can nearest neighbours mislead in high dimensions?</summary>
The nearest and farthest points are almost equally distant.
</details>

## Key terms

* **Dimension:** the number of coordinates describing a point.
* **Curse of dimensionality:** the problems that arise as dimension grows.
* **Concentration of distances:** distances between points becoming nearly equal.
* **Hyperplane:** a flat boundary in high dimensions.

## Related

[[Coordinates and Distance]] · [[Areas, Volumes and Scaling]] · [[Norms and Distance]] · [[Cosine Similarity]] · [[SVD and PCA]]
