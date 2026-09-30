The **KL divergence** `D(p ‖ q) = Σ p log(p / q)` measures how much extra surprise you incur by believing distribution `q` when the truth is `p`. It is zero only when the two agree, positive otherwise, and **not symmetric**: the divergence from `p` to `q` differs from the divergence from `q` to `p`.

**You need:** [[Cross-Entropy]] and [[Entropy]].

## The question it answers

"How different are two distributions?" It is the standard way to say how far a model's predictions are from the truth, or how far a learned distribution has moved from a prior.

## Intuition: the price of a wrong belief

Cross-entropy is the surprise you actually experience; entropy is the least it could be. Their gap is the KL divergence:

```text
D(p ‖ q) = Σ p(x) · log₂( p(x) / q(x) ) = H(p, q) − H(p)
D(p ‖ q) ≥ 0,   and  D(p ‖ q) = 0  ⇔  p = q
```

Because training a model with cross-entropy changes only `q`, and `H(p)` is a constant of the data, **minimising cross-entropy is the same as minimising KL divergence** from the data distribution to the model.

## Not a distance

KL divergence is asymmetric: `D(p ‖ q) ≠ D(q ‖ p)`, and it does not satisfy the triangle inequality, so it is a *divergence*, not a distance. It blows up if `q(x) = 0` where `p(x) > 0`: believing something impossible that happens costs infinite surprise.

## A worked example

`p = (0.5, 0.5)` (truth) and `q = (0.9, 0.1)` (belief):

```text
D(p ‖ q) = 0.5·log₂(0.5/0.9) + 0.5·log₂(0.5/0.1)
         = 0.5 × (−0.848) + 0.5 × 2.322 = 0.737 bits
D(q ‖ p) = 0.9·log₂(0.9/0.5) + 0.1·log₂(0.1/0.5)
         = 0.9 × 0.848 + 0.1 × (−2.322) = 0.531 bits
```

The two directions differ (0.737 versus 0.531). Direction matters: `D(p ‖ q)` punishes a model for missing where the truth puts probability; `D(q ‖ p)` punishes it for putting probability where the truth does not.

## Bench

```bench
id: kl-match
title: Match one distribution to another
fallback: Sliders set a target distribution and a predicted distribution over three outcomes; the bench shows both as bars and reports the KL divergence in both directions, so you can drive it to zero by matching them.
```

**Try this**

1. Match the prediction to the target and read the divergence.
2. Move one outcome's probability toward zero where the target has mass.
3. Compare D(p‖q) with D(q‖p).
4. Find a pair where they differ a lot.

**What you should notice:** the divergence is zero only for a perfect match, it is not symmetric, and it grows sharply as the prediction assigns near-zero probability to something that can happen.

## Where it appears in AI

* **Training classifiers and language models** minimises the KL from data to model (via cross-entropy).
* **Variational autoencoders and RL policies** use KL as a regulariser to keep a distribution near a reference.
* **Model comparison and distillation** measure how different two models' outputs are.

## Common pitfalls

* **Treating it as symmetric or as a distance.**
* **Zero probabilities:** infinite divergence when `q` rules out something `p` allows.
* **Swapping the arguments** unknowingly (frameworks differ).
* **Mixing bits and nats.**

## Quick check

<details><summary>1. What is D(p ‖ p)?</summary>
0.
</details>

<details><summary>2. Is D(p ‖ q) always equal to D(q ‖ p)?</summary>
No.
</details>

<details><summary>3. Cross-entropy is 1.7 bits and the true entropy is 1.0. What is the KL?</summary>
0.7 bits.
</details>

## Key terms

* **KL divergence:** the extra surprise from using `q` instead of `p`.
* **Divergence:** a non-negative measure of difference that need not be symmetric.
* **Relative entropy:** another name for KL divergence.
* **Regulariser:** a penalty term such as a KL to a reference.

## Related

[[Cross-Entropy]] · [[Entropy]] · [[Mutual Information]] · [[Loss Functions]] · [[Bayesian vs Frequentist]]
