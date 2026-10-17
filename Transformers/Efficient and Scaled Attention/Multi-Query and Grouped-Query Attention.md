[[Multi-Head Attention|Standard multi-head attention]] gives every head its own query, key and value projections. That costs something specific at inference time: every head's keys and values have to be stored and reused as generation proceeds. Multi-query and grouped-query attention keep the per-head queries but share the keys and values across heads — shrinking exactly that storage cost.

**You need:** [[Multi-Head Attention]].

## The question it answers

"Does every attention head really need its own separate keys and values, or only its own queries?" Multi-query attention (MQA) answers no: give every head its own query projection, but share a single key and value projection across *all* heads. Grouped-query attention (GQA) is the middle ground: split the heads into a handful of groups, and share one key/value projection per group. Both leave the query side fully multi-head — only the keys and values, the part that has to be stored and reused during generation, get shared.

## Intuition

In standard multi-head attention, every one of the 8 (or more) heads keeps its own separate copy of "what does every past token mean, as a key and a value" — redundant storage, since much of that information overlaps across heads. MQA asks every head to share one single copy of that key/value information, while still letting each head query it differently. GQA compromises: a handful of shared key/value copies, a middle point between MQA's single shared copy and standard attention's one copy per head.

## Definition and notation

```text
standard (MHA):  num_kv_heads = num_heads        — one K/V projection per head
GQA:             num_kv_heads = num_groups        — one K/V projection per group of heads
MQA:             num_kv_heads = 1                 — a single, shared K/V projection for every head

KV cache size per token ∝ num_kv_heads × head_dim × num_layers
```

Only `num_kv_heads` changes between the three schemes — the number of query heads, and everything else about the attention computation, stays the same.

## A worked example

A model with `d_model = 512`, 8 heads, `head_dim = 64`, and 12 layers, comparing the per-token KV cache cost:

```text
MHA (num_kv_heads = 8):  12,288 floats per token
GQA (num_kv_heads = 2):   3,072 floats per token   (4× smaller than MHA)
MQA (num_kv_heads = 1):   1,536 floats per token   (8× smaller than MHA)
```

For a sequence of 2,048 tokens (4 bytes per float), the full KV cache comes out to:

```text
MHA: 100.66 MB
GQA:  25.17 MB
MQA:  12.58 MB
```

Switching from standard multi-head attention to MQA shrinks the KV cache that needs to be stored and read back at every generation step by a full 8×, at this configuration — with only the key/value side of attention changed.

## Bench

```bench
id: kv-heads-cache
title: Shrinking what has to be cached
fallback: Set the number of KV heads and see the per-token and per-sequence KV cache size change, from standard multi-head attention down to a single shared KV head.
```

**Try this**

1. Move from 8 KV heads down to 1 and watch the cache size shrink proportionally.
2. Try an intermediate value (2 or 4) to see GQA's middle-ground cost.
3. Increase the sequence length and watch the absolute cache size at each KV-head setting.

**What you should notice:** the cache size scales linearly with `num_kv_heads` — going from 8 to 1 KV head doesn't just help a little, it's a direct, proportional 8× reduction in exactly the thing that has to be stored during generation.

## Where it appears in AI

* **It directly sets up [[KV-Caching for Autoregressive Inference|the next topic]]**: the whole reason the number of KV heads matters this much is the cache that gets built and reused during generation.
* **GQA in particular is a widely-used practical compromise** in many modern large language models — most of MQA's memory savings, with less of the capacity loss that comes from sharing key/value information across every single head.
* **It is a pure inference-time efficiency choice**: the training objective and the rest of the architecture are unaffected — only how keys and values are shared across heads changes.

## Common pitfalls

* **Assuming MQA or GQA shrinks the query side too.** Only the key/value projections are shared; every head still computes its own distinct query.
* **Treating this as free.** Sharing key/value information across heads does cost some representational capacity compared to giving every head its own — the savings come with a genuine, if often small, trade-off.
* **Confusing "num_kv_heads" with "num_heads."** The query side's head count is unchanged by this topic entirely — only how many *distinct* key/value projections exist changes.

## Quick check

<details><summary>1. What is shared across heads in multi-query attention, and what stays separate per head?</summary>
A single key and value projection is shared across all heads; each head still has its own separate query projection.
</details>

<details><summary>2. In the worked example, by what factor did the KV cache shrink going from standard multi-head attention to MQA?</summary>
8×, directly matching the drop from 8 KV heads to 1.
</details>

<details><summary>3. What does grouped-query attention trade off, relative to multi-query attention?</summary>
More KV heads than MQA's single shared one (so a larger cache, less savings) in exchange for more representational capacity than fully sharing key/value information across every head.
</details>

## Key terms

* **num_kv_heads:** the number of distinct key/value projections, which can be fewer than the number of query heads.
* **Multi-query attention (MQA):** sharing a single key/value projection across every attention head.
* **Grouped-query attention (GQA):** sharing one key/value projection per group of heads, a middle ground between standard multi-head attention and MQA.

## Related

[[Multi-Head Attention]] · [[KV-Caching for Autoregressive Inference]]
