**Momentum** lets a walker keep some of its previous velocity, so it speeds up along steady slopes and smooths out zig-zags. **Adam** goes further: it also gives each parameter its own step size, based on how large its recent gradients have been. Together they are why modern networks train faster and more reliably than with plain gradient descent.

**You need:** [[Gradient Descent]], [[Learning Rate]] and [[Stochastic Gradient Descent]].

## The question it answers

"How do I move faster along shallow directions without bouncing across steep ones?" In a long narrow valley, plain gradient descent zig-zags across the walls and creeps along the floor.

## Intuition: a heavy ball

Momentum treats the parameters as a heavy ball rolling downhill. It builds up speed in the direction it keeps going, and side-to-side pushes that alternate in sign cancel out.

```text
velocity:   v ← β · v + g                 β ≈ 0.9 keeps 90% of the old velocity
update:     w ← w − η · v
```

If the gradient stays `g = 1` step after step, the velocity climbs `1, 1.9, 2.71, 3.44, …` towards `1 / (1 − β) = 10`: ten times faster than plain descent. If it alternates `+1, −1, +1, …` the velocity stays small.

## Adam: momentum plus per-parameter step sizes

Adam tracks two running averages of the gradient `g`: its mean `m` (the direction) and its mean square `v` (the typical size), with bias correction for the first steps.

```text
m ← β₁ m + (1 − β₁) g          v ← β₂ v + (1 − β₂) g²        (β₁ ≈ 0.9, β₂ ≈ 0.999)
m̂ = m / (1 − β₁ᵗ)              v̂ = v / (1 − β₂ᵗ)
w ← w − η · m̂ / (√v̂ + ε)                                     ε ≈ 10⁻⁸ avoids dividing by zero
```

Dividing by `√v̂` normalises each parameter's step: parameters with big, noisy gradients take smaller steps, and those with small steady gradients take relatively larger ones.

## A worked example

First Adam step with `g = 0.5`, `β₁ = 0.9`, `β₂ = 0.999`, starting from `m = v = 0`:

```text
m = 0.1 · 0.5 = 0.05          v = 0.001 · 0.25 = 0.00025
m̂ = 0.05 / 0.1 = 0.5          v̂ = 0.00025 / 0.001 = 0.25       √v̂ = 0.5
step = η · 0.5 / 0.5 = η
```

So the first Adam step is about `η` in size whatever the gradient's scale: it is close to `η · sign(g)`. That scale-invariance makes Adam forgiving about how gradients are scaled, and it is why many people start with Adam at `η = 0.001`.

## Bench

```bench
id: optimizer-race
title: Race the optimisers
fallback: Plain gradient descent, momentum and Adam start from the same point on a narrow valley; sliders set the learning rates and the momentum, and a step slider shows how far each has travelled, with paths drawn on a contour map.
```

**Try this**

1. Advance 30 steps and compare the three paths.
2. Raise the momentum and watch it overshoot, then settle.
3. Change the terrain to a round bowl and compare.
4. Change Adam's learning rate.

**What you should notice:** plain descent zig-zags in the valley, momentum builds speed along it, and Adam takes steps of a steady size.

## Where it appears in AI

* **Adam and AdamW** are the default optimisers for most deep-learning models, including Transformers.
* **SGD with momentum** remains common in computer vision.
* **Learning-rate schedules** are usually combined with these optimisers.

## Common pitfalls

* **Momentum too high** overshoots and oscillates.
* **Assuming Adam removes the need to tune η.** It is more forgiving, not free.
* **Forgetting the bias correction** in a hand-written version.
* **Dividing by a tiny `√v̂`** without `ε`.

## Quick check

<details><summary>1. With β = 0.9 and constant gradient 2, what velocity does momentum approach?</summary>
2 / (1 − 0.9) = 20.
</details>

<details><summary>2. What does Adam divide the step by?</summary>
√v̂, the typical size of recent gradients.
</details>

<details><summary>3. What does momentum do to alternating +1, −1 gradients?</summary>
Largely cancels them, so the velocity stays small.
</details>

## Key terms

* **Momentum:** keeping a running velocity of past gradients.
* **Adam:** an optimiser with momentum and per-parameter step sizes.
* **Bias correction:** rescaling early running averages.
* **Adaptive learning rate:** a step size adjusted per parameter.

## Related

[[Gradient Descent]] · [[Learning Rate]] · [[Stochastic Gradient Descent]] · [[Sequences and Series]] · [[Backpropagation by Hand]]
