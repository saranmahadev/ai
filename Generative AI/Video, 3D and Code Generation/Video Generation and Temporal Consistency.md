Generate a sequence of images one frame at a time, each independently, and you get something that technically shows motion but looks nothing like video — it flickers and jumps, because nothing ties one frame's content to the next. This note covers the specific problem of keeping frames coherent with each other, not just individually plausible.

**You need:** [[Text-to-Image Pipelines]].

## The question it answers

"Why doesn't generating a sequence of plausible images automatically produce a plausible video?" Each frame of a diffusion-generated sequence has its own randomness — its own noise, its own sampling — so two frames generated independently can each look fine on their own while still disagreeing wildly about where things are from one moment to the next. **Temporal consistency** means damping how much a frame is allowed to move away from the previous one, so successive frames stay correlated instead of each being an independent roll of the dice.

## Intuition

Flip through a stack of individually well-drawn photographs of the same scene, each drawn by a different artist with no sight of the others' work, and the "animation" will jump and flicker even though every single photograph looks fine. A flipbook only looks like smooth motion when each page is drawn *with the previous page in view* — exactly the difference between independently sampling every video frame and generating each frame as a damped continuation of the last.

## Definition and notation

```text
without consistency:  frameₜ = frameₜ₋₁ + step_size · score(frameₜ₋₁) + noiseₜ
                       (independent noise every frame → large frame-to-frame jumps)

with consistency (damping factor λ):
  frameₜ = frameₜ₋₁ + (1 − λ) · [step_size · score(frameₜ₋₁) + noiseₜ]
  (λ close to 1: barely move from the previous frame at all;
   λ = 0: identical to the undamped case)
```

## A worked example

Eight toy frames generated from the same starting point and the same random noise sequence, compared with and without a damping term:

```text
no consistency (λ=0):    total frame-to-frame motion = 7.599
with consistency (λ=0.7): total frame-to-frame motion = 2.183
```

Damping with λ=0.7 cut the total motion across all 8 frames by more than 70%, using the exact same underlying noise and the exact same pull toward the data distribution — the only change was how much of each frame's proposed movement was allowed to actually take effect.

## Bench

```bench
id: video-temporal-consistency
title: Jittery frames vs. a temporally consistent sequence
fallback: Adjust a temporal-consistency damping factor and watch the total frame-to-frame motion in a toy generated sequence.
```

**Try this**

1. Set λ to 0 and look at how jagged the resulting path is.
2. Raise λ toward 0.9 and watch the path smooth out into much smaller steps.
3. Compare the total-motion readout across a few different λ values.

**What you should notice:** every frame still ends up somewhere near the data distribution regardless of λ — consistency doesn't change *where* the content tends to go, only how abruptly it gets there from one frame to the next.

## Where it appears in AI

* **Real video diffusion models add temporal attention or 3D convolutions across frames** rather than a simple damping term, letting the model learn consistency directly instead of imposing it as a fixed rule — but the goal is identical to this worked example's.
* **Too much consistency produces a different, equally obvious failure**: a video that barely moves at all, since very high λ suppresses essentially all frame-to-frame change.
* **[[Video Editing and Interpolation|frame interpolation]] solves a related but distinct problem**: filling in frames *between* two already-fixed frames, rather than generating a new frame forward from one.

## Common pitfalls

* **Assuming independently-plausible frames are sufficient for a plausible video.** The worked example is built specifically to show this isn't true — each frame can be individually fine while the sequence as a whole flickers.
* **Treating temporal consistency as purely a post-processing smoothing step.** In the worked example, it's applied *during* generation, shaping every frame as it's produced, not blurring already-finished frames afterward.
* **Pushing the damping factor too high.** Past a point, the sequence stops showing meaningful motion at all — consistency and motion are a genuine trade-off, not a free improvement.

## Quick check

<details><summary>1. Why can a sequence of individually plausible frames still fail to look like video?</summary>
Because each frame's own randomness is independent of the others, so even though every single frame looks fine on its own, the content can jump around unpredictably from one frame to the next.
</details>

<details><summary>2. In the worked example, what changed between the two runs, and what stayed the same?</summary>
The damping factor λ changed, reducing how much of each frame's proposed movement was allowed to take effect; the underlying noise sequence and the pull toward the data distribution stayed identical in both runs.
</details>

<details><summary>3. What happens if the temporal-consistency damping factor is set too high?</summary>
The generated sequence barely moves at all from frame to frame, since almost none of each frame's proposed change is allowed to take effect — trading away motion entirely for consistency.
</details>

## Key terms

* **Temporal consistency:** keeping successive frames of a generated sequence correlated with each other, rather than independently sampled.
* **Damping factor:** how much of a frame's proposed change from the previous frame is suppressed to maintain consistency.
* **Frame-to-frame motion:** the total distance moved between consecutive frames across a sequence.

## Related

[[Text-to-Image Pipelines]] · [[Video Editing and Interpolation]] · [[Unified Multimodal Generation]]
