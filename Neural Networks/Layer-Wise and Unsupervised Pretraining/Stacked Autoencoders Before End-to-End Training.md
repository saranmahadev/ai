[[Deep Belief Networks|The previous topic]] stacked RBMs, each trained by contrastive divergence. The exact same greedy, one-frozen-layer-at-a-time idea works with a different building block: an [[Autoencoders|autoencoder]], trained by ordinary backpropagation on its own reconstruction error instead of contrastive divergence. This was the second major route into pretraining deep networks before end-to-end training of very deep nets was standard practice.

**You need:** [[Autoencoders]], [[Deep Belief Networks]].

## The question it answers

"Does greedy, layer-wise pretraining require energy-based models like RBMs specifically, or does the same idea work with any unsupervised building block?" It works with any unsupervised building block that compresses and reconstructs its input — an autoencoder trained with ordinary gradient descent on reconstruction error does the same job as a greedily-trained RBM, with no sampling or energy function involved at all.

## Intuition

Train a small autoencoder to compress a pattern down to a bottleneck and reconstruct it well. Once it reconstructs well, throw away the decoder and keep only the encoder's output — the **code** — as a compressed description of the input. Now train a *second* autoencoder whose job is to compress and reconstruct *that code*, not the original data. Stack as many of these as you like, each one trained independently on the previous one's code, each one frozen once it's done.

## Definition and notation

```text
1. Train autoencoder₁ (encoder + decoder) on raw data v, minimizing reconstruction
   error ‖v − decoder(encoder(v))‖². Freeze the encoder.
2. Compute code₁ = encoder₁(v) for every data point — this is layer 2's "data".
3. Train autoencoder₂ on {code₁}, minimizing its own reconstruction error.
   Freeze its encoder.
4. Repeat for as many layers as wanted.
```

Unlike [[Deep Belief Networks]], there is no Gibbs sampling and no energy function anywhere in this process — every layer is trained by plain backpropagation on a plain squared-error loss, exactly as in [[Autoencoders]], just applied one layer at a time instead of end to end.

## A worked example

The same four patterns as the previous two topics, `[1,1,0,0], [1,0,1,0], [0,0,1,1], [0,1,0,1]`. Train a 4→3→4 autoencoder (bottleneck of 3) by gradient descent on reconstruction error:

```text
after training:  mean reconstruction error ≈ 0.0042   (very low — 3 units is enough to nearly rebuild 4)
```

Freeze its encoder and compute the 3-number code for pattern `v = [1, 1, 0, 0]`:

```text
code₁ = encoder₁(v) ≈ [0.020, 0.605, 0.978]
```

Train a second autoencoder, 3→2→3, on all four patterns' `code₁` vectors:

```text
after training:  mean reconstruction error ≈ 0.171   (higher — compressing 3 numbers into 2 loses more)
```

Pushing the same pattern's `code₁` through this second encoder:

```text
code₂ = encoder₂(code₁) ≈ [0.012, 0.634]
```

The second layer's reconstruction error is noticeably higher than the first's — compressing to 2 numbers from 3 is a tighter bottleneck than compressing to 3 from 4, and the training reveals exactly that trade-off without needing to be told it in advance.

## Bench

```bench
id: stacked-ae
title: Stack two autoencoders, one frozen layer at a time
fallback: Train a small autoencoder on raw data, freeze its encoder, then train a second autoencoder on the first one's codes, and watch the reconstruction error and a chosen pattern's code at each layer.
```

**Try this**

1. Train the first autoencoder and watch its reconstruction error fall.
2. Train the second autoencoder on the first one's codes and compare its final error.
3. Compare each pattern's two-layer code against its raw form.

**What you should notice:** the second layer's reconstruction error is consistently higher than the first's here, because it works with a smaller bottleneck on already-compressed input — a direct, measurable cost of stacking.

## Where it appears in AI

* **It is functionally the same pretraining idea as [[Deep Belief Networks]]**, built from backpropagation and reconstruction error instead of contrastive divergence and energy functions — proof that greedy layer-wise pretraining was never tied to RBMs specifically.
* **It is a direct ancestor of [[Autoencoders|the autoencoder]] as covered in [[Deep Learning]]** today, which is almost always trained end to end rather than stacked, for the same reason DBNs fell out of favour — see [[Choosing Classical vs Modern Approaches]].
* **The code-quality trade-off in the worked example (tighter bottleneck, higher error) is the same bias–variance-flavoured trade-off** that appears throughout [[Machine Learning]] wherever a model is forced to compress information.

## Common pitfalls

* **Assuming a stacked autoencoder needs an energy function.** It does not — ordinary backpropagation on reconstruction error, applied one layer at a time, is sufficient.
* **Expecting every layer's reconstruction error to be similar.** Each layer has a different bottleneck size relative to its input, so errors are not directly comparable across layers.
* **Treating the decoder as useful after pretraining.** Only the encoder is kept and stacked; this is also why the decoder only has to get the current layer's reconstruction right, not any earlier layer's.

## Quick check

<details><summary>1. What is kept from each trained autoencoder when stacking, and what is discarded?</summary>
The encoder is kept (to produce the next layer's input); the decoder is discarded once that layer's training is finished.
</details>

<details><summary>2. How does a stacked autoencoder's training signal differ from a deep belief network's?</summary>
It uses ordinary backpropagation on a reconstruction-error loss; a DBN uses contrastive divergence on an energy function, with no backpropagation in the pretraining stage.
</details>

<details><summary>3. In the worked example, why was the second layer's reconstruction error higher than the first's?</summary>
It had to compress its 3-number input down to only 2 numbers, a tighter bottleneck relative to its input than the first layer's 4-to-3 compression.
</details>

## Key terms

* **Code:** the compressed, encoder-only output of a trained autoencoder, used as the next layer's input.
* **Bottleneck:** the smallest layer of an autoencoder, forcing it to compress rather than copy its input.
* **Reconstruction error:** the squared difference between an autoencoder's input and its decoded output, minimized during training.

## Related

[[Deep Belief Networks]] · [[Autoencoders]] · [[Contrastive Divergence]]
