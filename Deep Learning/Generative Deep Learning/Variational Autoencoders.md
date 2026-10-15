A plain [[Autoencoders|autoencoder]]'s bottleneck is one fixed vector per input — useful for compression, but there's no obvious way to "make up" a new, realistic vector to decode into something new. A **variational autoencoder (VAE)** fixes that by making the bottleneck a whole probability distribution instead of a single point, trained so that sampling *any* reasonable point from a known, simple distribution produces a plausible decoded output.

**You need:** [[Autoencoders]] and [[Generative vs Discriminative Models]].

## The question it answers

"A trained decoder can reconstruct known inputs — but how do I generate *new* ones that were never in the training set?" Train the encoder to describe each input as a small Gaussian distribution (a mean and a variance) rather than a single point, and push all those distributions to resemble a standard normal distribution — then sampling from that standard normal and decoding gives you new, never-seen data.

## Intuition: a neighbourhood, not a pin

A plain autoencoder places each input at one exact point in latent space — a pin on a map. A VAE instead places each input as a small cloud (a Gaussian) around a point — a neighbourhood, not a pin — and requires nearby points in that neighbourhood to decode into something similar. Because every input's cloud is also pushed to resemble a single shared standard normal shape, the *whole* latent space ends up densely, smoothly covered by overlapping neighbourhoods: any point you pick, even one never specifically seen during training, lands inside *some* input's learned neighbourhood and decodes into something plausible.

## Definitions

```text
encoder outputs:  μ (mean), log(σ²) (log-variance), per latent dimension

reparameterization trick:  z = μ + σ · ε,     ε ~ N(0, 1)   (sampling, but still differentiable in μ, σ)

loss = reconstruction error  +  KL( N(μ, σ²) ‖ N(0, 1) )
KL(N(μ, σ²) ‖ N(0, 1)) = ½(σ² + μ² − 1 − log σ²)
```

The KL term is what pulls every input's latent distribution toward the shared standard normal shape; without it, the model could ignore the "distribution" framing and collapse back toward a plain autoencoder's sharp points.

## A worked example

An encoder outputs `μ = 0.5`, `log(σ²) = −0.2` for one latent dimension. Sampling with a drawn standard-normal value `ε = 1.2`:

```text
σ = exp(−0.2 / 2) = exp(−0.1) ≈ 0.9048

z = μ + σ·ε = 0.5 + 0.9048 × 1.2 ≈ 1.5858

KL(N(0.5, 0.8187) ‖ N(0, 1)) = ½(0.8187 + 0.5² − 1 − (−0.2)) = ½(0.8187 + 0.25 − 1 + 0.2) ≈ 0.1344
```

A small KL value (0.1344) here means this particular input's distribution is already fairly close to the shared standard normal shape — not yet exactly there, but the training pressure is pulling it further in that direction with every step.

## Bench

```bench
id: vae-sample
title: Sampling from a learned distribution
fallback: An adjustable mean and log-variance for one latent dimension, plus a draggable random sample ε. See the resulting latent value z, and how far this distribution's KL divergence sits from the standard normal target.
```

**Try this**

1. Set μ and σ to match the standard normal (μ=0, log-variance=0) and watch KL drop to exactly 0.
2. Push μ or σ far from the standard normal and watch KL grow.
3. Change ε and watch z move, while μ and σ (and so KL) stay exactly the same.

**What you should notice:** ε is pure randomness drawn fresh every time; μ and σ are what the encoder actually learned for this input, and are the only part of z's computation that training can push toward (or away from) the standard normal.

## Where it appears in AI

* **Generating new samples** at inference time simply means sampling `z ~ N(0, 1)` directly (no encoder needed) and running it through the decoder.
* **The reparameterization trick** is what makes training possible at all — sampling on its own isn't differentiable, but expressing the sample as a differentiable function of μ, σ and an independent random ε is.
* **[[Generative Adversarial Networks|GANs]] and [[Diffusion Models]]** are alternative generative approaches that solve the "generate something new" problem by entirely different means, each with their own trade-offs against a VAE's approach.

## Common pitfalls

* **Forgetting the KL term's role.** Without it, nothing pushes different inputs' latent distributions to overlap or resemble a common shape, and sampling randomly from the prior would likely land in "empty" regions the decoder never learned to handle.
* **Treating z as fully determined by the input.** It genuinely depends on a random draw (ε) as well as the encoder's output — the same input produces a different z (though from the same distribution) on repeated encodings.
* **Expecting VAE samples to be as sharp as GAN samples.** VAEs are well known for often producing somewhat blurrier outputs than adversarial approaches, a direct consequence of how their loss is structured.

## Quick check

<details><summary>1. What does a VAE's encoder output, instead of a single vector?</summary>
A mean and variance (describing a Gaussian distribution) for each latent dimension.
</details>

<details><summary>2. Why is the reparameterization trick necessary?</summary>
Directly sampling from a distribution isn't differentiable; rewriting the sample as μ + σ·ε (with ε drawn independently) keeps μ and σ differentiable, so gradients can still flow through the sampling step during training.
</details>

<details><summary>3. What does the KL divergence term in the loss encourage?</summary>
It pushes each input's learned latent distribution to resemble the standard normal distribution, so that the whole latent space is smoothly, densely covered and sampling from the standard normal at generation time produces plausible outputs.
</details>

## Key terms

* **Variational autoencoder (VAE):** an autoencoder whose bottleneck is a learned probability distribution rather than a fixed vector.
* **Reparameterization trick:** expressing a random sample as a differentiable function of learned parameters and independent noise.
* **KL divergence:** a measure of how different two probability distributions are, used here to pull latent distributions toward the standard normal.

## Related

[[Autoencoders]] · [[Generative vs Discriminative Models]] · [[Generative Adversarial Networks]] · [[Diffusion Models]]
