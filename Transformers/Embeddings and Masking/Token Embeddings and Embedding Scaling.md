A tokenizer hands back a sequence of integer ids — [[Byte Pair Encoding|vocabulary indices]], not vectors. The embedding table is the lookup that turns each id into the actual vector the rest of the transformer operates on, and the original transformer paper adds one small, easy-to-miss twist: it scales that vector up before using it.

**You need:** [[Byte Pair Encoding]], [[Vector Operations]].

## The question it answers

"How does a token id — a bare integer — become a vector a neural network can compute with?" By a direct lookup: the embedding table is a matrix with one row per vocabulary entry, and looking up a token's id simply reads off that row. The twist — multiplying the result by `√d_model` — exists to balance the scale of the token embedding against the positional encoding it gets added to next.

## Intuition

Think of the embedding table as a dictionary where every vocabulary entry has a fixed, trainable "meaning vector" stored as a row. Looking up a token is nothing more than reading that row off the table — the same operation, however large the table gets. The scaling factor is a smaller, more specific fix: positional encodings (see [[Positional Information Beyond Sinusoids]]) are added directly to the token embedding, and a trained embedding's values tend to be small by comparison, so without scaling, the position signal could end up dominating the actual token's identity. Multiplying by `√d_model` brings the two onto a comparable scale before they're added.

## Definition and notation

```text
embedding lookup:  e = E[token_id]            — one row of the embedding table E
embedding scaling: e_scaled = e × √d_model
```

`d_model` is the width of every vector flowing through the transformer. The table `E` has shape `vocabulary_size × d_model` — the same embedding table whose parameter cost was counted in [[Vocabulary Size and Out-of-Vocabulary Trade-offs]].

## A worked example

A tiny 5-token, 4-dimensional embedding table, looking up token id `2`, with `d_model = 4` so `√d_model = 2`:

```text
raw embedding for token 2:    [-0.3, 0.5, 0.2, -0.4]
scale = √4 = 2
scaled embedding:             [-0.6, 1.0, 0.4, -0.8]

raw vector norm:    0.7348
scaled vector norm: 1.4697
```

Scaling by `√d_model` doubled the vector's length exactly as expected — every component simply multiplied by 2, and the overall magnitude grew by the same factor of 2, matching `√4`.

## Bench

```bench
id: embed-scale
title: From token id to scaled vector
fallback: Look up a token id's row in a small embedding table, then watch the vector scale as d_model (and so √d_model) changes.
```

**Try this**

1. Look up a few different token ids and compare their raw embedding rows.
2. Change `d_model` and watch the scaling factor, and the scaled vector's length, change together.
3. Compare the scaled embedding's magnitude against a typical positional encoding value (from [[Positional Information Beyond Sinusoids]]) to see why the two need to be on a similar scale.

**What you should notice:** the scaling factor depends only on `d_model`, never on the token itself — every token's embedding gets stretched by exactly the same amount.

## Where it appears in AI

* **It is the very first numeric operation inside a transformer**, immediately after [[Byte Pair Encoding|tokenization]] and before a single attention computation runs.
* **The embedding table is also, usually, the output projection** — see [[Weight Tying]] next for why sharing that one matrix both ways is a common choice.
* **Scaling choices like this recur throughout [[The Transformer Block]]**: normalization placement and residual connections are both, at heart, about keeping values at a consistent, trainable scale as they flow through many layers.

## Common pitfalls

* **Forgetting the scaling factor when reasoning about embedding magnitudes.** A raw embedding row understates the actual value flowing into the rest of the network by a factor of `√d_model`.
* **Assuming scaling changes the embedding's direction.** It's a uniform multiplication — every component scales by the same factor, so the vector's direction is unchanged, only its length.
* **Treating the embedding table as fixed.** It is trained along with the rest of the model — the rows aren't hand-assigned, they're learned.

## Quick check

<details><summary>1. What operation turns a token id into a vector?</summary>
A direct row lookup in the embedding table — the token id selects which row to read.
</details>

<details><summary>2. Why is the embedding scaled by √d_model?</summary>
To bring it onto a comparable scale with the positional encoding it gets added to next, so neither one dominates the sum.
</details>

<details><summary>3. In the worked example, by what factor did the embedding's vector norm grow after scaling?</summary>
By exactly 2 — the same factor as √d_model with d_model = 4, since scaling multiplies every component (and so the whole vector's length) uniformly.
</details>

## Key terms

* **Embedding table:** a `vocabulary_size × d_model` matrix, one row per token, learned during training.
* **d_model:** the width of every vector flowing through a transformer's layers.
* **Embedding scaling:** multiplying a looked-up embedding by `√d_model` before it is combined with positional information.

## Related

[[Byte Pair Encoding]] · [[Weight Tying]] · [[Positional Information Beyond Sinusoids]]
