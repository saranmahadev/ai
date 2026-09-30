A **continuous random variable** can take any value in a range, so no single value has positive probability. Instead it has a **density**: a curve whose **area** over an interval is the probability of landing in that interval. The **normal (bell curve)** is the most important density in all of statistics and machine learning.

**You need:** [[Random Variables]], [[Integrals]] and [[Exponential and Logarithmic Functions]].

## The question it answers

"How likely is a measurement to fall in this range?" Heights, temperatures, errors and model weights vary continuously.

## Intuition: probability as area

Draw the density `f(x)`. The total area under it is 1. The probability of falling between `a` and `b` is the area between them:

```text
P(a ≤ X ≤ b) = ∫ₐᵇ f(x) dx        and P(X = x) = 0 for any single x
```

The height of the density is **not** a probability (it can exceed 1); only areas are.

## Common densities

```text
Uniform(a, b):     flat at 1/(b − a) on [a, b]        mean (a + b)/2
Exponential(λ):    f(x) = λ e⁻ˡˣ for x ≥ 0            P(X > t) = e⁻ˡᵗ      mean 1/λ
Normal(μ, σ²):     f(x) = (1 / (σ√(2π))) · e^(−(x − μ)² / (2σ²))
```

The normal is fixed by its mean `μ` (centre) and standard deviation `σ` (width). Convert any normal value to a **z-score** `z = (x − μ)/σ` to measure how many standard deviations it lies from the mean. The **68–95–99.7 rule** says about 68% of values fall within 1σ of the mean, 95% within 2σ and 99.7% within 3σ.

## A worked example

Heights are normal with `μ = 170` cm and `σ = 10` cm.

```text
P(160 < X < 180) = P(−1 < Z < 1) ≈ 0.6827          (within one σ)
P(X > 190)       = P(Z > 2)     ≈ 0.0228           (about 2.3%)
z-score of 185   = (185 − 170) / 10 = 1.5
```

For an exponential wait with rate `λ = 0.5` per minute (mean 2 minutes): `P(wait > 3) = e^(−1.5) ≈ 0.2231`.

Uniform(0, 10): `P(2 < X < 5) = 3/10 = 0.3`, the width of the interval times the height `1/10`.

## Bench

```bench
id: area-probability
title: Probability as area under a curve
fallback: Choose a uniform, normal or exponential density and set its parameters; two sliders pick the ends of an interval, the region under the curve is shaded and its area, the probability, is shown.
```

**Try this**

1. On the normal, shade from μ − σ to μ + σ and read the probability.
2. Widen to 2σ and to 3σ.
3. Change σ and see how the same interval's probability changes.
4. Try the exponential and read P(X > t).

**What you should notice:** probability is the shaded area, the total area is always 1, and a wider spread flattens the curve.

## Where it appears in AI

* **Noise and errors** are often modelled as normal.
* **Weight initialisation** draws from normal or uniform distributions.
* **Gaussian models and processes** describe continuous predictions with uncertainty.
* **Waiting times** and lifetimes follow exponential-like laws.

## Common pitfalls

* **Reading density height as probability.**
* **Forgetting that a single point has probability 0.**
* **Using the normal for skewed data** without checking.
* **Confusing σ with σ²** (standard deviation and variance).

## Quick check

<details><summary>1. For a normal, about what fraction lies within 2σ of the mean?</summary>
About 95%.
</details>

<details><summary>2. What is the z-score of 130 when μ = 100 and σ = 15?</summary>
2.
</details>

<details><summary>3. What is P(2 < X < 4) for Uniform(0, 8)?</summary>
2/8 = 0.25.
</details>

## Key terms

* **Density:** a curve whose area gives probability.
* **Normal distribution:** the bell curve set by mean and standard deviation.
* **z-score:** the distance from the mean in standard deviations.
* **Exponential distribution:** waiting times with a constant rate.

## Related

[[Random Variables]] · [[Integrals]] · [[Discrete Distributions]] · [[Central Limit Theorem]] · [[Variance and Standard Deviation]]
