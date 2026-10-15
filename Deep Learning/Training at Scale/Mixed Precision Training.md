[[Floating Point|32-bit floats]] are the usual default, but most of a network's computation doesn't need that much precision. **Mixed precision training** runs most operations in a faster, cheaper 16-bit format instead, while keeping a few specific, precision-sensitive parts (like the running total of weight updates) in 32-bit — and uses one extra trick, **loss scaling**, to stop tiny gradients from disappearing entirely in the lower-precision format.

**You need:** [[Why GPUs and Accelerators]] and [[Floating Point]].

## The question it answers

"If most GPUs compute faster, and need less memory, in 16-bit than 32-bit — why not just switch everything to 16-bit?" Because some values, especially small gradients, can be too small for 16-bit to represent at all, rounding silently to zero — mixed precision gets the speed benefit while specifically protecting against that failure.

## Intuition: a coarser ruler that sometimes can't see small things at all

16-bit floating point isn't just less precise than 32-bit — it also can't represent numbers below a certain tiny threshold at all; anything smaller simply rounds to zero. A gradient that's genuinely useful but very small can vanish entirely the moment it's stored in 16-bit. **Loss scaling** sidesteps this: multiply the loss (and hence every gradient, by the chain rule) by some large constant *before* computing gradients, so even tiny gradients land comfortably above 16-bit's representable range — then divide the gradients back down by that same constant (done in full 32-bit precision) before actually updating the weights.

## Definitions

```text
FP16's smallest representable positive values are far larger than FP32's

loss scaling:   scaled_loss = loss × S            (S = a large constant, e.g. 65536)
                compute gradients from scaled_loss (now larger, safely representable in FP16)
                unscaled_gradient = scaled_gradient / S     (done in FP32, before the weight update)
```

## A worked example

A genuinely tiny gradient, `3 × 10⁻⁸` — below FP16's smallest representable positive value (about `5.96 × 10⁻⁸`), so it would round straight to **zero** if computed directly in FP16:

```text
raw gradient:     3 × 10⁻⁸          (below FP16's minimum — would underflow to 0)

scale factor S = 65,536 (= 2¹⁶)
scaled gradient = 3×10⁻⁸ × 65,536 ≈ 0.00196608      (comfortably representable in FP16)

unscale (in FP32):  0.00196608 / 65,536 = 3 × 10⁻⁸    (recovers the original value exactly)
```

Scaling first, then computing in 16-bit, then unscaling in 32-bit, preserves a gradient that would have been silently lost — zeroed out — if the computation had been done in 16-bit without this trick.

## Bench

```bench
id: loss-scale
title: Rescuing a gradient from underflow
fallback: An adjustable raw gradient value and a loss-scale factor. See whether the raw gradient underflows to zero in 16-bit, and whether scaling (and later unscaling) rescues it.
```

**Try this**

1. Set a very small gradient and watch it round to zero without scaling.
2. Increase the scale factor until the scaled gradient clears the 16-bit minimum threshold.
3. Confirm unscaling (dividing by the same factor, in full precision) recovers the original value.

**What you should notice:** the scale factor needs to be large enough to lift the smallest gradients you care about above 16-bit's minimum, but the *unscaling* step always happens in full precision, so it never introduces new rounding error of its own.

## Where it appears in AI

* **Nearly all large-scale training today uses mixed precision by default**, since the speed and memory savings from most computation running in 16-bit are substantial.
* **BF16**, a different 16-bit format with the same exponent range as 32-bit float (but less precision in the mantissa), avoids much of the underflow risk FP16 has, at the cost of some precision — many modern training setups use it instead of FP16, sometimes without needing loss scaling at all.
* **Automatic mixed precision** tooling in major frameworks handles the scale-factor choice (often adjusting it dynamically) without requiring manual tuning in most cases.

## Common pitfalls

* **Forgetting that only some operations should run in 16-bit.** A few parts — notably the master copy of the weights, and the accumulation during the weight update — are usually kept in 32-bit specifically because they're sensitive to precision loss.
* **Picking a scale factor too small to matter**, or so large it causes different numerical issues (overflow) elsewhere.
* **Assuming BF16 eliminates the need for any numerical care.** It avoids underflow more easily than FP16, but still has less precision than full 32-bit float.

## Quick check

<details><summary>1. Why can a useful gradient disappear entirely when computed directly in 16-bit?</summary>
16-bit floating point has a smallest representable positive value; anything smaller rounds straight to zero, losing the gradient completely.
</details>

<details><summary>2. What does loss scaling do, and why does it work?</summary>
It multiplies the loss (and so every gradient) by a large constant before backpropagation, lifting even tiny gradients above 16-bit's minimum representable value; dividing back by the same constant afterward, in full precision, recovers the correct gradient.
</details>

<details><summary>3. Why is the "unscale" step done in 32-bit rather than 16-bit?</summary>
To avoid introducing new rounding error exactly where precision matters most — recovering the true gradient value before it's used to update the weights.
</details>

## Key terms

* **Mixed precision training:** running most computation in a lower-precision format while keeping precision-sensitive parts at higher precision.
* **Loss scaling:** multiplying the loss by a large constant to prevent small gradients from underflowing in low precision.
* **Underflow:** a value too small to represent in a given numerical format, rounding to zero.

## Related

[[Why GPUs and Accelerators]] · [[Floating Point]] · [[Distributed and Data-Parallel Training]] · [[Debugging a Training Run]]
