[[Tokenizing Beyond Text|Patches became a token sequence]] several sections ago. This topic finishes the job: linearly project each patch into the model's width, prepend a special summary token, add positional information, and run the exact same transformer block machinery already built for text.

**You need:** [[Tokenizing Beyond Text]], [[Learned Positional Embeddings]], [[Assembling One Transformer Block]].

## The question it answers

"Once an image is a sequence of flattened patches, what turns that sequence into something a transformer can actually classify?" A Vision Transformer (ViT) does exactly what a text transformer does with token ids: project each patch into a `d_model`-wide vector (the patch's "embedding"), add positional information so the model knows where each patch sat in the image, and run the whole sequence through ordinary transformer blocks — no convolutions, no image-specific machinery anywhere in the stack.

## Intuition

A patch, once flattened, is just a long list of numbers — not yet in the shape the rest of the transformer expects. A single learned linear layer fixes that, the same role [[Token Embeddings and Embedding Scaling|a token embedding table]] plays for words, just computed by a projection instead of a lookup (since there's no fixed "vocabulary" of patches). One more addition makes classification possible: prepend a special, learned **`[CLS]` token** to the sequence, with no patch of its own — after attention lets it gather information from every patch, its final vector is used as the whole image's summary representation.

## Definition and notation

```text
1. patches = patchify(image, P)                          — from Tokenizing Beyond Text
2. patch_embeddings = W_proj · patch, for each patch       — a learned linear projection
3. sequence = [CLS_token, patch_embedding₁, …, patch_embeddingₙ]
4. sequence += positional_embeddings                       — one per position, CLS included
5. run the sequence through ordinary transformer blocks
6. classification uses the final layer's CLS token output only
```

Everything from step 5 onward is identical to a text transformer — the only genuinely image-specific parts are patchifying and the linear patch projection.

## A worked example

An 8×8 image, patchified into four 4×4 patches (16 numbers each, as in [[Tokenizing Beyond Text]]), projected into a 4-dimensional model width:

```text
4 patches, each projected to 4 dimensions:
  patch 1: [-0.261, 0.047, -0.077, -0.221]
  patch 2: [-0.316, 0.083, -0.143, -0.261]
  patch 3: [-0.700, 0.330, -0.605, -0.544]
  patch 4: [-0.755, 0.365, -0.671, -0.585]

sequence with a prepended CLS token: 5 positions total

after adding positional embeddings and running one self-attention sublayer,
the CLS token's output (the eventual classification signal):
  [-0.554, 0.254, 0.040, -0.178]
```

The CLS token started with no patch information of its own — its final vector is entirely built from attending to the four patch tokens, exactly the mechanism that lets it summarize the whole image for classification.

## Bench

```bench
id: vit-pipeline
title: From patches to a classification token
fallback: Patchify a small image, project the patches, prepend a CLS token, and watch its vector change as it attends over the patch sequence.
```

**Try this**

1. Change the image and watch the patch embeddings change accordingly.
2. Compare the CLS token's vector before and after the attention step.
3. Increase the patch count (smaller patch size) and see the sequence length grow.

**What you should notice:** nothing about steps 5–6 cares whether the sequence came from patches or from word tokens — the exact same attention, residual, and feed-forward machinery applies either way.

## Where it appears in AI

* **It is the standard architecture for applying transformers to image classification**, and the clearest demonstration that nothing about the transformer block itself is specific to language.
* **It directly reuses [[Assembling One Transformer Block|the full block]] built earlier in this subject** — a genuine example of the same machinery generalizing to a new modality with minimal new parts.
* **[[Multimodal Transformers as an Architecture Pattern|the next topic]] builds on exactly this**: once image patches are vectors in a sequence, nothing stops combining them with text tokens in a single sequence.

## Common pitfalls

* **Assuming a Vision Transformer needs any convolutional layers.** It doesn't — patchifying and a linear projection are the only departures from an ordinary text transformer's input pipeline.
* **Forgetting the CLS token has to be learned too.** It's an additional trainable parameter, not a fixed or hand-computed value — a parameter like any other embedding.
* **Expecting classification to use every patch token's final output.** Only the CLS token's final vector is typically used for the classification decision, even though every patch token still participates in attention throughout the stack.

## Quick check

<details><summary>1. What two steps are specific to images, and what's identical to a text transformer from there on?</summary>
Patchifying the image and linearly projecting each patch are image-specific; prepending a CLS token, adding positional embeddings, and running the transformer blocks are identical to a text transformer.
</details>

<details><summary>2. What does the CLS token's final-layer output represent, and how does it get there?</summary>
A summary of the whole image, built entirely through attention over the patch tokens — the CLS token starts with no patch information of its own.
</details>

<details><summary>3. Why doesn't the patch-projection step use a lookup table the way token embeddings do?</summary>
There's no fixed vocabulary of patches to look up — each patch is a unique vector of raw pixel values, so a learned linear projection, not a lookup, is used instead.
</details>

## Key terms

* **Patch embedding:** a learned linear projection turning a flattened image patch into a model-width vector.
* **[CLS] token:** a special, learned token prepended to a sequence, whose final output summarizes the whole input for classification.
* **Vision Transformer (ViT):** a transformer applied to image patches, using no convolutional layers.

## Related

[[Tokenizing Beyond Text]] · [[Learned Positional Embeddings]] · [[Assembling One Transformer Block]] · [[Multimodal Transformers as an Architecture Pattern]]
