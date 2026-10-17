[[Sparse and Local (Windowed) Attention|Windowed attention]] cuts cost by refusing to compute most pairs at all. Linear attention takes a different route to the same destination: keep every pair's influence, but restructure the arithmetic — using a different order of matrix multiplication — so the expensive n×n score matrix never has to exist in memory in the first place.

**You need:** [[Sparse and Local (Windowed) Attention]], [[Matrix Multiplication]].

## The question it answers

"Is there a way to avoid ever computing the full n×n attention matrix, without throwing away any pairs the way windowed attention does?" Yes — if the softmax is replaced with a simpler, positive "feature map" applied to queries and keys separately, matrix multiplication's associativity lets the exact same mathematical result be computed in a completely different order: one that multiplies a `d×d` matrix instead of an `n×n` one, however long the sequence is.

## Intuition

`(A · B) · C` and `A · (B · C)` always give the same answer for matrices whose shapes allow it — that's just associativity, true regardless of what the matrices mean. Standard attention computes `(φ(Q) · φ(K)ᵀ) · V` — forming the full query-by-key score matrix first, an `n × n` object, however long the sequence is. Reorder the same three matrices to `φ(Q) · (φ(K)ᵀ · V)` instead, and the first thing computed is `φ(K)ᵀ · V` — a `d × d` matrix, whose size depends only on the model's width, never on sequence length. The `n × n` matrix is never built at all.

## Definition and notation

```text
quadratic order:  (φ(Q) · φ(K)ᵀ) · V      — forms an n × n matrix first; cost ∝ n²·d
linear order:     φ(Q) · (φ(K)ᵀ · V)      — forms a d × d matrix first; cost ∝ n·d²
```

`φ` is a positive feature map applied to queries and keys (a common choice is `elu(x) + 1`), standing in for the softmax — this substitution is the actual approximation: it changes what attention computes, trading the softmax's exact normalization for a function that makes the reordering trick valid.

## A worked example

A 5-position sequence, 3-dimensional queries, keys and values, computed both ways:

```text
quadratic order output: identical to linear order output, to the digit — e.g. first row [4.665, 4.233, 5.187]
```

Both orders produce the exact same result, confirming the reordering itself is mathematically exact — only the feature map `φ` is an approximation of softmax, not the reassociation. Comparing the actual arithmetic cost (multiply-adds) at a few scales:

```text
n = 5,     d = 3:   quadratic 150        linear 90          →   1.7× fewer
n = 1,000, d = 64:  quadratic 128,000,000  linear 8,192,000  →  15.6× fewer
n = 10,000, d = 64: quadratic 12,800,000,000  linear 81,920,000 → 156.3× fewer
```

The advantage isn't fixed — it grows with sequence length, because the quadratic order's cost scales with `n²` while the linear order's scales with just `n`.

## Bench

```bench
id: linear-attention-order
title: Same answer, two different costs
fallback: Compute the same small attention result two ways — the usual quadratic order and the linear order — confirm they match, and compare their arithmetic cost at larger scales.
```

**Try this**

1. Confirm both orders produce the same output on the same small example.
2. Increase the sequence length and watch the cost gap between the two orders widen.
3. Change the model width `d` and see how it affects the linear order's cost specifically.

**What you should notice:** the two orders are the *same computation*, not two different algorithms producing different answers — the entire benefit comes from the order of operations alone.

## Where it appears in AI

* **It is a genuinely different strategy from [[Sparse and Local (Windowed) Attention|windowed attention]]**: windowed attention throws away distant pairs entirely; linear attention keeps every pair's influence, approximated through the feature map, while changing how the computation is organized.
* **The feature map choice is itself an active area of design** — different choices trade off how closely the approximation matches true softmax attention against other practical considerations.
* **[[IO-Aware Attention Computation|the next topic]] takes yet another angle on the same underlying problem**: computing *exact* softmax attention faster, not approximating it at all.

## Common pitfalls

* **Assuming linear attention computes exactly the same thing as softmax attention.** The reassociation trick is exact; the feature map replacing softmax is not — real approximation error is introduced there, not in the reordering.
* **Expecting the linear order to help at short sequence lengths.** At small `n` relative to `d`, as the worked example's first row shows, the saving can be modest — the real advantage shows up at long sequences.
* **Forgetting causal masking complicates this trick.** The simple reordering shown here assumes no masking; making it work with causal masking (needed for decoder-only generation) requires a more careful, running-sum version of the same idea.

## Quick check

<details><summary>1. What mathematical property makes the linear-order computation valid?</summary>
Associativity of matrix multiplication — (A·B)·C and A·(B·C) always give the same result when the shapes allow it, regardless of what the matrices represent.
</details>

<details><summary>2. In the worked example, what was the actual source of approximation error — the reordering, or something else?</summary>
The feature map φ replacing softmax — the reordering itself is exact, confirmed by both orders producing identical output.
</details>

<details><summary>3. Why does the cost gap between the two orders grow with sequence length?</summary>
The quadratic order's cost scales with n² while the linear order's scales with n — the ratio between the two necessarily grows as n increases.
</details>

## Key terms

* **Feature map (φ):** a function applied to queries and keys in place of softmax, chosen to make the linear-order computation valid.
* **Associativity:** the property that matrix multiplication gives the same result regardless of grouping, which the linear-order trick relies on.
* **Linear attention:** an attention computation reorganized to scale linearly, rather than quadratically, with sequence length.

## Related

[[Sparse and Local (Windowed) Attention]] · [[Matrix Multiplication]] · [[IO-Aware Attention Computation]]
