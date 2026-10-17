[[Decoder-Only Architectures|Generating text one token at a time]] means recomputing attention at every single step. Without care, that recomputation redoes work that was already done at every previous step — KV-caching is the fix: compute each token's key and value exactly once, and simply reuse them forever after.

**You need:** [[Decoder-Only Architectures]], [[Multi-Query and Grouped-Query Attention]].

## The question it answers

"When generating token by token, does every generation step really need to recompute the keys and values for every token seen so far?" No — a token's key and value vectors depend only on that token itself (and its position), never on what comes after it. Once computed, they never change. KV-caching simply stores them the first time and looks them up on every later step, instead of recomputing them from scratch.

## Intuition

Imagine writing a long essay, and before adding every new sentence, re-reading and re-summarizing the entire essay so far from the beginning — wasteful, since most of that summary hasn't changed since the last sentence. KV-caching is the obvious fix: keep a running set of notes (the keys and values) for everything written so far, and when adding a new sentence, just write new notes for it and append them to the pile, without redoing any of the old ones.

## Definition and notation

```text
without caching, generating N tokens:
  at step t, recompute K and V for all t tokens seen so far
  total K/V computations = Σ_{t=1}^{N} t = N(N+1)/2

with caching:
  at step t, compute K and V only for the one new token
  total K/V computations = N
```

The query for the new token is still computed fresh every step (it has to be — it's a brand-new token), but the keys and values for every *earlier* token are pulled straight from the cache instead of being recomputed.

## A worked example

Generating sequences of various lengths, comparing total key/value computations with and without caching:

```text
N = 10:   without cache: 55     with cache: 10     →  5.5× fewer computations
N = 50:   without cache: 1,275  with cache: 50      →  25.5× fewer computations
N = 100:  without cache: 5,050  with cache: 100     →  50.5× fewer computations
N = 500:  without cache: 125,250  with cache: 500   →  250.5× fewer computations
```

The savings aren't a fixed multiple — they keep growing as the generated sequence gets longer, since recomputing from scratch gets quadratically more wasteful while caching stays perfectly linear.

## Bench

```bench
id: kv-cache-savings
title: Compute each key and value exactly once
fallback: Set a generation length and compare the total key/value computations needed with and without caching, as the sequence grows.
```

**Try this**

1. Increase the generation length and watch the speedup factor grow.
2. Compare the shape of the "without cache" and "with cache" cost curves as length increases.
3. Connect this back to [[Multi-Query and Grouped-Query Attention]] — consider how a smaller `num_kv_heads` affects what actually needs to be stored in this cache.

**What you should notice:** without caching, generation cost grows quadratically with length purely from redundant recomputation — not from any new work the model is actually doing — which is exactly the waste caching eliminates.

## Where it appears in AI

* **It is standard practice in essentially every deployed autoregressive transformer** — without it, generating long text would be prohibitively slow, scaling quadratically for no computational benefit.
* **It is also the main memory cost of serving a decoder-only model**: the cache has to be stored for the whole generation, which is exactly why [[Multi-Query and Grouped-Query Attention|shrinking num_kv_heads]] matters so much in practice.
* **[[Inference Serving Trade-offs|later in this planet]], batching multiple requests together means managing many of these caches simultaneously** — a real systems problem built directly on top of this mechanism.

## Common pitfalls

* **Assuming the cache needs to store queries too.** Only keys and values are cached — queries are always freshly computed for the current token being generated, never reused.
* **Forgetting the cache grows with every generated token.** Longer generations need more memory for the cache, not just more computation — the two costs (speed savings and memory cost) are two sides of the same mechanism.
* **Treating caching as changing what the model computes.** It changes nothing about the *result* — the same keys and values are produced either way; caching only avoids redundantly recomputing them.

## Quick check

<details><summary>1. Why can a token's key and value be safely cached and reused at every later generation step?</summary>
A token's key and value depend only on that token itself and its position — nothing about later tokens changes them, so they never need to be recomputed.
</details>

<details><summary>2. In the worked example, why does the speedup factor keep growing as the generation length increases?</summary>
Recomputing from scratch costs grows quadratically (Σt ≈ N²/2) while caching costs grow only linearly (N), so the ratio between the two keeps widening as N grows.
</details>

<details><summary>3. What is still computed fresh at every generation step, even with caching?</summary>
The query for the newly generated token, and that token's own key and value (which then get added to the cache for future steps).
</details>

## Key terms

* **KV cache:** stored keys and values for every token generated so far, reused instead of recomputed at each new step.
* **Quadratic recomputation:** the wasted cost of recomputing every earlier token's key and value at every single generation step, without caching.
* **Autoregressive generation:** producing a sequence one token at a time, each depending on everything generated before it.

## Related

[[Decoder-Only Architectures]] · [[Multi-Query and Grouped-Query Attention]] · [[Inference Serving Trade-offs]]
