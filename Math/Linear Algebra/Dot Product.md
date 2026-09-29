The **dot product** combines two vectors into a single number that tells you how much they point in the same direction. It is the most-used operation in AI: a neuron's weighted sum, the similarity between two word embeddings, and the attention scores inside a transformer are all dot products.

**You need:** [[Vectors]] (a list of numbers, or an arrow) and [[Scalars]] (a single number).

## The question it answers

Given two arrows, how *aligned* are they? Two people walking in the same direction are aligned. Two walking in opposite directions are not. Two walking at right angles have nothing in common. The dot product turns that idea into one number.

## Intuition: shadows

Shine a light straight down onto arrow **a**, and look at the shadow that arrow **b** casts on it.

* If **b** leans the same way as **a**, the shadow lies along **a** and the dot product is **positive**.
* If **b** is exactly sideways to **a**, it casts no shadow and the dot product is **zero**.
* If **b** leans the opposite way, the shadow lies backwards and the dot product is **negative**.

The dot product is the length of **a** times the (signed) length of that shadow. That is why longer vectors give bigger numbers.

## Two ways to compute it

**1. Multiply matching entries, then add.** For vectors of the same length:

```text
a · b = a₁b₁ + a₂b₂ + … + aₙbₙ
```

**2. Lengths and angle.** If θ is the angle between the arrows:

```text
a · b = |a| |b| cos θ
```

Both always give the same answer. The first is what a computer does. The second is what explains the meaning. Because cos θ is 1 when the arrows agree, 0 at a right angle and −1 when they oppose, the sign of the dot product tells you the relationship at a glance.

## A worked example

Take **a** = (2, 1) and **b** = (1, 3).

**Entries:** a · b = (2 × 1) + (1 × 3) = **5**

**Lengths and angle:** |a| = √5 ≈ 2.236 and |b| = √10 ≈ 3.162. Since a · b = |a||b| cos θ:

```text
cos θ = 5 / (√5 × √10) = 5 / √50 ≈ 0.707   →   θ = 45°
```

The arrows are 45° apart, and both methods agree. Now try a perpendicular pair, **a** = (2, 1) and **c** = (−1, 2):

```text
a · c = (2 × −1) + (1 × 2) = −2 + 2 = 0
```

Zero means perpendicular (for non-zero vectors).

> [!note] A useful special case
> A vector dotted with itself gives the square of its length: a · a = a₁² + a₂² + … = |a|². That is how the length of a vector is computed.

## Bench

```bench
id: dot-product
title: Dot product playground
fallback: Two arrows a and b start at the origin. Dragging either tip changes their lengths and directions, and the page shows a · b, the angle between them, and the shadow of b on a.
```

**Try this**

1. Press **Perpendicular**. Read the dot product, then drag a tip a little. When does the dot product turn positive, and when does it turn negative?
2. Press **Same direction**, then make **b** twice as long with the length slider. What happens to a · b? What happens to cos θ?
3. Set both vectors to the same direction, then rotate **b** all the way around. Where is the dot product largest, zero and smallest?
4. Press **Unit length (cosine similarity)**. The dot product now equals cos θ exactly. Why?

**What you should notice:** the dot product depends on length *and* direction, but cos θ depends on direction only. To compare direction alone, divide by both lengths:

```text
cosine similarity = (a · b) / (|a| |b|)
```

## Where it appears in AI

* **A neuron** computes a dot product of its inputs with its weights, then adds a bias: `w · x + b`.
* **Embeddings and search:** when words, images or documents are stored as vectors, "similar" usually means a high dot product or a high cosine similarity. Searching a large collection of documents is comparing dot products.
* **Attention in [[Transformers]]:** every word's *query* vector is dotted with every other word's *key* vector, and the (scaled) results decide where the model looks.
* **Matrix multiplication** is just many dot products: each entry of the result is a row dotted with a column. See [[Matrices]].

## Common pitfalls

* **The result is a number, not a vector.** Two vectors go in, one scalar comes out.
* **Size can fool you.** A huge vector pointing only vaguely your way can out-score a small vector pointing straight at you. When length is irrelevant, use cosine similarity.
* **Vectors must be the same length.** You cannot dot a 3-number vector with a 4-number vector.
* **It is not the entry-by-entry product.** Multiplying matching entries gives a new vector. The dot product goes one step further and adds them up.
* **Cosine similarity needs non-zero vectors.** The zero vector has no direction, so the ratio is undefined.

## Quick check

<details><summary>1. What is (3, 4) · (4, −3)? What does it tell you?</summary>
(3 × 4) + (4 × −3) = 12 − 12 = 0, so the two vectors are perpendicular.
</details>

<details><summary>2. Vector a = (1, 0). Compare a · (5, 0) with a · (100, 0), and their cosine similarities.</summary>
The dot products are 5 and 100, but both cosine similarities are exactly 1, because both vectors point the same way. Dot product reflects length; cosine similarity does not.
</details>

<details><summary>3. What is (3, 4) · (3, 4), and what is it the square of?</summary>
9 + 16 = 25, the square of the vector's length, 5.
</details>

## Related

[[Vectors]] · [[Vector Operations]] · [[Matrices]] · [[Gradients]] · [[Transformers]]
