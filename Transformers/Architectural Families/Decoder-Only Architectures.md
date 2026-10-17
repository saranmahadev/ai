[[Encoder-Only Architectures|The previous topic's]] bidirectional attention works because the whole input is available at once. Generating text one token at a time breaks that assumption completely: the tokens after "now" genuinely don't exist yet. A decoder-only architecture is built around that constraint from the ground up — causal masking, everywhere, always.

**You need:** [[Encoder-Only Architectures]].

## The question it answers

"What does a transformer look like when it has to generate its output one token at a time, each one depending only on what came before?" A decoder-only architecture: every attention computation in the stack uses a causal mask, so a position can never attend to anything later than itself. This isn't an arbitrary restriction — it's the only option that makes sense once the goal is producing the next token in a sequence that doesn't fully exist yet.

## Intuition

Imagine writing a sentence one word at a time, where each new word has to be chosen based only on the words already written — you can't peek ahead at a word you haven't written yet, because it doesn't exist until you write it. A decoder-only transformer is in exactly that position at every single token it generates: predict the next token using only the tokens generated (or given) so far, then append that new token to the sequence and repeat. This is called **autoregressive** generation — each new output feeds back in as part of the input for the next step.

## Definition and notation

```text
decoder-only attention mask: causal mask only
  allowed(i, j) = (j ≤ i)

generation, one step at a time:
  step t:  predict token at position t, using only positions 0 … t−1
  append the predicted token, now position t is "known" too
  step t+1: predict position t+1, using positions 0 … t
```

Every layer of a decoder-only transformer applies this same causal restriction — there is no point in the stack where a position can see ahead of itself.

## A worked example

Generating a 5-token sequence, tracking exactly how much context is visible at each generation step:

```text
step 1: predicting position 0 — context: {}               (0 tokens visible)
step 2: predicting position 1 — context: {0}               (1 token visible)
step 3: predicting position 2 — context: {0, 1}             (2 tokens visible)
step 4: predicting position 3 — context: {0, 1, 2}           (3 tokens visible)
step 5: predicting position 4 — context: {0, 1, 2, 3}         (4 tokens visible)
```

Compare this to [[Encoder-Only Architectures|the previous topic's]] worked example, where every position saw all 5 other tokens simultaneously, regardless of position. Here, the visible context grows by exactly one token at each step — never more, and crucially, never including anything "ahead" of the position currently being predicted.

## Bench

```bench
id: decoder-generate
title: Generating one token, with only what came before
fallback: Step through generating a sequence one token at a time, watching exactly which positions are visible to the model at each step.
```

**Try this**

1. Step through generation and watch the visible context grow by exactly one position each time.
2. Compare the final step's visible context to the encoder-only bench's full-sentence visibility.
3. Consider what would happen if a later position's information somehow leaked into an earlier prediction.

**What you should notice:** the causal mask isn't an arbitrary training-time restriction — it's the architecture correctly matching the actual information available at generation time, step by step.

## Where it appears in AI

* **GPT-style models are the canonical decoder-only architecture**, trained to predict the next token given everything before it — exactly the generation process traced in the worked example.
* **This is the architecture [[LLMs|most modern large language models]] are built on**, since their core capability — generating fluent, coherent text one token at a time — is precisely what causal masking makes consistent between training and actual use.
* **[[KV-Caching for Autoregressive Inference|KV-caching]], covered later on this planet**, exists specifically because decoder-only generation repeats the same growing-context computation at every single step — a real cost this architecture's generation process creates.

## Common pitfalls

* **Assuming a decoder-only model could use bidirectional attention if trained differently.** The mismatch between bidirectional training and strictly left-to-right generation would make training and actual use inconsistent — training would see context the model will never have at generation time.
* **Confusing "decoder-only" with "has no encoder, so it can't understand anything."** Decoder-only models still build up a rich internal understanding of the input — the causal restriction limits what they attend to, not what they're capable of representing.
* **Forgetting every layer applies the same causal mask.** It isn't just the final output step that's restricted — every attention computation in every layer, at every depth, respects the same causal boundary.

## Quick check

<details><summary>1. What masking choice defines a decoder-only architecture, and why is it necessary rather than arbitrary?</summary>
Causal masking everywhere — necessary because generation produces tokens one at a time, and later tokens genuinely don't exist yet when an earlier one is being predicted.
</details>

<details><summary>2. In the worked example, how does the visible context change from one generation step to the next?</summary>
It grows by exactly one token — predicting position t uses positions 0 through t−1, and once that token is generated, predicting position t+1 can use positions 0 through t.
</details>

<details><summary>3. What does "autoregressive" mean in this context?</summary>
Each newly generated token is appended to the sequence and becomes part of the input context for predicting the next one.
</details>

## Key terms

* **Autoregressive:** generating output one step at a time, where each new output becomes part of the input for the next step.
* **Causal masking:** restricting attention so a position can only see itself and earlier positions, never later ones.
* **Decoder-only:** a transformer architecture using causal masking throughout, suited to generating text one token at a time.

## Related

[[Encoder-Only Architectures]] · [[Encoder-Decoder Architectures as a Pattern]] · [[Choosing an Architecture Family for a Task]] · [[KV-Caching for Autoregressive Inference]]
