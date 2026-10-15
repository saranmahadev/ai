[[Attention as Dot Products|Attention]] computes a weighted average over a set of values — and an average has no idea what order its inputs came in. Shuffle the tokens of a sentence and plain attention, on its own, would compute exactly the same thing. **Positional encoding** fixes this by adding a position-dependent vector to each token's embedding before attention ever sees it.

**You need:** [[Multi-Head Attention]] and [[Attention as Dot Products]].

## The question it answers

"Word order obviously matters for meaning — how does an architecture built entirely from permutation-blind weighted averages know which word came first?" It doesn't, unless each token's representation is tagged with *where* it sits in the sequence before attention runs — which is exactly what positional encoding does.

## Intuition: writing a page number on every slip of paper

Imagine handing someone a stack of sentence fragments with no page numbers — they could reconstruct the content, but never the order. Positional encoding writes a "page number" onto every token's own vector, as a small added pattern that differs by position, so that any subsequent operation (like attention) can still tell which position produced which content, purely by looking at the vector itself.

## Definitions

```text
PE(pos, 2i)   = sin(pos / 10000^(2i/d))
PE(pos, 2i+1) = cos(pos / 10000^(2i/d))

token input to the model = token embedding + PE(position)
```

Different dimensions of the encoding oscillate at different frequencies — early dimensions change quickly from position to position, later dimensions change very slowly — so the *combination* across all dimensions gives every position a distinct, recoverable signature.

## A worked example

Positional encodings for a tiny 4-dimensional model at the first four positions:

```text
position 0:  ( 0.0000,  1.0000,  0.0000,  1.0000)
position 1:  ( 0.8415,  0.5403,  0.0100,  1.0000)
position 2:  ( 0.9093, -0.4161,  0.0200,  0.9998)
position 3:  ( 0.1411, -0.9900,  0.0300,  0.9996)
```

The first two dimensions (using the fastest frequency) swing widely between consecutive positions — compare position 0's `(0.0000, 1.0000)` to position 1's `(0.8415, 0.5403)`. The last two dimensions (a much slower frequency) barely move at all over these same four positions — `0.9996` to `1.0000`. Together, fast- and slow-changing dimensions give every position its own unique pattern, usable at both nearby and far-apart scales.

## Bench

```bench
id: position-wave
title: A page number written in sine waves
fallback: Pick a model dimension and a range of positions to see the sinusoidal positional encoding at each position, with fast-changing and slow-changing dimensions plotted separately.
```

**Try this**

1. Compare the fastest-changing dimension's values across the first ten positions to the slowest-changing dimension's values.
2. Pick two positions far apart and see how different their full encoding vectors are, even though some individual dimensions barely moved.
3. Pick two adjacent positions and compare the same thing.

**What you should notice:** no single dimension alone uniquely identifies a position over a long range, but the *combination* of fast and slow dimensions together does — exactly the way a combination of hour and minute hands tells you the time more precisely than either alone.

## Where it appears in AI

* **The original transformer architecture** used exactly this sinusoidal scheme; later architectures have introduced several alternatives (learned positional embeddings, relative position schemes) with different trade-offs.
* **Anywhere attention is used without an inherent sense of order** — not just text, but images split into patches, or any other set-like input that nonetheless has meaningful structure — needs some form of positional signal.
* **Positional information only matters because attention itself is permutation-blind** — a recurrent network (see [[Recurrent Neural Networks]]) doesn't need this, since its own step-by-step structure already encodes order.

## Common pitfalls

* **Assuming attention "knows" word order on its own.** Without positional encoding (or an equivalent), swapping two tokens' positions changes nothing about attention's output for a given token content.
* **Expecting a single dimension of the encoding to be independently meaningful.** The position signal lives in the *combination* across all dimensions, not any one of them alone.
* **Confusing positional encoding with the token embedding itself.** They are added together, but represent two entirely different kinds of information: what the token is, versus where it sits.

## Quick check

<details><summary>1. Why does plain attention need a separate positional signal at all?</summary>
Attention computes a weighted average over values, which has no built-in sense of input order — shuffling the inputs would otherwise produce the same result (for the same content).
</details>

<details><summary>2. In the worked example, why do the last two dimensions change so little across the first four positions?</summary>
They use a much slower oscillation frequency than the first two dimensions, designed to distinguish positions that are far apart rather than adjacent.
</details>

<details><summary>3. How is the positional signal combined with a token's own embedding?</summary>
By simple addition — the positional encoding vector is added directly to the token's embedding vector before any attention computation happens.
</details>

## Key terms

* **Positional encoding:** a position-dependent vector added to each token's embedding so order-sensitive information survives into attention.
* **Permutation-invariant:** unaffected by reordering the inputs — the property plain attention has without positional information.
* **Frequency (in positional encoding):** how quickly a given dimension's value changes from one position to the next.

## Related

[[Multi-Head Attention]] · [[Attention as Dot Products]] · [[Encoder-Decoder Architectures with Attention]] · [[Why Attention Replaced Recurrence]]
