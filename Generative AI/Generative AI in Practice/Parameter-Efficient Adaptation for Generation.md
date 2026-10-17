Adapting a huge generative model to a specific style, domain, or speaker (as in [[Voice Cloning and Speaker Adaptation]]) by retraining all of its weights would mean storing and updating a full new copy of the model for every adaptation. This note covers the standard trick for avoiding that: learning a tiny update instead of a full one.

**You need:** [[Voice Cloning and Speaker Adaptation]].

## The question it answers

"How do you adapt a large generative model's behavior without retraining all of its weights?" **LoRA** (low-rank adaptation) freezes the original weight matrix entirely and learns a small *correction* to it, expressed as the product of two much smaller matrices: `A` (d × r) and `B` (r × d), for some small rank `r` chosen far smaller than `d`. The adapted weight is simply the original plus that low-rank correction — `W' = W + A·B` — with only `2·d·r` new parameters learned, instead of the full `d²` a complete retraining would touch.

## Intuition

Rather than repainting an entire wall to adjust its color slightly, you could describe the exact color shift as a single thin, structured overlay — far less information than specifying every pixel's new color individually, if the shift itself is simple enough to describe that way. A low-rank update works the same way: it can't express arbitrary changes to a weight matrix (only ones expressible through a narrow "bottleneck" of size `r`), but a great many useful adaptations — a new style, a new speaker, a narrow new domain — turn out to be expressible through a bottleneck much narrower than the full matrix.

## Definition and notation

```text
original weight:  W           (d × d, frozen -- never updated)
low-rank update:  A (d × r), B (r × d)   -- r ≪ d, these are the only trained parameters
adapted weight:   W' = W + A·B

parameter count:
  full fine-tuning:  d²
  LoRA:              2·d·r
```

## A worked example

A 64×64 weight matrix, adapted with LoRA at rank 4:

```text
full fine-tuning parameters:  64 × 64 = 4,096
LoRA parameters (r=4):        2 × 64 × 4 = 512
savings:                       87.5% fewer trained parameters
```

Despite touching only 512 parameters instead of 4,096, the low-rank update still measurably changes the model's output: feeding the same input vector through the original weight matrix and the LoRA-adapted one produces outputs that differ by a magnitude of roughly 0.157 — a real, meaningful change in behavior, achieved at a small fraction of full fine-tuning's parameter cost.

## Bench

```bench
id: lora-adapt
title: A low-rank update instead of a full one
fallback: Adjust the LoRA rank and compare the parameter savings against a full fine-tune, alongside how much the adapted output actually changes.
```

**Try this**

1. Raise the rank and watch the parameter savings shrink.
2. Lower it toward 1 and see how close to total savings you can get.
3. Compare the output-change magnitude at a few different ranks.

**What you should notice:** even a very low rank still produces a meaningfully different output — the low-rank bottleneck limits *what kinds* of changes can be expressed, not how large an effect a learned change can have.

## Where it appears in AI

* **LoRA is the standard way to fine-tune large language and diffusion models for a specific style, domain, or task**, letting many different lightweight adaptations be stored and swapped for the cost of a few megabytes each, instead of a full multi-gigabyte model copy per adaptation.
* **It composes directly with [[Voice Cloning and Speaker Adaptation|other adaptation techniques]]** — a pitch-ratio shift and a LoRA update aren't competing methods; they can both be applied to the same base model for different aspects of adaptation.
* **The choice of rank is a real trade-off**: too low a rank can't express the needed adaptation well; too high a rank approaches the cost (and overfitting risk) of full fine-tuning without much added benefit.

## Common pitfalls

* **Assuming a low-rank update can express any possible change to a weight matrix.** It's mathematically restricted to the "bottleneck" a low rank allows — not every possible adaptation is expressible this way, which is why rank is a real, task-dependent choice.
* **Confusing parameter savings with training-cost savings more broadly.** LoRA sharply reduces trained parameters and storage per adaptation, but the forward pass still runs through the full (frozen) base model — it doesn't make the model itself smaller or faster to run.
* **Forgetting the base weights stay completely frozen.** Only `A` and `B` are ever updated; nothing about this method touches the original weight matrix `W` at all.

## Quick check

<details><summary>1. What does LoRA actually learn, as opposed to full fine-tuning?</summary>
A low-rank correction (the product of two small matrices, A and B) added onto a frozen original weight matrix, rather than updating every entry of the original matrix directly.
</details>

<details><summary>2. In the worked example, how many parameters did LoRA at rank 4 use compared to full fine-tuning, for a 64×64 matrix?</summary>
512 parameters (2 × 64 × 4) versus 4,096 for full fine-tuning — an 87.5% reduction.
</details>

<details><summary>3. Does a low-rank update's restricted expressiveness mean it can't meaningfully change a model's behavior?</summary>
No — the worked example shows a real, measurable change in output even at a small rank; the restriction limits what *kinds* of changes are expressible, not whether a change can be substantial.
</details>

## Key terms

* **LoRA (low-rank adaptation):** adapting a model by learning a low-rank correction to a frozen weight matrix, instead of updating the matrix directly.
* **Rank:** the size of the bottleneck dimension in a low-rank update, controlling how expressive (and how parameter-efficient) the adaptation is.
* **Parameter-efficient fine-tuning:** any adaptation method that updates far fewer parameters than the full model, of which LoRA is the most common example.

## Related

[[Voice Cloning and Speaker Adaptation]] · [[Building a Generative Product]] · [[Compute and Environmental Costs of Generative AI]]
