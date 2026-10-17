Every generation method so far on this planet produces a flat grid of values — pixels, a spectrogram, a sequence of frames. A genuinely three-dimensional object needs a different kind of representation entirely: something that can answer "is this point inside the shape, or outside it?" for *any* point in space, not just at fixed grid positions.

**You need:** [[ControlNet-Style Structural Conditioning]].

## The question it answers

"How do you represent and generate a three-dimensional shape, rather than a flat image?" A **signed distance function (SDF)** represents a shape implicitly: given any point in space, it returns how far that point is from the shape's surface — negative if the point is inside, positive if outside, zero exactly on the surface. Combining two SDFs with a **smooth minimum** blends their shapes into one rounded union, rather than a sharp, un-blended overlap — one of the simplest building blocks for generating 3D content without ever specifying a fixed grid of voxels or vertices.

## Intuition

A flat image is a fixed table of color values, one per pixel — there's no "value" for a point between pixels unless you interpolate. An SDF is the opposite: it's a *function*, answerable at any point in continuous space, not a fixed table at all. Two SDF shapes placed near each other and combined with a plain minimum would meet at a sharp seam, like two separate lumps of clay just touching. A *smooth* minimum is like actually pressing the clay together — the transition rounds out into one continuous surface instead of staying two distinct shapes with a crease where they meet.

## Definition and notation

```text
signed distance of a point p from a circle of radius r centered at c:
  sd(p) = |p − c| − r          (negative inside, zero on the boundary, positive outside)

plain union of two shapes:        min(d₁, d₂)                  -- sharp seam
smooth union, blend amount k:     smoothMin(d₁, d₂, k)          -- rounded seam
  k = 0 reduces exactly to the plain (sharp) union
```

## A worked example

Two circles (toy 2D stand-ins for spheres), each radius 0.6, centered at `(−0.5, 0)` and `(0.5, 0)` — close enough to overlap. The signed distance exactly at the midpoint between them, `(0, 0)`, under different blend amounts:

```text
k = 0.0 (plain union, sharp seam):     distance at midpoint = −0.1000
k = 0.3 (some blending):               distance at midpoint = −0.1750
k = 0.8 (strong blending):             distance at midpoint = −0.3000
```

As the blend amount increases, the midpoint reads as *further inside* the combined shape than either circle alone would suggest (each circle alone gives exactly −0.1 at that point) — exactly what a smoothly filled-in join between the two shapes should look like, with no sharp crease anywhere in between.

## Bench

```bench
id: sdf-blend-3d
title: Blending two implicit shapes
fallback: Adjust the blend amount between two overlapping implicit shapes and watch the join between them round out.
```

**Try this**

1. Set the blend amount to 0 and look at the sharp seam where the two circles meet.
2. Raise it and watch the seam round into a single smooth shape.
3. Note how the midpoint's signed distance value changes as blending increases.

**What you should notice:** the two circles' individual shapes barely change — almost all the visible difference happens exactly where they overlap, which is precisely where a smooth minimum differs from a plain one.

## Where it appears in AI

* **Many 3D generative models (and classical computer graphics before them) represent shapes as neural or explicit SDFs**, rendered by ray marching (stepping along a ray until the SDF reports a point on the surface) rather than storing an explicit mesh or voxel grid.
* **NeRF-style scene representations use a related but distinct idea** — a learned function of 3D position (and viewing direction) that predicts density and color, rather than signed distance specifically — solving the same core problem of representing 3D content without a fixed grid.
* **[[Video Generation and Temporal Consistency|the same consistency problem from video]] shows up again in 3D**: a generated 3D scene viewed from different angles needs to agree with itself, the spatial analogue of frames needing to agree with each other over time.

## Common pitfalls

* **Confusing "signed distance" with "just distance."** The sign is what makes an SDF useful for defining a shape's interior at all — without it, there's no way to distinguish "inside" from "outside" using the distance value alone.
* **Assuming smooth blending only affects appearance.** It changes the actual signed-distance values (and so, where the true surface boundary lies) in the overlap region — it's a real geometric operation, not a cosmetic rendering effect.
* **Treating k=0 as a special, different algorithm.** It's simply the smooth-minimum formula at its weakest setting, reducing exactly to a plain minimum — not a separate method requiring different code.

## Quick check

<details><summary>1. What does a signed distance function return for a point exactly on a shape's surface?</summary>
Zero — positive values mean outside the shape, negative values mean inside it, and zero marks the boundary itself.
</details>

<details><summary>2. In the worked example, why did the midpoint's distance value get more negative as the blend amount increased?</summary>
Because stronger blending fills in the overlap region more fully, making points there read as further inside the combined shape than either individual circle would suggest on its own.
</details>

<details><summary>3. What does the blend amount k=0 case reduce to?</summary>
A plain (sharp) union — the smooth-minimum formula, at its weakest setting, is mathematically identical to just taking the minimum of the two distances.
</details>

## Key terms

* **Signed distance function (SDF):** a function of position that returns distance to a shape's surface, negative inside and positive outside.
* **Smooth minimum:** a blending operation that rounds the join between two combined shapes instead of leaving a sharp seam.
* **Ray marching:** rendering an SDF-defined shape by stepping along a ray until the function reports a point on the surface.

## Related

[[ControlNet-Style Structural Conditioning]] · [[Video Editing and Interpolation]] · [[Any-to-Any Generative Models]]
