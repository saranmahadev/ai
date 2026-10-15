A [[Matrix Multiplication|matrix multiplication]] — the core operation behind every [[The Multilayer Feedforward Network|dense layer]], convolution and attention computation — is really an enormous number of small, independent multiply-and-add operations. A **GPU** has thousands of simple cores built specifically to do the same operation on many pieces of data at once, which matches that structure far better than a CPU's handful of powerful, general-purpose cores.

**You need:** [[The Multilayer Feedforward Network]] and [[Matrix Multiplication]].

## The question it answers

"Why is specialised hardware, not just a faster CPU, the default for training deep networks?" Because the dominant cost — matrix multiplication — is made of enormous numbers of independent small operations, and a chip with thousands of simple cores running them in parallel finishes the job in a small fraction of the time a handful of sequential cores would take.

## Intuition: one team of eight experts, or five thousand people filling in a spreadsheet

A CPU is like a small team of highly skilled, versatile experts — each can do many different kinds of complex work, one task at a time, very capably. A GPU is like a huge crowd of people, each only able to do one simple thing (a multiply-and-add), but five thousand of them can do five thousand such operations *at the same time*. Multiplying two large matrices needs an astronomical number of these simple, identical, independent operations — exactly the job a crowd beats a small team of specialists at.

## Definitions

```text
multiplying two n×n matrices requires n³ multiply-add operations

with P processors working in parallel, that many operations take roughly  n³ / P  "rounds"

fewer, more powerful processors (CPU):   small P, many rounds
many, simpler processors (GPU):          large P, few rounds
```

## A worked example

Multiplying two 1000×1000 matrices requires `1000³ = 10⁹` multiply-add operations. Comparing a CPU-like 8 parallel cores against a GPU-like 5,000 parallel cores (assuming, for this comparison, similar speed per core):

```text
CPU (8 cores):     10⁹ / 8     = 1.25 × 10⁸ rounds
GPU (5,000 cores):  10⁹ / 5000 = 2.00 × 10⁵ rounds

speedup ≈ 1.25×10⁸ / 2.00×10⁵ = 625×
```

Even with no assumption that each GPU core is individually faster than a CPU core, having roughly 625 times as many of them working in parallel gives roughly a 625× reduction in the number of sequential rounds needed for this one matrix multiplication.

## Bench

```bench
id: parallel-rounds
title: Rounds needed for a big matrix multiply
fallback: A matrix-size slider and a processor-count slider. See how many sequential rounds a given number of parallel processors needs to finish all the required multiply-add operations.
```

**Try this**

1. Increase matrix size and watch the total operation count (and rounds needed) grow sharply — it scales with the cube of the size.
2. Increase processor count and watch the rounds needed shrink proportionally.
3. Compare a "CPU-like" and "GPU-like" processor count side by side at a large matrix size.

**What you should notice:** operations grow with the *cube* of matrix size, so even a huge processor count eventually faces a huge number of rounds for big enough matrices — parallelism helps enormously, but doesn't make the underlying cost disappear.

## Where it appears in AI

* **Training and running every modern deep network** relies on GPUs (or similar accelerators like TPUs) for close to all of the actual arithmetic.
* **Tensor cores and other specialised units**, not covered in depth here, go even further than general GPU parallelism, with hardware specifically built for the matrix-multiply-and-accumulate pattern at the heart of deep learning.
* **[[Mixed Precision Training]] and [[Distributed and Data-Parallel Training]]** both build further on this same hardware reality — using the parallelism available even more efficiently, or spreading work across many accelerators at once.

## Common pitfalls

* **Assuming a GPU is always faster, for any workload.** For tasks with few independent operations, or a lot of sequential, branching logic, a CPU's more powerful individual cores can win; GPUs excel specifically when there's enormous, uniform, independent work to parallelise.
* **Forgetting data movement has its own cost.** Even perfectly parallel computation can be bottlenecked by how fast data can be moved to and from the processors doing the work.
* **Treating "more cores" as a free, unlimited speedup.** Communication and coordination overhead between cores (and later, between whole machines — see [[Distributed and Data-Parallel Training]]) eventually limits how much parallelism actually helps.

## Quick check

<details><summary>1. Why does matrix multiplication parallelise so well across many simple processors?</summary>
It consists of an enormous number of small, independent multiply-and-add operations that don't depend on each other's results, so many of them can run simultaneously.
</details>

<details><summary>2. In the worked example, where does the roughly 625× speedup come from?</summary>
From having roughly 625 times as many parallel processors (5,000 versus 8), each doing the same kind of work, cutting the number of sequential rounds needed by that same factor.
</details>

<details><summary>3. Does increasing matrix size always make the GPU's advantage grow without limit?</summary>
The total work grows with the cube of the matrix size, so a fixed processor count eventually faces far more rounds regardless — parallelism helps a constant factor, not an unlimited one.
</details>

## Key terms

* **Parallel processing:** performing many independent operations at the same time rather than one after another.
* **GPU (graphics processing unit):** hardware with many simple cores, well-suited to the kind of massive, uniform parallelism matrix multiplication needs.
* **Accelerator:** specialised hardware (GPUs, TPUs and others) built for the arithmetic patterns deep learning relies on.

## Related

[[The Multilayer Feedforward Network]] · [[Matrix Multiplication]] · [[Mixed Precision Training]] · [[Distributed and Data-Parallel Training]]
