**Area** measures a flat region and **volume** measures a solid. When you scale a shape by a factor `k`, lengths grow by `k`, areas by `k²` and volumes by `k³`. That simple pattern explains why doubling a network's width more than doubles its cost.

**You need:** [[Exponents and Roots]] and [[Coordinates and Distance]].

## The question it answers

"How much space does a shape take up, and how does that change when the shape grows?" Memory, compute and even how points spread in space depend on these powers.

## Intuition: squares and cubes of size

Double the side of a square and you can fit four of the original squares inside: area ×4 (that is 2²). Double the side of a cube and eight of the originals fit: volume ×8 (2³). In general:

```text
lengths scale by k       areas scale by k²       volumes scale by k³
```

## Formulas

```text
rectangle   A = w × h            triangle   A = ½ × base × height
circle      A = π r²             circumference  C = 2π r
cube        V = s³               box        V = w × h × d
sphere      V = 4/3 π r³         surface    S = 4π r²
cylinder    V = π r² h
```

## A worked example

A circle of radius 3 has area `π × 9 ≈ 28.27`. Double the radius to 6: `π × 36 ≈ 113.10`, exactly 4 times bigger. ✓

A sphere of radius 1 has volume `4/3 π ≈ 4.189`; radius 2 gives `4/3 π × 8 ≈ 33.51`, 8 times bigger. ✓

Now a cost example. A layer connecting `n` inputs to `n` outputs has `n²` weights. Doubling `n` from 512 to 1,024 multiplies the weights by 4 (from 262,144 to 1,048,576), not 2.

Another consequence, surface versus volume: surface grows by `k²` and volume by `k³`, so bigger objects have relatively less surface for their volume.

## Bench

```bench
id: scale-shape
title: Scale a shape
fallback: A slider scales a square, circle or cube by a factor; bars show how the length, area and volume change.
```

**Try this**

1. Set the factor to 2 for each shape. How many times bigger is the area? The volume?
2. Try a factor of 0.5.
3. Find the factor that makes the area 9 times larger.
4. Compare the growth of length, area and volume side by side.

**What you should notice:** the same scale factor is raised to the power 1, 2 or 3, and each further dimension makes growth faster.

## Where it appears in AI

* **Parameter counts** grow with the square of width in dense layers.
* **Attention** cost grows with the square of sequence length.
* **Image models:** doubling resolution multiplies pixels by four.
* **High dimensions:** volumes behave strangely (see [[Geometry in Many Dimensions]]).

## Common pitfalls

* **Scaling area linearly.** Doubling the side quadruples the area.
* **Mixing radius and diameter** in the circle formulas.
* **Forgetting units.** Areas are squared units, volumes cubed.
* **Assuming similar shapes scale their perimeter like their area.** Perimeter scales by `k`.

## Quick check

<details><summary>1. A square's side triples. What happens to the area?</summary>
It becomes 9 times bigger.
</details>

<details><summary>2. What is the area of a circle of radius 2?</summary>
4π ≈ 12.57.
</details>

<details><summary>3. A cube's side is halved. What happens to the volume?</summary>
It becomes 1/8 as big.
</details>

## Key terms

* **Area:** the size of a flat region.
* **Volume:** the size of a solid.
* **Scale factor:** the number by which lengths are multiplied.
* **Surface area:** the total area of a solid's outside.

## Related

[[Exponents and Roots]] · [[Growth Rates and Big-O]] · [[Geometry in Many Dimensions]] · [[Coordinates and Distance]]
