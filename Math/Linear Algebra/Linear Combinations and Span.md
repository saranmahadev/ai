A **linear combination** of vectors is a sum of scaled copies: `c₁v₁ + c₂v₂ + …`. The **span** of some vectors is the set of every point you can reach that way. How far a set of vectors can reach decides what a model can represent.

**You need:** [[Vector Operations]].

## The question it answers

"Starting from a few building-block vectors, what can I make?" Two arrows might reach the whole plane, or only a single line, depending on how they point.

## Intuition: mixing recipes

Take two ingredients, the vectors `v₁` and `v₂`. Choose how much of each (`c₁`, `c₂`, any real numbers, including negative) and add. Every mix is a linear combination, and all possible mixes form the span.

```text
c₁ v₁ + c₂ v₂
```

* Two vectors pointing in different directions can reach **every point in the plane**.
* Two vectors pointing along the same line reach **only that line**; the second adds nothing.
* One non-zero vector reaches a line; the zero vector reaches just the origin.

## Definition

```text
span{v₁, …, vₖ} = { c₁v₁ + … + cₖvₖ : all real numbers c₁, …, cₖ }
```

In 3D, two independent vectors span a plane and three span all of space.

## A worked example

Can `v₁ = (1, 0)` and `v₂ = (1, 1)` reach the target `t = (5, 4)`? Solve `a(1, 0) + b(1, 1) = (5, 4)`:

```text
(a + b, b) = (5, 4)   →   b = 4,  a = 1
```

Yes: `t = 1·(1, 0) + 4·(1, 1)`. Since any target `(x, y)` gives `b = y`, `a = x − y`, this pair spans the whole plane.

Now try `u₁ = (1, 2)` and `u₂ = (2, 4)`. Notice `u₂ = 2 u₁`, so every combination `a u₁ + b u₂ = (a + 2b) u₁` is just a multiple of `u₁`. The span is the single line through `(1, 2)`, and the target `(5, 4)` is unreachable.

## Bench

```bench
id: span-shader
title: What can these vectors reach?
fallback: Two vectors set by sliders and a mix of two coefficients draw the reachable region; the bench says whether the pair spans the plane or only a line.
```

**Try this**

1. Set v₁ = (1, 0), v₂ = (0, 1) and vary the coefficients.
2. Make v₂ a multiple of v₁. What happens to the reachable region?
3. Try to reach a target point and read the coefficients.
4. Find two different-looking vectors that still span only a line.

**What you should notice:** the reachable region is a plane unless the vectors line up, in which case it collapses to a line.

## Where it appears in AI

* **A neuron's output** is a linear combination of its inputs.
* **Embedding spaces:** every embedding is a combination of directions.
* **Model capacity:** features that lie in a smaller span cannot express everything.

## Common pitfalls

* **Assuming more vectors always mean a bigger span.** Redundant ones add nothing.
* **Restricting coefficients to positives.** Span allows any real number.
* **Confusing span with a set of two points.** It is all mixes.
* **Forgetting the origin is always in the span** (all coefficients zero).

## Quick check

<details><summary>1. What does span{(1, 0), (0, 1)} equal?</summary>
The entire plane.
</details>

<details><summary>2. What is the span of (2, 6) and (1, 3)?</summary>
The line through (1, 3), since (2, 6) = 2·(1, 3).
</details>

<details><summary>3. Write (4, 7) as a combination of (1, 0) and (0, 1).</summary>
4·(1, 0) + 7·(0, 1).
</details>

## Key terms

* **Linear combination:** a sum of scaled vectors.
* **Span:** all linear combinations of a set of vectors.
* **Coefficient:** the scalar multiplying a vector.
* **Plane / line:** the possible shapes of a span in 2D.

## Related

[[Vector Operations]] · [[Linear Independence and Basis]] · [[Rank and Null Space]] · [[Solving Linear Systems]]
