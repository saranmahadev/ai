[[Stochastic Gradient Descent]] estimates the true gradient (averaged over the whole dataset) using only a **batch** of examples at a time. That estimate is noisy, and how noisy it is — and therefore how the whole training run behaves — depends directly on how many examples go into the batch.

**You need:** [[Stochastic Gradient Descent]] and [[Learning Rate Schedules and Warmup]].

## The question it answers

"Does batch size just trade speed for memory, or does it change how training actually behaves?" It changes both: a larger batch gives a less noisy gradient estimate, which changes how smoothly — and sometimes how well — training converges, not just how fast each step runs.

## Intuition: averaging quiets the noise

Each training example's gradient points in a slightly different direction; a batch gradient is their average. Averaging more independent, noisy measurements always produces a steadier estimate — exactly the [[Law of Large Numbers|law of large numbers]] at work. A batch of 1 example is as noisy as gradients get; a batch of the whole dataset has no sampling noise left at all (it is the true gradient).

## Definitions

```text
if each example's gradient has standard deviation σ (around the true gradient),
a batch of B examples averages to a gradient with standard deviation  σ / √B
```

Quadrupling the batch size halves the noise's standard deviation; it takes a 100× larger batch to cut the noise by a factor of 10.

## A worked example

With per-example gradient noise `σ = 1`:

```text
batch size (B)    1      4      16      64     256
noise std (σ/√B)  1.00   0.50   0.25    0.125  0.0625
```

Going from a batch of 1 to a batch of 4 (four times the data per step) only halves the noise; reaching a noise level eight times smaller than a single example needs a batch 64 times larger. Shrinking noise gets expensive fast — which is why batch size is usually chosen for a practical sweet spot, not driven all the way down to zero noise.

## Bench

```bench
id: batch-noise
title: Batch size and the noisiness of a training run
fallback: Gradient descent on a simple bowl-shaped loss, with noise added to every step scaled by 1/√(batch size). Compare the wobbly path of small batches against the smooth path of large ones.
```

**Try this**

1. Set batch size to 1 and watch the path zig-zag noisily toward the minimum.
2. Raise it to 64 and compare how much smoother the same number of steps looks.
3. Try a very large batch and notice the path becomes almost deterministic — but doesn't necessarily get there faster in wall-clock time, since each step now costs more to compute.

**What you should notice:** a smaller batch's path is noisier step to step but can still reach the minimum; a larger batch's path is smoother but needs more computation per step to get the same noise reduction.

## Where it appears in AI

* **Small-batch noise can act like a mild regulariser:** some research credits part of why small-batch SGD sometimes generalises better to this noise helping escape sharp, narrow minima.
* **Large-batch training** (see [[Training at Scale]] and [[Distributed and Data-Parallel Training]]) needs techniques like learning-rate warmup specifically because a suddenly much cleaner gradient estimate can otherwise take too-large, unstable steps.
* **Batch normalization's statistics** (see [[Batch Normalization]]) are themselves computed per batch, so very small batches make those statistics noisy too — another reason batch size is rarely taken to the extreme.

## Common pitfalls

* **Assuming bigger batches are strictly better.** They reduce gradient noise but cost more memory and compute per step, and can need a different learning rate to match.
* **Changing batch size without revisiting the learning rate.** A noise level appropriate for batch 32 is not automatically appropriate for batch 1024.
* **Forgetting batch size interacts with normalization layers.** Very small batches make batch statistics unreliable (see [[Batch Normalization]]).

## Quick check

<details><summary>1. If the per-example gradient noise has standard deviation 2, what is the noise of a batch-of-16 gradient?</summary>
2 / √16 = 2 / 4 = 0.5.
</details>

<details><summary>2. Why does cutting the noise by a factor of 10 need a 100× larger batch, not a 10× larger one?</summary>
Noise scales as `1/√B`, so to shrink it by 10 you need `B` to grow by `10² = 100`.
</details>

<details><summary>3. Is a batch of the entire dataset's gradient noisy?</summary>
No — it is exactly the true gradient, with no sampling noise at all (though it is the most expensive single step to compute).
</details>

## Key terms

* **Batch size:** the number of examples averaged into one gradient estimate.
* **Gradient noise:** the random variation of a batch gradient around the true, full-dataset gradient.
* **Law of large numbers:** the statistical fact that averaging more samples reduces estimation noise.

## Related

[[Stochastic Gradient Descent]] · [[Law of Large Numbers]] · [[Learning Rate Schedules and Warmup]] · [[Training at Scale]]
