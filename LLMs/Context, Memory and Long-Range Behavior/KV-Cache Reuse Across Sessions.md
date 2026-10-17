[[KV-Caching for Autoregressive Inference|KV-caching]] already avoids recomputing a sequence's earlier positions while generating one response. There's no reason that saved computation has to be thrown away the moment a response finishes — if a conversation returns later and starts from the exact same prefix, that cache can simply be reused.

**You need:** [[KV-Caching for Autoregressive Inference]], [[Multi-Turn Conversation State and Memory]].

## The question it answers

"Does a returning conversation have to recompute its entire history from scratch?" Not if the earlier turns' key-value cache was kept around. **Cross-session KV-cache reuse** stores a conversation's cache after a response finishes, and when the same conversation continues later with the same prefix, loads that cache back instead of recomputing attention over every earlier token — only the genuinely new tokens need fresh computation.

## Intuition

Reopening a long document you were reading yesterday doesn't require re-reading it from page one to pick up where you left off — you (or a bookmark) remember exactly where you stopped, and you continue from there. A cached KV state is exactly that bookmark, at the level of a transformer's internal computation: it's the saved result of everything the model already "figured out" about the earlier tokens, ready to be picked back up without redoing that work.

## Definition and notation

```text
without cache reuse: cost = (prefix_tokens + new_tokens) × flops_per_token
with cache reuse:     cost = new_tokens × flops_per_token
  (the prefix's key/value vectors are loaded from the saved cache,
   not recomputed by running the earlier tokens through the model again)
```

## A worked example

A conversation returning with a 2,000-token prefix already cached, and 50 new tokens to process:

```text
without reuse (recompute everything):  4.10 × 10⁹ FLOPs
with reuse (only the new tokens):      1.00 × 10⁸ FLOPs

savings: 97.6%
```

Recomputing the full 2,050 tokens from scratch costs over 40 times what processing only the 50 genuinely new tokens costs — the 2,000-token prefix's computation was already done once, and reusing its cache means never paying for it again.

## Bench

```bench
id: kv-cache-session-reuse
title: Not starting from zero on a returning conversation
fallback: Adjust how long a cached conversation prefix is and watch how much compute reusing its cache saves compared to recomputing everything.
```

**Try this**

1. Set a short cached prefix and note the modest savings.
2. Raise the prefix length and watch the savings grow.
3. Consider what happens to the savings percentage as the prefix becomes very large relative to the new tokens.

**What you should notice:** the longer the already-processed prefix, the more dramatic the savings from reusing its cache — the benefit scales directly with how much work would otherwise have to be needlessly redone.

## Where it appears in AI

* **Production chat APIs that support prompt or context caching are applying exactly this idea** — a system prompt or long document included in every request of a session can be cached once and reused across many turns, rather than reprocessed every time.
* **It requires the prefix to be genuinely unchanged between reuses** — if even one earlier token differs, the cached keys and values no longer correspond to the right context, and the mismatch has to be detected and handled (usually by recomputing from the point of divergence onward).
* **It composes directly with [[Multi-Turn Conversation State and Memory|summarization-based memory]]**: summarizing older turns shrinks what needs to be cached (and reused) in the first place, compounding the savings from caching alone.

## Common pitfalls

* **Assuming cache reuse works across any two requests.** It specifically requires the cached prefix to exactly match the new request's beginning — a changed system prompt, a reordered conversation, or even a different sampling parameter upstream can all invalidate the match.
* **Forgetting cached state has to be stored somewhere.** Keeping a conversation's KV-cache around between turns (or sessions) has its own memory cost — it isn't a purely free optimization, it trades compute savings for memory and storage overhead.
* **Confusing this with [[Multi-Turn Conversation State and Memory|reducing how much content is included]] in a conversation's context.** Cache reuse still processes the exact same total content conceptually — it just avoids redoing the computation for the part that hasn't changed.

## Quick check

<details><summary>1. What does cross-session KV-cache reuse avoid recomputing, specifically?</summary>
The attention computation for a conversation's earlier, unchanged prefix — only genuinely new tokens need to be processed through the model again.
</details>

<details><summary>2. In the worked example, how much compute was saved by reusing a 2,000-token cached prefix instead of recomputing it?</summary>
About 97.6% — the full recomputation cost roughly 40 times what processing only the 50 new tokens cost using the cached prefix.
</details>

<details><summary>3. What has to be true for a cached prefix to be validly reused?</summary>
The new request's beginning must exactly match the cached prefix — any change anywhere in that earlier content invalidates the cache for everything from the point of divergence onward.
</details>

## Key terms

* **Cross-session KV-cache reuse:** reusing a previously computed key-value cache for an unchanged conversation prefix, rather than recomputing it.
* **Cache invalidation:** when a change in the prefix makes a previously cached KV-state no longer valid to reuse.
* **Prefix:** the earlier, unchanged portion of a conversation or document whose computation can potentially be cached.

## Related

[[KV-Caching for Autoregressive Inference]] · [[Multi-Turn Conversation State and Memory]] · [[Cost and Latency of LLM APIs]]
