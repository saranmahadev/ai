Every conditioning technique so far steers generation toward something. This note is about moving *between* two already-generated results, smoothly — and about why the obvious way to do that (a straight line) isn't usually the right one.

**You need:** [[Variational Autoencoders]].

## The question it answers

"How do you smoothly morph between two generated outputs, through their latent representations?" **Linear interpolation (lerp)** draws a straight line between two latent vectors. **Spherical interpolation (slerp)** instead follows the arc between them on the sphere of a given radius — and for latents whose *norm* matters to how a decoder interprets them (common when latents are drawn from something like a Gaussian, where most of the probability mass sits at a fairly consistent distance from the origin), slerp keeps that norm roughly constant along the path, while lerp doesn't.

## Intuition

Walking in a straight line between two points on the surface of a globe takes you *through* the globe, not along it — the direct path dips below the surface before rising back up to the destination. Walking the great-circle arc instead stays on the surface the whole way. Latent interpolation has the same geometry problem: a straight line between two latent vectors of similar length passes through points *closer to the origin* than either endpoint, which — for many generative decoders — corresponds to a point that doesn't look like a confident sample of anything.

## Definition and notation

```text
lerp(a, b, t)  = (1−t)·a + t·b                                    t ∈ [0, 1]

slerp(a, b, t) = sin((1−t)θ)/sin(θ) · a  +  sin(tθ)/sin(θ) · b
  θ = angle between a and b
```

## A worked example

Two unit-length latent vectors 90° apart, `a = (1, 0)` and `b = (0, 1)`:

```text
t = 0.00:  lerp (1.000, 0.000) |1.000|    slerp (1.000, 0.000) |1.000|
t = 0.25:  lerp (0.750, 0.250) |0.791|    slerp (0.924, 0.383) |1.000|
t = 0.50:  lerp (0.500, 0.500) |0.707|    slerp (0.707, 0.707) |1.000|
t = 0.75:  lerp (0.250, 0.750) |0.791|    slerp (0.383, 0.924) |1.000|
t = 1.00:  lerp (0.000, 1.000) |1.000|    slerp (0.000, 1.000) |1.000|
```

At the midpoint, linear interpolation's norm has shrunk to 0.707 — about 71% of either endpoint's length — while spherical interpolation's norm stays exactly 1.000 the entire way. Both paths start and end at exactly the same two points; only what happens *between* them differs.

## Bench

```bench
id: latent-interpolation
title: Interpolating between two latents
fallback: Slide between two latent vectors using linear and spherical interpolation and compare their paths and norms.
```

**Try this**

1. Move t from 0 to 1 and watch both paths trace out between the same two endpoints.
2. Watch the lerp path's norm dip in the middle while slerp's stays constant.
3. Compare the two curves drawn on the canvas — one is a straight line, the other follows the circle.

**What you should notice:** the two interpolations agree exactly at the endpoints (t=0 and t=1) and diverge everywhere in between, with lerp cutting the "inside" of the arc that slerp follows along its edge.

## Where it appears in AI

* **GAN and diffusion-model latent-space exploration tools almost always use slerp**, not lerp, specifically to avoid passing through lower-norm regions that tend to decode into blurrier or less coherent intermediate samples.
* **[[Variational Autoencoders|VAE]] latents are typically drawn to resemble a standard Gaussian**, where almost all the probability mass sits near one particular distance from the origin — exactly the setting where norm-preserving interpolation matters.
* **"Latent space walks"** — a common way to visualize what a generative model has learned — are built by interpolating (usually spherically) between sampled latents and decoding each intermediate point.

## Common pitfalls

* **Assuming lerp and slerp always differ meaningfully.** When two latents are nearly identical (θ close to 0) or when the decoder doesn't care about latent norm, the two methods barely differ in practice.
* **Forgetting slerp is undefined (or numerically unstable) at θ = 0.** When the two latents point in exactly the same direction, there's no unique arc between them — most implementations fall back to lerp in that case.
* **Interpolating in the wrong space.** Interpolating raw pixel values between two images produces a ghostly double-exposure, not a smooth morph — the whole point of latent interpolation is that the *latent* space, not pixel space, is where intermediate points decode into plausible content.

## Quick check

<details><summary>1. What's the key geometric difference between lerp and slerp?</summary>
Lerp follows a straight line between two points; slerp follows the arc between them along a circle (or sphere) of roughly constant radius.
</details>

<details><summary>2. In the worked example, what happened to each method's norm at the midpoint?</summary>
Lerp's norm dropped to about 0.707, noticeably shorter than either endpoint's length of 1.000; slerp's norm stayed at exactly 1.000 throughout.
</details>

<details><summary>3. Why might a shrunken-norm latent point decode into a worse sample?</summary>
Because many generative decoders are built around latents drawn from a distribution (like a standard Gaussian) where most of the probability mass sits at a fairly consistent distance from the origin — a point much closer to the origin than that is an atypical input the decoder wasn't well-trained on.
</details>

## Key terms

* **Linear interpolation (lerp):** a straight-line blend between two points, parameterized by t ∈ [0, 1].
* **Spherical interpolation (slerp):** an interpolation that follows the arc between two vectors, keeping their norm roughly constant along the path.
* **Latent space walk:** a sequence of decoded outputs along an interpolated path between two (or more) latent points.

## Related

[[Variational Autoencoders]] · [[ControlNet-Style Structural Conditioning]] · [[Any-to-Any Generative Models]]
