[[Attention as Dot Products]] computes one weighted average per query — one way of deciding what to focus on. **Multi-head attention** runs several such attention computations in parallel, each looking at the input through its own learned projection, then concatenates all of their outputs — so the model can attend to several different kinds of relationship at once, not just one.

**You need:** [[Attention as Dot Products]] and [[Sequence-to-Sequence Models]].

## The question it answers

"A sentence can have several relevant relationships at once — grammatical agreement, which pronoun refers to what, topical similarity — can one attention computation really capture all of them simultaneously?" Not well on its own; give the model several independent attention "heads" instead, each free to specialise in a different kind of relationship.

## Intuition: several readers, each with their own highlighter colour

Imagine several readers going through the same sentence together, each one highlighting whatever they personally find relevant — one highlights grammatical subjects and verbs, another highlights pronouns and what they refer to, a third highlights topically related words. No single highlighter colour could capture everything useful; multiple independent passes, each looking for something different, can.

## Definitions

```text
for head i:  Qᵢ = Wᵢ^Q x,   Kᵢ = Wᵢ^K x,   Vᵢ = Wᵢ^V x    (each head has its own projection matrices)
headᵢ_output = attention(Qᵢ, Kᵢ, Vᵢ)                      (ordinary dot-product attention, within that head)

multi-head output = concat(head₁_output, head₂_output, …, head_h_output)
```

Each head operates in a smaller subspace (if the full embedding is dimension `d` and there are `h` heads, each head typically works in dimension `d/h`), so running several heads costs roughly the same total compute as one full-size attention computation — the capacity is spent on *diversity* of attention patterns, not extra total size.

## A worked example

Three token embeddings (4 dimensions each), with two heads: head A's projections look only at the first two dimensions, head B's look only at the last two:

```text
x₁ = (1, 0, 1, 0),   x₂ = (0, 1, 0, 1),   x₃ = (1, 1, 0, 0)
```

Using `x₁` as the query, each head computes its own attention weights over all three tokens:

```text
head A weights:  (0.401, 0.198, 0.401)    →  output ≈ (0.802, 0.599)
head B weights:  (0.503, 0.248, 0.248)    →  output ≈ (0.503, 0.248)

concatenated:    (0.802, 0.599, 0.503, 0.248)
```

Because the two heads look at different dimensions of the input, they produce genuinely different attention patterns over the *same* three tokens from the *same* query — exactly the point of running more than one head.

## Bench

```bench
id: multihead-compare
title: Two heads, two attention patterns
fallback: Three toy tokens and two attention heads, each looking at a different part of the embedding. Pick a query token and compare the two heads' attention weights and outputs side by side.
```

**Try this**

1. Compare the two heads' weight distributions for the default query and see how differently they weigh the same three tokens.
2. Switch the query token and see both heads' weights shift.
3. Imagine adding a third head looking at yet another part of the embedding — would it necessarily agree with either of the first two?

**What you should notice:** nothing forces the two heads to agree on which tokens matter most — each is free to specialise, constrained only by the part of the embedding it was set up (or, in a trained model, learns) to look at.

## Where it appears in AI

* **Every transformer block** (see [[Encoder-Decoder Architectures with Attention]]) uses multi-head attention as its core building block, typically with 8 to 96 or more heads depending on the model's size.
* **Different heads in trained transformers have been observed specialising** in specific patterns — some track syntactic structure, others track long-range topical relationships — though which head does what emerges from training, not from design.
* **The final concatenated output is usually passed through one more linear layer** (not shown here) to mix information across heads before moving to the next part of the network.

## Common pitfalls

* **Assuming more heads always helps.** Splitting the same total dimension across more heads gives each one less room to work with; there is a practical trade-off, not a free upgrade.
* **Expecting heads to specialise in humanly interpretable ways by design.** Any such specialisation is a trained, emergent property, not something multi-head attention guarantees on its own.
* **Forgetting each head has its own, separately learned projection matrices.** They are not the same attention computation run multiple times — each one can learn to look at the input completely differently.

## Quick check

<details><summary>1. What does each attention head have that is uniquely its own?</summary>
Its own query, key and value projection matrices, letting it attend to the input in its own way.
</details>

<details><summary>2. In the worked example, why do the two heads produce different attention weights for the same query token?</summary>
Each head's projections look at a different part of the token embeddings (the first two dimensions versus the last two), so they are effectively comparing different information even though the input tokens are the same.
</details>

<details><summary>3. How are the heads' outputs combined into one final output?</summary>
By concatenating each head's output vector into one longer vector (often followed by a linear mixing layer).
</details>

## Key terms

* **Attention head:** one independent attention computation with its own query, key and value projections.
* **Multi-head attention:** running several attention heads in parallel and concatenating their outputs.
* **Head dimension:** the (usually reduced) dimensionality each head's projections operate in.

## Related

[[Attention as Dot Products]] · [[Sequence-to-Sequence Models]] · [[Positional Encoding]] · [[Encoder-Decoder Architectures with Attention]]
