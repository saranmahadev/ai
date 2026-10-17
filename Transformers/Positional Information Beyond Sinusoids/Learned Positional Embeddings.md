The sinusoidal encoding from [[Deep Learning]] computes a position's vector from a fixed formula — nothing about it is trained. The simplest alternative skips the formula entirely: treat position exactly like a token, and learn a vector for each one.

**You need:** [[Token Embeddings and Embedding Scaling]].

## The question it answers

"Must positional information come from a fixed mathematical formula, or can the model simply learn what each position's vector should be?" It can simply learn it: build a second embedding table, indexed by position instead of by token id, and add the result to the token embedding at that position — the exact same lookup-and-add mechanism as token embeddings, just keyed by a different index.

## Intuition

A token embedding table answers "what vector represents *this word*?" A learned positional embedding table answers the parallel question "what vector represents *this position*?" Both are ordinary trainable lookup tables; adding the two together gives the model a vector that encodes both what the token is and where it sits in the sequence. Because the table is trained like any other parameter, the model is free to learn whatever positional pattern turns out to be useful — not constrained to the particular sinusoidal shape derived in [[Deep Learning]].

## Definition and notation

```text
positional table P: shape max_length × d_model, trained like any other parameter

input to the transformer at position i:
  token_embedding(token_id) + P[i]
```

Unlike the sinusoidal formula, which can in principle be evaluated at any position, a learned table has a fixed `max_length` — it has no entry at all for a position beyond however many rows it was built with.

## A worked example

A 5-row, 4-dimensional positional table, applied to the *same* token embedding `[0.5, -0.2, 0.1, 0.4]` at two different positions:

```text
P[0] = [ 0.106, -0.184,  0.019, -0.201]
P[3] = [-0.158, -0.181,  0.078,  0.143]

token at position 0:  [0.5,-0.2,0.1,0.4] + P[0] = [0.606, -0.384, 0.119, 0.199]
token at position 3:  [0.5,-0.2,0.1,0.4] + P[3] = [0.342, -0.381, 0.178, 0.543]
```

The exact same word produces two visibly different vectors purely because of where it sits in the sequence — exactly the disambiguation positional information is supposed to provide, here coming entirely from two learned rows of a table rather than a formula. This table costs `5 × 4 = 20` parameters at this toy size; a real model's table scales with its actual maximum sequence length and width.

## Bench

```bench
id: learned-pos-embed
title: A trained row instead of a formula
fallback: Add a learned positional vector to the same token embedding at different positions, and see how the resulting vector changes with position.
```

**Try this**

1. Compare the same token's final vector across several different positions.
2. Try a position beyond the table's size and see that there's simply no row to look up.
3. Compare the parameter cost of the table at a few different maximum lengths.

**What you should notice:** nothing in this mechanism explains or constrains *what* each positional row should contain — unlike the sinusoidal formula's built-in structure, a learned table's positional vectors are whatever training happens to settle on.

## Where it appears in AI

* **It was the positional scheme used by several early, influential transformer models**, valued for its simplicity — one more embedding table, trained the same way as every other.
* **Its fixed-length limitation is exactly the problem [[Relative Position and RoPE|relative position schemes]] and [[ALiBi and Length Extrapolation]] solve directly** — both of the next two topics specifically target handling sequences longer than anything seen during training.
* **It contrasts directly with the sinusoidal encoding on [[Deep Learning]]**: same role, same place in the computation, but one is fixed and formula-based while the other is trained and data-driven.

## Common pitfalls

* **Assuming a learned table generalizes past its trained maximum length.** There is no row to look up past `max_length` — the model simply cannot represent a position it never saw a table entry for.
* **Expecting the learned positions to form any particular pattern.** Unlike the sinusoidal encoding's deliberate frequency structure, a learned table's values are whatever training found useful, with no guaranteed interpretable shape.
* **Forgetting the parameter cost scales with maximum sequence length.** A model built for very long sequences pays for a correspondingly large positional table.

## Quick check

<details><summary>1. How does a learned positional embedding table get its positional vectors, as opposed to the sinusoidal encoding?</summary>
By training, exactly like a token embedding table — there is no formula; the values are learned parameters, indexed by position instead of token id.
</details>

<details><summary>2. In the worked example, what caused the same token's final vector to differ at position 0 versus position 3?</summary>
The two different rows of the positional table, `P[0]` and `P[3]`, added to the identical token embedding.
</details>

<details><summary>3. What is a learned positional table's main limitation compared to a formula-based encoding?</summary>
It has a fixed maximum length — there is no table entry at all for a position beyond however many rows it was trained with.
</details>

## Key terms

* **Positional table:** a trained embedding table indexed by sequence position instead of token id.
* **max_length:** the largest sequence position a learned positional table has an entry for.
* **Absolute position:** a token's fixed index within the sequence (0, 1, 2, …), as opposed to its position relative to another token.

## Related

[[Token Embeddings and Embedding Scaling]] · [[Relative Position and RoPE]] · [[ALiBi and Length Extrapolation]]
