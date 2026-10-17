[[Multimodal Transformers as an Architecture Pattern|a multimodal transformer]] can take text and image patches as input together. This note covers going one step further: generating *both* text and image content from one model, one shared vocabulary, and one next-token prediction step — with no separate "text head" and "image head" at all.

**You need:** [[Multimodal Transformers as an Architecture Pattern]], [[Byte Pair Encoding]].

## The question it answers

"How can one model generate both text and images using the exact same next-token mechanism?" The trick is making images speak the same discrete language as text. A **codebook** of a fixed number of representative vectors lets any continuous image patch be **quantized** — replaced by the index of whichever codebook entry it's closest to — turning a patch into a discrete token exactly like a word. Once both text tokens and image tokens are just integers in one combined, **unified vocabulary**, a single autoregressive model can predict the next token of either kind, one at a time, with no architectural distinction between them.

## Intuition

Imagine a language that has words for "a", "photo", "of" — and also exactly four extra words, each standing for one specific swatch of visual texture, with no way to express anything in between. Any photograph, chopped into patches, gets described (lossily) using only those four visual words, slotted into sentences right alongside ordinary ones. Once that's true, "predict the next word" and "predict the next patch" are literally the same operation — there's no longer a meaningful line between them.

## Definition and notation

```text
codebook: K fixed vectors c₁, ..., c_K
quantize(patch) = argmin_k ‖patch − cₖ‖²            (nearest codebook entry)

unified vocabulary:  text tokens (ids 0 .. |text vocab|−1)
                      + image codes (ids |text vocab| .. |text vocab|+K−1)
→ one softmax over the combined vocabulary predicts the next token, of either kind
```

## A worked example

A 4-word text vocabulary `{a, photo, of, <img>}` and a 4-entry image codebook, giving a combined vocabulary of size 8. Three different image patches, quantized to their nearest codebook entries:

```text
patch (0.9, 0.1)    →  code 0   (nearest to codebook entry [1, 0])
patch (0.45, 0.52)  →  code 2   (nearest to codebook entry [0.5, 0.5])
patch (-0.8, 0.1)   →  code 3   (nearest to codebook entry [-1, 0])
```

A single unified sequence mixing text and a quantized image patch, using the combined ids directly:

```text
"a photo of <img> code2"   — ids [0, 1, 2, 3, 6]
```

Predicting the next element of this sequence is exactly one softmax over all 8 combined vocabulary entries — the model has no way of "knowing" which of the 8 are text and which are image codes except by what it learned about how they tend to follow each other, because the mechanism itself treats every one of them identically.

## Bench

```bench
id: vq-unified-vocab
title: One vocabulary, text and image tokens together
fallback: Pick an image patch and watch it quantize to a discrete code, placed directly into a shared text-and-image vocabulary sequence.
```

**Try this**

1. Try each of the three patches and check which codebook entry each quantizes to.
2. Notice the unified sequence places a quantized image code directly among the text tokens.
3. Consider: nothing in the sequence's representation marks which tokens came from text versus images.

**What you should notice:** quantization is a lossy compression step — many different continuous patches would all map to the same discrete code — which is the price paid for letting images join the same vocabulary, and the same generation mechanism, as text.

## Where it appears in AI

* **Models like Parti and early versions of DALL·E generate images by predicting a sequence of discrete image-codebook tokens**, using exactly the same autoregressive, next-token machinery as a language model — the codebook (often trained via a VQ-VAE) is what makes that possible.
* **The codebook size is a real design trade-off**: more entries capture visual detail more faithfully, but enlarge the vocabulary (and the prediction problem) correspondingly.
* **[[Any-to-Any Generative Models|any-to-any models]] generalize this idea past two modalities**, giving every supported modality its own quantization scheme into one shared vocabulary (or, alternatively, one shared continuous latent space).

## Common pitfalls

* **Assuming quantization is lossless.** Collapsing a continuous patch to one of a small, fixed number of codebook entries necessarily discards information — the whole point is compression, at the cost of exact fidelity.
* **Thinking the model "knows" which tokens are visual and which are textual.** Nothing in the unified representation marks this distinction explicitly; any such distinction the model exploits is learned from patterns in the data, not built into the mechanism.
* **Expecting arbitrary resolution from a small codebook.** A codebook with very few entries (as in this toy example) can only represent a small number of distinct visual "words" — real systems use codebooks with thousands of entries for this reason.

## Quick check

<details><summary>1. What does quantizing an image patch actually do?</summary>
It replaces a continuous patch vector with the index of whichever fixed codebook entry is closest to it, turning the patch into a discrete token.
</details>

<details><summary>2. In the worked example, why can a single softmax predict either a text token or an image code?</summary>
Because both kinds of token are simply integers in one combined vocabulary — the prediction mechanism has no separate path for either kind, it's one softmax over the whole combined set.
</details>

<details><summary>3. What's lost by representing images as discrete codebook tokens rather than continuous values?</summary>
Fidelity — many different continuous patches can map to the same discrete code, so some visual detail is necessarily discarded in the quantization step.
</details>

## Key terms

* **Codebook:** a fixed set of representative vectors used to quantize continuous inputs into discrete tokens.
* **Quantization:** replacing a continuous value with the nearest entry from a fixed codebook.
* **Unified vocabulary:** a single combined set of token ids spanning more than one modality, letting one model generate across all of them with one mechanism.

## Related

[[Multimodal Transformers as an Architecture Pattern]] · [[Byte Pair Encoding]] · [[Any-to-Any Generative Models]]
