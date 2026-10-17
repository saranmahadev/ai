Plain attention lets every position look at every other position. Two very ordinary situations need to take some of that away: a batch of sequences padded to the same length, where the padding isn't real data, and a model generating text one token at a time, which must never peek at tokens that haven't been produced yet. Both are handled the same way — by masking.

**You need:** [[Encoder-Decoder Architectures with Attention]].

## The question it answers

"How does attention stop a position from looking at positions it shouldn't?" By setting the attention score for a forbidden position to negative infinity before the softmax — guaranteeing its weight comes out to exactly zero, no matter how the rest of the scores land.

## Intuition

Picture the attention weights for one query as a row of numbers that has to sum to 1. A mask is a simple yes/no veto applied before that row is computed: wherever the mask says "no," that position's raw score gets knocked down to negative infinity, so after the softmax its share of the attention is exactly zero — not small, not negligible, exactly zero. **Padding masks** veto positions that are only there to make a batch rectangular, not real tokens. **Causal masks** veto every position that comes *after* the current one, so a model generating text left to right can never use information it wouldn't actually have yet at that point in generation.

## Definition and notation

```text
masked score(i, j) = score(i, j)   if position j is allowed for query i
                    = −∞            otherwise

causal mask:   allowed(i, j) = (j ≤ i)                — only look backward or at yourself
padding mask:  allowed(i, j) = (j < valid_length)     — never attend to padding positions
combined:      allowed(i, j) = causal(i, j) AND padding(i, j)
```

Both masks can be applied together — a decoder processing a padded batch needs both the causal restriction and the padding restriction at once.

## A worked example

A sequence of length 4, where only the first 2 positions are real tokens (the rest is padding):

```text
causal mask (1 = allowed, 0 = blocked):
  1 0 0 0
  1 1 0 0
  1 1 1 0
  1 1 1 1

padding mask (valid length 2):  [1, 1, 0, 0]

combined mask (causal AND padding):
  1 0 0 0
  1 1 0 0
  1 1 0 0
  1 1 0 0
```

Every row, including the padding positions' own rows, loses access to columns 2 and 3 — no query, real or padding, is ever allowed to attend to a padding position. The causal structure is still visible in the first two columns: query 0 can only see position 0, query 1 can see positions 0 and 1.

## Bench

```bench
id: attention-masks
title: Building and combining attention masks
fallback: Set a sequence's valid length and toggle causal masking on and off, and see the resulting allowed/blocked attention pattern as a grid.
```

**Try this**

1. Turn off causal masking and look at the padding mask alone — every real position attends to every other real position.
2. Turn causal masking back on and watch the upper-right triangle close off.
3. Shrink the valid length and watch more columns (not rows) get blocked.

**What you should notice:** padding masking blocks whole *columns* (nobody may attend to a padding position), while causal masking blocks a *triangle* (nobody may attend to a later position) — the two patterns compose by simple intersection.

## Where it appears in AI

* **It is what distinguishes [[Encoder-Only Architectures|encoder-only]] from [[Decoder-Only Architectures|decoder-only]] transformers**: an encoder uses only padding masking (every real position sees every other), a decoder adds the causal mask on top.
* **It makes batched training possible at all**: without padding masks, shorter sequences packed into the same batch as longer ones would leak attention onto meaningless padding tokens.
* **The same −∞-before-softmax trick reappears in [[Sparse and Local (Windowed) Attention]]**, which is really just a different, fixed mask pattern applied to the same mechanism.

## Common pitfalls

* **Masking after the softmax instead of before.** Zeroing out weights after the softmax breaks the guarantee that the remaining weights still sum to 1; the mask has to be applied to the scores, before normalization.
* **Forgetting padding masking in an encoder.** Without it, real tokens' attention weights get diluted by padding positions that carry no actual information.
* **Assuming causal masking alone handles padding.** The two serve different purposes and are usually both needed together when training a decoder on padded batches.

## Quick check

<details><summary>1. What value does a masked-out attention score get set to, and why that value specifically?</summary>
Negative infinity, so that after the softmax its weight is exactly zero — no finite negative value gives that exact guarantee.
</details>

<details><summary>2. In the worked example, why were columns 2 and 3 blocked for every single query, including queries 2 and 3 themselves?</summary>
Because positions 2 and 3 are padding, and the padding mask blocks every query — real or padding — from attending to a padding position.
</details>

<details><summary>3. What's the structural difference between how a padding mask and a causal mask block positions?</summary>
A padding mask blocks entire columns (no one may attend to a padding position); a causal mask blocks an upper triangle (no one may attend to a later position).
</details>

## Key terms

* **Padding mask:** blocks every query from attending to positions that are only padding, not real tokens.
* **Causal mask:** blocks every query from attending to positions later than itself in the sequence.
* **Masked score:** an attention score set to negative infinity before the softmax, guaranteeing zero attention weight.

## Related

[[Encoder-Decoder Architectures with Attention]] · [[Encoder-Only Architectures]] · [[Decoder-Only Architectures]] · [[Sparse and Local (Windowed) Attention]]
