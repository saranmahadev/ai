Everything in this subject so far has been about a single request: decode it well, condition it correctly, evaluate it fairly. A real product serves thousands of requests, and most of its cost comes from decisions that have nothing to do with any individual one of them.

**You need:** [[Parameter-Efficient Adaptation for Generation]], [[Content Safety and Red-Teaming]].

## The question it answers

"Where does a generative product's cost actually come from, beyond just running the model?" Every incoming request passes through several stages before (or instead of) reaching generation itself: a **safety check** can reject it outright, for free; a **cache lookup** can serve a previously-generated answer for a prompt seen before, at a small fraction of generation's cost; only requests that clear both stages pay the full cost of actually generating something new. The product-level question isn't "how good is the model" — it's "how much of our traffic can we avoid fully generating for at all."

## Intuition

A restaurant kitchen doesn't cook every order from raw ingredients at full price in attention and time — some orders get turned away at the door (safety), some are standard dishes already prepped and ready to plate (cache), and only the genuinely novel orders go through the full cooking process. The total cost of running the kitchen depends enormously on how many orders fall into each category, not just on how good the kitchen is at cooking any one dish.

## Definition and notation

```text
per-request cost:
  blocked (failed safety check):    ~0 cost, no generation happens
  cache hit (prompt seen before):   small fixed cost, no generation happens
  cache miss (genuinely new):       full generation cost

total cost over N requests ≈ N × [ (fraction blocked) × 0
                                   + (fraction cached) × cache_cost
                                   + (fraction generated) × generation_cost ]
```

## A worked example

100 simulated requests, where roughly a fifth get blocked by a safety check, and the cache hit rate is varied among the rest:

```text
cache hit rate 0%:    total cost 740.0   (every unblocked request fully generated)
cache hit rate 30%:   total cost 462.8   (37% lower, with the same blocked count)
cache hit rate 60%:   total cost 334.1   (55% lower)
```

The number of blocked requests doesn't change across these three runs — only the cache hit rate does — and that alone more than halves total cost going from 0% to 60% cache hits. The model's own generation cost per request never changed at all; the product-level decision of *how many requests actually reach generation* was the whole story.

## Bench

```bench
id: product-pipeline-cost
title: Where a generative product's cost actually goes
fallback: Adjust a cache hit rate and watch how much of a generative product's total cost shifts away from full generation.
```

**Try this**

1. Set cache hit rate to 0% and note the total cost.
2. Raise it and watch the cost breakdown shift toward cheap cache hits.
3. Notice the blocked-request count doesn't change as you adjust the cache hit rate.

**What you should notice:** safety blocking and caching are independent levers — one depends on what's being asked, the other on whether it's been asked before — and both reduce cost without touching the model itself.

## Where it appears in AI

* **Production LLM APIs commonly cache responses to repeated or near-identical prompts**, especially for common queries, because the savings from avoiding redundant generation can be substantial at scale.
* **Safety filtering, when it can run cheaply before generation, is a cost optimization as well as a safety one** — a request blocked before reaching the model costs nothing to generate.
* **[[Inference Serving Trade-offs|batching decisions]] in Transformers address a related but distinct cost lever** — how to make the *generation* stage itself more efficient once a request actually reaches it, rather than how to avoid reaching it in the first place.

## Common pitfalls

* **Assuming a better model is the main lever for reducing product cost.** The worked example shows cache hit rate alone, with no change to the model, more than halves total cost — architectural and product decisions can dominate model quality as a cost factor.
* **Caching prompts that need fresh, request-specific output.** A cache is only a good trade when repeated prompts genuinely warrant an identical (or near-identical) response — caching inappropriately can serve stale or wrong answers.
* **Treating safety filtering purely as a cost or purely as a safety measure.** It's genuinely both at once in a case like this: a request blocked for safety reasons also never incurs any generation cost.

## Quick check

<details><summary>1. What are the three paths a request can take in this worked example's pipeline, and their relative costs?</summary>
Blocked by a safety check (no cost), a cache hit (small fixed cost), or a cache miss that triggers full generation (the full generation cost) — in increasing order of cost.
</details>

<details><summary>2. In the worked example, what changed between the three simulated runs, and what stayed the same?</summary>
The cache hit rate changed (0%, 30%, 60%); the fraction of requests blocked by the safety check, and the per-request generation cost itself, stayed the same across all three.
</details>

<details><summary>3. Why can product-level decisions sometimes matter more for cost than the model itself?</summary>
Because how many requests actually reach full generation — determined by safety filtering and caching — directly scales the total cost, independent of how efficient or expensive any single generation happens to be.
</details>

## Key terms

* **Cache hit rate:** the fraction of requests served from a previously generated response rather than freshly generated.
* **Safety-check blocking:** rejecting a request before generation, avoiding its generation cost entirely.
* **Product-level cost lever:** a decision (caching, filtering, batching) that changes total cost without changing the underlying model.

## Related

[[Parameter-Efficient Adaptation for Generation]] · [[Content Safety and Red-Teaming]] · [[Compute and Environmental Costs of Generative AI]]
