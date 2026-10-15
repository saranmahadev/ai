A [[Generative Adversarial Networks|GAN]]'s two networks are not cooperating toward one shared loss the way an ordinary supervised model's layers do — they are actively working against each other. That adversarial setup is exactly why GAN training is notoriously harder to keep stable than most other deep learning.

**You need:** [[Generative Adversarial Networks]] and [[Vanishing and Exploding Gradients]].

## The question it answers

"If the generator and discriminator are both just being trained by gradient descent, why is this specific setup so much harder to get right?" Because each network's loss landscape keeps shifting underneath it as the *other* network changes — and a couple of specific failure patterns show up again and again as a result.

## Intuition: two failure patterns worth knowing by name

**Mode collapse**: the generator discovers a small handful of outputs that reliably fool the current discriminator, and — having no incentive to explore further once those work — keeps producing just those, with little variety. **Vanishing gradients for the generator**: if the discriminator becomes too confident too early (correctly spotting fakes with near-certainty), the generator's naive loss formula can give it almost no useful gradient to learn from, right when it most needs guidance.

## Definitions

```text
original minimax generator loss:   log(1 − D(fake))     — saturates (near-zero gradient) when D(fake) is small
non-saturating generator loss:     −log(D(fake))          — stays large (strong gradient) when D(fake) is small
```

The non-saturating version is almost universally used in practice for exactly this reason: it gives the generator its *strongest* signal exactly when it is doing worst (being caught easily), rather than its weakest.

## A worked example

Comparing the gradient (with respect to `D(fake)`) of both loss formulations when the discriminator is confidently catching the generator's fakes, `D(fake) = 0.01`:

```text
original minimax loss gradient:    d/dD[log(1−D)] = −1/(1−D) = −1/0.99 ≈ −1.0101
non-saturating loss gradient:      d/dD[−log(D)]   = −1/D     = −1/0.01 = −100.0000
```

At exactly the moment the generator is being caught almost every time — precisely when it most needs a strong push to improve — the original loss's gradient magnitude is a modest 1.01, while the non-saturating loss's gradient magnitude is a massive 100. The non-saturating form gives roughly 100 times stronger training signal in this situation.

## Bench

```bench
id: saturating-grad
title: Saturating vs non-saturating generator gradients
fallback: A slider for D(fake). Compare the gradient magnitude of the original minimax generator loss against the non-saturating version, especially as D(fake) gets small.
```

**Try this**

1. Move D(fake) toward 0 (the generator being caught easily) and watch the two gradient magnitudes diverge sharply.
2. Move D(fake) toward 1 (the generator fooling the discriminator) and see the two formulas behave more similarly.
3. Find roughly where the two gradients cross over in magnitude.

**What you should notice:** the gap between the two formulas is largest exactly where training needs the most help — when the generator is currently losing badly.

## Where it appears in AI

* **The non-saturating loss is the practical default** in almost every real GAN implementation, specifically to avoid the vanishing-gradient trap shown here.
* **Mode collapse detection and mitigation** (tracking output diversity, specialised loss terms, architectural tweaks) is an entire sub-area of GAN research in its own right.
* **Alternative training objectives** (Wasserstein GANs and others, not covered in depth here) were developed specifically to make GAN training more stable, reformulating the adversarial game to behave better numerically.

## Common pitfalls

* **Assuming a GAN that trains without crashing is training well.** Stable-looking losses can still hide mode collapse — checking actual output diversity matters, not just the loss curves.
* **Using the original (saturating) minimax loss by default.** It is the textbook formula, but the non-saturating version is almost always the practical choice.
* **Treating instability as purely a hyperparameter problem.** Some of it is structural to the adversarial setup itself, not something any single learning rate or architecture choice fully eliminates.

## Quick check

<details><summary>1. What is mode collapse?</summary>
The generator settling on producing a small handful of outputs that reliably fool the discriminator, rather than a diverse range of outputs.
</details>

<details><summary>2. Why does the original minimax generator loss give a weak gradient exactly when the generator is doing poorly?</summary>
Its gradient, −1/(1−D(fake)), stays small in magnitude when D(fake) is small (the generator being easily caught) — the opposite of where strong training signal is most needed.
</details>

<details><summary>3. Why is the non-saturating loss preferred in practice?</summary>
Its gradient, −1/D(fake), grows large exactly when D(fake) is small, giving the generator a much stronger training signal precisely when it is losing badly.
</details>

## Key terms

* **Mode collapse:** a generator producing a narrow range of outputs rather than diverse ones.
* **Saturating gradient:** a gradient that shrinks toward zero in exactly the situation where a strong training signal is most needed.
* **Non-saturating loss:** a generator loss formulation chosen specifically to avoid that vanishing-gradient trap.

## Related

[[Generative Adversarial Networks]] · [[Vanishing and Exploding Gradients]] · [[Normalizing Flows]] · [[Diffusion Models]]
