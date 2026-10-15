Even with good initialization, one unlucky batch can produce a gradient with an enormous spike in one direction — enough to blow up the weights in a single step. **Gradient clipping** caps the gradient's size before it is used, so one bad step cannot wreck hours of training.

**You need:** [[Vanishing and Exploding Gradients]] and [[Gradient Descent]].

## The question it answers

"What stops one freak gradient from undoing all the progress training has made?" A hard limit on how big a single update step is allowed to be, applied every step, regardless of how large the raw gradient gets.

## Intuition: a speed limit, not a steering correction

Clipping does not change the *direction* a gradient points, only how far a step in that direction is allowed to go. Picture a gradient vector as an arrow: if its length exceeds some threshold, shrink the whole arrow back to that threshold length, keeping its direction exactly the same. Short gradients are left untouched; only the rare, oversized ones are reined in.

## Definitions

```text
g           the raw gradient vector
‖g‖         its length (norm)
threshold   the maximum allowed length, τ

clipped g = g                     if ‖g‖ ≤ τ
          = g · (τ / ‖g‖)         if ‖g‖ > τ      ("clip by global norm")
```

A simpler, cruder variant, **clip by value**, caps each component of `g` independently to `[−τ, τ]`; it is easier to compute but can distort the gradient's direction, since different components may get clipped by different amounts.

## A worked example

A two-component gradient `g = (0.3, 9.8)` — a small signal in one direction, a spike in the other — with clip threshold `τ = 1`:

```text
‖g‖ = √(0.3² + 9.8²) = √96.13 ≈ 9.8046

scale = τ / ‖g‖ = 1 / 9.8046 ≈ 0.1020

clipped g = (0.3 × 0.1020, 9.8 × 0.1020) ≈ (0.0306, 0.9995)
```

The clipped vector points in essentially the same direction (it is still almost entirely in the second component) but its length is now exactly 1 instead of 9.8 — the step this update takes is about a tenth the size it would otherwise have been.

## Bench

```bench
id: clip-step
title: Clipping an oversized gradient
fallback: A gradient arrow with two adjustable components and a clip-threshold slider. When the arrow's length exceeds the threshold, a second, shortened arrow shows the clipped step actually taken.
```

**Try this**

1. Set both components small and watch the clipped arrow sit exactly on top of the raw one — nothing is clipped.
2. Push one component very large and watch the clipped arrow shrink back to the threshold length, same direction.
3. Lower the threshold and see how much more often clipping kicks in.

**What you should notice:** the clipped arrow's direction never changes, only its length — and only when the raw arrow's length is already past the threshold.

## Where it appears in AI

* **Recurrent networks** (see [[Backpropagation Through Time]]) use gradient clipping almost by default, since their gradients are especially prone to spikes.
* **Large-scale training runs** (see [[Training at Scale]]) clip gradients routinely, since a single bad batch among millions can otherwise destabilise an entire run.
* **Reinforcement learning** updates, which can have very high-variance gradients, lean on clipping heavily too.

## Common pitfalls

* **Setting the threshold too low.** Clipping every step, not just the rare spikes, slows learning by always understating the true gradient.
* **Confusing clip-by-norm with clip-by-value.** Clip-by-value can change a gradient's direction, not just its size, by capping components unevenly.
* **Treating clipping as a fix for vanishing gradients.** It only caps gradients that are too large; a vanishing gradient needs the remedies in [[Vanishing and Exploding Gradients]] instead.

## Quick check

<details><summary>1. Does gradient clipping change the direction of a gradient that exceeds the threshold?</summary>
No — clip-by-norm rescales the whole vector by the same factor, so its direction is unchanged; only its length is capped.
</details>

<details><summary>2. What happens to a gradient whose norm is already below the threshold?</summary>
Nothing — it passes through clipping unchanged.
</details>

<details><summary>3. Why might clip-by-value be riskier than clip-by-norm?</summary>
It caps each component separately, which can change the gradient's direction when some components are clipped more than others.
</details>

## Key terms

* **Gradient clipping:** capping the size of a gradient before using it in an update.
* **Clip by norm:** rescaling the whole gradient vector to a maximum length, preserving direction.
* **Clip by value:** capping each component of the gradient independently.

## Related

[[Vanishing and Exploding Gradients]] · [[Gradient Descent]] · [[Backpropagation Through Time]] · [[Learning Rate Schedules and Warmup]]
