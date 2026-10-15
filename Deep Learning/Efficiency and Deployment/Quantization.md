A weight stored as a 32-bit float can represent an enormous range of values with high precision — far more precision than most trained weights actually need. **Quantization** stores (and often computes) the same weights using far fewer bits — commonly 8 — accepting a small, bounded rounding error in exchange for a model that is smaller and faster.

**You need:** [[Floating Point]] and [[Model Pruning]].

## The question it answers

"Do weights really need 32 bits of precision each?" Usually not — rounding each weight to one of a much smaller number of evenly-spaced levels loses only a small, predictable amount of accuracy, while shrinking the model's size by a large, fixed factor.

## Intuition: a ruler with fewer markings

A ruler with millimetre markings is far more precise than one with only centimetre markings, but for most everyday measurements, the coarser ruler is still good enough — you just round to the nearest mark. Quantization rounds every weight to the nearest of a fixed, small set of evenly-spaced levels (say, 256 of them for 8-bit quantization), instead of keeping each weight's full floating-point precision.

## Definitions

```text
range [min, max],  b bits  →  2^b evenly-spaced levels

scale = (max − min) / (2^b − 1)

quantize:    q = round((x − min) / scale)        (an integer, 0 to 2^b − 1)
dequantize:  x̂ = min + q · scale                   (the approximate value actually used)

maximum possible rounding error = scale / 2
```

## A worked example

Five weights, quantized to 8 bits (256 levels) over the range `[−1, 1]`:

```text
scale = (1 − (−1)) / 255 ≈ 0.007843

weight     −0.800   0.300   0.950   −0.200   0.600
quantized   q=25    q=166   q=249    q=102    q=204
dequantized −0.8039  0.3020  0.9529  −0.2000  0.6000
error       0.00392  0.00196 0.00294  0.00000  0.00000
```

Every weight's error is well under the theoretical maximum of `scale / 2 ≈ 0.00392`, and most are far smaller — a tiny rounding cost in exchange for storing each weight in 8 bits instead of 32, a 4× reduction in storage for the weights alone.

## Bench

```bench
id: quantize-weights
title: Rounding weights to a fixed set of levels
fallback: Adjustable weights, a bit-width slider, and the chosen value range. See each weight's quantized integer code, its dequantized approximation, and the resulting rounding error.
```

**Try this**

1. Lower the bit-width from 8 toward 2 or 3 and watch the rounding error grow sharply.
2. Widen the value range without changing the bit-width and watch the error grow too, even though the bit-width didn't change.
3. Narrow the range to just barely cover the actual weights and watch the error shrink.

**What you should notice:** error depends on both the bit-width *and* how tightly the chosen range actually fits the weights being quantized — a wider range than necessary wastes precision on values that never occur.

## Where it appears in AI

* **8-bit (and even 4-bit) quantization** is now routine for deploying large models efficiently, especially combined with [[Model Pruning]] and [[Knowledge Distillation]].
* **Quantization-aware training**, not covered in full detail here, trains a model while simulating quantization's rounding effects, so the model learns weights that are more robust to that rounding than a model quantized only after training.
* **Different parts of a model are often quantized to different precisions** — some layers more sensitive to rounding than others — rather than applying one fixed bit-width everywhere.

## Common pitfalls

* **Choosing too wide a value range.** It wastes available precision on values that never actually occur, increasing error for no benefit.
* **Assuming quantization is free.** There is a real, bounded accuracy cost; very aggressive quantization (very few bits) can noticeably hurt a model's outputs if not done carefully.
* **Forgetting that quantizing after training ("post-training quantization") and training with quantization in mind are different strategies** with different accuracy trade-offs.

## Quick check

<details><summary>1. What is the maximum possible rounding error introduced by quantizing to a given scale?</summary>
Half the scale (half the spacing between adjacent quantized levels).
</details>

<details><summary>2. Why does widening the chosen value range increase quantization error, even with the same bit-width?</summary>
The same number of levels must now be spread over a wider range, so the scale (spacing between levels) grows, and so does the maximum possible rounding error.
</details>

<details><summary>3. In the worked example, why did two of the five weights have exactly zero error?</summary>
Those particular weight values happened to land exactly on one of the 256 quantization levels, so rounding introduced no change at all.
</details>

## Key terms

* **Quantization:** representing values with a smaller, fixed set of discrete levels instead of full floating-point precision.
* **Scale:** the spacing between adjacent quantization levels, determined by the value range and bit-width.
* **Dequantization:** converting a quantized integer code back into its approximate real value.

## Related

[[Floating Point]] · [[Model Pruning]] · [[Knowledge Distillation]] · [[Edge and On-Device Deep Learning]]
