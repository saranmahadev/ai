[[Inpainting and Outpainting|inpainting]] fills in missing pixels surrounded by known ones. Frame interpolation is the exact same idea, just rotated: the "gap" to fill is in time rather than space, and what's known on either side is a whole frame instead of a few pixels.

**You need:** [[Inpainting and Outpainting]], [[Video Generation and Temporal Consistency]].

## The question it answers

"How do you generate the frames in between two frames you already have?" **Frame interpolation** treats the in-between frames exactly the way [[Inpainting and Outpainting|inpainting]] treats missing pixels between two known anchors: minimize total squared change between adjacent frames, with the known start and end frames fixed. Because both ends are known, the result is just as well-constrained as spatial inpainting was — unlike [[Video Generation and Temporal Consistency|generating new frames forward]], which only ever has evidence from one direction.

## Intuition

If you have a photo of a ball at the top of a bounce and another photo of it at the bottom, sketching plausible in-between positions is a well-posed problem — you know exactly where the motion starts and ends, you're just filling in a smooth path between them. That's a fundamentally easier task than predicting where the ball is going to end up with no second photo at all, which is what forward video generation has to do.

## Definition and notation

```text
given frame A (position a) and frame B (position b), n frames apart:
  interpolated frame i = a + (i/n)·(b−a)      for i = 0, ..., n

(this is exactly harmonic inpainting from the Image Generation and Editing
district, with "pixel value" replaced by "frame position")
```

## A worked example

Interpolating 3 frames between a known starting frame at position 10 and a known ending frame at position 50:

```text
known frame A:  10
interpolated:   20, 30, 40
known frame B:  50
```

This is the identical computation already verified in [[Inpainting and Outpainting]] — the only thing that changed is calling the sequence "frames over time" instead of "pixels across space." Both known frames are respected exactly, and the interpolated frames fall on a perfectly even path between them.

## Bench

```bench
id: frame-interpolation
title: Interpolating the frames in between
fallback: Choose how many frames to interpolate between two known frames and watch the generated positions fall evenly between them.
```

**Try this**

1. Set the number of interpolated frames low, then high, and watch the sequence stay evenly spaced either way.
2. Compare the two solid (known) endpoints against the hollow (interpolated) frames in between.
3. Notice the interpolated values never depend on anything except the two known endpoints and how many frames separate them.

**What you should notice:** this is the exact same harmonic-interpolation result from [[Inpainting and Outpainting]], applied along a different axis — nothing about the underlying math changed.

## Where it appears in AI

* **Video frame-rate upconversion (making a 30fps video look like 60fps) is built on exactly this idea**, generating new frames between existing ones rather than extending the video forward in time.
* **Real frame interpolation models usually interpolate in a learned feature space informed by motion (optical flow), not a flat linear path** — the toy linear version here shows the well-constrained *shape* of the problem, not the sophistication of a production method.
* **Slow-motion effects from standard-frame-rate footage are a direct application**: interpolating many frames between each pair of real frames to synthesize the missing in-between motion.

## Common pitfalls

* **Confusing frame interpolation with [[Video Generation and Temporal Consistency|forward video generation]].** Interpolation has evidence from both sides of the gap; forward generation only ever has evidence from one side (the past), which is a meaningfully harder-constrained problem.
* **Assuming a straight-line interpolation always looks right.** Real motion is rarely linear in pixel space — a ball's bounce accelerates and decelerates, which is exactly why production systems use learned motion models rather than this toy's flat linear path.
* **Forgetting both endpoints must be real, known frames.** The well-constrained property only holds because both sides of the gap are fixed; interpolating past either known frame is outpainting, not inpainting, and inherits that weaker guarantee.

## Quick check

<details><summary>1. Why is frame interpolation better-constrained than forward video generation?</summary>
Because frame interpolation has a known frame on both sides of the gap being filled, while forward generation only has evidence from the preceding frames, with nothing constraining where the sequence "should" end up.
</details>

<details><summary>2. In the worked example, what determines the interpolated frame values?</summary>
Only the two known endpoint positions and how many frames separate them — the same harmonic (linear) interpolation formula used for spatial inpainting.
</details>

<details><summary>3. What's a real limitation of using flat linear interpolation for video frames?</summary>
Real motion is rarely linear — accelerating or decelerating motion (like a bouncing ball) isn't well approximated by evenly-spaced positions, which is why production frame interpolation uses learned, motion-aware methods instead.
</details>

## Key terms

* **Frame interpolation:** generating frames between two known frames, analogous to inpainting across time instead of space.
* **Well-constrained:** having evidence on both sides of a gap, as opposed to only one side.
* **Frame-rate upconversion:** increasing a video's frame rate by interpolating new frames between existing ones.

## Related

[[Inpainting and Outpainting]] · [[Video Generation and Temporal Consistency]] · [[3D Asset and Scene Generation]]
