Everything so far on this planet has been about making a single forward pass efficient. Serving a transformer to real traffic adds a different question entirely: many requests arrive at once, and how they're grouped together changes both how much total work the hardware gets through and how long any individual request actually waits.

**You need:** [[KV-Caching for Autoregressive Inference]], [[Multi-Query and Grouped-Query Attention]].

## The question it answers

"Should requests be processed one at a time, or grouped together, when serving a transformer to many users at once?" Grouping them — **batching** — turns out to be dramatically more efficient, for a specific hardware reason: processing one request barely uses a modern accelerator's parallel compute capacity, so most of the cost of running a batch is fixed overhead, nearly independent of how many requests ride along in it. The trade-off is latency: a request in a larger batch may have to wait for that batch to be assembled before processing even starts.

## Intuition

Imagine a delivery van that costs the same to send out whether it carries one package or thirty — most of the cost is the trip itself, not the cargo. Sending one package at a time means paying for a trip per package; waiting to fill the van with thirty packages means thirty deliveries share one trip's cost, at the price of the first package having to wait for the van to fill up. Batching a transformer's inference requests is the same trade: processing time per *batch* barely grows with batch size (a GPU has spare parallel capacity at small batch sizes), so grouping requests multiplies throughput — but anyone whose request has to wait for the batch to fill pays in added latency.

## Definition and notation

```text
batch processing time ≈ T_fixed + T_marginal × batch_size
  T_fixed:    overhead paid once per batch, largely independent of its size
  T_marginal: small additional time per request added to the batch

throughput (requests/second) = batch_size / batch_processing_time
```

Because `T_fixed` dominates at small batch sizes, throughput grows much faster than processing time as batch size increases — the central reason batching is worth doing at all.

## A worked example

With `T_fixed = 10 ms` and `T_marginal = 0.5 ms` per request, comparing three batch sizes:

```text
batch size  1:  processing time 10.5 ms   →   95.2 requests/second
batch size  8:  processing time 14.0 ms   →  571.4 requests/second
batch size 32:  processing time 26.0 ms   → 1230.8 requests/second
```

Going from batch size 1 to 32 increased processing time by only 2.5× (10.5ms → 26ms) but increased throughput by nearly 13× (95.2 → 1230.8 requests/second) — the fixed overhead that dominates a batch of 1 becomes almost negligible once spread across 32 requests.

## Bench

```bench
id: batching-tradeoff
title: Throughput and the cost of waiting for a full batch
fallback: Set a batch size and see processing time and throughput change, alongside the latency cost of waiting for that batch to fill before processing starts.
```

**Try this**

1. Increase batch size and compare how much throughput grows versus how much processing time grows.
2. Consider a request that arrives just after a batch starts filling — how long might it wait before the next batch begins?
3. Change `T_fixed` relative to `T_marginal` and see how much that shifts the throughput benefit of larger batches.

**What you should notice:** the throughput gain from batching has a real latency cost attached — not in the processing time itself, which grows slowly, but in how long an individual request may sit waiting for its batch to be assembled in the first place.

## Where it appears in AI

* **Every production transformer-serving system has to make this trade-off explicitly**, usually by capping batch size or the maximum wait time before processing a partially-filled batch, rather than choosing one extreme.
* **[[Multi-Query and Grouped-Query Attention|KV-cache size]] directly limits how large a batch can grow**: each request in a batch needs its own growing cache, so memory — not just compute — caps batch size in practice.
* **[[Capstone: Assembling a Tiny Transformer from the Ground Up|the planet's capstone]] closes by tracing a single request through the whole pipeline this planet has built**, end to end.

## Common pitfalls

* **Assuming bigger batches are always better.** Past some point, GPU parallel capacity really does run out, and `T_marginal` starts dominating — throughput gains taper off, while latency keeps growing.
* **Forgetting batch-fill waiting time is a separate cost from processing time.** The worked example only accounts for processing time; a request's *total* latency also includes however long it waited for its batch to be ready.
* **Treating this as purely a software scheduling problem.** It's fundamentally a hardware-utilization fact — GPUs have spare parallel capacity at low batch sizes, which is what makes the whole trade-off exist in the first place.

## Quick check

<details><summary>1. Why does batch processing time grow much more slowly than batch size itself?</summary>
Most of the cost is fixed overhead, largely independent of batch size, because a GPU has spare parallel capacity that a single request doesn't fully use — adding more requests to the batch is nearly free until that capacity runs out.
</details>

<details><summary>2. In the worked example, what was the throughput gain going from batch size 1 to batch size 32, and why was it so much larger than the processing-time increase?</summary>
Nearly 13× (95.2 to 1230.8 requests/second), versus only a 2.5× increase in processing time — because the fixed overhead dominating a batch of 1 request gets spread across far more requests at batch size 32.
</details>

<details><summary>3. What latency cost does batching introduce that isn't captured by processing time alone?</summary>
The time a request spends waiting for its batch to be assembled before processing even starts — a real cost on top of the processing time itself.
</details>

## Key terms

* **Batching:** grouping multiple inference requests together to process in a single pass, amortizing fixed per-batch overhead.
* **Throughput:** the rate at which requests are processed, typically requests or tokens per second.
* **Latency:** the total time a single request takes, including both time spent waiting to be batched and time spent being processed.

## Related

[[KV-Caching for Autoregressive Inference]] · [[Multi-Query and Grouped-Query Attention]] · [[Capstone: Assembling a Tiny Transformer from the Ground Up]]
