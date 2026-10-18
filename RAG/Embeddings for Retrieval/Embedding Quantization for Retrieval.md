A million documents, each with a 768-dimensional embedding stored as 32-bit floats, is already several gigabytes before any text itself is stored. Quantization shrinks every number in every vector down to a much smaller representation — trading a small amount of precision for a large, direct cut in memory.

**You need:** [[Bi-Encoders and Dense Embeddings]].

## The question it answers

"How much can an embedding be shrunk before it stops being useful for retrieval?" Quantization rounds each float32 value in a vector down to a much coarser representation — commonly int8, one byte instead of four — scaled so the rounding error stays small relative to the vector's own range. The question is whether that rounding changes which documents a query would retrieve, not just how much space the vectors take up.

## Intuition

Rounding a set of prices to the nearest dollar instead of keeping every cent barely changes which item is cheapest when prices differ by many dollars — it only risks confusion between items priced within a few cents of each other. Quantizing an embedding is the same trade: coarser numbers, with very little risk of changing the *ranking* unless two candidates were already nearly tied.

## Definition and notation

```text
scale = max(|vector|) / 127
quantized[i]   = round(vector[i] / scale)        -- an integer from −127 to 127
dequantized[i] = quantized[i] × scale            -- back to a float, at reduced precision
```

Four bytes per dimension (float32) become one byte per dimension (int8): a 4× reduction in memory for the vectors themselves.

## A worked example

One embedding, quantized to int8 and converted back to check the precision lost:

```text
original:      [0.9500, 0.0500]
quantized:     [127, 7]            (integers, one byte each)
dequantized:   [0.9500, 0.0524]
similarity between original and dequantized: 0.999997
```

Quantizing and reconstructing this vector changes its cosine similarity to itself by only about 0.0003% — nearly indistinguishable. Checking the same three-document ranking from earlier topics confirms it: the ranking order (refund timeline, returns policy, shipping times) comes out identical whether the document vectors are stored at full float32 precision or quantized to int8.

## Bench

```bench
id: embedding-quantization
title: Four bytes per number, or one
fallback: Quantize an embedding to int8 and compare its similarity and ranking against the original float32 version.
```

**Try this**

1. Compare the float32 and int8 rankings — they come out in the same order.
2. Check the memory figure for each precision level.
3. Imagine a collection of 10 million documents — what does a 4× memory reduction actually mean at that scale?

**What you should notice:** the ranking the query cares about survives quantization intact in this example, while the memory footprint drops to a quarter — a trade that's nearly free when the vectors being compared aren't extremely close to each other to begin with.

## Where it appears in AI

* **Multi-vector retrieval ([[Multi-Vector and Late-Interaction Retrieval]]) stores many more vectors per document**, which is exactly where quantization's memory savings matter most.
* **[[Vector Databases and Index Management]] often applies quantization as one of its built-in storage options**, alongside the index structure itself.
* **[[Approximate Nearest Neighbor Search with IVF and Product Quantization]] takes this idea further**, using quantization not just to save memory but as part of the search algorithm itself.

## Common pitfalls

* **Assuming quantization is always this safe.** The worked example's three documents aren't nearly tied — quantization is far more likely to change a ranking when two candidates' true similarities are extremely close to begin with.
* **Quantizing without checking the actual retrieval quality impact on real queries.** A similarity-preservation check on one vector, as in the worked example, is reassuring but not a guarantee across an entire collection and query distribution.
* **Confusing quantization with dimensionality reduction.** Quantization keeps every dimension but represents each one more coarsely; it doesn't reduce how many numbers make up the vector.

## Quick check

<details><summary>1. In the worked example, why does quantizing to int8 barely change the vector's similarity to its own original version?</summary>
The quantization scale is chosen relative to the vector's own maximum absolute value, so the rounding error introduced at each dimension is small relative to the vector's overall magnitude — the reconstructed vector stays very close to the original.
</details>

<details><summary>2. When would quantization be more likely to change a retrieval ranking?</summary>
When two or more candidates' true similarities to the query are extremely close — quantization's small rounding errors are more likely to flip the order of near-ties than they are to change a ranking where the gaps are already large.
</details>

<details><summary>3. Does quantization reduce how many dimensions a vector has?</summary>
No — it keeps the same number of dimensions but stores each one with less precision (fewer bits), which is different from dimensionality reduction, which drops dimensions entirely.
</details>

## Key terms

* **Quantization:** representing each value in a vector with fewer bits, trading precision for reduced memory.
* **int8:** an 8-bit (1-byte) integer representation, commonly used as a quantization target for embeddings originally stored as 32-bit floats.
* **Scale factor:** the value used to convert between a quantized integer and its original floating-point range.

## Related

[[Bi-Encoders and Dense Embeddings]] · [[Multi-Vector and Late-Interaction Retrieval]] · [[Vector Databases and Index Management]]
