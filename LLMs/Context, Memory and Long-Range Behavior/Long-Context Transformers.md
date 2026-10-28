Every mechanism this subject has covered for making attention cheaper — [[Sparse and Local (Windowed) Attention|windowed]], [[Linear Attention Approximations|linear]], [[IO-Aware Attention Computation|IO-aware]] — exists because of one specific, unavoidable fact: ordinary self-attention gets quadratically more expensive as context grows, and "long context" means running straight into that wall.

**You need:** [[Sparse and Local (Windowed) Attention]], [[IO-Aware Attention Computation]].

## The question it answers

"Why is handling a longer context fundamentally harder than just 'using a bigger number'?" Ordinary self-attention computes a score between every pair of positions in a sequence — for a sequence of length `n`, that's `n²` pairwise scores. Double the sequence length, and the attention computation doesn't double in cost; it quadruples. Long-context transformers aren't just models with a larger number written in a config file — they specifically have to grapple with this quadratic wall, usually through the efficient-attention techniques already covered earlier in this subject.

## Intuition

Doubling the number of people at a party doesn't double the number of possible one-on-one conversations — it roughly quadruples it, since every new person can talk to every existing person, and every existing person gains one more possible conversation partner. Self-attention's cost scales the same way: every new token in the sequence can attend to every other token, so the total number of pairwise interactions grows quadratically, not linearly, with sequence length.

## Definition and notation

```text
self-attention FLOPs for sequence length n, model dimension d:
  ≈ 2 · n² · d

doubling n → FLOPs increase by a factor of 4 (not 2)
16× the sequence length → FLOPs increase by a factor of 256
```

## A worked example

Attention's FLOPs cost at several sequence lengths, with model dimension fixed at 128:

```text
n =   512:  6.711 × 10⁷ FLOPs
n =  1024:  2.684 × 10⁸ FLOPs
n =  2048:  1.074 × 10⁹ FLOPs
n =  4096:  4.295 × 10⁹ FLOPs
n =  8192:  1.718 × 10¹⁰ FLOPs
```

Going from `n=512` to `n=8192` — a 16× increase in sequence length — increased attention's FLOPs cost by exactly 256×, precisely matching `16² = 256`. This is the quadratic wall in concrete numbers: context length can't simply be scaled up for free, which is exactly why [[Sparse and Local (Windowed) Attention|windowed]] and [[Linear Attention Approximations|linear]] attention variants exist in the first place.

## Bench

```bench
id: attention-quadratic-cost
title: Doubling the sequence quadruples the cost
fallback: Pick a sequence length and watch how sharply attention's FLOPs cost grows compared to a shorter sequence.
```

**Try this**

1. Compare the shortest and longest sequence lengths' FLOPs costs.
2. Check the ratio against the squared ratio of their lengths.
3. Consider what this means for simply "making the context window bigger" as a design choice.

**What you should notice:** the FLOPs ratio always exactly matches the *squared* ratio of sequence lengths — this isn't an approximation, it's the direct consequence of attention computing a score for every pair of positions.

## Where it appears in AI

* **Every efficient-attention technique already covered in this subject** — sparsity, linear-order approximations, IO-aware computation — exists specifically to avoid paying this full quadratic cost as context grows.
* **"Long context" as a marketed model feature usually means a combination of architectural tricks and serving-infrastructure engineering**, not simply running an unmodified quadratic-attention transformer at a much larger sequence length.
* **[[Context Window Extension Techniques|extending how far a model's positional understanding reaches]] is a separate problem from the raw compute cost** — a model could, in principle, have cheap-enough attention for a long sequence while still never having learned to handle positions that far apart meaningfully.

## Common pitfalls

* **Assuming a model's maximum context length is purely a memory or compute limit that can always be raised by using better hardware.** Raw compute cost is one real constraint, but [[Context Window Extension Techniques|a model's own positional understanding]] is a separate limit that more hardware alone doesn't fix.
* **Expecting "long context" models to use ordinary, unmodified self-attention at huge sequence lengths.** In practice, most long-context systems rely on some combination of the efficiency techniques covered earlier in this subject.
* **Treating the quadratic cost as a recent problem.** It's been a structural property of self-attention since it was introduced — what's changed over time is how aggressively that cost gets engineered around.

## Quick check

<details><summary>1. Why does doubling a sequence's length roughly quadruple attention's FLOPs cost?</summary>
Self-attention computes a score for every pair of positions in the sequence; doubling the number of positions roughly quadruples the number of pairs, since every one of the doubled positions can attend to every other doubled position.
</details>

<details><summary>2. In the worked example, what FLOPs ratio resulted from a 16× increase in sequence length?</summary>
256× — exactly matching 16², confirming the quadratic relationship between sequence length and attention cost.
</details>

<details><summary>3. Is "long context" purely a matter of raw compute capacity?</summary>
No — handling longer sequences cheaply enough typically requires architectural techniques (sparsity, linear attention, IO-aware computation) on top of raw compute, and separately requires the model to have learned to use positional information that far apart meaningfully.
</details>

## Key terms

* **Quadratic attention cost:** the FLOPs cost of self-attention growing with the square of sequence length.
* **Long-context transformer:** a model engineered to handle much longer sequences than ordinary quadratic attention would make practical.
* **FLOPs:** floating-point operations, the unit used to measure attention's computational cost.

## Related

[[Sparse and Local (Windowed) Attention]] · [[IO-Aware Attention Computation]] · [[Context Window Extension Techniques]]
