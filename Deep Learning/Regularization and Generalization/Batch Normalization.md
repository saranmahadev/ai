**Batch normalization** re-centres and re-scales a layer's activations, using the statistics of the current mini-batch, so every unit sees roughly mean-0, unit-variance inputs no matter how the layers before it are shifting during training. It then lets the network undo that normalization, with two learned numbers, if a different scale turns out to work better.

**You need:** [[Weight Initialization]] and [[Variance and Standard Deviation]].

## The question it answers

"As earlier layers' weights keep changing during training, doesn't every later layer have to keep adapting to a constantly shifting input distribution?" Batch normalization pins that distribution down to a fixed mean and variance at every step, so later layers train against a far steadier target.

## Intuition: a thermostat for each layer

Without normalization, a layer's inputs can drift in scale as training changes the weights feeding into it — like trying to cook with a stove whose heat setting keeps recalibrating itself. Batch normalization adds a thermostat: whatever the raw signal's scale happens to be this batch, rescale it back to a known, fixed range before using it. A learned scale `γ` and shift `β` then let the network dial the temperature back up or down deliberately, if that helps.

## Definitions

```text
for one unit, over a batch of values x₁, …, xₘ:

mean  μ = (1/m) Σ xᵢ
variance  σ² = (1/m) Σ (xᵢ − μ)²

normalized  x̂ᵢ = (xᵢ − μ) / √σ²          (mean 0, variance 1 across the batch)
output      yᵢ = γ · x̂ᵢ + β               (γ, β are learned, per unit)
```

If training ever finds that `γ = √σ²` and `β = μ` is best, the layer can fully undo the normalization — so batch normalization never removes the ability to use any scale, it just starts from a stable, fixed one.

## A worked example

One unit's values across a batch of 5: `x = (2, 4, 4, 4, 5)`, with learned `γ = 2`, `β = 1`:

```text
mean  μ = 3.8
variance σ² = 0.96,  √σ² ≈ 0.9798

x̂ = (−1.8371, 0.2041, 0.2041, 0.2041, 1.2247)

y = 2·x̂ + 1 = (−2.6742, 1.4082, 1.4082, 1.4082, 3.4495)
```

The three repeated values of 4 all normalize to the same `x̂`, and the output simply tracks their relative distance from the batch mean, rescaled to whatever `γ` and `β` the network has learned.

## Bench

```bench
id: batchnorm-step
title: Normalizing a batch of activations
fallback: Five adjustable activation values for one unit, plus learned scale γ and shift β. See the batch mean and variance, the normalized values, and the final output after applying γ and β.
```

**Try this**

1. Spread the five values far apart and watch the normalized values spread to match, always centred on 0.
2. Set all five values equal and see what happens to the variance (and watch the small stabiliser avoid a division by zero).
3. Set `γ = √(current variance)` and `β =` the current mean, and watch the output return to the original values.

**What you should notice:** the normalized values always have mean 0 regardless of the raw values' scale; `γ` and `β` are the only things standing between the normalized output and recovering the original input exactly.

## Where it appears in AI

* **Convolutional networks** (see [[Convolutional Neural Networks]]) use batch normalization heavily between convolutional layers.
* **Why batch size matters for batch normalization:** a very small batch (see [[Batch Size and Training Dynamics]]) gives a noisy estimate of the batch mean and variance, which can hurt training.
* **At test time**, batch normalization uses a running average of mean and variance collected during training, not the statistics of whatever single example is being evaluated.

## Common pitfalls

* **Using a batch size of 1.** The "batch" variance of a single example is 0, making normalization undefined without extra care.
* **Forgetting it behaves differently at train and test time.** Training uses the current batch's statistics; inference uses accumulated running statistics instead.
* **Confusing batch normalization with [[Layer Normalization]].** Batch normalization normalizes across the batch for each unit; layer normalization normalizes across the unit's own features for each example instead.

## Quick check

<details><summary>1. What does batch normalization compute the mean and variance over?</summary>
The values of one unit across every example in the current mini-batch.
</details>

<details><summary>2. What can γ and β do, in principle?</summary>
Fully undo the normalization (recovering the original scale and shift) if that turns out to be what the network needs.
</details>

<details><summary>3. Why is batch normalization awkward with a batch size of 1?</summary>
The variance of a single value is 0, so normalizing by it is undefined (or requires an added stabilising constant).
</details>

## Key terms

* **Batch normalization:** normalizing a layer's activations using the current batch's mean and variance, then applying a learned scale and shift.
* **γ, β:** the learned per-unit scale and shift applied after normalization.
* **Running statistics:** the accumulated mean and variance used at test time instead of a single batch's.

## Related

[[Weight Initialization]] · [[Variance and Standard Deviation]] · [[Layer Normalization]] · [[Convolutional Neural Networks]]
