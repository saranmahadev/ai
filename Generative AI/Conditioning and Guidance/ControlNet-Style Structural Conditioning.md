Guidance and cross-attention both steer generation toward a *concept* — a class, a prompt — expressed as a direction or an attended-to embedding. Neither one *forces* an exact structure. This note covers conditioning that does: locking part of the output to a given structural signal and letting the rest be generated around it.

**You need:** [[Classifier Guidance]].

## The question it answers

"How do you generate an image that must follow an exact pose, edge map, or layout — not just resemble one?" **Structural conditioning** (the idea behind ControlNet) treats some of the output as *fixed* to a given control signal (an edge map, a depth map, a pose skeleton) at every step of generation, while the rest of the output is still produced by the ordinary denoising process, informed by what the fixed part implies about the surrounding content.

## Intuition

It's like tracing part of a drawing from a stencil while freehand-sketching everything around it to match. The stencil-traced lines don't move no matter what — they're locked. But the shading, color and detail you add around them still have to make sense given what the stencil shows, the same way a free hand naturally fills in a face around a pair of stencil-traced eyes.

## Definition and notation

```text
at every denoising step, for a point x = (x_controlled, x_free):
  x_controlled is pinned to the control signal c, every step: x_controlled := c
  x_free is updated normally, using the score at the *current* (partially
    locked) point — so it still "sees" the controlled part's influence
```

The locked coordinates never move; the free coordinates evolve exactly as they would in ordinary score-based generation, except that every gradient they follow is computed at a point that already has the control signal baked in.

## A worked example

Two toy data clusters at `(−2, −1)` and `(2, 1)` — so the first coordinate and the second coordinate are correlated within each cluster. Locking the first coordinate to a control value and letting the second evolve freely for 5 steps, starting from `(0, 0)`:

```text
control x = 2:   free coordinate settles at y ≈ 0.760   → point ≈ (2.000, 0.760)
control x = -2:  free coordinate settles at y ≈ -0.760  → point ≈ (-2.000, -0.760)
with no control (free start, symmetric):  stays at (0.000, 0.000)
```

Locking x to 2 pulls the point into the neighborhood of the cluster at `(2, 1)`, and the free y-coordinate follows along, settling toward (though not exactly reaching, in just 5 steps) that cluster's own y-value of 1. The locked coordinate never wavered from exactly 2; everything else in the result is downstream of that one fixed value.

## Bench

```bench
id: controlnet-structural
title: A locked structural coordinate steers the rest
fallback: Lock one coordinate to a control value and watch where the free coordinate settles as a toy denoising process runs.
```

**Try this**

1. Set the control value to 2 and watch the free coordinate drift upward toward the matching cluster.
2. Set it to −2 and watch the free coordinate drift downward instead.
3. Set it to 0 (between both clusters) and see which way the free coordinate goes, if either.

**What you should notice:** the locked coordinate is never influenced by the free one — only the reverse. Structural conditioning is a one-way constraint, not a negotiation between the fixed and free parts.

## Where it appears in AI

* **ControlNet-style conditioning lets a single pretrained text-to-image model accept an edge map, pose skeleton, or depth map as an additional, exact structural input**, without retraining the base model from scratch.
* **It composes directly with [[Cross-Attention Conditioning for Generation|text conditioning]] and [[Classifier-Free Guidance|guidance]]**: a generated image can simultaneously follow an exact pose *and* a text prompt describing style and content.
* **[[Inpainting and Outpainting|inpainting]] is a close relative**: a mask marks which pixels are "controlled" by the original image and which are free to be generated.

## Common pitfalls

* **Expecting the free part to influence the locked part.** The constraint only runs one way — the controlled coordinates are pinned regardless of what the free coordinates' gradients would otherwise suggest.
* **Over-constraining a structure that conflicts with the content being asked for.** A control signal pulled from one kind of scene, paired with a text prompt for a totally different kind of scene, can produce an image where the two pull against each other.
* **Assuming structural conditioning alone determines the output's style or content.** It only fixes the part of the output it directly controls; the rest is still shaped by whatever other conditioning (text, guidance) is present.

## Quick check

<details><summary>1. What's locked, and what's free, in structural conditioning?</summary>
A subset of the output's coordinates (the structural control signal, like an edge map or pose) is pinned exactly and never changes; the remaining coordinates are generated normally by the denoising process.
</details>

<details><summary>2. In the worked example, why did locking x to 2 cause the free y-coordinate to drift toward positive values?</summary>
Because the data cluster near x=2 is centered at y=1, so the denoising score at points near x=2 points the free y-coordinate upward, toward that cluster's own y-value.
</details>

<details><summary>3. Does the free coordinate's evolution ever affect the locked coordinate?</summary>
No — the constraint is one-directional; the locked coordinate is reset to the control value at every step regardless of what's happening to the free coordinate.
</details>

## Key terms

* **Structural conditioning:** pinning part of a generated output to an exact control signal throughout generation, while the rest is generated normally.
* **Control signal:** the structural input being enforced exactly — an edge map, depth map, or pose skeleton, for example.
* **One-way constraint:** the locked part of the output influences the free part, but never the reverse.

## Related

[[Classifier Guidance]] · [[Inpainting and Outpainting]] · [[Cross-Attention Conditioning for Generation]]
