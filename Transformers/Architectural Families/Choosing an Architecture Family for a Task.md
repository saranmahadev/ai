Three architecture families, three different attention patterns, three different costs. This topic puts a number on that difference for a single concrete input/output shape, and turns the earlier topics' structural differences into an actual decision.

**You need:** [[Encoder-Only Architectures]], [[Decoder-Only Architectures]], [[Encoder-Decoder Architectures as a Pattern]], [[Why Attention Replaced Recurrence]].

## The question it answers

"Given a task's input and output shape, which architecture family actually fits, and what does each one cost?" The deciding factor is almost always what the task's input and output actually look like: a single input with no generated output (classification, understanding) fits encoder-only; one continuous stream the model both reads and extends (open-ended generation, chat) fits decoder-only; two genuinely separate sequences, one transformed into the other (translation, summarization into a fixed target format) fits encoder-decoder.

## Intuition

Encoder-only has nothing to generate — it reads once and produces a judgment, so bidirectional, single-pass attention is exactly what's needed and nothing is wasted on a decoder it would never use. Decoder-only treats the prompt and the generated continuation as one and the same kind of thing — appropriate when there's no meaningful boundary between "input" and "output," just one growing sequence. Encoder-decoder keeps the input and output as two separate sequences on purpose, useful exactly when that separation is real and worth preserving — the output isn't a continuation of the input, it's a transformation of it.

## Definition and notation

Using the same quadratic attention-cost accounting as [[Why Attention Replaced Recurrence]] (attention pairs ≈ sequence length squared, summed appropriately for causal attention):

```text
encoder-only:    cost ≈ N²                              (one bidirectional pass, N input tokens)
decoder-only:    cost ≈ Σ_{t=1}^{N+M} t                  (causal self-attention over the whole N+M sequence)
encoder-decoder: cost ≈ N² + Σ_{t=1}^{M} t + M·N          (encoder + decoder self-attn + cross-attention)
```

## A worked example

An input of `N = 6` tokens and an output of `M = 4` tokens, compared across all three architectures:

```text
encoder-only (classification, no generation): 6² = 36 attention pairs
decoder-only (one growing sequence, 6+4=10 tokens total): Σ_{t=1}^{10} t = 55 attention pairs
encoder-decoder (6 → 4, as a transformation): 6² + Σ_{t=1}^{4} t + 4×6 = 36 + 10 + 24 = 70 attention pairs
```

At this small scale, encoder-only is cheapest (it never generates anything), encoder-decoder is most expensive (two full stacks plus cross-attention), and decoder-only sits in between — but the real decision almost never comes down to this cost difference alone: it comes down to whether the task actually has an input-only shape, a single growing sequence, or two genuinely separate sequences.

## Bench

```bench
id: architecture-choice
title: Match the task shape to the architecture
fallback: Pick a task shape — understanding only, one growing sequence, or two separate sequences — and see which architecture family fits and its attention-pair cost at a chosen input and output length.
```

**Try this**

1. Pick each task shape in turn and read which architecture it matches.
2. Change the input and output lengths and watch each architecture's cost scale differently.
3. Find input/output lengths where decoder-only and encoder-decoder's costs are close, and consider what would still make one the better practical choice anyway.

**What you should notice:** cost alone rarely decides the choice — a classification task fed through a decoder-only architecture would work, but it would be paying for a growing causal sequence it doesn't actually need, since there's no "generation" involved at all.

## Where it appears in AI

* **Most large language models in current practice are decoder-only**, in part because a single, flexible growing-sequence architecture handles an enormous range of tasks (including ones that look like classification, by framing the answer as generated text) without needing a second stack.
* **Encoder-decoder remains the natural fit for genuinely structured sequence-to-sequence tasks** — translation, where a fixed, separate target sequence is really being produced from a fixed, separate source.
* **Encoder-only remains the standard choice for pure understanding tasks** — classification, retrieval, and other jobs with no generated output at all.

## Common pitfalls

* **Treating the cost formula as the deciding factor.** The task's actual shape — is there a generated output at all, and if so, is it a transformation of a separate input or a continuation of the same sequence — matters far more than the attention-pair count at any one scale.
* **Assuming decoder-only can't do understanding tasks.** It can, by framing them as generation (producing a label as if it were text), just not with the quadratic savings an encoder-only model gets from never generating anything.
* **Forgetting encoder-decoder's cost includes two full stacks.** The formula above counts only attention pairs, not the two separate sets of feed-forward sublayers each stack also needs.

## Quick check

<details><summary>1. What is the single biggest factor in choosing between the three architecture families?</summary>
Whether the task has a generated output at all, and if so, whether that output is a transformation of a separate input sequence or a continuation of the same one.
</details>

<details><summary>2. In the worked example, why was encoder-only the cheapest of the three?</summary>
It never generates anything — its entire cost is one bidirectional pass over the input, with no causal self-attention or cross-attention to pay for at all.
</details>

<details><summary>3. Why might a task that looks like classification still be handled by a decoder-only model in practice?</summary>
A decoder-only model can frame a classification answer as generated text, trading away encoder-only's cost advantage for the flexibility of a single, general-purpose architecture.
</details>

## Key terms

* **Task shape:** whether a task has no generated output, one continuous growing sequence, or two separate input/output sequences.
* **Attention-pair cost:** the number of query-key comparisons an attention computation makes, used here as a simple proxy for compute cost.
* **Sequence-to-sequence task:** a task whose output is a genuine transformation of a separate input, the natural fit for encoder-decoder.

## Related

[[Encoder-Only Architectures]] · [[Decoder-Only Architectures]] · [[Encoder-Decoder Architectures as a Pattern]] · [[Why Attention Replaced Recurrence]]
