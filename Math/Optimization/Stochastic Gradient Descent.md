**Stochastic gradient descent** (SGD) takes each step using the gradient from a small random **mini-batch** of examples instead of the whole data set. Each step is noisy, but it costs far less, and on average it points the right way, which makes learning from millions of examples practical.

**You need:** [[Gradient Descent]], [[Loss Functions]] and [[Sums and Products]].

## The question it answers

"How can I train on a huge data set without touching every example for each step?" The exact gradient needs a pass over all `n` examples. SGD gets a good-enough direction from just a handful.

## Intuition: polling a small sample

The loss is an average over all examples, so its gradient is an average too. Compute that average over a random sample of `B` examples (the batch) and you get an *estimate*: noisy, but **unbiased**, meaning correct on average.

```text
full gradient:      g = (1/n) Σ gradient of loss on example i     (all n examples)
mini-batch:         ĝ = (1/B) Σ gradient over B random examples
update:             w ← w − η · ĝ
```

One pass over the data is an **epoch**. With batch size `B`, an epoch takes `n / B` steps.

## A worked example

Fit the single number `w` to data `(1, 2, 3, 4, 10)` by minimising `(1/5) Σ (w − xᵢ)²`. The gradient is `2(w − mean of the examples used)`. At `w = 0`:

```text
full data:   mean = 4         gradient = 2(0 − 4) = −8
batch {1, 2}:  mean = 1.5     gradient = −3       (too gentle)
batch {4, 10}: mean = 7       gradient = −14      (too strong)
```

Every batch points the same way (up), just with different length. Averaged over all possible batches, the estimate equals the full gradient. Noise shrinks with larger batches, roughly as `1/√B`, so going from `B = 1` to `B = 100` cuts the noise about tenfold.

Noise has a benefit: it can shake the parameters out of shallow valleys and saddle points. It also has a cost: SGD keeps jittering around the minimum rather than settling exactly, which is why the learning rate is usually decayed over time (see [[Learning Rate]]).

## Bench

```bench
id: noisy-batch
title: Noisy steps that still find the way
fallback: Sliders set the batch size and learning rate; the bench plots the parameter over 60 steps of mini-batch descent alongside full-batch descent, with a line at the true best value.
```

**Try this**

1. Use batch size 1 and watch the jitter.
2. Raise the batch size and watch the path smooth out.
3. Lower the learning rate at a small batch size to reduce the jitter.
4. Compare where each run settles.

**What you should notice:** small batches wander but on average head to the right place, larger batches are steadier, and a smaller rate calms the noise.

## Where it appears in AI

* **Almost all neural-network training** uses mini-batch SGD or a variant.
* **Batch size** is a key hyperparameter trading speed against noise.
* **Data loaders** shuffle the data each epoch to keep batches random.

## Common pitfalls

* **Not shuffling** the data, so batches are biased.
* **Comparing epochs across batch sizes:** steps per epoch differ.
* **Keeping the learning rate high** so the parameters never settle.
* **Assuming smaller batches are always better.** They are noisier and slower on modern hardware.

## Quick check

<details><summary>1. With 1,000 examples and batch size 50, how many steps per epoch?</summary>
20.
</details>

<details><summary>2. Is a mini-batch gradient exactly the full gradient?</summary>
No, but it is unbiased: correct on average.
</details>

<details><summary>3. Roughly how does noise change if the batch size is quadrupled?</summary>
It halves (noise falls like 1/√B).
</details>

## Key terms

* **Mini-batch:** a small random subset of the data.
* **Epoch:** one full pass through the data.
* **Unbiased estimate:** correct on average.
* **Batch size:** the number of examples per step.

## Related

[[Gradient Descent]] · [[Learning Rate]] · [[Loss Functions]] · [[Sampling and Bias]] · [[Momentum and Adam]]
