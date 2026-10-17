[[ControlNet-Style Structural Conditioning|structural conditioning]] locks part of a generated output to an exact value. This note covers the specific, very common case where that "exact value" comes from a real image: part of the output is known (because it's an existing photo), and the rest has to be generated to match.

**You need:** [[ControlNet-Style Structural Conditioning]].

## The question it answers

"How do you fill in a missing region of an image, or extend one past its original edges?" **Inpainting** fills a masked-out region that's surrounded by known pixels on multiple sides, so the generation has strong evidence from every direction about what belongs there. **Outpainting** extends an image past its original border, where the generated region has evidence from only one direction — and, intuitively, should become progressively less certain the further it gets from the known content.

## Intuition

Filling in a torn-out piece from the *middle* of an old photograph is a much better-constrained problem than guessing what's past its *edge* — in the middle, the surrounding pixels on every side all constrain the answer; past the edge, only the content immediately bordering it offers any clue, and that clue gets weaker and weaker in influence the further out you go. The mechanism in both cases is the same locking idea from [[ControlNet-Style Structural Conditioning|structural conditioning]], but where the known pixels sit around the gap determines how confident the result can be.

## Definition and notation

```text
inpainting: minimize Σ(x_{i+1} − x_i)²  given both endpoints fixed
  → the exact minimizer is linear interpolation between the two known values
    (a discrete harmonic / smoothness-prior solution)

outpainting: minimize Σ(x_{i+1} − x_i)² + λ·Σxᵢ²  given only one endpoint fixed
  → the solution decays from the known value toward the prior mean (here, 0)
    as it moves away from the anchor; larger λ decays faster
```

## A worked example

Filling 3 missing values between two known anchors, 10 and 50, by minimizing total squared adjacent differences — the exact solution is linear interpolation, confirmed by gradient descent landing on the same answer:

```text
inpaint 10 → 50 over 5 positions:  10.00  20.00  30.00  40.00  50.00
```

Extending past a single known anchor of 50, with no second anchor to pull toward, instead decays toward a prior mean of 0 — and how fast it decays depends entirely on how strongly that prior pulls (λ):

```text
λ = 0.30 (strong pull to prior):  50.00  29.25  17.28  10.49   6.86   5.27
λ = 0.05 (weak pull to prior):    50.00  41.78  35.65  31.30  28.52  27.16
```

Inpainting's result is fully determined by two known values and stays exactly linear between them. Outpainting's result starts at the known value but drifts toward an arbitrary prior the further it goes — exactly the intuition that content "far from the edge" should get less certain, not more.

## Bench

```bench
id: inpaint-outpaint
title: Filling a gap vs. extending past the edge
fallback: Compare values generated between two known anchors against values generated past a single anchor, at different prior strengths.
```

**Try this**

1. Look at inpaint mode and confirm the filled values interpolate linearly.
2. Switch to outpaint mode and watch the generated sequence decay away from the known anchor.
3. Raise the prior strength λ and watch the decay happen faster.

**What you should notice:** inpainting's result only depends on the two known values and λ plays no role; outpainting's result depends on both the one known value and how strongly λ pulls it toward a generic answer.

## Where it appears in AI

* **Production inpainting tools (removing an object from a photo, filling a torn region) rely on exactly this "constrained from multiple sides" property** to produce confident, consistent fills.
* **Outpainting tools (extending a photo's canvas) are a known weaker guarantee** — content generated far from the original image's edge is, by the nature of the problem, less constrained by real evidence.
* **[[Video Editing and Interpolation|frame interpolation]] is inpainting applied along the time axis instead of space**: filling in a frame that's "missing" between two known frames, with evidence from both sides.

## Common pitfalls

* **Expecting outpainted content far from the edge to be as reliable as inpainted content.** The worked example's own math shows why it can't be — outpainting has only one-sided evidence, which necessarily weakens with distance.
* **Assuming inpainting and outpainting use fundamentally different algorithms.** Both are the same "some pixels locked, some free, minimize a smoothness-plus-prior objective" idea — what differs is only how many sides of the gap have known values.
* **Forgetting a mask's shape matters, not just its size.** A thin gap surrounded almost entirely by known pixels is a much better-constrained inpainting problem than a large gap with a short known boundary.

## Quick check

<details><summary>1. Why is inpainting generally more reliable than outpainting?</summary>
Inpainting has known pixels constraining the missing region from multiple directions, while outpainting only has known pixels on one side, leaving the generated content progressively less constrained the further it extends.
</details>

<details><summary>2. In the worked example, what determined how quickly outpainted values decayed toward the prior mean?</summary>
The strength of the prior-pull term, λ — a larger λ caused faster decay toward the prior mean, while a smaller λ let the known anchor's value persist longer.
</details>

<details><summary>3. What's the exact mathematical solution to the inpainting worked example, and why?</summary>
Linear interpolation between the two known anchors — it's the exact minimizer of total squared adjacent differences with both endpoints fixed, a discrete harmonic (smoothness-prior) solution.
</details>

## Key terms

* **Inpainting:** generating a masked region surrounded by known pixels on multiple sides.
* **Outpainting:** extending an image past its original border, with known pixels only on one side of the generated region.
* **Prior mean:** the generic value a one-sided generation process drifts toward as it moves away from known evidence.

## Related

[[ControlNet-Style Structural Conditioning]] · [[Image-to-Image Translation and Style Transfer]] · [[Video Editing and Interpolation]]
