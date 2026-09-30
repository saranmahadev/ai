A **coordinate system** locates a point with numbers, `(x, y)` on a plane, and a **distance formula** measures how far apart two points are. The idea of "close" versus "far" in a plane is the seed of how models compare data.

**You need:** [[Variables and Expressions]] and [[Exponents and Roots]].

## The question it answers

"Where is this point, and how far is it from that one?" A house described by size and price is a point in a plane; two similar houses are nearby points.

## Intuition: a grid with a home base

Pick a starting point, the **origin** `(0, 0)`, and two perpendicular number lines through it, the **axes**. A point `(3, 4)` means "3 across, 4 up". Negative numbers go left and down.

## Distances

The straight-line (**Euclidean**) distance between `(x₁, y₁)` and `(x₂, y₂)` comes from the Pythagorean theorem: the horizontal and vertical gaps are the two short sides of a right triangle, and the distance is its long side.

```text
d = √((x₂ − x₁)² + (y₂ − y₁)²)
```

Other ways to measure "far":

```text
Manhattan (grid) distance:  |x₂ − x₁| + |y₂ − y₁|      like walking city blocks
Chebyshev distance:         max(|x₂ − x₁|, |y₂ − y₁|)  like a king's moves in chess
```

The **midpoint** between two points averages the coordinates: `((x₁ + x₂)/2, (y₁ + y₂)/2)`.

## A worked example

Points `A = (1, 2)` and `B = (4, 6)`.

```text
horizontal gap = 4 − 1 = 3        vertical gap = 6 − 2 = 4
Euclidean:  √(3² + 4²) = √25 = 5
Manhattan:  3 + 4 = 7
Chebyshev:  max(3, 4) = 4
midpoint:   (2.5, 4)
```

The Euclidean distance is always the shortest, the Manhattan longest of the three, and Chebyshev the smallest when the gaps are unequal.

## Bench

```bench
id: point-distance
title: Measure the distance between two points
fallback: Drag two points on a grid to see the horizontal and vertical gaps, the Euclidean, Manhattan and Chebyshev distances, and the midpoint.
```

**Try this**

1. Drag the points so the gaps are 3 and 4. What is the Euclidean distance?
2. Put them on a horizontal line. Do the three distances agree?
3. Move them diagonally. Which distance is largest?
4. Find two positions where Manhattan is twice the Euclidean.

**What you should notice:** all three distances agree along an axis and differ on a diagonal, and the Euclidean is the shortest straight route.

## Where it appears in AI

* **Nearest-neighbour methods** classify a point by its closest examples.
* **Clustering** groups points by distance.
* **Error measures**: L2 (Euclidean) and L1 (Manhattan) distance between predictions and answers (see [[Norms and Distance]]).

## Common pitfalls

* **Forgetting to square-root.** `3² + 4² = 25` is the *squared* distance.
* **Mixing up the order of subtraction.** It does not matter, because it is squared.
* **Assuming distance is the same everywhere.** Different tasks call for different measures.
* **Comparing distances when features have different scales.** A price in dollars swamps a size in metres.

## Quick check

<details><summary>1. Distance from (0, 0) to (6, 8)?</summary>
√(36 + 64) = 10.
</details>

<details><summary>2. Manhattan distance between (1, 1) and (4, 5)?</summary>
3 + 4 = 7.
</details>

<details><summary>3. Midpoint of (2, 4) and (8, 10)?</summary>
(5, 7).
</details>

## Key terms

* **Coordinates:** numbers locating a point.
* **Origin:** the point (0, 0).
* **Euclidean distance:** straight-line distance.
* **Manhattan distance:** sum of the horizontal and vertical gaps.

## Related

[[Angles and Radians]] · [[Lines, Planes and Circles]] · [[Norms and Distance]] · [[Geometry in Many Dimensions]] · [[Scalars and Vectors]]
