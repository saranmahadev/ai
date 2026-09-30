A **line**, a **circle** and a **plane** are the basic shapes, and each has a short equation. Points, distances and intersections between them are the geometry behind classifiers, which often draw a line or plane to separate two groups.

**You need:** [[Linear Functions]] and [[Coordinates and Distance]].

## The question it answers

"How do I write a shape as an equation, and how do I tell whether a point is on it, inside it or beyond it?" A classifier that draws a boundary is asking exactly this for every data point.

## Intuition and equations

**Line** in the plane: all points satisfying one linear equation.

```text
a x + b y = c            (or y = m x + q)
```

**Circle**: all points at distance `r` from the centre `(h, k)`. Straight from the distance formula:

```text
(x − h)² + (y − k)² = r²
```

**Plane** in 3D: all points `(x, y, z)` satisfying one linear equation. A plane is the 3D version of a line, and its coefficients `(a, b, c)` form the **normal** direction, perpendicular to the plane.

```text
a x + b y + c z = d
```

A line in 3D needs two equations, or a starting point plus a direction.

## Which side of the boundary?

Plug a point into `a x + b y − c`. If the result is 0, the point is on the line; if it is positive, it is on one side; if negative, on the other. A classifier does exactly this: the sign of a weighted sum decides the class.

The distance from a point `(x₀, y₀)` to the line `a x + b y = c` is:

```text
|a x₀ + b y₀ − c| / √(a² + b²)
```

## A worked example

Line `3x + 4y = 10` and point `(0, 0)`:

```text
distance = |0 + 0 − 10| / √(9 + 16) = 10 / 5 = 2
```

The origin gives `−10 < 0`, so it lies on the "negative" side.

Circle centre `(1, 2)`, radius 5. Is `(4, 6)` on it? `(4−1)² + (6−2)² = 9 + 16 = 25 = 5²`. Yes ✓. Is `(0, 0)` inside? `1 + 4 = 5 < 25`, so yes.

Plane `x + 2y + 3z = 6`: the point `(1, 1, 1)` gives `1 + 2 + 3 = 6`, so it lies on the plane.

A line meets a circle in 0, 1 or 2 points, according to whether the centre's distance to the line is more than, equal to, or less than `r`.

## Bench

```bench
id: line-circle
title: A line and a circle
fallback: Sliders set a line and a circle; the bench shows how many points they share, the distance from the circle's centre to the line, and the intersection points.
```

**Try this**

1. Move the line until it just touches the circle. What is the distance?
2. Push it through the middle: how many intersections now?
3. Change the radius and watch the intersection count change.
4. Check which side of the line the centre is on.

**What you should notice:** the number of intersections is decided by comparing one distance with the radius.

## Where it appears in AI

* **Linear classifiers** separate classes with a line or a plane (a *hyperplane* in many dimensions).
* **Margins** are distances from points to that boundary.
* **Support vector machines** maximise the distance from the boundary to the nearest points.

## Common pitfalls

* **Dropping the square in the circle equation.** The right side is `r²`.
* **Forgetting the absolute value in the distance formula.**
* **Assuming a line in 3D is one equation.** That is a plane.
* **Ignoring normalisation** when comparing distances to different lines.

## Quick check

<details><summary>1. Is (3, 4) on the circle x² + y² = 25?</summary>
Yes: 9 + 16 = 25.
</details>

<details><summary>2. Which side of x + y = 4 is (0, 0)?</summary>
The negative side: 0 + 0 − 4 < 0.
</details>

<details><summary>3. How many points can a line share with a circle?</summary>
0, 1 or 2.
</details>

## Key terms

* **Line, circle, plane:** the basic shapes.
* **Normal:** a direction perpendicular to a plane.
* **Hyperplane:** a plane in more than three dimensions.
* **Tangent:** a line that touches a curve at exactly one point.

## Related

[[Linear Functions]] · [[Coordinates and Distance]] · [[Dot Product]] · [[Orthogonality and Projection]] · [[Logistic Regression and the Sigmoid]]
