An **autoencoder** is a network trained to do something that sounds pointless — reproduce its own input — except it must pass the signal through a narrow **bottleneck** on the way. Forcing the data through a smaller space than it started in is what makes the trick useful: whatever the bottleneck keeps is, by necessity, a compressed representation of the input.

**You need:** [[The Multilayer Feedforward Network]] and [[Dimensionality Reduction in Practice]].

## The question it answers

"How can a network learn a useful, compressed representation of data with no labels at all?" Train it to reconstruct its own input through a bottleneck too small to pass the input through unchanged — whatever the network keeps in that bottleneck must be the most useful summary it could find.

## Intuition: packing for a trip with half the suitcase space

If you must describe a 4-item outfit using only 2 numbers, you're forced to find some compressed code that still lets someone reconstruct a reasonable approximation of the outfit — you can't just copy it over. An autoencoder's **encoder** does exactly this compression; its **decoder** does the reverse, expanding the small code back toward the original size; and training pushes both halves to cooperate so the round trip loses as little as possible.

## Definitions

```text
encoder:        z = f_enc(x)             (x is high-dimensional, z is a small "bottleneck" vector)
decoder:        x̂ = f_dec(z)             (reconstruction, same shape as x)

loss = ‖x − x̂‖²         (reconstruction error, no labels needed at all)
```

## A worked example

A 4-dimensional input `x = (1, 0, 1, 0)`, compressed to a 2-dimensional bottleneck and reconstructed:

```text
encoder:  z = (0.5x₁ + 0.5x₃,  0.5x₂ + 0.5x₄) = (1, 0)
decoder:  x̂ = (0.9z₁ + 0.1z₂, 0.1z₁ + 0.9z₂, 0.9z₁ + 0.1z₂, 0.1z₁ + 0.9z₂)
            = (0.9, 0.1, 0.9, 0.1)

reconstruction error (MSE) = ((1−0.9)² + (0−0.1)² + (1−0.9)² + (0−0.1)²) / 4 = 0.01
```

The reconstruction isn't perfect — the 2-number bottleneck couldn't carry everything — but it's close, and the bottleneck vector `(1, 0)` is itself a legitimate, compressed 2D stand-in for the original 4D input.

## Bench

```bench
id: autoencoder-bottleneck
title: Squeezing data through a bottleneck
fallback: A 4-dimensional input and an adjustable 2-dimensional bottleneck. See the compressed code and the reconstruction, and watch the reconstruction error change as the input or the encoder/decoder weights change.
```

**Try this**

1. Try an input the current encoder/decoder weights handle well, and one they handle poorly, and compare reconstruction error.
2. Shrink the bottleneck further (if the bench allows it) and watch reconstruction get worse on average.
3. Find an input that reconstructs almost perfectly, and think about why those particular inputs survive the bottleneck well.

**What you should notice:** reconstruction quality depends on how well a given input's structure matches what the encoder/decoder pair has learned (or, here, been hand-set) to compress — not every input compresses equally well through the same bottleneck.

## Where it appears in AI

* **Denoising and sparse autoencoders**, variants not covered in full detail here, add extra constraints (noise robustness, sparsity) to shape what the bottleneck learns to represent.
* **Variational autoencoders** (see [[Variational Autoencoders]]) extend this idea to generate new data, not just compress existing data.
* **Anomaly detection** (see [[Anomaly Detection]]) can reuse a trained autoencoder directly: inputs unlike anything seen during training tend to reconstruct unusually badly.

## Common pitfalls

* **Assuming a smaller bottleneck is always better (or always worse).** Too large a bottleneck can let the network "cheat" by nearly copying the input through without learning anything useful; too small loses real information.
* **Forgetting autoencoders need no labels at all.** The "label" for reconstruction is just the input itself — this is why they're a building block for [[Self-Supervised Learning]].
* **Confusing a plain autoencoder's bottleneck with a probability distribution.** A plain autoencoder's code is just a fixed vector; sampling new data from it the way a generative model would needs the extra machinery in [[Variational Autoencoders]].

## Quick check

<details><summary>1. Why must an autoencoder's bottleneck be smaller than its input, for the trick to be useful?</summary>
If the bottleneck could carry everything the input contains, the network would have no need to learn a genuinely compressed, useful representation — it could simply pass the input through.
</details>

<details><summary>2. What loss is an autoencoder typically trained to minimise?</summary>
Reconstruction error — the difference between the original input and the decoder's reconstruction of it.
</details>

<details><summary>3. Does training an autoencoder require labelled data?</summary>
No — the input itself serves as its own target, which is why autoencoders need no human-provided labels at all.
</details>

## Key terms

* **Bottleneck:** the smallest, most compressed layer in an autoencoder, between the encoder and decoder.
* **Reconstruction error:** the difference between an autoencoder's input and its reconstructed output.
* **Encoder / decoder:** the two halves of an autoencoder, compressing and then expanding the representation.

## Related

[[The Multilayer Feedforward Network]] · [[Dimensionality Reduction in Practice]] · [[Variational Autoencoders]] · [[Self-Supervised Learning]]
