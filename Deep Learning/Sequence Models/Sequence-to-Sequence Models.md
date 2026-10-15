A **sequence-to-sequence (seq2seq)** model turns one sequence into another, possibly of a different length — a sentence in one language into a sentence in another, say. An **encoder** RNN reads the whole input and compresses it into a single vector; a **decoder** RNN starts from that vector and generates the output one step at a time, each step feeding its own previous output back in as the next input.

**You need:** [[Bidirectional and Stacked RNNs]] and [[Recurrent Neural Networks]].

## The question it answers

"Translation input and output sentences are rarely the same length — how can one RNN handle that mismatch?" Use two RNNs instead of one: an encoder that reads the whole input and distills it into a fixed-size summary, and a decoder that generates the output from that summary, for as many steps as it needs.

## Intuition: read it all, then speak

Imagine translating a sentence by first reading the whole thing, forming a complete understanding of what it means, and only then starting to speak the translation — one word at a time, each word informed by what you understood plus everything you've said in the translation so far. The encoder plays "read it all and understand"; the decoder plays "now speak it, one word at a time."

## Definitions

```text
encoder:   read x₁, …, x_n, keep only the final hidden state h_enc  (the "context vector")
decoder:   h_dec₀ = h_enc;  at each step, feed the previous output back in as the next input
           h_dec_t = RNN(prev_output, h_dec_(t-1))
           output_t = (some function of) h_dec_t
```

During training, the decoder is usually fed the *true* previous output instead of its own guess (**teacher forcing**), which trains faster and more stably; at inference, with no true answer available, it must feed back whatever it actually generated.

## A worked example

Encoding `(1, 0, 1)` with the encoder weights from [[Recurrent Neural Networks|the RNN worked example]] produces a context vector `h_enc = 0.7565`. The decoder (different weights: `Wₓ = 0.6`, `Wₕ = 0.7`, `b = 0.05`) starts from that context and generates three steps, feeding each output back in:

```text
h_dec₀ = 0.7565 (the encoder's final hidden state)

step 1: input = 0 (start token)        h₁ = 0.5224    output₁ = sigmoid(h₁) = 0.6277
step 2: input = output₁ = 0.6277       h₂ = 0.6597    output₂ = sigmoid(h₂) = 0.6592
step 3: input = output₂ = 0.6592       h₃ = 0.7198    output₃ = sigmoid(h₃) = 0.6726
```

Every decoder step depends on the whole input sentence only indirectly, through the one number `h_enc = 0.7565` passed in at the very start — everything else about the input has already been compressed away by the time decoding begins.

## Bench

```bench
id: seq2seq-decode
title: Encode once, decode step by step
fallback: An editable input sequence feeds an encoder, producing one context value. Step the decoder forward, watching each output get fed back in as the next input.
```

**Try this**

1. Change the input sequence and watch how much the context vector (and every later decoder output) shifts.
2. Step through decoding and watch each output feed into the next step as input.
3. Compare decoder outputs when starting from two very different context values.

**What you should notice:** once decoding starts, the decoder never looks back at the original input sequence directly — the entire input is represented only through the single starting context value, a real bottleneck that [[Attention and the Road to Transformers|attention]] was invented to remove.

## Where it appears in AI

* **Machine translation** (Sutskever, Vinyals and Le's 2014 encoder-decoder model) was the breakthrough application that popularised this architecture.
* **Any "input sequence in, output sequence out" task** — summarisation, speech-to-text, chatbot responses — fits this template, whatever the specific encoder and decoder architecture.
* **The single-vector bottleneck** this architecture has, where the entire input is squeezed through one fixed-size context vector, is exactly the limitation [[Encoder-Decoder Architectures with Attention|attention-augmented decoders]] were built to fix.

## Common pitfalls

* **Forgetting the context vector is a bottleneck.** Squeezing an arbitrarily long input into one fixed-size vector loses information, especially for long sequences.
* **Confusing teacher forcing (training) with free-running generation (inference).** A decoder trained only with teacher forcing can behave very differently once it must rely on its own, possibly imperfect, previous outputs.
* **Expecting the decoder to "remember" the raw input.** It only has access to the input through the encoder's final hidden state — nothing more.

## Quick check

<details><summary>1. What single piece of information does the decoder receive about the entire input sequence?</summary>
The encoder's final hidden state (the context vector) — a single fixed-size summary, nothing more detailed.
</details>

<details><summary>2. What is teacher forcing?</summary>
Feeding the decoder the true previous output (rather than its own generated output) during training, for faster and more stable learning.
</details>

<details><summary>3. Why might a seq2seq model without attention struggle on long input sentences?</summary>
The entire sentence must be compressed into one fixed-size context vector, which can only hold so much information regardless of how long the input actually is.
</details>

## Key terms

* **Encoder:** the RNN that reads the input sequence and produces a context vector.
* **Decoder:** the RNN that generates the output sequence, starting from the context vector.
* **Teacher forcing:** feeding the true previous output during training instead of the model's own generated output.

## Related

[[Bidirectional and Stacked RNNs]] · [[Recurrent Neural Networks]] · [[Encoder-Decoder Architectures with Attention]] · [[Why Attention Replaced Recurrence]]
