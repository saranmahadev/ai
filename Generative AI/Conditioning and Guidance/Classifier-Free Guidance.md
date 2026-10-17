[[Classifier Guidance]] works, but it needs a second model — a classifier trained specifically to work on noisy, partially-denoised samples. This note covers the technique that replaced it almost everywhere: getting the same steering effect from one model alone.

**You need:** [[Classifier Guidance]].

## The question it answers

"Can you guide generation toward a condition without training a separate classifier at all?" **Classifier-free guidance (CFG)** trains a single model to produce both an *unconditional* score (ignoring the condition) and a *conditional* score (using it), typically by randomly dropping the condition during training some fraction of the time. At sampling time, the two scores are combined by extrapolating *past* the conditional score, away from the unconditional one — which pushes samples more strongly toward the condition than simply using the conditional score on its own would.

## Intuition

Imagine knowing both what someone would say about a photo with no hint of what it's of, and what they'd say once told "it's a cat." The *difference* between those two answers is exactly the part attributable to "cat." Classifier-free guidance doesn't just take the "told it's a cat" answer — it takes that difference and adds *more than one copy of it* on top of the unconditional answer, deliberately overshooting past what simply conditioning on "cat" would give you, to produce something even more unmistakably cat-like.

## Definition and notation

```text
uncond score:  ∇x log p(x)          (no condition used)
cond score:    ∇x log p(x | y)      (condition y used)

CFG score:  uncond + g · (cond − uncond)
  g = 0:  pure unconditional generation
  g = 1:  exactly the plain conditional score — no extrapolation
  g > 1:  overshoots past the conditional direction (typical production values: 2–8)
```

## A worked example

The same two-cluster toy setup as [[Classifier Guidance]], with the "condition" now being an entire target distribution centered at `(2, 0)` rather than a classifier's opinion. Starting from the origin (where the unconditional score is exactly zero):

```text
g = 0:  score (0.000, 0.000)  →  step lands at (0.000, 0.000)   (pure unconditional)
g = 1:  score (2.000, 0.000)  →  step lands at (1.000, 0.000)   (plain conditional)
g = 2:  score (4.000, 0.000)  →  step lands at (2.000, 0.000)   (right at the cluster center)
g = 4:  score (8.000, 0.000)  →  step lands at (4.000, 0.000)   (overshoots past it)
```

At `g = 1`, the result exactly matches what plain conditioning (ignoring the unconditional score entirely) would give. At `g = 2`, the extrapolation already lands beyond where a single conditional step would — and by `g = 4`, the step has overshot the cluster's own center by a factor of two, which is the real, documented trade-off CFG makes: stronger adherence to the condition, at the cost of sometimes pushing past what the data distribution itself would naturally produce.

## Bench

```bench
id: cfg-extrapolate
title: Classifier-free guidance overshoots on purpose
fallback: Adjust a CFG guidance scale and watch a toy denoising step move past where plain conditioning would land.
```

**Try this**

1. Set guidance scale to 1 and confirm it matches plain conditional generation.
2. Raise it toward 2 and watch the step land right at the target cluster's center.
3. Push it to 4 and notice the step overshoots well past the cluster.

**What you should notice:** guidance scale 1 is not "no guidance" — it's exactly what conditioning alone gives you; guidance only starts extrapolating *past* that once the scale exceeds 1.

## Where it appears in AI

* **Classifier-free guidance is the standard conditioning method in modern [[Text-to-Image Pipelines|text-to-image models]]**, specifically because it needs no separate classifier and trains naturally alongside the main model.
* **Typical production guidance scales (often 5–8) are well past g=1**, confirming that real systems deliberately overshoot the plain conditional direction to get sharper adherence to a text prompt.
* **Too high a scale is a known failure mode** — oversaturated colors, exaggerated or distorted features — directly caused by extrapolating too far past the conditional score.

## Common pitfalls

* **Thinking g=1 means "no guidance."** g=0 means no guidance (purely unconditional); g=1 means ordinary conditioning, with no extrapolation at all.
* **Assuming higher guidance scale is strictly better.** It trades diversity and realism for stronger condition-adherence — past a point, output quality visibly degrades.
* **Forgetting this needs the model trained to produce both scores.** CFG only works because the model was trained (typically by randomly dropping the condition during training) to represent the unconditional distribution as well as the conditional one — it's not a free property of any conditional model.

## Quick check

<details><summary>1. What's the key difference between classifier-free guidance and classifier guidance?</summary>
Classifier-free guidance needs only one model, trained to produce both conditional and unconditional scores; classifier guidance needs a second, separately trained classifier that can evaluate noisy samples.
</details>

<details><summary>2. In the worked example, what guidance scale reproduces plain conditional generation exactly?</summary>
g = 1 — at that scale, the CFG formula reduces to exactly the conditional score, with no extrapolation.
</details>

<details><summary>3. Why would a practitioner deliberately choose a guidance scale greater than 1, knowing it overshoots?</summary>
Because the overshoot produces output that adheres more strongly and unambiguously to the condition (e.g. a text prompt), which is often worth the trade-off against sample diversity and realism, up to a point.
</details>

## Key terms

* **Classifier-free guidance (CFG):** steering a single model's generation by extrapolating past its conditional score, away from its unconditional score.
* **Guidance scale:** how far past the conditional score to extrapolate; g=1 is no extrapolation, g=0 is no guidance at all.
* **Condition dropping:** randomly training without the condition some fraction of the time, so one model learns both the conditional and unconditional distributions.

## Related

[[Classifier Guidance]] · [[Text-to-Image Pipelines]] · [[Cross-Attention Conditioning for Generation]]
