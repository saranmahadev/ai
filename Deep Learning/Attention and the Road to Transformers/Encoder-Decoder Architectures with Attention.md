The plain [[Sequence-to-Sequence Models|seq2seq]] decoder sees the entire input sequence through exactly one fixed context vector, chosen once before decoding even starts. Adding **attention** lets the decoder instead look back at *every* encoder hidden state, fresh, at *every* decoding step — computing a new, step-specific context each time, weighted by relevance to whatever the decoder currently needs.

**You need:** [[Sequence-to-Sequence Models]] and [[Multi-Head Attention]].

## The question it answers

"A single fixed context vector is a serious bottleneck for long inputs — can the decoder instead consult the whole input, as needed, at every step?" Yes: score every encoder hidden state against the decoder's current state, turn those scores into weights, and let the decoder's context at this step be the weighted combination — different every step, instead of fixed once at the start.

## Intuition: looking back at your notes as you write, not just once before you start

Plain seq2seq is like reading a document once, writing down one summary, and then writing a translation using only that summary — never looking back at the original. Attention-augmented decoding is like keeping the whole document open on the desk, and at each word you write, glancing back at whichever parts of the document are currently most relevant — different parts for different words.

## Definitions

```text
at decoder step t, with decoder hidden state h_d:

score_i = h_d · h_enc_i                      (relevance of encoder step i, right now)
weights  = softmax(score₁, …, score_n)
context_t = Σᵢ weightᵢ · h_enc_i              (a fresh, step-specific context vector)
```

The decoder then uses `context_t` (often concatenated with its own hidden state) to produce this step's output — a different blend of the input for every single decoding step, instead of seq2seq's one fixed context used throughout.

## A worked example

Encoder hidden states from reading `(1, 0, 1)` (reusing [[Recurrent Neural Networks|the earlier RNN example]]): `h_enc = (0.5370, 0.4851, 0.7565)`. At a decoder step where the decoder's current hidden state is `h_d = 0.6`:

```text
scores = h_d · h_enc = (0.6×0.5370, 0.6×0.4851, 0.6×0.7565) = (0.3222, 0.2911, 0.4539)

weights = softmax(scores) = (0.3215, 0.3117, 0.3668)

context = 0.3215×0.5370 + 0.3117×0.4851 + 0.3668×0.7565 ≈ 0.6013
```

The third encoder step gets the most weight (0.3668) because its hidden state is most aligned with the decoder's current state — and at a *different* decoder step, with a different `h_d`, these weights (and the resulting context) would come out differently, something plain seq2seq's single fixed context could never provide.

## Bench

```bench
id: attn-decode
title: A fresh context at every decoding step
fallback: Three encoder hidden states and an adjustable decoder hidden state. See the attention scores, weights and the resulting context vector update as the decoder state changes.
```

**Try this**

1. Move the decoder hidden state slider and watch which encoder step gets the most attention weight shift.
2. Set the decoder hidden state to match one encoder step closely and watch that step dominate the weights.
3. Compare the resulting context to what a fixed, seq2seq-style single context (say, just the final encoder state) would have given instead.

**What you should notice:** the attention weights — and therefore the context — depend on the decoder's *current* state, not just on the encoder's output; the same encoder states produce a different context at every decoding step.

## Where it appears in AI

* **Bahdanau and Luong attention**, introduced not long after plain seq2seq, were the first widely-used versions of exactly this idea, dramatically improving translation quality on long sentences.
* **This per-step attention mechanism is the direct ancestor of the self-attention used throughout transformers** (see [[Multi-Head Attention]]) — the same scoring-and-weighting idea, generalised to attend within a sequence as well as across encoder and decoder.
* **Attention weights are often visualised directly** (as a grid of input versus output positions) to show, qualitatively, which input words a model attended to when producing each output word.

## Common pitfalls

* **Assuming attention replaces the encoder and decoder RNNs entirely.** In this architecture, attention is an addition to the RNN-based encoder-decoder, not (yet) a replacement for the recurrence itself — that step comes with [[Why Attention Replaced Recurrence]].
* **Confusing this per-step, cross-sequence attention with the self-attention inside a transformer block.** Both use the same scoring mechanism, but this version attends from the decoder *to* the encoder, not within one sequence.
* **Thinking the context vector is computed once and reused.** It is recomputed fresh at every single decoding step.

## Quick check

<details><summary>1. What is the key limitation of plain seq2seq that attention fixes here?</summary>
The decoder only ever sees the input through one fixed context vector, computed once; attention lets it look back at every encoder state, freshly, at every step.
</details>

<details><summary>2. In the worked example, why does the third encoder step get the highest attention weight?</summary>
Its hidden state (0.7565) has the highest dot product with the current decoder hidden state (0.6), making it the most relevant under this scoring rule.
</details>

<details><summary>3. Does the context vector stay the same across all decoding steps?</summary>
No — it is recomputed at every step, using the decoder's current hidden state at that step, so it can (and usually does) change from step to step.
</details>

## Key terms

* **Attention score:** a measure of relevance between a decoder state and an encoder state.
* **Context vector (attention-based):** the weighted combination of encoder states, recomputed at every decoding step.
* **Alignment:** which input positions a model attended to most strongly when producing a given output.

## Related

[[Sequence-to-Sequence Models]] · [[Multi-Head Attention]] · [[Why Attention Replaced Recurrence]] · [[Positional Encoding]]
