[[Encoder-Only Architectures|Encoder-only]] and [[Decoder-Only Architectures|decoder-only]] architectures each use one kind of self-attention throughout. An encoder-decoder architecture uses both — a full bidirectional encoder stack, a full causal decoder stack, and a third kind of attention connecting them: the decoder looking directly at the encoder's finished output.

**You need:** [[Encoder-Only Architectures]], [[Decoder-Only Architectures]].

## The question it answers

"What does a transformer look like when the task is genuinely two different jobs — fully understand one piece of text, then generate a different piece of text based on it?" An encoder-decoder architecture: the encoder stack reads the input bidirectionally, exactly as in [[Encoder-Only Architectures]]; the decoder stack generates output causally, exactly as in [[Decoder-Only Architectures]]; and a new attention sublayer, **cross-attention**, lets every decoder position look at the *entire* finished encoder output, with no causal restriction at all.

## Intuition

Think of translating a sentence from one language to another. Understanding the full source sentence benefits from seeing it all at once, in both directions — exactly the encoder's job. Producing the translation, word by word, has to respect that later words don't exist yet — exactly the decoder's job. But generating each word of the translation also needs to look back at the *entire* source sentence, not just the part already covered — translating the first word of the output might still depend on something near the end of the input. Cross-attention is exactly that: a decoder position's query, compared against keys and values drawn from the finished encoder output, with no restriction on which source positions it can see.

## Definition and notation

```text
encoder:  bidirectional self-attention, same as Encoder-Only Architectures
decoder (per block):
  1. causal self-attention among the decoder's own positions so far
  2. cross-attention: decoder queries, encoder keys and values — no masking
  3. feed-forward sublayer, as usual
```

Cross-attention uses the same scaled dot-product formula as self-attention — the only difference is that queries come from one sequence (the decoder) while keys and values come from a different, already-computed sequence (the encoder's output).

## A worked example

A 3-position encoder output and a 2-position decoder, so far, both 4-dimensional:

```text
decoder's own causal self-attention weights:
  position 0: [1.000, 0.000]        (can only see itself)
  position 1: [0.509, 0.491]        (sees itself and position 0)

cross-attention weights (decoder position → encoder positions), no masking:
  decoder position 0: [0.341, 0.327, 0.333]   (sums to 1.000)
  decoder position 1: [0.322, 0.344, 0.334]   (sums to 1.000)
```

Both decoder positions spread their cross-attention across *all three* encoder positions, regardless of how little of the decoder's own sequence has been generated so far — position 0, despite only having itself available in self-attention, still has full access to the entire encoder output through cross-attention.

## Bench

```bench
id: cross-attention-demo
title: Looking back at the whole source while generating
fallback: Compare a decoder position's causal self-attention (restricted to earlier decoder positions) against its cross-attention (full access to every encoder position), side by side.
```

**Try this**

1. Compare how restricted decoder self-attention is for an early position against how unrestricted its cross-attention is.
2. Add more decoder positions and watch self-attention's visible context grow while cross-attention's stays full every time.
3. Consider what cross-attention would need to be masked for a task like translation with aligned padding.

**What you should notice:** causal restriction applies only to the decoder's own, still-being-generated sequence — it says nothing about the encoder's already-complete output, which stays fully visible through cross-attention at every single decoder step.

## Where it appears in AI

* **T5 and other sequence-to-sequence transformer models follow exactly this pattern**, and it is the direct transformer-era descendant of [[Encoder-Decoder Architectures with Attention|the RNN-based encoder-decoder attention]] covered on [[Deep Learning]] — same cross-attention idea, built from transformer blocks instead of recurrent ones.
* **It is the natural fit for genuinely input-to-output tasks**: translation, summarization, and other jobs where the output is a transformation of a complete input, not a continuation of it.
* **[[Choosing an Architecture Family for a Task|the next topic]] weighs this pattern's extra cost and complexity** (two stacks instead of one, plus cross-attention) against when it's actually worth it over a simpler architecture.

## Common pitfalls

* **Assuming cross-attention is masked like decoder self-attention.** It generally isn't — the encoder's output is already complete and fixed, so there's no "future" to hide from it (padding masking on the encoder side still applies).
* **Confusing cross-attention with a second self-attention pass.** Queries and keys/values come from two different sequences here, unlike self-attention, where they all come from the same one.
* **Treating this as strictly more powerful than encoder-only or decoder-only.** It solves a genuinely different kind of task (transforming one sequence into another) at the cost of two stacks instead of one — not a universal upgrade.

## Quick check

<details><summary>1. What are the three kinds of attention present in an encoder-decoder transformer block?</summary>
Bidirectional self-attention in the encoder, causal self-attention in the decoder, and cross-attention connecting the decoder's queries to the encoder's keys and values.
</details>

<details><summary>2. In the worked example, why did cross-attention weights sum to 1 across all three encoder positions, for every decoder position?</summary>
Cross-attention has no causal restriction — every decoder position's query is compared against the entire, already-complete encoder output, with the softmax normalizing the weights over all of it.
</details>

<details><summary>3. What distinguishes cross-attention from self-attention, mechanically?</summary>
Cross-attention's queries come from one sequence (the decoder) while its keys and values come from a different, already-computed sequence (the encoder) — self-attention draws all three from the same sequence.
</details>

## Key terms

* **Cross-attention:** attention where queries come from one sequence and keys/values come from a separately computed sequence.
* **Encoder-decoder architecture:** a transformer combining a bidirectional encoder stack, a causal decoder stack, and cross-attention connecting them.
* **Sequence-to-sequence:** a task that transforms one complete input sequence into a different output sequence, such as translation.

## Related

[[Encoder-Only Architectures]] · [[Decoder-Only Architectures]] · [[Encoder-Decoder Architectures with Attention]] · [[Choosing an Architecture Family for a Task]]
