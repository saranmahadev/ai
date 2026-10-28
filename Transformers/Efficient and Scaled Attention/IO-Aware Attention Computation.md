[[Linear Attention Approximations|Linear attention]] changes what gets computed — trading exact softmax for an approximation. This topic changes nothing about what's computed at all. The exact same softmax attention, computed in a different order, without ever holding the full n×n score matrix in memory at once.

**You need:** [[Linear Attention Approximations]], [[Sparse and Local (Windowed) Attention]].

## The question it answers

"Can exact softmax attention be made faster without approximating anything?" Yes — a large part of attention's real-world cost isn't the arithmetic itself, it's moving data between slow and fast memory. FlashAttention-style computation processes attention in small tiles that fit in fast on-chip memory, using a running ("online") version of softmax that never needs the full row of scores available at once — producing the mathematically identical result to ordinary softmax attention, just computed with far less data shuffled through slow memory.

## Intuition

Ordinary softmax needs every score in a row before it can normalize any of them — compute the max, subtract it from everything, exponentiate, sum, divide. That seems to require holding the whole row at once. The **online softmax** trick shows this isn't actually true: process the row in small chunks, keeping a running maximum and a running sum, and correct the running total each time a new chunk reveals a larger maximum than seen so far. The correction factor exactly accounts for everything computed before — no information is lost, nothing is approximated, and the full row never needs to exist in memory simultaneously.

## Definition and notation

```text
process keys/values in blocks. Maintain running max m, running sum l, running weighted output acc.
for each block:
  m_new = max(m, max(block scores))
  correction = exp(m − m_new)                      — rescales everything computed so far
  l = l × correction + Σ exp(block scores − m_new)
  acc = acc × correction + Σ exp(block scores − m_new) × block values
  m = m_new
final output = acc / l
```

This is exact — not an approximation of softmax, unlike [[Linear Attention Approximations|linear attention's]] feature map. It only changes *when* each piece of the computation happens, never *what* the final answer is.

## A worked example

Eight keys and values, 3-dimensional, processed in blocks of 3 (so three blocks: sizes 3, 3, 2):

```text
naive (full-row) softmax output:   [0.564455, -0.043759, -0.412017]
online (block-by-block) output:    [0.564455, -0.043759, -0.412017]

match: exact, to the digit
```

Processing the same 8 keys and values in three separate chunks — never holding all 8 scores at once, correcting the running totals each time a new chunk arrives — produces precisely the same output as computing the full softmax in one shot.

## Bench

```bench
id: online-softmax
title: The same softmax, one block at a time
fallback: Step through computing attention in blocks using the online softmax trick, and compare the running result against the naive full-row computation at the end.
```

**Try this**

1. Step through the blocks one at a time and watch the running max and running sum update.
2. Compare the block-by-block result against the naive full-row result once all blocks are processed.
3. Change the block size and confirm the final result doesn't change, only how many update steps it took.

**What you should notice:** the running correction factor exactly undoes any bias from an outdated running maximum — the math guarantees the final answer never depends on how the row happened to be chopped into blocks.

## Where it appears in AI

* **It is the core idea behind FlashAttention and similar exact, memory-efficient attention implementations**, widely used in practice because they compute identical results to standard attention while running meaningfully faster on real hardware.
* **It complements rather than replaces the other efficiency topics in this subject**: nothing stops combining IO-aware computation with [[Sparse and Local (Windowed) Attention|windowed]] or [[Multi-Query and Grouped-Query Attention|grouped-query]] attention — they address different costs (compute pattern, memory bandwidth, and cache size respectively).
* **The online-softmax trick itself is useful anywhere a softmax needs to be computed over data too large to hold at once** — not specific to attention at all.

## Common pitfalls

* **Confusing this with an approximation technique.** Unlike linear attention, nothing about the final numerical result changes — this is purely about the order and locality of computation.
* **Assuming block size affects correctness.** It doesn't — the worked example's match confirms the result is identical regardless of how the row is chunked; block size affects only performance, not the answer.
* **Assuming this removes the need for other efficiency techniques.** It specifically targets memory-movement cost, not the fact that attention still compares every allowed pair — windowed or linear attention address that different cost.

## Quick check

<details><summary>1. What, if anything, does IO-aware attention computation approximate?</summary>
Nothing — it computes the exact same softmax attention result as the naive approach, just reorganized to avoid holding the full score row in memory at once.
</details>

<details><summary>2. What role does the "correction factor" play in the online softmax algorithm?</summary>
It rescales everything accumulated from earlier blocks whenever a new block reveals a larger maximum score, keeping the running total mathematically consistent with what a single, full-row computation would have produced.
</details>

<details><summary>3. How does IO-aware computation relate to windowed and linear attention?</summary>
It addresses a different cost (memory movement, not compute pattern) and can be combined with either of the other two rather than replacing them.
</details>

## Key terms

* **Online (running) softmax:** computing softmax incrementally over blocks, using a running maximum and sum, instead of requiring the full row at once.
* **IO-aware:** designed around minimizing data movement between slow and fast memory, not just minimizing arithmetic operations.
* **Correction factor:** the rescaling term that keeps a running softmax computation consistent as new blocks of data arrive.

## Related

[[Linear Attention Approximations]] · [[Sparse and Local (Windowed) Attention]] · [[Multi-Query and Grouped-Query Attention]]
