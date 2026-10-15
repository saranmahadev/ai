Before a single training step runs, a deep network's starting weights already decide whether signal can flow through it at all. **Weight initialization** picks the random spread of the starting weights so that a layer's output has roughly the same scale as its input — too wide a spread and activations blow up with depth; too narrow and they vanish.

**You need:** [[The Multilayer Feedforward Network]] and [[Variance and Standard Deviation]].

## The question it answers

"If I just pick random starting weights, does it matter how big they are?" Enormously — the wrong scale, repeated over many layers, turns a reasonable signal into either an overflow or a flat zero before training even begins.

## Intuition: compounding, layer after layer

Each dense layer sums `n` weighted inputs. If each weight is random with some variance, the sum's variance scales with `n` times the weight variance (roughly — the inputs act like independent terms adding up). Get that combined scaling factor even slightly above 1 and, repeated over ten or twenty layers, the signal's size compounds like interest: it can grow by a factor of a million. Get it even slightly below 1 and the signal compounds toward zero just as fast.

## Definitions

```text
layer width n, weight variance s²
output variance  ≈  n · s² · (input variance)

to keep variance roughly constant layer to layer:   s² ≈ 1 / n     (so   s ≈ 1/√n)
```

This `1/√n` scaling (the core of Xavier/Glorot-style initialization) is exactly chosen so the "n inputs, each of variance s²" sum neither explodes nor vanishes, on average, for a linear or near-linear layer.

## A worked example

Pass a fixed input through 10 random dense layers of width 100, three different initialization scales, and track the standard deviation of the activations at each layer:

```text
layer            0      1      2      3      4       5        6         7          8           9            10
scale = 1      0.709  8.054  85.17  828.2  7072.4  58119.0  479674.0  4161386.3  37782995.9  359313411.5  3340833417.7
scale = 1/√n   0.709  0.805  0.852  0.828  0.707   0.581    0.480     0.416      0.378       0.359        0.334
scale = 0.1/√n 0.709  0.081  0.009  0.001  0.000   0.000    0.000     0.000      0.000       0.000        0.000
```

With `scale = 1` (ten times too large for width 100), the signal's spread multiplies by roughly 10× per layer and reaches the billions by layer 10 — numbers a computer's floating point will soon overflow. With `scale = 0.1/√n` (ten times too small), it collapses to indistinguishable-from-zero by layer 4. Only `scale ≈ 1/√n` keeps the signal in a usable range the whole way through.

## Bench

```bench
id: weight-init-depth
title: Signal scale across ten random layers
fallback: Ten stacked random dense layers of a chosen width. A scale slider multiplies the 1/√n baseline; the chart shows the standard deviation of the activations at each layer on a log scale, so you can watch it explode, stay flat, or vanish.
```

**Try this**

1. Set the scale multiplier to 1 (the "just right" baseline) and watch the line stay roughly flat.
2. Push the multiplier up to 10 and watch the signal explode within a few layers.
3. Pull it down to 0.1 and watch it vanish instead.
4. Try a much wider layer and see how much the baseline scale still keeps things flat.

**What you should notice:** only a narrow band of scale around the `1/√n` baseline keeps the signal from exploding or vanishing; moving away from it by even a factor of 10 compounds into an enormous or negligible number within ten layers.

## Where it appears in AI

* **Xavier/Glorot initialization** scales by `1/√n` (fan-in), the baseline in this bench.
* **He initialization** uses a similar idea tuned for ReLU networks, which zero out half their inputs on average.
* **Why this matters more as networks get deeper:** a shallow network can tolerate a poorly scaled initialization; a hundred-layer network cannot.

## Common pitfalls

* **Using the same initialization scale regardless of layer width.** A fixed, width-independent variance is "too big" for wide layers and "too small" for narrow ones.
* **Blaming training (the optimizer or learning rate) for a problem that started before training began.** A badly initialized deep network can fail to learn no matter how it is trained afterward.
* **Forgetting that activation functions change the picture.** ReLU's zeroing of negative inputs is why He initialization scales differently from the plain linear calculation here.

## Quick check

<details><summary>1. Why does an initialization scale of 1 cause explosion in a wide layer, but might be fine in a narrow one?</summary>
The combined output variance scales with the layer's width `n`; a fixed weight variance that is safe for small `n` becomes far too large once `n` is big.
</details>

<details><summary>2. What does "1/√n" scaling achieve?</summary>
It keeps the output variance of a layer close to its input variance, so the signal's scale neither grows nor shrinks much from layer to layer.
</details>

<details><summary>3. Does good initialization guarantee training will succeed?</summary>
No — it only gives the signal (and later, gradients) a reasonable scale to start from; see [[Vanishing and Exploding Gradients]] for what can still go wrong during training.
</details>

## Key terms

* **Weight initialization:** the rule for picking a network's starting weights.
* **Fan-in:** the number of inputs feeding into a given unit.
* **Xavier (Glorot) initialization:** scaling weights by roughly `1/√(fan-in)`.
* **He initialization:** a variant scaled for ReLU networks.

## Related

[[The Multilayer Feedforward Network]] · [[Variance and Standard Deviation]] · [[Vanishing and Exploding Gradients]] · [[Batch Normalization]]
