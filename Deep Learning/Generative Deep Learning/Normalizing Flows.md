Neither a [[Variational Autoencoders|VAE]] nor a [[Generative Adversarial Networks|GAN]] can tell you the exact probability their model assigns to a specific data point — a VAE only has an approximation, and a GAN has no likelihood at all. A **normalizing flow** builds its generator entirely out of transformations that are **invertible** and have a computable [[Jacobian]], which buys back an exact likelihood for every single point, in exchange for a real architectural constraint.

**You need:** [[Variational Autoencoders]] and [[Jacobian]].

## The question it answers

"Is there a generative model where I can compute the exact probability it assigns to any given data point, not just sample from it?" Yes — if every transformation from the simple base distribution to the data is invertible, the classic change-of-variables formula from probability gives you that exact probability for free.

## Intuition: stretching a dough, and tracking exactly how much it thinned

Imagine rolling out a ball of dough into a specific shape: every point in the original ball maps to exactly one point in the final shape, and the mapping can be reversed. Wherever the dough was stretched more, it got correspondingly thinner — that local stretching factor is exactly what the Jacobian measures. A normalizing flow builds a generator as a chain of such invertible "stretches," and the change-of-variables formula uses the *total* stretching factor to convert the simple base distribution's density into the correct density for the transformed data.

## Definitions

```text
x = f(z),    z ~ (simple base distribution, e.g. standard normal)
f must be invertible: z = f⁻¹(x)

change of variables:   p_x(x) = p_z(f⁻¹(x)) · |det(∂f⁻¹/∂x)|
                      = p_z(z) / |det(∂f/∂z)|            (for one invertible step)
```

Stacking several invertible transformations, each with its own computable Jacobian determinant, multiplies the correction factors together — still exactly computable, as long as every step was chosen to be invertible with a tractable Jacobian.

## A worked example

A single affine flow step, `x = f(z) = 2z + 3`, with `z ~ N(0, 1)`. The Jacobian here is just the scale factor, `2`. Evaluating the exact density at `x = 5`:

```text
z = f⁻¹(x) = (5 − 3) / 2 = 1

p_z(z=1) = standard normal density at 1 ≈ 0.2420

p_x(x=5) = p_z(z) / |2| = 0.2420 / 2 ≈ 0.1210
```

The transformation stretched the distribution by a factor of 2 (every unit of `z` becomes 2 units of `x`), so the density correspondingly thins out by that same factor — exactly what the `/ |det|` term in the formula accounts for.

## Bench

```bench
id: flow-density
title: Stretching a distribution and tracking its density
fallback: A simple affine flow with adjustable scale and shift. See the base distribution, the transformed distribution, and the exact density computed at a chosen point via the change-of-variables formula.
```

**Try this**

1. Increase the scale factor and watch the transformed distribution spread out while its peak density drops.
2. Decrease the scale factor below 1 and watch the opposite: a narrower, taller transformed distribution.
3. Move the evaluation point and check the computed density against reading the transformed curve directly.

**What you should notice:** the transformed density's peak height is inversely proportional to the scale factor — stretching a fixed amount of probability "mass" over a wider range necessarily thins out how densely packed it is at any one point.

## Where it appears in AI

* **Exact likelihood matters for some applications directly** — density estimation, certain scientific modelling tasks — where knowing precisely how probable a point is (not just being able to sample) is the whole point.
* **Real normalizing flows use far more expressive invertible transformations** than a simple affine map, specifically designed to have a Jacobian determinant that is still cheap to compute despite the transformation being complex.
* **Flows, VAEs, GANs and [[Diffusion Models|diffusion models]] are different trade-offs on the same underlying problem** — generate realistic samples — each giving up or keeping different things (exact likelihood, training stability, sample sharpness, generation speed).

## Common pitfalls

* **Assuming any invertible network qualifies as a usable flow.** The architecture also needs a Jacobian determinant that's cheap to compute — an arbitrary invertible network's Jacobian can be computationally intractable.
* **Forgetting the correction factor's job.** It is not optional bookkeeping; without dividing by the Jacobian determinant, the "density" computed would not actually integrate to 1 and wouldn't be a valid probability distribution.
* **Expecting flows to always outperform GANs or diffusion models on sample quality.** Exact likelihood is flows' specific advantage, not necessarily the sharpest or most realistic samples in every setting.

## Quick check

<details><summary>1. What capability do normalizing flows provide that VAEs and GANs don't?</summary>
An exact, computable likelihood (probability density) for any given data point, rather than an approximation or none at all.
</details>

<details><summary>2. In the worked example, why does the density at x=5 come out smaller than the density at z=1?</summary>
The transformation stretched the distribution by a factor of 2, thinning out the density by that same factor at the corresponding point.
</details>

<details><summary>3. What property must every transformation in a normalizing flow have?</summary>
It must be invertible, with a Jacobian determinant that is tractable (cheap) to compute.
</details>

## Key terms

* **Normalizing flow:** a generative model built from invertible transformations with computable Jacobians.
* **Change of variables:** the probability formula relating a base distribution's density to a transformed distribution's density via the Jacobian determinant.
* **Jacobian determinant:** the local stretching (or shrinking) factor a transformation applies to volume (or, in 1D, length).

## Related

[[Variational Autoencoders]] · [[Jacobian]] · [[Generative Adversarial Networks]] · [[Diffusion Models]]
