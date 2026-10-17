Both the sinusoidal encoding and [[Learned Positional Embeddings|learned positional embeddings]] tell a token its *absolute* position — "you are token number 7." Rotary position embedding (RoPE) asks a different question: instead of encoding where a token is, what if positional information only ever showed up as *how far apart* two tokens are, built directly into the attention computation itself?

**You need:** [[Learned Positional Embeddings]], [[Multi-Head Attention]].

## The question it answers

"Can positional information be built into attention so that only the *relative* distance between two tokens matters, with no notion of absolute position anywhere?" RoPE's answer: rotate each query and key vector by an angle proportional to its position, before computing attention scores. Because rotating two vectors by different amounts and then taking their dot product depends only on the *difference* between the two rotation angles, the resulting attention score ends up depending only on how far apart the two tokens are — never on their absolute positions.

## Intuition

Picture a query vector and a key vector as two hands on two separate clocks. Instead of writing a token's absolute position somewhere in the vector, RoPE spins each vector's clock hand by an angle proportional to its position. When two spun vectors are compared (via a dot product), the comparison naturally only "sees" how far apart the two clocks were spun relative to each other — spinning both clocks forward by the same extra amount changes nothing about how they compare to each other. That's exactly the relative-position property this topic is after.

## Definition and notation

For a 2D pair of a vector's components `(x₁, x₂)` and position `pos`, RoPE applies a rotation by angle `pos × θ`:

```text
rotate(x₁, x₂, angle) = (x₁ cos(angle) − x₂ sin(angle),  x₁ sin(angle) + x₂ cos(angle))
```

A full query or key vector is split into pairs of dimensions, each pair rotated by a position-dependent angle (different pairs typically use different frequencies, the same idea as the sinusoidal encoding's varying frequencies). The key mathematical fact: for query position `m` and key position `n`, `dot(rotate(q, m), rotate(k, n))` depends only on `m − n`, never on `m` and `n` individually.

## A worked example

A single 2D query `q = [1, 0.5]` and key `k = [0.3, -0.8]`, rotated by position and then compared via dot product, at several different absolute positions but the same relative distance:

```text
positions (m=2, n=5),   relative distance −3:  dot = 0.233063
positions (m=10, n=13), relative distance −3:  dot = 0.233063
positions (m=0, n=3),   relative distance −3:  dot = 0.233063

positions (m=5, n=5),     relative distance 0:  dot = −0.100000
positions (m=100, n=100), relative distance 0:  dot = −0.100000
raw dot(q, k), no rotation at all:              −0.100000
```

Three completely different pairs of absolute positions, all three at a relative distance of `−3`, produce the *exact same* attention score. And a relative distance of `0` always recovers the original, unrotated dot product — whatever the shared absolute position actually is.

## Bench

```bench
id: rope-relative
title: Rotation that only sees relative distance
fallback: Rotate a query and a key vector by two chosen positions and see that their dot product depends only on the distance between the two positions, not where they are absolutely.
```

**Try this**

1. Fix the relative distance between two positions and slide both positions together — watch the dot product stay fixed.
2. Change only the relative distance and watch the dot product change.
3. Set both positions equal (distance 0) and confirm the result matches the unrotated dot product.

**What you should notice:** the dot product is a function of exactly one number — the relative distance — no matter how large or small the two absolute positions themselves are.

## Where it appears in AI

* **It is the positional scheme used by many modern large language models**, directly addressing [[Learned Positional Embeddings|the fixed-table problem]]: there's no table to run out of, since the rotation formula is defined for any position.
* **It composes naturally with [[Multi-Head Attention]]**: the rotation is applied to queries and keys before the usual scaled dot-product computation, with nothing else about attention changed.
* **[[ALiBi and Length Extrapolation|the next topic]] takes a different, even simpler route** to a related goal — generalizing well to sequences longer than anything seen during training.

## Common pitfalls

* **Assuming RoPE adds anything to the vectors.** Unlike the sinusoidal encoding or learned embeddings, nothing is added — RoPE only rotates the existing query and key vectors.
* **Forgetting RoPE applies to queries and keys, not values.** The rotation specifically targets the vectors used to compute attention scores; the values being averaged together are untouched.
* **Expecting the relative-distance property to hold for arbitrary transformations.** It specifically relies on rotation's particular mathematical structure (rotating by `m` then comparing to rotating by `n` depends only on `m − n`) — not every positional scheme has this property.

## Quick check

<details><summary>1. What does RoPE do to a query or key vector, and what does it never do?</summary>
It rotates the vector by an angle proportional to its position; it never adds anything to the vector, unlike the sinusoidal encoding or learned positional embeddings.
</details>

<details><summary>2. In the worked example, why did three different position pairs all produce the exact same dot product?</summary>
Because all three pairs shared the same relative distance (−3), and RoPE's rotation makes the dot product of two rotated vectors depend only on that relative distance, not on the absolute positions themselves.
</details>

<details><summary>3. What happens to the dot product when two positions are equal (relative distance 0)?</summary>
It equals the original, unrotated dot product of the two vectors — rotating both by the same angle doesn't change their relationship to each other.
</details>

## Key terms

* **Relative position:** positional information expressed as the distance between two tokens, rather than either token's absolute index.
* **Rotation angle:** the position-proportional angle RoPE uses to rotate a vector's paired dimensions.
* **Rotary position embedding (RoPE):** a positional scheme that rotates queries and keys so attention scores depend only on relative distance.

## Related

[[Learned Positional Embeddings]] · [[Multi-Head Attention]] · [[ALiBi and Length Extrapolation]]
