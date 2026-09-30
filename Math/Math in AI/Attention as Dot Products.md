**Attention** lets a model decide, for each item, which other items to focus on. It is three ideas from this planet in a row: compare a **query** with every **key** using dot products, turn the scores into weights with softmax, and take a weighted average of the **values**. It is the core of the Transformer.

**You need:** [[Dot Product]], [[Softmax and Cross-Entropy in Practice]], [[Expectation]] and [[Matrix Multiplication]].

## The question it answers

"When processing this word, which other words matter, and by how much?" In "the animal didn't cross the street because it was tired", the word "it" should draw on "animal", not "street". Attention computes that weighting.

## The three steps

Each item produces a **query** `q`, a **key** `k` and a **value** `v` (all vectors). For one query and `n` keys:

```text
1. scores   sᵢ = (q · kᵢ) / √d            dot-product similarity, scaled by √(dimension d)
2. weights  wᵢ = softmax(s)ᵢ               positive, sum to 1
3. output   o  = Σ wᵢ · vᵢ                 a weighted average of the values
```

The `1/√d` keeps scores from growing with the dimension, which would make the softmax too sharp (see [[Softmax and Cross-Entropy in Practice]]). Stacking all queries into a matrix gives the compact formula `softmax(Q Kᵀ / √d) V`: two matrix products and a softmax.

## A worked example

Dimension `d = 2`. Query `q = (1, 0)`. Three keys, with values equal to the keys: `k₁ = v₁ = (1, 0)`, `k₂ = v₂ = (0, 1)`, `k₃ = v₃ = (1, 1)`.

```text
scores  = ( q·k₁, q·k₂, q·k₃ ) / √2 = ( 1, 0, 1 ) / 1.414 = ( 0.707, 0, 0.707 )
softmax: e^ = ( 2.028, 1, 2.028 ), sum = 5.056  →  weights ( 0.401, 0.198, 0.401 )
output  = 0.401·(1,0) + 0.198·(0,1) + 0.401·(1,1) = ( 0.802, 0.599 )
```

The query points along the first axis, so it attends most to the keys that share that direction (`k₁` and `k₃`) and least to `k₂`. The output is pulled toward those values.

## The cost

Every item attends to every other, so `n` items need `n²` score computations. That quadratic growth in the sequence length is why long contexts are expensive (see [[Growth Rates and Big-O]]): doubling the length quadruples the attention cost.

## Bench

```bench
id: attention-heatmap
title: A query attends to five keys
fallback: A query vector set by an angle and a length attends to five keys around a half-circle; bars show the attention weights, arrows show the query and the weighted output, and a switch turns the one over root d scaling on or off.
```

**Try this**

1. Rotate the query and see which keys get the most weight.
2. Lengthen the query and watch the attention sharpen.
3. Turn the scaling off and on.
4. Find a query that attends almost equally to all keys.

**What you should notice:** keys pointing the way the query points get the most weight, longer vectors give sharper attention, and the output is the weighted average of the values.

## Where it appears in AI

* **Transformers** apply attention in every layer (see [[Transformers]]).
* **Large language models** use it to relate each token to earlier ones.
* **Image and audio models** use it to relate patches or frames.

## Common pitfalls

* **Forgetting the `√d` scaling.**
* **Reading attention weights as a full explanation** of the model's behaviour.
* **Ignoring the quadratic cost** on long sequences.
* **Confusing keys and values.** Keys are matched against; values are averaged.

## Quick check

<details><summary>1. Do attention weights add up to 1?</summary>
Yes; they come from a softmax.
</details>

<details><summary>2. With scores (0, 0, 0), what are the weights?</summary>
Equal: (1/3, 1/3, 1/3).
</details>

<details><summary>3. If the sequence length doubles, how does the attention cost change?</summary>
It roughly quadruples.
</details>

## Key terms

* **Query / key / value:** the three vectors each item produces.
* **Attention weights:** the softmax of scaled query–key dot products.
* **Scaled dot-product attention:** `softmax(Q Kᵀ / √d) V`.
* **Self-attention:** items in a sequence attending to one another.

## Related

[[Dot Product]] · [[Softmax and Cross-Entropy in Practice]] · [[Matrix Multiplication]] · [[Embeddings and Similarity Search]] · [[Transformers]]
