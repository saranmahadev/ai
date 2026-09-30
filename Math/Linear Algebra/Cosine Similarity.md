**Cosine similarity** measures how closely two vectors point in the same direction, ignoring how long they are: `cos θ = (a · b) / (‖a‖ ‖b‖)`. It runs from 1 (same direction) through 0 (unrelated) to −1 (opposite), and it is the standard way to compare embeddings.

**You need:** [[Dot Product]], [[Norms and Distance]] and [[Sine, Cosine and the Unit Circle]].

## The question it answers

"Are these two things about the same thing, regardless of how much of it there is?" A long document and a short one on the same topic have very different word counts, but their word-count vectors point the same way.

## Intuition: compare arrows by angle

Length is often not the point. Two documents repeat the same words, one twice as often: the vectors are `(3, 1)` and `(6, 2)`. They differ in length but agree in direction. Dividing the dot product by both lengths removes the length and leaves the cosine of the angle between them.

```text
cos θ = (a · b) / (‖a‖ ‖b‖)
```

A quick shortcut: if you first scale both vectors to length 1, cosine similarity is just their dot product.

```text
cos θ =  1    same direction (angle 0°)
cos θ =  0    perpendicular (90°): no shared direction
cos θ = −1    opposite directions (180°)
```

## A worked example

Take three toy document vectors (counts of two words): `A = (3, 1)`, `B = (6, 2)`, `C = (1, 3)`.

```text
cos(A, B) = (3·6 + 1·2) / (√10 · √40) = 20 / 20 = 1.0
cos(A, C) = (3·1 + 1·3) / (√10 · √10) = 6 / 10 = 0.6
```

`B` is `A` doubled, so cosine similarity is exactly 1: same direction, different size. `C` leans towards the other word, so it is less similar (0.6, an angle of about 53°).

Compare with plain distance: `A` and `B` are far apart (distance `√10 ≈ 3.16`) even though they point the same way, which is why cosine is preferred when only direction carries meaning.

## Bench

```bench
id: cosine-angle
title: Direction versus length
fallback: A fixed vector A and a movable vector B show the cosine similarity, the angle, the dot product and the distance, with a control to rescale B without changing its direction.
```

**Try this**

1. Drag B around A. Where is the cosine 1? 0? −1?
2. Use the scale slider to lengthen B without turning it. What changes, and what does not?
3. Compare the cosine with the distance as B moves.
4. Find a B that is far from A but has a high cosine.

**What you should notice:** cosine similarity depends only on direction, so rescaling B leaves it unchanged, while distance and the dot product both change.

## Where it appears in AI

* **Embedding search:** find the documents or images whose vectors have the highest cosine with a query (see [[Embeddings and Similarity Search]]).
* **Recommendation:** users and items with similar preference directions.
* **Attention** compares queries and keys by an unnormalised dot product (see [[Attention as Dot Products]]).
* **Duplicate detection** and clustering of text.

## Common pitfalls

* **Using it when length matters.** It discards magnitude.
* **Dividing by a zero vector.** Its direction is undefined.
* **Reading 0.9 as "90% similar".** It is a cosine, not a percentage.
* **Confusing similarity with distance.** High cosine means *small* angle.

## Quick check

<details><summary>1. What is the cosine similarity of (1, 0) and (0, 1)?</summary>
0.
</details>

<details><summary>2. What is the cosine similarity of (2, 2) and (5, 5)?</summary>
1.
</details>

<details><summary>3. If cos θ = −1, what does that tell you?</summary>
The vectors point in opposite directions.
</details>

## Key terms

* **Cosine similarity:** the cosine of the angle between two vectors.
* **Normalisation:** rescaling a vector to length 1.
* **Angle:** the turn from one vector to the other.
* **Embedding:** a vector representing a word, image or item.

## Related

[[Dot Product]] · [[Norms and Distance]] · [[Sine, Cosine and the Unit Circle]] · [[Embeddings and Similarity Search]] · [[Attention as Dot Products]]
