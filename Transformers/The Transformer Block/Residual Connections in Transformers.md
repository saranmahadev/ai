Stack enough layers on top of each other, and a signal passed through all of them — unless something stops it — tends to either vanish or blow up. A residual connection is the simplest possible fix: instead of replacing the input with each sublayer's output, add the two together.

**You need:** [[Multi-Head Attention]], [[Vanishing and Exploding Gradients]].

## The question it answers

"Why does every sublayer in a transformer add its output to the input instead of just computing a new value?" Because a deep stack of layers that each *replace* their input, rather than *adjust* it, tends to destroy the original signal entirely by the time it reaches the output — and the same problem hits gradients flowing the other way during training. Adding instead of replacing gives every layer's output a guaranteed, undistorted path straight back to its input.

## Intuition

Imagine passing a message through a long chain of people, where each person is asked to *rewrite* the message in their own words before handing it on. After six people, the message has likely drifted far from the original, or been garbled into nothing. Now imagine instead that each person is asked to write a short *note* which gets stapled alongside the original message — the message itself keeps moving forward untouched, with small notes accumulating alongside it. The second version guarantees the original content survives no matter how many people (layers) it passes through.

## Definition and notation

```text
without residual:  x_{i+1} = Sublayer(x_i)
with residual:      x_{i+1} = x_i + Sublayer(x_i)
```

Every sublayer in a transformer block — the attention sublayer and the feed-forward sublayer alike — is wrapped this way. The gradient of a residual sublayer's output with respect to its input always contains an identity term (from the `x_i` on the right), on top of whatever the sublayer itself contributes — that identity term is what keeps a gradient from vanishing as it's pushed back through many layers.

## A worked example

Six small, fixed linear "sublayers" (random 3×3 weight matrices, entries scaled to stay small) applied to the same input `x = [1, 1, 1]` (vector norm ≈ 1.73), two ways:

```text
without residuals (x_{i+1} = W_i · x_i), after 6 layers:
  output ≈ [-0.0002, 0.0001, -0.0003]     ‖output‖ ≈ 0.0004

with residuals (x_{i+1} = x_i + W_i · x_i), after 6 layers:
  output ≈ [1.2015, 1.2272, 0.5980]       ‖output‖ ≈ 1.8185
```

Without residual connections, six layers of small transformations compounded multiplicatively and the signal collapsed to almost nothing — over 4,000 times smaller than the input. With residual connections, the output stayed close in magnitude to the original input, even after the same six transformations.

## Bench

```bench
id: residual-signal
title: What survives six layers, with and without residuals
fallback: Push a vector through six small random linear layers, with and without residual connections, and compare how much of the original signal survives.
```

**Try this**

1. Compare the output norm with and without residuals after all six layers.
2. Increase the number of layers and watch the gap between the two widen further.
3. Shrink each layer's weight scale and see the no-residual case collapse even faster.

**What you should notice:** the residual output never strays far from the input's scale, no matter how many layers are stacked — the non-residual output's fate depends entirely on the specific (and here, small) weights, which is exactly the instability residual connections are designed to remove.

## Where it appears in AI

* **It is what makes very deep transformer stacks trainable at all** — the same reason residual connections were introduced for deep convolutional networks on [[Deep Learning]], now applied to every sublayer of every transformer block.
* **It interacts directly with [[Layer Normalization Placement: Pre-Norm vs Post-Norm|where normalization is placed]]**, covered next — the residual path's stability depends on whether normalization happens inside or outside of it.
* **[[Assembling One Transformer Block|Assembling a full block]]** uses residual connections around both of its sublayers, attention and feed-forward alike.

## Common pitfalls

* **Assuming the sublayer's output should dominate.** The whole point is that the sublayer only needs to learn a *small adjustment* to the input, not reconstruct it from scratch.
* **Forgetting residual connections require matching dimensions.** `x_i` and `Sublayer(x_i)` must have the same shape to be added — a real constraint on how sublayers are designed.
* **Treating this as specific to transformers.** The same idea predates transformers entirely, from deep residual networks in computer vision.

## Quick check

<details><summary>1. What's the key structural difference between a residual sublayer and a non-residual one?</summary>
A residual sublayer adds its output to its input (`x + Sublayer(x)`); a non-residual one replaces the input with the sublayer's output (`Sublayer(x)`).
</details>

<details><summary>2. In the worked example, why did the non-residual output nearly vanish after six layers?</summary>
Each layer's small linear transformation compounded multiplicatively with the others, and six multiplications by small-valued matrices shrank the signal toward zero.
</details>

<details><summary>3. Why does a residual connection help gradients flow during training, not just signals during the forward pass?</summary>
The identity term in a residual sublayer's gradient gives every layer a direct path back to its input, so the gradient doesn't have to pass through every sublayer's own (possibly small) derivative to reach earlier layers.
</details>

## Key terms

* **Residual connection:** adding a sublayer's input to its output, instead of replacing the input entirely.
* **Sublayer:** one of the two main computations inside a transformer block — the attention sublayer or the feed-forward sublayer.
* **Signal preservation:** how much of an original input's information survives after passing through many layers.

## Related

[[Multi-Head Attention]] · [[Vanishing and Exploding Gradients]] · [[Layer Normalization Placement: Pre-Norm vs Post-Norm]] · [[Assembling One Transformer Block]]
