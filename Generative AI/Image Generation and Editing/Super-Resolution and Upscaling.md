A low-resolution image has fewer pixels than you want — every upscaling method has to invent the missing ones somehow. This note covers the spectrum from the cheapest possible answer to a genuinely learned one.

**You need:** [[Text-to-Image Pipelines]].

## The question it answers

"How do you produce a higher-resolution image from a lower-resolution one?" The simplest answer, **nearest-neighbor upsampling**, just repeats each existing pixel to fill the new grid — fast, but visibly blocky. **Bilinear upsampling** instead linearly blends between each pixel's neighbors, producing smoother (if slightly blurry) transitions. Learned super-resolution models go further still, using a trained network (often diffusion-based) to hallucinate plausible fine detail that was never in the low-resolution image to begin with, rather than merely smoothing between the pixels that were.

## Intuition

Blowing up a small photo in basic image-editing software without any smart scaling gives you visibly chunky squares — that's nearest-neighbor, each original pixel's color simply repeated across a block. Blur the result slightly and the blockiness softens into gradients — that's roughly what bilinear interpolation does mathematically. Neither one adds information that wasn't there; a learned super-resolution model is the first step that actually can, by having seen many pairs of low- and high-resolution images and learned what plausible fine detail tends to look like.

## Definition and notation

```text
nearest-neighbor:  output pixel = nearest input pixel's value (repeated into a block)

bilinear:  output pixel = weighted average of the 4 nearest input pixels,
           weights determined by how close the output position is to each
```

## A worked example

A tiny 2×2 low-resolution grid `[[10, 20], [30, 40]]`, upsampled 2× to a 4×4 grid two different ways:

```text
nearest-neighbor:        bilinear:
10 10 20 20               10.00 12.50 17.50 20.00
10 10 20 20               15.00 17.50 22.50 25.00
30 30 40 40               25.00 27.50 32.50 35.00
30 30 40 40               30.00 32.50 37.50 40.00
```

Nearest-neighbor produces four hard-edged blocks of exactly the original four values. Bilinear instead produces a smooth gradient between them — every value strictly between 10 and 40, changing gradually across the grid rather than jumping at block boundaries. Neither method invents detail finer than what a smooth blend between the original four values can represent.

## Bench

```bench
id: super-resolution-upsample
title: Blocky vs. smooth upsampling
fallback: Compare nearest-neighbor and bilinear upsampling of the same tiny low-resolution grid at different scale factors.
```

**Try this**

1. Compare the two grids at the default scale factor.
2. Raise the scale factor and watch the nearest-neighbor side get blockier while bilinear stays smooth.
3. Consider what neither method can do: add detail finer than a smooth blend of the original four values.

**What you should notice:** bilinear always looks smoother, but it's still fundamentally limited to interpolating between the original pixels — it cannot add genuinely new information, which is exactly the gap a learned super-resolution model is trained to fill.

## Where it appears in AI

* **Diffusion-based super-resolution models condition a denoising process on the low-resolution image** (much like [[Text-to-Image Pipelines|text conditioning]], but with an image instead of text), letting the model hallucinate plausible detail rather than merely interpolate.
* **Nearest-neighbor and bilinear are still used constantly as cheap building blocks** — inside learned models (to resize feature maps between layers), and anywhere upscaling needs to be instant rather than learned.
* **Real super-resolution benchmarks measure against a known ground-truth high-resolution image**, which is exactly the setup [[Distributional Metrics (FID, Inception Score and CLIP Score)|distributional image metrics]] were built to score.

## Common pitfalls

* **Assuming any interpolation method can recover true lost detail.** Interpolation can only ever produce a smooth function of the pixels that exist — recovering plausible *new* detail requires a model that has learned what that detail tends to look like from other examples.
* **Confusing "smoother" with "more accurate."** Bilinear's smoothness is a side effect of linear blending, not evidence it's closer to what a higher-resolution camera would have actually captured.
* **Forgetting learned super-resolution models can hallucinate wrong detail.** Because they invent plausible-looking content rather than recovering real information, they can confidently add detail that looks reasonable but doesn't match what was actually there.

## Quick check

<details><summary>1. What's the key difference between nearest-neighbor and bilinear upsampling?</summary>
Nearest-neighbor repeats each original pixel's value across a block, producing hard edges; bilinear linearly blends between neighboring pixels, producing a smooth gradient instead.
</details>

<details><summary>2. In the worked example, why couldn't either method add detail finer than what's visible in the 2×2 original?</summary>
Because both are purely interpolation methods — they compute new pixel values as some combination (a copy, or a weighted blend) of the existing pixels, with no mechanism for introducing information that wasn't already present.
</details>

<details><summary>3. How does a learned super-resolution model differ fundamentally from interpolation?</summary>
It has been trained on many pairs of low- and high-resolution images, letting it generate plausible fine detail that was never present in the low-resolution input, rather than only smoothing between existing values.
</details>

## Key terms

* **Nearest-neighbor upsampling:** filling a larger grid by repeating each original pixel's value across a block.
* **Bilinear upsampling:** filling a larger grid by linearly blending between each position's four nearest original pixels.
* **Super-resolution:** producing a higher-resolution version of an image, ranging from simple interpolation to learned detail hallucination.

## Related

[[Text-to-Image Pipelines]] · [[Instruction-Based Image Editing]] · [[Distributional Metrics (FID, Inception Score and CLIP Score)]]
