ResNet's fix for [[CNN Architectures: From LeNet to ResNet|the degradation problem]] is almost absurdly simple: instead of a block computing `output = F(x)`, make it compute `output = F(x) + x` — adding the block's own input straight back onto its output. This one **skip connection** both makes "do nothing" trivially learnable and gives gradients a direct path around the block entirely.

**You need:** [[CNN Architectures: From LeNet to ResNet]] and [[Vanishing and Exploding Gradients]].

## The question it answers

"If depth is supposed to help (see [[Why Depth Helps]]), why did very deep plain networks start training *worse* — not just overfitting, but worse even on training data — as more layers were added?" Because a plain stack of layers cannot easily learn to leave its input alone, and because its gradients shrink multiplicatively with every added layer; the skip connection fixes both at once.

## Intuition: an elevator, and a staircase beside it

In a plain deep network, every layer's output must pass *through* that layer's full transformation to reach the next one — like a staircase that forces every step. A residual block puts an elevator next to the staircase: the input can skip straight past the block (the `+x` term) while the block's own computation (`F(x)`) adds whatever extra adjustment is useful on top. If a block has nothing useful to add, it can simply learn `F(x) ≈ 0` and let the elevator carry the signal through unchanged — "doing nothing" is now one of the easiest things a block can learn, instead of one of the hardest.

## Definitions

```text
plain block:      y = F(x)
residual block:    y = F(x) + x

gradient through a plain block:      ∂y/∂x = F'(x)
gradient through a residual block:   ∂y/∂x = F'(x) + 1
```

That `+1` is the whole trick: even if a block's own gradient `F'(x)` is tiny (vanishing), the total gradient through the block is still at least close to 1, because the skip connection passes the incoming gradient straight through unchanged.

## A worked example

Ten blocks, each with an internal gradient factor of just `0.1` (nearly "dead"):

```text
without skip connections:  0.1¹⁰  =  0.0000000001          (vanished)
with skip connections:    (1 + 0.1)¹⁰ = 1.1¹⁰ ≈ 2.594      (still order-1, not vanished)
```

Ten plain layers this weak would leave almost no gradient reaching the first layer at all. Ten residual blocks this weak still pass a gradient of a very reasonable size all the way back — the skip connections alone are enough to prevent the vanishing, regardless of how weak each block's own contribution is.

## Bench

```bench
id: resnet-skip
title: Gradient flow with and without a skip connection
fallback: A depth slider and a per-block internal gradient factor slider. Compare the total gradient reaching the first layer with plain stacking versus residual (skip) connections, on a log scale.
```

**Try this**

1. Set the per-block factor low (say 0.1) and increase depth, comparing the two lines.
2. Watch the plain-stacking line vanish quickly while the residual line stays near order 1.
3. Set the per-block factor to exactly 1 and see both lines behave similarly — skip connections matter most when blocks are weak.

**What you should notice:** the skip connection's advantage is largest exactly when each block's own contribution is weak — which is precisely the situation [[Vanishing and Exploding Gradients|vanishing gradients]] describe.

## Where it appears in AI

* **Every architecture descended from ResNet** uses this pattern, including most modern CNNs and the residual connections inside every transformer block (see [[Multi-Head Attention]]).
* **"Highway networks"** introduced a closely related, slightly more flexible gated version of the same idea shortly before ResNet.
* **Very deep networks (100+ layers) are only practical because of this trick** — without it, depth this extreme reliably trained worse, not better.

## Common pitfalls

* **Thinking skip connections are only about gradients.** They also make the *identity function* trivially representable, which matters even in a forward-pass sense: a block that would otherwise need to learn a complicated way to approximate "do nothing" can now just learn nothing extra.
* **Assuming the shapes always match for a `+x`.** When a block changes the number of channels or the spatial size, the skip path needs its own small transformation (often a 1×1 convolution) to match shapes before adding.
* **Confusing "residual" with "recurrent."** A residual connection skips across a fixed number of layers in a feedforward network; it has nothing to do with the recurrence in [[Recurrent Neural Networks]].

## Quick check

<details><summary>1. What does a residual block compute, instead of a plain block's F(x)?</summary>
F(x) + x — the block's own transformation plus its original input, added back on.
</details>

<details><summary>2. Why does the "+1" in a residual block's gradient matter so much?</summary>
It guarantees a gradient of at least close to 1 flows through the block regardless of how small the block's own internal gradient is, directly countering vanishing gradients.
</details>

<details><summary>3. What is the easiest function for a residual block to learn, that is hard for a plain block?</summary>
The identity function (doing nothing extra) — a residual block gets this for free by learning F(x) ≈ 0, while a plain block has to learn to approximate identity through its entire transformation.
</details>

## Key terms

* **Skip connection:** a path that carries a layer's input forward, around (added to) that layer's own output.
* **Residual block:** a block computing `F(x) + x` rather than just `F(x)`.
* **Degradation problem:** very deep plain networks training worse, even on training data, as depth increases past a point.

## Related

[[CNN Architectures: From LeNet to ResNet]] · [[Vanishing and Exploding Gradients]] · [[Why Depth Helps]] · [[Multi-Head Attention]]
