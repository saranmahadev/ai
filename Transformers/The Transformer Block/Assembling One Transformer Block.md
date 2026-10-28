Every piece needed is now on the table: [[Multi-Head Attention|attention]] itself, [[Residual Connections in Transformers|residual connections]], [[Layer Normalization Placement: Pre-Norm vs Post-Norm|normalization placement]], and [[The Feed-Forward Sublayer|the feed-forward sublayer]]. This topic puts them together into the one block that gets stacked, unchanged, a dozen or a hundred times to build an entire transformer.

**You need:** [[Multi-Head Attention]], [[Residual Connections in Transformers]], [[Layer Normalization Placement: Pre-Norm vs Post-Norm]], [[The Feed-Forward Sublayer]].

## The question it answers

"What is the exact sequence of operations inside one transformer block, from input to output?" A pre-norm block (the modern default) runs two residual sublayers in order: normalize, then attend, then add back to the input; normalize again, then feed forward, then add back to that result. Every piece covered earlier in this subject has exactly one job inside this sequence.

## Intuition

Think of the block as two "detours," each one leaving from and returning to the same running total (the residual stream). The first detour: take a cleaned-up look at the whole sequence (normalize), gather information from every other position (attend), then merge whatever was gathered back into the running total. The second detour: take another cleaned-up look at just this position's own current content (normalize again), process it in isolation (feed forward), then merge that back in too. Nothing about the running total itself is ever replaced — only added to.

## Definition and notation

```text
pre-norm transformer block, for a sequence of position vectors X:

1. X₁ = X + SelfAttention(LayerNorm(X))
2. X₂ = X₁ + FeedForward(LayerNorm(X₁))     — applied to each position independently

output: X₂
```

Every sublayer follows the identical shape: normalize an input, transform it, add the result back to the (untouched) residual stream. The exact same block, with its own trained weights, is stacked many times — the output `X₂` of one block becomes the input `X` of the next.

## A worked example

A 3-position, 4-dimensional toy sequence, pushed through one complete pre-norm block (random small weights, for traceability):

```text
input X, three positions' vector norms:        1.28, 1.61, 0.96

step 1 — LayerNorm(X), then self-attention, then add back (X₁):
  X₁'s vector norms:                           1.08, 1.79, 1.34

step 2 — LayerNorm(X₁), then feed-forward, then add back (X₂, final output):
  X₂'s vector norms:                           1.40, 1.91, 1.42
```

Every position's output norm ended up larger than its input norm — each residual addition contributed something new on top of the original signal, exactly as [[Residual Connections in Transformers|residual connections]] are designed to do, without ever discarding what came before.

## Bench

```bench
id: transformer-block
title: One block, start to finish
fallback: Trace a small sequence of vectors through one complete pre-norm transformer block — attention sublayer, then feed-forward sublayer, each wrapped in normalization and a residual connection.
```

**Try this**

1. Step through the block one sublayer at a time and watch each position's vector change.
2. Compare the input and final output vector norms for each position.
3. Stack the same block's output back through itself as a second block, and see the norms grow further.

**What you should notice:** nothing about this process depends on how many times the block is repeated — the same four-step recipe (normalize, attend, add; normalize, feed forward, add) is exactly what every layer of a real transformer runs, with its own independently trained weights at each depth.

## Where it appears in AI

* **It is literally the building block of every transformer**, from a small research model to a frontier-scale one — the only things that change between models are the number of blocks, their width, and small variant choices (RMSNorm vs LayerNorm, gated vs plain feed-forward) covered earlier in this section.
* **[[Encoder-Only Architectures|Encoder-only]], [[Decoder-Only Architectures|decoder-only]] and [[Encoder-Decoder Architectures as a Pattern|encoder-decoder]] architectures**, covered next, differ only in what masking is applied to the attention sublayer and whether a second, cross-attention sublayer is added — the block's core shape stays the same.
* **[[Capstone: Assembling a Tiny Transformer from the Ground Up|this subject's own capstone]]** extends exactly this worked example into a full, multi-block transformer.

## Common pitfalls

* **Forgetting the feed-forward sublayer is applied position by position.** Only the attention sublayer mixes information across positions; the feed-forward sublayer, inside the same block, processes each position independently.
* **Mixing up pre-norm and post-norm while assembling a block.** The order of normalize-then-sublayer versus sublayer-then-normalize changes which quantity is being added to the residual stream.
* **Assuming every block in a stack is identical in its weights.** The structure is identical at every depth, but each block has its own independently trained parameters.

## Quick check

<details><summary>1. How many sublayers does one transformer block contain, and what does each one do?</summary>
Two: a self-attention sublayer that mixes information across positions, and a feed-forward sublayer that processes each position independently — both wrapped in normalization and a residual connection.
</details>

<details><summary>2. In a pre-norm block, what exactly gets added back to the residual stream after the attention sublayer?</summary>
The output of self-attention applied to the normalized input — the residual stream itself (the unnormalized `X`) is never altered directly, only added to.
</details>

<details><summary>3. What changes between a transformer's blocks when they're stacked, and what stays the same?</summary>
Each block's own weights are independently trained and different; the overall structure — normalize, attend, add; normalize, feed forward, add — is identical at every depth.
</details>

## Key terms

* **Transformer block:** the repeated unit of a transformer, containing one attention sublayer and one feed-forward sublayer, each wrapped in normalization and a residual connection.
* **Sublayer:** one of the two main computations (attention or feed-forward) inside a transformer block.
* **Stacking:** repeating the same block structure many times, with independently trained weights at each depth, to build a full transformer.

## Related

[[Multi-Head Attention]] · [[Residual Connections in Transformers]] · [[The Feed-Forward Sublayer]] · [[Encoder-Only Architectures]] · [[Capstone: Assembling a Tiny Transformer from the Ground Up]]
