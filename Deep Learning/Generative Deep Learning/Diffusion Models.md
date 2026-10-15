A **diffusion model** learns to generate by learning the opposite of something easy: gradually turning clean data into pure noise is a simple, fixed process with no learning involved at all; a diffusion model trains a network to run that process **backward**, turning noise back into data, one small denoising step at a time.

**You need:** [[Normalizing Flows]] and [[Variational Autoencoders]].

## The question it answers

"Generation from scratch is hard — is there an easier problem to train on that still gets you a generative model?" Yes: train a network to undo one small, fixed amount of noise at a time, repeated enough times, and starting from pure noise and running that trained denoiser repeatedly produces a sample.

## Intuition: un-developing a photograph, one grain at a time

Imagine a photograph progressively ruined by adding a little grainy noise, over and over, many times, until nothing recognisable remains — pure static. That forward process needs no learning; it's just adding noise on a fixed schedule. The hard, trained part is the *reverse*: a network that looks at a noisy image and predicts roughly what noise was just added, so it can be subtracted back out. Chain enough of these small denoising steps together, starting from pure static, and a recognisable image gradually emerges.

## Definitions

```text
forward process:  x_t = √(ᾱ_t) · x₀ + √(1 − ᾱ_t) · ε,     ε ~ N(0, 1)

ᾱ_t = ∏ (1 − β_s) for s = 1 to t      (cumulative product of per-step "keep" factors)
β_t = the (small, scheduled) amount of noise added at step t
```

This "jump directly to step t" formula is one of diffusion's most useful properties: you never need to simulate every intermediate noising step one by one — you can sample `x_t` straight from `x₀` and a single noise draw, using only `ᾱ_t`.

## A worked example

A toy 4-step noise schedule, `β = (0.1, 0.2, 0.3, 0.4)`:

```text
step (t)    ᾱ_t      signal weight √ᾱ_t    noise weight √(1−ᾱ_t)
1          0.9000    0.9487                 0.3162
2          0.7200    0.8485                 0.5292
3          0.5040    0.7099                 0.7043
4          0.3024    0.5499                 0.8352
```

By step 3, the signal and noise weights are almost equal (0.7099 versus 0.7043) — the data and the noise contribute almost equally to `x₃`. For `x₀ = 1` and a drawn noise value `ε = 0.5` at step 3: `x₃ = 0.7099 × 1 + 0.7043 × 0.5 ≈ 1.0621`. By step 4, the noise weight (0.8352) has clearly overtaken the signal weight (0.5499) — the original data is nearly swamped.

## Bench

```bench
id: diffusion-noise
title: Noising a value, step by step
fallback: A clean value and a noise schedule. Step forward through the noising process and watch the signal and noise weights trade off, then see how a trained reverse step would need to subtract the noise back out.
```

**Try this**

1. Step forward through the schedule and watch the signal weight shrink while the noise weight grows.
2. Find roughly which step the signal and noise weights cross over.
3. Try a gentler schedule (smaller β values) and see how many more steps it takes to reach the same amount of noise.

**What you should notice:** the signal weight and noise weight always satisfy `(signal weight)² + (noise weight)² = 1` — they trade off along a fixed budget, never both staying large or both shrinking together.

## Where it appears in AI

* **Modern state-of-the-art image generation** is largely built on diffusion models, having displaced GANs as the dominant approach for photorealistic image synthesis in recent years.
* **The reverse (denoising) network** is usually a large convolutional or attention-based architecture, trained to predict the noise that was added at a given step, given the noisy input and the step number.
* **Sampling requires running the reverse process many times** (often dozens to hundreds of steps), which is a genuine speed trade-off against GANs' single forward pass — a major area of ongoing research is reducing the number of steps needed.

## Common pitfalls

* **Assuming the forward (noising) process involves any learning.** It is entirely fixed and known in advance; only the reverse (denoising) process is trained.
* **Confusing the per-step noise schedule (β_t) with the cumulative signal/noise weights (ᾱ_t and its square root).** The schedule sets how much noise is added at each individual step; the cumulative weights describe the total effect by step t.
* **Expecting diffusion sampling to be as fast as a GAN's single forward pass.** Generating one sample typically requires many sequential denoising steps, a real computational cost diffusion pays for its other advantages.

## Quick check

<details><summary>1. What does the forward diffusion process do, and does it require training?</summary>
It gradually adds noise to data according to a fixed schedule, turning it into pure noise; no training is involved in this direction.
</details>

<details><summary>2. What does a diffusion model's network actually learn to predict?</summary>
Roughly how much noise was added at a given step, so that noise can be subtracted back out during the reverse (generation) process.
</details>

<details><summary>3. In the worked example, what happens to the balance between signal weight and noise weight as t increases?</summary>
The signal weight shrinks and the noise weight grows, with the two becoming roughly equal partway through the schedule and noise dominating by the final step.
</details>

## Key terms

* **Forward (noising) process:** the fixed, un-learned process of gradually adding noise to data.
* **Reverse (denoising) process:** the trained process of removing noise step by step, used to generate new samples.
* **Noise schedule:** the sequence of per-step noise amounts (β_t) controlling how quickly data is noised.

## Related

[[Normalizing Flows]] · [[Variational Autoencoders]] · [[Generative Adversarial Networks]] · [[Training Instabilities in GANs]]
