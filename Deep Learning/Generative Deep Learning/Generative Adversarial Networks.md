A **generative adversarial network (GAN)** trains two networks against each other: a **generator** that turns random noise into fake samples, trying to fool the second network, and a **discriminator** that tries to tell real samples from the generator's fakes. Training is a contest — as one gets better, it forces the other to improve too.

**You need:** [[Variational Autoencoders]] and [[Generative vs Discriminative Models]].

## The question it answers

"Is there another way to train a generative model, besides a VAE's distribution-and-reconstruction approach?" Yes: instead of an explicit loss measuring reconstruction quality, let a second network — one explicitly trying to catch the first one's fakes — supply the training signal.

## Intuition: a forger and a detective, improving together

A forger (the generator) tries to paint fakes good enough to pass as originals; a detective (the discriminator) examines paintings and tries to spot the fakes. Neither starts out skilled. But as the detective gets better at spotting specific tells, the forger is forced to eliminate exactly those tells; as the forger's fakes get subtler, the detective is forced to look harder. Run this contest long enough, and (ideally) the forger's fakes become good enough that even a skilled detective can't reliably tell them from the real thing.

## Definitions

```text
generator G:        fake = G(noise)                 (turns random noise into a fake sample)
discriminator D:     D(x) = P(x is real), a probability in (0, 1)

discriminator loss:  −[ log D(real) + log(1 − D(fake)) ]      (wants D(real) high, D(fake) low)
generator loss:       −log D(fake)                              (wants D(fake) high — fool the discriminator)
```

The two losses pull in opposite directions on the same `D(fake)` value — exactly the adversarial contest.

## A worked example

A discriminator currently scores a real example `D(real) = 0.9` and a generated fake `D(fake) = 0.3`:

```text
discriminator loss = −[log(0.9) + log(1 − 0.3)] = −[log(0.9) + log(0.7)] ≈ 0.4620
generator loss (non-saturating form) = −log(0.3) ≈ 1.2040
```

The discriminator's loss is fairly low (0.4620) — it's doing a reasonable job, correctly leaning toward "real" for the real example and "fake" for the fake one. The generator's loss is considerably higher (1.2040) — it's currently being caught fairly easily, and that higher loss is exactly the training signal pushing it to produce more convincing fakes next.

## Bench

```bench
id: gan-losses
title: The forger and the detective's two losses
fallback: Adjustable discriminator scores for a real and a fake example. See the discriminator's loss and the generator's loss move in opposite directions as those scores change.
```

**Try this**

1. Push `D(fake)` toward 0 (confidently caught) and watch the generator's loss climb.
2. Push `D(fake)` toward 1 (the generator fooled the discriminator) and watch the generator's loss drop while the discriminator's loss rises.
3. Find settings where both losses are simultaneously low or high, and think about whether that's a stable state for the contest.

**What you should notice:** `D(fake)` pulls the two losses in opposite directions — good news for the generator (`D(fake)` near 1) is exactly bad news for the discriminator, and vice versa, which is the whole adversarial structure in miniature.

## Where it appears in AI

* **Image generation** was GANs' first major success, producing photorealistic faces, objects and scenes years before diffusion models became the dominant approach.
* **Style transfer and image-to-image translation** (turning sketches into photos, day scenes into night scenes) have used GAN-based architectures extensively.
* **The adversarial training signal itself** — one network's loss derived directly from another network's current performance — has influenced training setups well beyond pure generation.

## Common pitfalls

* **Expecting GAN training to be as stable as ordinary supervised training.** The adversarial setup is well known for instability (see [[Training Instabilities in GANs]]), unlike a VAE's single, well-behaved loss.
* **Confusing the discriminator's job with the final goal.** The discriminator is a training tool; at the end, only the generator is kept and used.
* **Forgetting that a "perfect" discriminator early in training can stall the generator.** If the discriminator becomes too good too fast, the generator may receive almost no useful gradient to improve from.

## Quick check

<details><summary>1. What does the discriminator's loss want D(real) and D(fake) to be?</summary>
D(real) close to 1 (correctly spotting real examples) and D(fake) close to 0 (correctly spotting fakes).
</details>

<details><summary>2. What does the generator's loss want D(fake) to be?</summary>
Close to 1 — meaning the discriminator was fooled into thinking the fake is real.
</details>

<details><summary>3. In the worked example, why is the generator's loss higher than the discriminator's?</summary>
The discriminator is currently doing fairly well at telling real from fake (D(real)=0.9, D(fake)=0.3), which is exactly the situation that produces a high loss for the generator, since its fakes are being caught.
</details>

## Key terms

* **Generator:** the network that turns random noise into fake samples.
* **Discriminator:** the network trained to distinguish real samples from the generator's fakes.
* **Adversarial training:** training two networks against each other's objectives simultaneously.

## Related

[[Variational Autoencoders]] · [[Generative vs Discriminative Models]] · [[Training Instabilities in GANs]] · [[Diffusion Models]]
