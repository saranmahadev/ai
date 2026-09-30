**Sine** and **cosine** turn an angle into the height and width of a point on a circle of radius 1, the **unit circle**. They trace smooth waves as the angle grows, and they are the maths of rotation, oscillation and periodic patterns.

**You need:** [[Angles and Radians]] and [[Functions]].

## The question it answers

"Given an angle, where am I on the circle, and what is the pattern as I keep turning?" It also answers a practical triangle question: given an angle and a side, what are the other sides?

## Intuition: a point walking around a circle

Put a point on the unit circle and rotate it by angle `θ` from the right-hand axis. Its coordinates are:

```text
(cos θ, sin θ)
```

`cos θ` is how far right the point is, `sin θ` how far up. As `θ` increases, both go up and down smoothly between −1 and 1, and repeat every 2π: that is the wave.

```text
θ = 0°   → (1, 0)        cos 0 = 1        sin 0 = 0
θ = 90°  → (0, 1)        cos 90° = 0      sin 90° = 1
θ = 180° → (−1, 0)
θ = 270° → (0, −1)
```

## Definitions and identities

In a right triangle with angle `θ`:

```text
sin θ = opposite / hypotenuse
cos θ = adjacent / hypotenuse
tan θ = sin θ / cos θ = opposite / adjacent
```

Because the point lies on a circle of radius 1, the Pythagorean theorem gives the most useful identity:

```text
sin²θ + cos²θ = 1
```

Both waves have **period** 2π and **amplitude** 1. `cos θ` is `sin θ` shifted a quarter turn.

## A worked example

Take θ = 30° (π/6). Known values: `sin 30° = 0.5` and `cos 30° = √3/2 ≈ 0.8660`. Check: `0.25 + 0.75 = 1` ✓.

A ramp 10 metres long rises at 30°. Its height is the opposite side:

```text
height = 10 × sin 30° = 5 m
run    = 10 × cos 30° ≈ 8.66 m
```

At θ = 60°, `cos 60° = 0.5` and `sin 60° ≈ 0.8660`, the values swapped.

## Bench

```bench
id: unit-circle
title: Trace the unit circle
fallback: A slider sets an angle; the bench shows the point on the unit circle with its cosine and sine, and draws the sine and cosine waves as the angle grows.
```

**Try this**

1. Move to 0°, 90°, 180°, 270°.
2. Find angles where sine and cosine are equal.
3. Watch the point and the waves together.
4. Check that sin² + cos² stays at 1.

**What you should notice:** the point's height is the sine wave and its width is the cosine wave, and the squared values always add to 1.

## Where it appears in AI

* **Positional encodings** in Transformers use sines and cosines of different frequencies.
* **Cosine similarity** measures direction (see [[Cosine Similarity]]).
* **Rotations** of images, vectors and robot joints.
* **Signals and audio** decompose into sine waves.

## Common pitfalls

* **Degrees vs radians.** Check the units in code.
* **Reading sine as "height" for every triangle.** It is opposite over hypotenuse.
* **Assuming sin(a + b) = sin a + sin b.** It is not additive.
* **Forgetting that both repeat.** Many angles share a value.

## Quick check

<details><summary>1. What is sin 90° and cos 90°?</summary>
1 and 0.
</details>

<details><summary>2. If sin θ = 0.6 and θ is in the first quarter, what is cos θ?</summary>
0.8 (since 0.36 + 0.64 = 1).
</details>

<details><summary>3. What is the period of sin θ?</summary>
2π radians (360°).
</details>

## Key terms

* **Unit circle:** the circle of radius 1 around the origin.
* **Sine and cosine:** the height and width of a point on the unit circle.
* **Period:** the length after which a wave repeats.
* **Amplitude:** a wave's peak height.

## Related

[[Angles and Radians]] · [[Cosine Similarity]] · [[Graphs and Transformations]] · [[Dot Product]]
