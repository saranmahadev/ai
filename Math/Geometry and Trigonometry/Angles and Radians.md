An **angle** measures a turn. **Degrees** split a full turn into 360 parts, and **radians** measure it by the length of the arc it cuts from a circle of radius 1, so a full turn is 2π. Radians are the natural unit for calculus and for nearly all formulas in code.

**You need:** [[Coordinates and Distance]].

## The question it answers

"How do I measure a turn, and why do programmers use radians?" Every rotation, wave and cosine similarity involves an angle, and libraries expect radians.

## Intuition: walking around a circle

Stand at the centre of a circle of radius 1 and turn. The distance you would have walked along the edge, the **arc length**, is the angle in radians. A full turn walks the circumference `2π ≈ 6.283`, so a full turn is 2π radians; a half turn is π; a quarter turn is π/2.

```text
360° = 2π rad          180° = π rad          90° = π/2 rad
degrees → radians:  multiply by π/180
radians → degrees:  multiply by 180/π
1 rad ≈ 57.30°
```

## Arc length and sectors

For a circle of radius `r` and an angle `θ` in radians:

```text
arc length  s = r · θ
sector area A = ½ · r² · θ
```

These clean formulas hold only in radians, which is why mathematicians prefer them.

## A worked example

Convert 60° to radians and use it:

```text
60° × π/180 = π/3 ≈ 1.0472 rad
```

On a circle of radius 2 with angle π/3, the arc length is `2 × 1.0472 = 2.0944` and the sector area is `½ × 4 × 1.0472 = 2.0944`.

Check with a full circle: `r = 2`, `θ = 2π` gives arc `4π ≈ 12.566`, the circumference `2πr`. ✓

Angles wrap: 370° is the same direction as 10°. Modulo captures this: `θ mod 360°` (see [[Rounding, Absolute Value and Modulo]]).

## Bench

```bench
id: radian-wheel
title: Angles in degrees and radians
fallback: A slider sets an angle; the bench shows it on a circle with the arc highlighted, in degrees and radians, with the arc length and sector area for a chosen radius.
```

**Try this**

1. Move to 90°, 180°, 360° and read the radians.
2. Find the angle where the arc length equals the radius (1 radian).
3. Change the radius: what changes and what stays the same?
4. Go past 360° and watch it wrap.

**What you should notice:** a radian is the angle whose arc equals the radius, and the arc length grows in proportion to both the angle and the radius.

## Where it appears in AI

* **Rotations** in graphics, robotics and image augmentation use radians.
* **Sinusoidal position encodings** in Transformers use angles.
* **Cosine similarity** is the cosine of the angle between two vectors (see [[Cosine Similarity]]).

## Common pitfalls

* **Feeding degrees to a radian function.** `sin(90)` is not 1 in most languages.
* **Forgetting to wrap.** 370° and 10° point the same way.
* **Using arc-length formulas in degrees.** They need radians.
* **Confusing π (a number) with 180° (an angle).** π radians *equals* 180°.

## Quick check

<details><summary>1. Convert 45° to radians.</summary>
π/4 ≈ 0.7854.
</details>

<details><summary>2. What is the arc length for r = 5, θ = 2 radians?</summary>
10.
</details>

<details><summary>3. What is 3π/2 radians in degrees?</summary>
270°.
</details>

## Key terms

* **Angle:** a measure of turn.
* **Radian:** the angle whose arc equals the radius.
* **Degree:** 1/360 of a full turn.
* **Arc length:** the length of the curve cut off by an angle.

## Related

[[Coordinates and Distance]] · [[Sine, Cosine and the Unit Circle]] · [[Cosine Similarity]] · [[Rounding, Absolute Value and Modulo]]
