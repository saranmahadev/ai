Attention lets every position look at every other position — but it never actually transforms a position's own content on its own. That job belongs to the feed-forward sublayer: a small, ordinary two-layer network applied identically and independently to every position in the sequence.

**You need:** [[Residual Connections in Transformers]], [[The Artificial Neuron and Activation Functions]].

## The question it answers

"After attention has mixed information across positions, what actually processes each position's own content?" The feed-forward sublayer: expand each position's vector to a wider hidden dimension, apply a nonlinearity, then project back down to the original width — exactly the same computation, with the exact same weights, applied to every position in the sequence, one at a time, with no mixing between positions at all.

## Intuition

Think of attention as the "communication" step — every position gathers information from everywhere else. The feed-forward sublayer is the "thinking" step that follows — each position, now holding whatever it gathered, processes that information entirely on its own, using the exact same small network every other position also uses. Expanding to a wider hidden layer first gives that processing more room to work with before compressing back down to the model's normal width.

## Definition and notation

```text
FFN(x) = W₂ · activation(W₁ · x + b₁) + b₂
```

`x` is one position's vector, of width `d_model`. `W₁` expands it to a wider hidden dimension `d_ff` (conventionally `4 × d_model` — for example, BERT-base uses `d_model = 768` and `d_ff = 3072`); `W₂` projects back down to `d_model`. The exact same `W₁, b₁, W₂, b₂` are applied to every position in the sequence — this sublayer has no notion of sequence position or neighbouring tokens at all.

## A worked example

A single position's 4-dimensional vector, expanded to an 8-wide hidden layer with ReLU, then projected back to 4 dimensions:

```text
x = [0.5, -0.3, 0.8, 0.1]

hidden (after W₁x + b₁, before ReLU, then ReLU applied):
  [0.000, 0.000, 0.000, 0.000, 0.175, 0.388, 0.000, 0.000]
  → 6 of 8 hidden units zeroed out by ReLU

output (after W₂ · hidden + b₂):
  [0.1182, -0.2757, 0.0638, 0.2591]
```

Parameter count for this small example: `W₁` contributes `8 × 4 = 32`, `b₁` contributes `8`, `W₂` contributes `4 × 8 = 32`, `b₂` contributes `4` — `76` parameters total, applied identically to every position the sublayer processes.

## Bench

```bench
id: ffn-sublayer
title: Expand, activate, project back down
fallback: Push a vector through a two-layer feed-forward sublayer and watch the hidden layer's values, including how many get zeroed by the activation function.
```

**Try this**

1. Change the input vector and watch which hidden units activate versus get zeroed by ReLU.
2. Widen the hidden dimension and see the parameter count grow.
3. Compare the same input processed twice — confirm the output is identical both times, since the same weights apply regardless of position.

**What you should notice:** this sublayer never looks at any other position's vector — everything it computes depends only on the one input vector it was given, unlike attention, which depends on the whole sequence.

## Where it appears in AI

* **It is where most of a transformer's parameters typically live**: with `d_ff = 4 × d_model`, the two feed-forward matrices together usually outweigh the attention sublayer's own parameters at a given layer.
* **[[Modern Feed-Forward Variants: SwiGLU and GeGLU|the next topic]] replaces the plain ReLU activation used here** with a gated variant that most modern large transformers use instead.
* **[[Mixture-of-Experts Transformer Blocks]], much later on this planet, replaces this entire sublayer** with several specialist copies and a router choosing which to use per token — directly building on the structure introduced here.

## Common pitfalls

* **Assuming the feed-forward sublayer mixes information across positions.** It explicitly does not — that's attention's job; this sublayer processes each position in complete isolation from every other.
* **Forgetting the hidden dimension is usually much wider than `d_model`.** The `4×` expansion is a real, consistent convention across most transformer designs, not an arbitrary implementation detail.
* **Treating this as a minor, lightweight component.** Given the typical 4× expansion, it is often the single largest parameter block in a transformer layer.

## Quick check

<details><summary>1. What is the key difference between what attention processes and what the feed-forward sublayer processes?</summary>
Attention mixes information across every position in the sequence; the feed-forward sublayer processes each position entirely independently, with no access to any other position's content.
</details>

<details><summary>2. In the worked example, what fraction of hidden units survived the ReLU activation?</summary>
2 of 8 — the other 6 were negative before the activation and got zeroed out by ReLU.
</details>

<details><summary>3. What is the conventional relationship between the feed-forward hidden dimension and d_model?</summary>
The hidden dimension (d_ff) is conventionally 4 times d_model — for example, 3072 for a 768-wide model.
</details>

## Key terms

* **d_ff:** the width of the feed-forward sublayer's hidden layer, conventionally 4 times d_model.
* **Position-wise:** applied identically and independently to each position in a sequence, with no mixing between positions.
* **Expansion-then-projection:** widening a vector to a larger hidden dimension before compressing it back to the original width.

## Related

[[Residual Connections in Transformers]] · [[The Artificial Neuron and Activation Functions]] · [[Modern Feed-Forward Variants: SwiGLU and GeGLU]] · [[Mixture-of-Experts Transformer Blocks]]
