A [[Diffusion Models|diffusion model]] learns to denoise toward its training data in general — nothing in that process knows you specifically want a *dog*, or a *red* one. This note covers the first practical fix: using a separate classifier's own gradient to nudge each denoising step toward a chosen class.

**You need:** [[Diffusion Models]].

## The question it answers

"How do you make a diffusion model generate a specific class or concept, using a classifier trained separately from it?" **Classifier guidance** adds the gradient of a classifier's log-probability for the target class, scaled by a guidance strength, directly onto the diffusion model's own score (its learned gradient of log-density) at every denoising step. The classifier doesn't generate anything itself — it only tells the sampling process which direction would make the current (partially denoised) sample more convincingly belong to the target class, and that direction gets added to the ordinary denoising step.

## Intuition

Picture a hiker (the diffusion process) walking generally toward higher ground (higher data density) with no particular peak in mind. A park ranger (the classifier) standing somewhere specific calls out directions toward where they are, and the hiker blends that suggestion into their own sense of which way is uphill. A louder ranger (higher guidance scale) gets listened to more — and if they shout loud enough, the hiker will walk straight toward them even across terrain that isn't particularly uphill at all.

## Definition and notation

```text
unconditional score:      ∇x log p(x)                (the diffusion model's own gradient)
classifier gradient:      ∇x log p(y | x)             (a separately trained classifier)

classifier-guided score:  ∇x log p(x) + s · ∇x log p(y | x)
  s: guidance scale — s = 0 ignores the classifier entirely;
     larger s pulls samples more strongly toward class y
```

## A worked example

Two toy data clusters sit at `(−2, 0)` and `(2, 0)`. Starting exactly at the origin `(0, 0)` — equidistant from both, so the diffusion model's own score there is exactly zero — a classifier's gradient (built from a simple sigmoid separating the clusters along the first coordinate) pulls toward cluster 1:

```text
scale  0:  combined score (0.000, 0.000)  →  one step lands at (0.000, 0.000)
scale  2:  combined score (1.000, 0.000)  →  one step lands at (0.500, 0.000)
scale  5:  combined score (2.500, 0.000)  →  one step lands at (1.250, 0.000)
scale 10:  combined score (5.000, 0.000)  →  one step lands at (2.500, 0.000)
```

With no guidance, the point doesn't move at all — the diffusion model itself has no preference between the two equally likely clusters here. As guidance scale rises, the single step moves further toward cluster 1, overshooting its center `(2, 0)` once the scale gets large enough that the classifier's pull dominates completely.

## Bench

```bench
id: classifier-guidance
title: Steering a denoising step with a classifier
fallback: Adjust a guidance scale and watch a toy denoising step move toward one cluster, pulled there by a separate classifier's gradient.
```

**Try this**

1. Set guidance scale to 0 and confirm the point doesn't move — the diffusion model alone has no preference here.
2. Raise the scale and watch the point move toward cluster 1.
3. Push the scale high enough to see it overshoot the cluster center.

**What you should notice:** guidance scale directly controls how much the classifier's opinion outweighs the diffusion model's own sense of where the data lives — at scale 0 it's ignored completely, and past a point it dominates entirely.

## Where it appears in AI

* **Classifier guidance was the first widely used technique for controllable diffusion generation**, letting a single unconditional diffusion model be steered by any classifier trained on the same kind of data.
* **It requires training (or having) a separate classifier for the target labels** — a real cost that [[Classifier-Free Guidance|classifier-free guidance]] was specifically designed to remove.
* **The same mechanism generalizes past class labels**: any differentiable function of x whose gradient points toward "more of what you want" can be added the same way.

## Common pitfalls

* **Pushing guidance scale too high.** Past a point, samples start looking distorted or artifact-heavy — the classifier's gradient can point toward regions a classifier is confident about without those regions being realistic data at all.
* **Forgetting the classifier must be applicable to partially noised data.** A classifier trained only on clean images generally needs to be retrained (or adapted) to give useful gradients on the noisy intermediate samples a diffusion process actually works with.
* **Assuming guidance changes what the diffusion model learned.** It doesn't modify the model at all — it only adds an extra term to the sampling step, entirely at generation time.

## Quick check

<details><summary>1. What two things get added together to form the classifier-guided score?</summary>
The diffusion model's own unconditional score, and a separately trained classifier's gradient of log-probability for the target class, scaled by a guidance strength.
</details>

<details><summary>2. In the worked example, why did the point not move at all when guidance scale was 0?</summary>
Because the starting point was exactly equidistant from both data clusters, so the diffusion model's own score there was exactly zero — with no classifier contribution, there was nothing to move toward.
</details>

<details><summary>3. What does classifier guidance require that classifier-free guidance avoids needing?</summary>
A separate classifier, trained specifically to give useful gradients on partially noised samples.
</details>

## Key terms

* **Score:** the gradient of log-density, ∇x log p(x) — the direction a diffusion model nudges a sample toward higher data density.
* **Classifier guidance:** adding a scaled classifier gradient to a diffusion model's score at sampling time, to steer generation toward a chosen class.
* **Guidance scale:** the strength with which a guidance signal is blended into the denoising step.

## Related

[[Diffusion Models]] · [[Classifier-Free Guidance]] · [[ControlNet-Style Structural Conditioning]]
