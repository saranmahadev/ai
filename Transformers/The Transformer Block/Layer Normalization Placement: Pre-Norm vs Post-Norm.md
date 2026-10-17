[[Residual Connections in Transformers|The residual connection]] guarantees a direct path for the input to reach the output. Where exactly normalization sits relative to that path — inside it or outside it — changes how the whole stack behaves as it gets deep, and it's one of the most consequential small decisions in a transformer's design.

**You need:** [[Residual Connections in Transformers]].

## The question it answers

"Should layer normalization be applied to the residual stream itself, or only to what feeds into each sublayer?" The original transformer paper normalized *after* adding the residual — **post-norm**. Almost every modern large transformer normalizes *before* each sublayer instead, leaving the residual stream itself untouched — **pre-norm**. The choice changes whether the running sum of residual contributions keeps growing with depth, or gets reset to a fixed scale at every single layer.

## Intuition

Post-norm treats each block as "do the sublayer, add it to the input, then clean up the result" — the normalization step smooths over whatever scale the addition produced, every single layer. Pre-norm treats each block as "clean up a copy of the input before feeding it to the sublayer, but leave the real running total alone" — the residual stream accumulates contributions from every layer, unnormalized, growing (or shrinking) as it goes. Pre-norm's unbroken, untouched residual path turns out to make very deep stacks dramatically easier to train from a cold start; post-norm's constant rescaling can make early training unstable unless handled carefully (commonly with a learning-rate warmup).

## Definition and notation

```text
post-norm:  x_{i+1} = LayerNorm(x_i + Sublayer(x_i))
pre-norm:   x_{i+1} = x_i + Sublayer(LayerNorm(x_i))
```

In pre-norm, the term `x_i` on the right is completely unnormalized — it's the same residual stream from [[Residual Connections in Transformers]], carried forward untouched. In post-norm, that same sum is passed through normalization before becoming the next layer's input.

## A worked example

An 8-layer stack of small random linear sublayers, starting from `x = [1, 0.5, -0.3, 0.8]` (norm ≈ 1.41), tracking the residual stream's norm after each layer:

```text
layer   post-norm ‖x‖   pre-norm ‖x‖
  0        1.41            1.41
  1        2.00            1.97
  2        2.00            2.50
  3        2.00            2.52
  4        2.00            3.36
  5        2.00            4.24
  6        2.00            4.71
  7        2.00            4.93
  8        2.00            5.81
```

Post-norm's residual stream locks to a constant norm (2.00, matching `√d` for this 4-dimensional example) at *every* layer, by construction — each layer's normalization resets the scale. Pre-norm's residual stream instead keeps growing, more than quadrupling from layer 1 to layer 8, because nothing ever rescales the accumulating sum.

## Bench

```bench
id: prenorm-postnorm
title: Does the residual stream stay put, or grow?
fallback: Stack several layers with pre-norm or post-norm placement and watch the residual stream's magnitude either stay fixed (post-norm) or grow with depth (pre-norm).
```

**Try this**

1. Compare the residual stream norm after each layer under both schemes.
2. Add more layers and watch pre-norm's norm keep climbing while post-norm's stays flat.
3. Increase each layer's weight scale and see pre-norm's growth accelerate.

**What you should notice:** post-norm's norm is identical at every single layer, independent of the number of layers or their weights — that fixed-point behaviour is exactly what the normalization step inside the residual path enforces.

## Where it appears in AI

* **Pre-norm became the default for very deep, large-scale transformers** precisely because its untouched residual path trains more reliably without careful warmup scheduling — a practical consequence of the growth pattern shown above.
* **The growing residual-stream norm under pre-norm is a well-documented, expected property** of large pre-norm models, not a bug — it's part of why the final output of a very deep pre-norm transformer often needs one last normalization step before being used.
* **[[RMSNorm vs LayerNorm|the next topic]] asks a related but different question** — not where normalization sits, but which normalization function is used at all.

## Common pitfalls

* **Assuming post-norm is simply "worse."** It can train perfectly well with the right learning-rate warmup; pre-norm's advantage is specifically in robustness at very large depth without that careful tuning.
* **Confusing this with residual connections themselves.** Both schemes keep the residual connection from [[Residual Connections in Transformers]] — the only difference is where normalization sits relative to it.
* **Expecting pre-norm's growing norm to cause instability.** It's an expected, stable growth pattern (not explosive), and real models account for it in their final output normalization.

## Quick check

<details><summary>1. What's the key structural difference between pre-norm and post-norm placement?</summary>
Pre-norm normalizes a copy of the input before the sublayer, leaving the residual stream itself untouched; post-norm normalizes the sum of the input and the sublayer's output, rescaling the residual stream at every layer.
</details>

<details><summary>2. In the worked example, why did post-norm's residual stream norm stay exactly 2.00 at every layer?</summary>
Because layer normalization is applied to the full residual sum at every step, resetting its scale to a fixed value (√d for this dimension) regardless of what came before.
</details>

<details><summary>3. Why does pre-norm tend to train more reliably at very large depth?</summary>
Its residual path is never normalized, giving gradients an unbroken, unscaled route back through every layer — removing the repeated rescaling that can destabilize training in deep post-norm stacks.
</details>

## Key terms

* **Post-norm:** normalizing the sum of a sublayer's input and output, after they're added together.
* **Pre-norm:** normalizing only the copy of the input fed into a sublayer, leaving the residual stream itself unnormalized.
* **Residual stream:** the running sum of contributions carried forward through a stack of residual-connected layers.

## Related

[[Residual Connections in Transformers]] · [[RMSNorm vs LayerNorm]] · [[Assembling One Transformer Block]]
