A transformer needs an embedding table to turn token ids into vectors at the input, and a separate projection at the output to turn a final hidden vector back into a score for every vocabulary entry. Both matrices have exactly the same shape. Weight tying notices this and uses the literal same matrix for both jobs.

**You need:** [[Token Embeddings and Embedding Scaling]].

## The question it answers

"Why train two separate matrices when the input embedding and the output projection have identical shapes and arguably similar jobs?" Because they don't have to be separate: the output projection can reuse the input embedding table directly (transposed), roughly halving the parameters spent on vocabulary-sized matrices, with no change to how the rest of the model computes.

## Intuition

The input embedding table answers "given this token, what vector represents it?" The output projection answers something close to the reverse: "given this vector, how well does it match each token?" Those are naturally related questions — a token whose embedding points in a certain direction should also score highly when the final hidden state points that same way. Weight tying takes that relationship literally: instead of learning two separate `vocabulary_size × d_model` matrices that have to learn to agree with each other, it uses one matrix for both, computed as `output = E · h` where `E` is the very same embedding table used at the input.

## Definition and notation

```text
untied:  input embedding E (vocab × d_model),  output projection W_out (vocab × d_model)  — two matrices
tied:    input embedding E (vocab × d_model),  output projection = E                        — one matrix, reused

logits = E · h     (h is the final hidden state, a d_model-length vector)
```

Tying removes one full `vocabulary_size × d_model` matrix's worth of parameters from the model.

## A worked example

A tiny 4-token, 3-dimensional embedding table, used directly as the tied output projection, applied to a hidden state `h = [0.5, -1.0, 0.2]`:

```text
E = [[0.1, -0.2, 0.3],
     [0.4,  0.1, -0.1],
     [-0.3, 0.5,  0.2],
     [0.2,  0.2,  0.2]]

logits = E · h = [0.310, 0.080, -0.610, -0.060]
```

No separate output matrix was ever introduced — the same four embedding rows used to represent the tokens at the input are reused, via a matrix-vector product, to score every token at the output.

At real scale, tying removes exactly one embedding-sized matrix: for BERT-base's vocabulary (30,522) at `d_model = 768`, an untied model spends `2 × 30,522 × 768 = 46,881,792` parameters on its two vocabulary-sized matrices; tying cuts that to `30,522 × 768 = 23,440,896` — a 50% reduction in exactly those two matrices.

## Bench

```bench
id: weight-tying
title: One matrix, two jobs
fallback: Compute output logits for a hidden state using a tied embedding matrix, and compare the parameter cost of tied against untied input/output matrices at a chosen vocabulary size.
```

**Try this**

1. Compute logits from the same embedding table used for input lookup, and check which token scores highest.
2. Change the hidden state and see the logits shift to favour a different token.
3. Compare tied vs. untied parameter counts at a few different vocabulary sizes.

**What you should notice:** the parameter saving from tying is always exactly one `vocabulary_size × d_model` matrix — a 50% reduction in the two vocabulary-sized matrices specifically, regardless of how large or small the model is otherwise.

## Where it appears in AI

* **It is a standard, widely-used design choice** in many transformer language models, not a rare optimization.
* **It directly reduces the embedding-related parameter cost** counted in [[Vocabulary Size and Out-of-Vocabulary Trade-offs]] and tallied in full in [[Counting a Transformer's Parameters and FLOPs]].
* **It is one instance of a broader pattern — parameter sharing** — that also shows up when the same transformer block's weights are reused across layers in some efficient model designs, though that is a separate choice from tying input and output.

## Common pitfalls

* **Assuming tying is free.** It removes real degrees of freedom — the input and output "views" of each token are now forced to be literally the same, which is not always the best fit for every architecture or task.
* **Confusing weight tying with weight sharing across layers.** Tying here specifically means sharing between input embedding and output projection; sharing a block's weights across depth is a different design decision entirely.
* **Forgetting the matrix needs transposing.** The input embedding is used as `vocabulary_size × d_model`; computing output logits from a `d_model`-length hidden state uses that same matrix in the transposed orientation.

## Quick check

<details><summary>1. What are the two roles a tied embedding matrix plays?</summary>
Looking up a token's embedding at the input, and projecting a final hidden state into per-token scores (logits) at the output.
</details>

<details><summary>2. In the worked example, how was the logit for a given token computed?</summary>
As the dot product of that token's embedding row with the hidden state vector — the same operation as a row of a matrix-vector multiplication, `E · h`.
</details>

<details><summary>3. Roughly how much does weight tying save, relative to using two separate vocabulary-sized matrices?</summary>
Exactly one full vocabulary-sized matrix's worth of parameters — a 50% reduction in the combined size of the input and output matrices specifically.
</details>

## Key terms

* **Output projection:** the matrix mapping a final hidden state to a score (logit) for every vocabulary entry.
* **Weight tying:** reusing the input embedding table as the output projection instead of training a separate matrix.
* **Logit:** an unnormalized score for one vocabulary entry, before any softmax turns it into a probability.

## Related

[[Token Embeddings and Embedding Scaling]] · [[Vocabulary Size and Out-of-Vocabulary Trade-offs]] · [[Counting a Transformer's Parameters and FLOPs]]
