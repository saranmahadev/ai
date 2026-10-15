Training a network means pushing a gradient signal backward through every layer by the chain rule. In a deep network that gradient is a product of many per-layer factors — and a product of many numbers each a little below 1 shrinks toward zero, while a product of many numbers each a little above 1 grows without bound. These are **vanishing** and **exploding** gradients.

**You need:** [[Backpropagation by Hand]] and [[The Artificial Neuron and Activation Functions]].

## The question it answers

"Why does a very deep network sometimes just... stop learning, with early layers barely changing at all?" Because the gradient reaching those early layers has been multiplied by one small factor per layer on the way back, and small numbers multiplied together shrink fast.

## Intuition: the same compounding, run backward

[[Weight Initialization]] showed a *forward* signal compounding layer by layer. The gradient flowing *backward* during training compounds the same way, through the chain rule: the gradient reaching layer 1 is (roughly) the gradient at the output times one factor per layer in between, multiplied together. If every factor is comfortably below 1, by the tenth or twentieth layer that product is indistinguishable from zero — the earliest layers get essentially no training signal.

## Definitions

```text
∂Loss/∂(layer 1)  ≈  ∂Loss/∂(output)  ×  factor_L × factor_(L−1) × ⋯ × factor_1

each factor ≈ (that layer's weight scale) × (that layer's activation derivative)
```

A sigmoid unit's derivative `σ(z)(1 − σ(z))` is at most 0.25, reached only at `z = 0`; everywhere else it is smaller. A ReLU unit's derivative is exactly 1 wherever the unit is active, and exactly 0 where it is not.

## A worked example

Even in the *best possible case* — every sigmoid unit sitting exactly at its peak derivative of 0.25, and every weight scaled to exactly cancel its own contribution — the activation alone shrinks the gradient by a factor of 0.25 per layer:

```text
layers (L)        1       5            10              20
0.25ᴸ           0.25   0.000977   0.00000095     0.0000000000009
```

By 10 layers, the best-case sigmoid gradient has shrunk to about one millionth of its starting size; by 20 layers it is effectively zero in ordinary floating point. A ReLU unit's derivative of exactly 1 contributes no shrinkage at all from the activation itself — which is one reason ReLU replaced sigmoid as the default for hidden layers in deep networks.

## Bench

```bench
id: gradient-chain
title: A gradient's size after L layers
fallback: A per-layer factor slider and a depth slider. The chart shows the factor raised to the depth, on a log scale, with reference marks at the sigmoid's best-case factor of 0.25 and ReLU's factor of 1.
```

**Try this**

1. Set the factor to 0.25 (sigmoid's best case) and increase depth from 1 to 20. Watch the gradient size collapse.
2. Set the factor to 1 (ReLU, best case) and increase depth. Nothing shrinks or grows.
3. Push the factor just above 1 (say 1.1) and increase depth — watch the gradient explode instead.

**What you should notice:** the surviving gradient depends almost entirely on whether the factor is below, at, or above exactly 1 — and the effect is exponential in depth, so even a tiny deviation from 1 becomes dramatic after enough layers.

## Where it appears in AI

* **Why ReLU became the default hidden-layer activation** in deep networks — see [[The Artificial Neuron and Activation Functions]].
* **Why recurrent networks (see [[Recurrent Neural Networks]]) are especially prone to this** — a sequence of length `T` is, for gradients, exactly as deep as `T` layers.
* **Why [[Residual and Skip Connections]] and [[Batch Normalization]] exist** — both are specifically designed to keep per-layer factors close to 1.

## Common pitfalls

* **Treating vanishing and exploding gradients as opposite problems needing opposite fixes.** Both come from the same compounding product; keeping factors near 1 fixes both at once.
* **Blaming only the activation function.** Weight scale (see [[Weight Initialization]]) multiplies into the same factor and can vanish or explode gradients on its own.
* **Assuming a loss that is decreasing means every layer is learning.** A network with vanishing gradients in its early layers can still improve slowly using only its later layers.

## Quick check

<details><summary>1. Why is 0.25 the best case, not a typical case, for a sigmoid-activated layer's gradient factor?</summary>
0.25 is the maximum of the sigmoid derivative, reached only when the unit's input is exactly 0; away from that point the factor is even smaller.
</details>

<details><summary>2. Why doesn't ReLU have this shrinkage problem from its activation?</summary>
Its derivative is exactly 1 for any active unit, so it neither shrinks nor grows the gradient passing through, by itself.
</details>

<details><summary>3. What single property of the per-layer factor decides whether a deep network's gradient vanishes or explodes?</summary>
Whether it is below, at, or above exactly 1 — multiplied over many layers, that small difference becomes an exponential effect.
</details>

## Key terms

* **Vanishing gradient:** a gradient that shrinks toward zero as it propagates back through many layers.
* **Exploding gradient:** a gradient that grows without bound as it propagates back through many layers.
* **Chain rule compounding:** the multiplication of many per-layer factors that produces both effects.

## Related

[[Backpropagation by Hand]] · [[Weight Initialization]] · [[The Artificial Neuron and Activation Functions]] · [[Gradient Clipping]] · [[Batch Normalization]]
