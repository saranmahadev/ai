[[Why GPUs and Accelerators|One accelerator]] has a limit to how much data it can process at once. **Data-parallel training** splits one large batch across several accelerators (or whole machines) — each computes gradients on its own smaller shard, and those gradients are averaged together before anyone updates their weights, producing the same result as one big batch would have, just computed in parallel.

**You need:** [[Why GPUs and Accelerators]] and [[Batch Size and Training Dynamics]].

## The question it answers

"A batch too large for one GPU's memory still needs to be processed together for a stable gradient estimate — how do multiple GPUs cooperate on that?" Split the batch into equal shards, one per worker; each worker computes its own shard's average gradient; average those averages together (an operation called **all-reduce**) to recover exactly the gradient the full, undivided batch would have given.

## Intuition: several people counting a sample, then comparing notes

Imagine four people each surveying a different quarter of a large sample, each reporting their own quarter's average. Average those four reports together, and (as long as each quarter is the same size) you get exactly the same answer as if one person had surveyed the whole sample and averaged it themselves — the work was split, but the final number is identical.

## Definitions

```text
K workers, each processing an equal shard of the batch

worker k's local gradient:  g_k = average gradient over its own shard

all-reduce step:  g_global = (1/K) · Σ g_k         — mathematically equal to averaging the whole batch at once

every worker then applies the same g_global to its own copy of the weights, keeping them in sync
```

## A worked example

Eight per-example gradients `(1, 2, 3, 4, 5, 6, 7, 8)`, split across 4 workers, 2 examples each:

```text
worker 1 (examples 1,2):  mean = 1.5
worker 2 (examples 3,4):  mean = 3.5
worker 3 (examples 5,6):  mean = 5.5
worker 4 (examples 7,8):  mean = 7.5

average of the four worker means = (1.5+3.5+5.5+7.5)/4 = 4.5
global mean of all eight gradients directly  = (1+2+⋯+8)/8 = 4.5
```

Both routes land on exactly the same number, 4.5 — splitting the batch and averaging the averages gives the identical result to averaging the whole batch at once, which is exactly why data parallelism doesn't change what's being computed, only how the work is spread out.

The speedup actually achieved, though, is a separate question from the math above. With 4 workers and a communication overhead equal to 10% of one worker's compute time:

```text
ideal speedup (if communication were free):   4×
actual time per step ≈ (1/4) compute + 0.1 overhead = 0.35   (normalized to 1.0 for a single worker)
actual speedup = 1 / 0.35 ≈ 2.857×
```

Even a modest communication overhead keeps the real speedup well under the ideal, which is why scaling to very large worker counts needs the all-reduce communication itself to be fast and efficient, not just the per-worker compute to be fast.

## Bench

```bench
id: data-parallel-avg
title: Splitting a batch across workers
fallback: A batch of per-example gradients and a worker-count slider. See each worker's local average, confirm the average of those averages matches the single global average, and see the ideal versus actual speedup given some communication overhead.
```

**Try this**

1. Change the worker count and confirm the averaged result always matches the global average exactly.
2. Increase the communication overhead and watch the actual speedup fall further below the ideal (worker-count) speedup.
3. Push worker count very high with a fixed overhead and see diminishing returns set in.

**What you should notice:** splitting the batch never changes the math (the averaged gradient is identical either way) — only the speedup actually achieved, which communication overhead always eats into.

## Where it appears in AI

* **Training today's largest models** is impossible on a single accelerator at all; data parallelism (often combined with other parallelism strategies) is the default way to use many accelerators together.
* **All-reduce implementations** are a major area of systems engineering in their own right, since efficient communication between many workers is often the actual bottleneck, not the compute itself.
* **[[Checkpointing and Reproducibility|Checkpointing]] matters even more at this scale** — a long run across many machines has far more chances for a single failure to interrupt the whole job.

## Common pitfalls

* **Expecting a perfect, linear speedup from adding more workers.** Communication overhead, as shown above, always eats into the ideal speedup, and that overhead can grow as worker count increases.
* **Forgetting that unequal shard sizes break the exact equivalence.** The averaging-of-averages trick only matches the single global average when every worker's shard is the same size.
* **Confusing data parallelism with model parallelism.** Data parallelism splits the *batch*; a different strategy, not covered in full depth here, splits the *model itself* across devices when a single model is too large to fit on one accelerator at all.

## Quick check

<details><summary>1. What does each worker compute in data-parallel training?</summary>
The average gradient over its own shard (fraction) of the full batch.
</details>

<details><summary>2. Why does averaging the workers' local averages give the same result as averaging the whole batch directly?</summary>
As long as every shard is the same size, the average of equal-sized group averages is mathematically identical to the average over the combined group.
</details>

<details><summary>3. Why might doubling the number of workers give less than double the speedup?</summary>
Communication overhead (the all-reduce step synchronising gradients across workers) doesn't shrink proportionally, and eats into the ideal speedup more as worker count grows.
</details>

## Key terms

* **Data parallelism:** splitting a batch across multiple workers, each computing gradients on its own shard.
* **All-reduce:** the communication step that averages gradients across all workers.
* **Communication overhead:** the time cost of synchronising workers, which limits real-world speedup.

## Related

[[Why GPUs and Accelerators]] · [[Batch Size and Training Dynamics]] · [[Mixed Precision Training]] · [[Checkpointing and Reproducibility]]
