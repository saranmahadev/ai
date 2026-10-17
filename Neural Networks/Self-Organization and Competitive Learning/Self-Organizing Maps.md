Give a grid of units nothing but unlabelled data points, and a rule that says "move the unit closest to each point a little closer, and drag its neighbours along too" — and the grid gradually arranges itself to mirror the shape of the data, with nearby grid cells responding to similar inputs. That arrangement is a self-organizing map (SOM).

**You need:** [[Norms and Distance]].

## The question it answers

"How can a fixed grid of units learn to lay itself out so that nearby units respond to similar inputs, with no labels and no target output at all?" By competition with a twist: for each input, find the single unit whose weight vector is closest (the **best-matching unit**, or BMU), then move *that unit and its grid neighbours* toward the input — the neighbours just a little less than the winner itself.

## Intuition

Picture a grid of units, each holding a point in the same space as the data, scattered randomly at first. Show the map one data point at a time. Each time, the closest unit "wins" and gets pulled toward that point — and because its neighbours on the grid get pulled too (by a shrinking amount, the further away they are), the whole neighbourhood drifts together. Over many data points, units that keep winning for similar inputs end up near each other on the grid, and the grid as a whole stretches and folds to cover the shape the data actually occupies.

## Definition and notation

Each grid unit `i` holds a weight vector `wᵢ`, the same dimension as the data. For an input `x`:

```text
BMU(x) = argmin_i ‖wᵢ − x‖              (the closest unit, by Euclidean distance)

update, for every unit i within radius r of the BMU on the grid:
  influence(i) = exp(−dist_grid(i, BMU)² / (2r²))
  wᵢ ← wᵢ + η · influence(i) · (x − wᵢ)
```

Units farther than `r` on the grid are left unchanged. Both the learning rate `η` and the radius `r` are typically shrunk over training, so the map makes large, coarse adjustments early and fine, local ones later.

## A worked example

A tiny 1D chain of four units with 2D weight vectors, `w₀=[0.1,0.1], w₁=[0.4,0.6], w₂=[0.8,0.2], w₃=[0.9,0.9]`, shown the input `x = [0.5, 0.5]`, with `η = 0.5` and `r = 1`:

```text
distances to x: ‖w₀−x‖=0.566, ‖w₁−x‖=0.141, ‖w₂−x‖=0.361, ‖w₃−x‖=0.566
BMU = unit 1 (closest)

grid distances from unit 1: unit0=1, unit1=0, unit2=1, unit3=2

unit 0 (dist 1, within radius): influence = exp(−1/2) ≈ 0.607
  w₀ ← [0.1,0.1] + 0.5×0.607×([0.5,0.5]−[0.1,0.1]) ≈ [0.221, 0.221]
unit 1 (dist 0, the winner): influence = 1
  w₁ ← [0.4,0.6] + 0.5×1×([0.5,0.5]−[0.4,0.6]) = [0.450, 0.550]
unit 2 (dist 1, within radius): influence ≈ 0.607
  w₂ ← [0.8,0.2] + 0.5×0.607×([0.5,0.5]−[0.8,0.2]) ≈ [0.709, 0.291]
unit 3 (dist 2, outside radius r=1): unchanged, stays [0.9, 0.9]
```

One input moved three of the four units toward it — most for the winner, less for its neighbours, and not at all for the unit too far away on the grid.

## Bench

```bench
id: som-train
title: Watch a grid of units organize itself
fallback: Feed a self-organizing map random points from a chosen 2D shape, one at a time, and watch the grid of units bend to cover that shape.
```

**Try this**

1. Step through single updates and watch which unit wins and how far its neighbours move.
2. Run many steps and watch the whole grid stretch to cover the data's shape.
3. Shrink the neighbourhood radius partway through and see updates become more local.

**What you should notice:** nearby units on the grid end up responding to nearby regions of the data space — the grid's own 1D or 2D layout comes to mirror the structure of the data, entirely from local, competitive updates.

## Where it appears in AI

* **Topological, human-inspectable maps of high-dimensional data** — a SOM can be walked across visually, in a way that a raw high-dimensional dataset cannot.
* **Vector quantization and clustering**, covered next in [[Competitive Learning and Vector Quantization]], is the same winner-take-all idea with the neighbourhood term removed.
* **It predates and parallels unsupervised methods on [[Machine Learning]]** like [[K-Means Clustering|k-means]], which also assigns points to the nearest of several prototype vectors, but without a grid layout or neighbourhood update.

## Common pitfalls

* **Confusing the grid's geometry with the data's geometry.** The grid is an artificial layout chosen before training; what self-organizes is which *data* regions each grid position comes to represent.
* **Using a fixed, large radius throughout training.** Without shrinking the radius, the map keeps making coarse, disruptive updates and never refines its boundaries.
* **Expecting convergence from very few data points.** The worked example shows one update; a usable map needs many updates across many (or repeated) data points.

## Quick check

<details><summary>1. What determines how much a given unit moves on one update?</summary>
Its grid distance from the best-matching unit — the BMU itself moves most, closer neighbours move less, and units beyond the neighbourhood radius don't move at all.
</details>

<details><summary>2. In the worked example, why did unit 3 not move?</summary>
Its grid distance from the BMU (unit 1) was 2, which is outside the neighbourhood radius of 1.
</details>

<details><summary>3. What typically happens to the learning rate and radius over the course of training?</summary>
Both are shrunk over time, so training starts with large, coarse adjustments and ends with small, local refinements.
</details>

## Key terms

* **Best-matching unit (BMU):** the grid unit whose weight vector is closest to the current input.
* **Neighbourhood function:** a function of grid distance from the BMU that scales how much each unit is updated.
* **Topological map:** a layout where nearby positions on the grid correspond to similar regions of the input space.

## Related

[[Competitive Learning and Vector Quantization]] · [[Norms and Distance]] · [[K-Means Clustering]]
