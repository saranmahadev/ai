[[Encoder-Decoder Architectures with Attention|Attention]] started as an addition to RNN-based encoder-decoders. The transformer architecture's real leap was realising attention could *replace* recurrence entirely — a sequence attending to itself, with no RNN at all — fixing two of recurrence's deepest weaknesses at once: how far a signal has to travel, and how little of the computation can run in parallel.

**You need:** [[Encoder-Decoder Architectures with Attention]] and [[Vanishing and Exploding Gradients]].

## The question it answers

"If attention already helps an RNN look back at its own input, why not skip the RNN altogether?" Because once you do, two of recurrence's structural costs disappear at the same time: the number of steps information must travel between distant positions, and the requirement that steps happen one after another.

## Intuition: a relay race versus a conference call

A recurrent network passing information from the first token to the last is like a relay race: the baton (hidden state) must physically pass through every runner (time step) in between, in strict order, one at a time — and if any runner drops it a little (a shrinking gradient factor), that loss compounds over the whole race. Self-attention is more like a conference call: every position can "speak" directly to every other position in one round, regardless of how far apart they are, and nothing has to wait its turn.

## Definitions

```text
RNN:           path length between positions 1 and T  =  T − 1   (must pass through every step between them)
self-attention: path length between any two positions  =  1       (direct dot product, any distance)

RNN:           T sequential steps required, none can start early
self-attention: all pairwise scores computed in one parallel operation (at the cost of T² of them)
```

## A worked example

A sequence of length `T = 100`, comparing how a gradient (or signal) travels between the first and last positions, with each RNN step shrinking it by a factor of 0.9:

```text
RNN:            path length = 99 steps      surviving signal ≈ 0.9⁹⁹ ≈ 0.0000295   (vanished)
self-attention: path length = 1 step        no compounding at all — a single direct connection
```

But this isn't a free upgrade: computing *every* pair of positions' attention scores costs `T² = 10,000` score computations for this sequence, against the RNN's `T = 100` sequential steps — self-attention trades a sequential bottleneck for a quadratic one, which becomes its own practical limit for very long sequences.

## Bench

```bench
id: path-length
title: How far does information have to travel?
fallback: A sequence length slider. Compare the path length (and resulting signal strength) between the first and last position under recurrence versus self-attention, alongside the compute cost each architecture pays.
```

**Try this**

1. Increase the sequence length and watch the RNN's path length (and surviving signal) collapse, while attention's path length stays at 1.
2. Watch the compute-cost comparison flip the other way: attention's cost grows quadratically while the RNN's stays linear.
3. Find roughly where, for this toy shrink factor, the RNN's surviving signal becomes negligible.

**What you should notice:** attention's constant path length is what makes long-range dependencies tractable at all; its quadratic compute cost is the real price paid for that, not a detail to ignore.

## Where it appears in AI

* **Every modern large language model** is built from self-attention for exactly this reason — the ability to relate any two tokens directly, however far apart, without a chain of recurrent steps between them.
* **The quadratic cost of full self-attention is a genuine, active engineering problem**, driving research into more efficient attention variants for very long sequences — a topic for later planets, not covered in depth here.
* **Parallel training (not just parallel attention computation)** is a major practical win too: an entire sequence's self-attention layer can be computed in one batched matrix operation, unlike an RNN's inherently step-by-step forward pass.

## Common pitfalls

* **Concluding attention is simply "better" with no downside.** Its quadratic compute and memory cost in sequence length is a real, serious limitation recurrence does not share.
* **Forgetting positional encoding is required precisely because recurrence's implicit ordering is gone.** Removing the RNN also removes the one thing that used to track position for free.
* **Assuming this means RNNs are obsolete everywhere.** For short sequences, or settings where compute is tightly constrained, RNNs (or GRUs/LSTMs) remain a reasonable, cheaper choice.

## Quick check

<details><summary>1. What is the path length between the first and last position in a self-attention layer, no matter how long the sequence?</summary>
1 — any two positions are connected by a single, direct computation.
</details>

<details><summary>2. What does self-attention trade away to achieve that constant path length?</summary>
A higher compute cost: scoring every pair of positions costs O(T²), compared to an RNN's O(T) sequential steps.
</details>

<details><summary>3. Why does a long RNN path length make vanishing gradients worse?</summary>
Each additional step in the path compounds another shrinking (or growing) multiplicative factor, exactly as described in [[Vanishing and Exploding Gradients]] and [[Backpropagation Through Time]].
</details>

## Key terms

* **Path length:** the number of sequential computation steps separating two positions in a sequence.
* **Quadratic cost:** compute or memory that grows with the square of the sequence length, as full self-attention's scoring does.
* **Parallelizable:** able to be computed all at once rather than step by step.

## Related

[[Encoder-Decoder Architectures with Attention]] · [[Vanishing and Exploding Gradients]] · [[Backpropagation Through Time]] · [[Multi-Head Attention]]
