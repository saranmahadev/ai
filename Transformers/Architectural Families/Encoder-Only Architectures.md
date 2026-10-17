[[Attention Masks: Padding and Causal Masking|The masking topic]] introduced two patterns: padding masks and causal masks. An encoder-only transformer uses only the first — every real token attends freely to every other real token, in both directions. That single choice is what makes BERT-style models good at *understanding* a complete piece of text rather than generating one token at a time.

**You need:** [[Attention Masks: Padding and Causal Masking]], [[Assembling One Transformer Block]].

## The question it answers

"What does a transformer look like when it's allowed to use the entire input at once, with nothing hidden from any position?" An encoder-only architecture: no causal mask anywhere, only padding masking where needed — every position can attend to every other position, before *and* after it in the sequence. This bidirectional view is exactly what makes these models well suited to a task like filling in a masked word, where the surrounding context on both sides is genuinely useful information.

## Intuition

Reading a sentence with one word blacked out, a person naturally uses *both* the words before the gap and the words after it to guess what's missing — "The ___ sat on the mat" is far easier to fill in with "the mat" visible than without it. An encoder-only transformer is built around exactly that assumption: since the whole input is available at once (there's no left-to-right generation happening), there's no reason to hide the right-hand context from any position. Every attention computation in the stack sees the complete sequence.

## Definition and notation

```text
encoder-only attention mask: padding mask only — no causal restriction
  allowed(i, j) = (j is not padding)
```

Training typically uses **masked language modeling (MLM)**: replace some tokens with a special `[MASK]` symbol, and train the model to predict the original token at each masked position, using the bidirectional context around it.

## A worked example

The sentence `The cat sat on the mat` (6 tokens), with the third token, `sat`, masked. Compare how much context is available to predict it under two schemes:

```text
encoder-only (bidirectional), mask row for position 2:  [1, 1, 1, 1, 1, 1]
  → sees all 5 other tokens: "The", "cat", "on", "the", "mat"

causal (as in a decoder-only model), mask row for position 2: [1, 1, 1, 0, 0, 0]
  → sees only 2 tokens: "The", "cat"
```

An encoder-only model predicting the masked word has access to the entire sentence except the masked position itself — including "on the mat," which strongly suggests a word like "sat." A causally-masked model at the same position could only ever see "The cat," with no access to what follows.

## Bench

```bench
id: encoder-mask
title: How much context is available to fill a gap
fallback: Mask one token in a short sentence and compare how many surrounding tokens are visible to predict it, bidirectionally versus causally.
```

**Try this**

1. Move the masked position toward the end of the sentence and watch the causal case's available context shrink to almost nothing.
2. Compare the total number of visible tokens under each scheme, for the same masked position.
3. Consider what the causal case would need to do differently to ever use the right-hand context at all.

**What you should notice:** the gap between the two schemes grows as the masked position moves later in the sequence — bidirectional access to context is most valuable exactly where a causal model is most starved for it.

## Where it appears in AI

* **BERT and its many descendants are encoder-only architectures**, trained with masked language modeling — a direct, practical application of the bidirectional masking shown here.
* **It is the natural fit for understanding tasks**: classification, extracting a span of text, or filling in a gap — anything where the complete input is available up front and the goal is to understand it, not generate new text one token at a time.
* **[[Decoder-Only Architectures|the next topic]] makes the opposite choice**, and the reason it must is directly visible in this topic's worked example: generating text one token at a time means the "future" tokens genuinely don't exist yet to attend to.

## Common pitfalls

* **Assuming encoder-only models can generate text left to right.** Nothing stops information from flowing backward through the sequence, which is exactly what makes naive autoregressive generation incoherent with this architecture.
* **Forgetting padding masking still applies.** "No causal mask" doesn't mean "no masking at all" — padding positions are still excluded, exactly as in [[Attention Masks: Padding and Causal Masking]].
* **Assuming MLM is the only possible training objective for this architecture.** It's the most common one, but the bidirectional *architecture* itself is a separate choice from any particular training objective layered on top of it.

## Quick check

<details><summary>1. What single masking choice defines an encoder-only architecture?</summary>
No causal mask — only padding masking is applied, so every real token can attend to every other real token in both directions.
</details>

<details><summary>2. In the worked example, why did the causal case have so much less context available than the bidirectional case?</summary>
A causal mask only allows a position to attend to itself and earlier positions, so at position 2 it could only see positions 0 and 1 — the bidirectional case had no such restriction and could see all 5 other positions.
</details>

<details><summary>3. What training objective is commonly paired with encoder-only architectures, and why does it need bidirectional attention?</summary>
Masked language modeling — predicting a masked-out token using the full surrounding context, which requires seeing tokens on both sides of the gap, not just the ones before it.
</details>

## Key terms

* **Encoder-only:** a transformer architecture using only padding masking, with no causal restriction — every position attends to every other.
* **Bidirectional attention:** attention that allows looking both backward and forward in a sequence, as opposed to causal (backward-only) attention.
* **Masked language modeling (MLM):** a training objective that predicts a masked-out token from its surrounding bidirectional context.

## Related

[[Attention Masks: Padding and Causal Masking]] · [[Decoder-Only Architectures]] · [[Choosing an Architecture Family for a Task]]
