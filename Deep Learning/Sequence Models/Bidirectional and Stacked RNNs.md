A plain RNN reading left to right only ever knows the *past* at any given position — it has no idea what comes next. **Bidirectional RNNs** fix that by running a second RNN in reverse and combining both directions' hidden states. **Stacking** RNN layers, separately, adds depth the same way stacking dense layers does: one layer's whole output sequence becomes the next layer's input sequence.

**You need:** [[Gated Recurrent Units]] and [[Recurrent Neural Networks]].

## The question it answers

"For tasks where the whole sequence is available up front — not streaming live — why limit a position's representation to only what came before it?" It needn't be limited at all: run one RNN forward, another backward, and give each position the combined output of both.

## Intuition: reading twice, once each direction

To understand the word "bank" in "I sat by the river bank," you need what comes *after* "bank" ("river") as much as what came before. A bidirectional RNN reads the sentence twice — once left to right, once right to left — and at every position, concatenates what the forward pass knew (everything before) with what the backward pass knew (everything after). Stacking is a separate, orthogonal idea: take the first layer's full sequence of hidden states and feed that whole sequence, position by position, into a second RNN layer — exactly like adding another dense layer, just operating on a sequence instead of a single vector.

## Definitions

```text
bidirectional:   h_t = [h→_t , h←_t]      (forward and backward hidden states, concatenated)
stacked:         layer 2's input sequence = layer 1's output sequence, position by position
```

Bidirectional RNNs require the whole sequence up front (you cannot run the backward pass on words that haven't happened yet), so they are unsuitable for live, streaming generation — see [[Sequence-to-Sequence Models]] for how generation handles this instead.

## A worked example

The same tiny one-unit RNN (`Wₓ = 0.5`, `Wₕ = 0.8`, `b = 0.1`) reading `(1, 0, 0)` forward, and reading it in reverse for the backward pass:

```text
position          1        2        3
forward h→      0.5370   0.4851   0.4527
backward h←     0.6305   0.1778   0.0997
```

At position 3, the input itself was `0` and the forward hidden state (0.4527) reflects mostly earlier context — but the backward hidden state is small too (0.0997), since there's nothing *after* position 3 to inform it. At position 1, the backward hidden state (0.6305) is large, because reading backward from the end, this position is the *last* one processed and has absorbed everything in the sequence.

## Bench

```bench
id: birnn-stack
title: Reading a sequence forward, backward, and both
fallback: An editable short sequence. See the forward hidden states, the backward hidden states, and their concatenation at each position, and compare to what a forward-only RNN would have known.
```

**Try this**

1. Change the first input and watch how much it affects only the forward states (not the backward ones).
2. Change the last input and watch the opposite: it affects mostly the backward states.
3. Compare position 2's concatenated representation using only the forward half versus using both halves.

**What you should notice:** at every position, the forward state only ever reflects what came before it, and the backward state only ever reflects what came after it — concatenating them is literally the only way to give one position's representation both directions at once.

## Where it appears in AI

* **Named entity recognition, part-of-speech tagging, and other tasks over a whole, already-available sequence** commonly use bidirectional RNNs, since there's no "future" to be unfair to during inference.
* **Encoders in [[Encoder-Decoder Architectures with Attention|encoder-decoder architectures]]** are very often bidirectional, since the encoder sees the whole input sequence before any output is generated.
* **Stacking 2–3 recurrent layers** is common in practice; beyond that, the usual training difficulties of very deep networks (see [[Vanishing and Exploding Gradients]]) start to apply to the stack as well as to each individual layer's own depth in time.

## Common pitfalls

* **Using a bidirectional RNN for live generation.** It needs the whole sequence available before it can run the backward pass at all, so it cannot be used to generate text one token at a time as it's produced.
* **Forgetting stacking and bidirectionality are independent choices.** A network can be bidirectional, stacked, both, or neither — the two ideas combine freely.
* **Assuming more stacked layers always help.** Each added layer costs training time and risks the same vanishing-gradient and overfitting issues seen elsewhere in deep networks.

## Quick check

<details><summary>1. Why can't a bidirectional RNN be used for live, streaming text generation?</summary>
Its backward pass needs the entire sequence available in advance, including positions that, in live generation, haven't been produced yet.
</details>

<details><summary>2. What does a stacked RNN's second layer actually take as input?</summary>
The first layer's entire output sequence (one hidden state per position), fed in position by position, just as the first layer took the original input sequence.
</details>

<details><summary>3. In the worked example, why is the backward hidden state at position 3 so small?</summary>
There is nothing after position 3 in the sequence, so the backward pass has only just started there and has absorbed almost no context yet.
</details>

## Key terms

* **Bidirectional RNN:** two RNNs, one reading forward and one reading backward, with their hidden states combined at each position.
* **Stacked RNN:** multiple RNN layers, each one's output sequence feeding the next as its input sequence.
* **Concatenation:** joining the forward and backward hidden states into one combined vector per position.

## Related

[[Gated Recurrent Units]] · [[Recurrent Neural Networks]] · [[Sequence-to-Sequence Models]] · [[Encoder-Decoder Architectures with Attention]]
