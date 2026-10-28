Vision, speech and language look like completely different fields from the outside — but underneath, the same handful of architectural ideas (convolution, recurrence, attention, embeddings) keep reappearing, each one adapted to whatever shape that modality's data happens to take.

**You need:** [[CNN Architectures: From LeNet to ResNet]] and [[Multi-Head Attention]].

## The question it answers

"Do vision, speech and language each need their own, entirely separate set of deep learning ideas?" Not really — the same core building blocks recur across all of them; what differs is how the raw data gets turned into the grid, sequence, or set of vectors those building blocks expect.

## Intuition: the same tools, a different-shaped material each time

A convolution doesn't care whether the grid it's sliding over represents pixel brightness or a spectrogram's time-and-frequency intensity — it just needs *some* grid. Attention doesn't care whether the sequence of vectors it's relating to each other represents words, audio frames, or image patches — it just needs a sequence of vectors to compare. Adapting an idea to a new modality is mostly about finding the right way to turn that modality's raw data into the shape (grid, sequence, or set) the architecture already knows how to use.

## Definitions

```text
modality         raw data              typical "shape" used by the model
vision            pixels                a 2D grid (an image, read by convolutions)
speech/audio      waveform              a spectrogram (2D: time × frequency), or a 1D sequence of audio frames
text/language     characters or words   a 1D sequence of token embeddings

once data is a sequence of vectors, attention applies identically regardless of what those
vectors originally represented
```

## A worked example

The exact same architectural idea, applied to three modalities:

```text
convolution:
  vision:   slides a small 2D filter over an image's pixel grid
  audio:    slides a small 2D filter over a spectrogram's time-frequency grid
            (or a 1D filter directly over the raw waveform)

attention:
  vision:   relates patches of an image to each other (as in vision transformers)
  audio:    relates frames of an audio sequence to each other
  language: relates tokens (words or subwords) of a sentence to each other
            — the attention computation itself is identical in all three cases,
            only what the vectors represent differs
```

The attention mechanism's formula doesn't change at all between these three uses — only the meaning of what's being compared does.

## Bench

```bench
id: modality-map
title: The same idea, a different modality each time
fallback: Pick an architectural idea (convolution, attention) and a modality (vision, audio, language) and see how that idea is adapted — what raw data becomes what shape before the idea applies.
```

**Try this**

1. Compare how convolution is applied to vision versus audio and note what changed (the data's shape) and what didn't (the operation itself).
2. Compare attention across all three modalities and notice the formula never changes.
3. Think about what a "multimodal" model (handling two of these at once) needs to bridge between them.

**What you should notice:** adapting a deep learning idea to a new modality is almost entirely about finding the right representation (grid? sequence? what resolution?) — the architectural idea itself usually transfers with little or no change.

## Where it appears in AI

* **Vision transformers** apply attention (originally developed for language) to images, by splitting an image into patches and treating each patch like a "word" in a sequence.
* **Speech recognition and audio generation models** borrow heavily from both convolutional and sequence-modelling ideas developed first for vision and language respectively.
* **Multimodal models** — handling images and text together, as in CLIP-style architectures (see [[Contrastive Learning]]) — are an increasingly central direction, and are the natural bridge toward the Transformers, Generative AI and LLMs subjects ahead.

## Common pitfalls

* **Assuming each modality needs a fundamentally different theory.** Most of deep learning's core ideas (convolution, attention, embeddings, normalization) are modality-agnostic; what's modality-specific is usually just the data representation.
* **Underestimating how much representation choice matters.** Whether audio is represented as a raw waveform or a spectrogram, for instance, can matter as much as the architecture applied afterward.
* **Treating "multimodal" as simply running two separate models side by side.** Genuinely combining modalities (as in contrastive vision-language training) usually requires the two modalities' representations to be brought into a shared space, not just processed independently.

## Quick check

<details><summary>1. What is the key difference in how convolution is applied to vision versus audio?</summary>
Mostly just the shape of the grid the filter slides over — pixels for vision, a spectrogram's time-frequency grid (or the raw waveform) for audio; the convolution operation itself is unchanged.
</details>

<details><summary>2. Does attention's formula need to change depending on whether it's relating image patches, audio frames, or text tokens?</summary>
No — the computation is identical in all three cases; only what the underlying vectors represent differs.
</details>

<details><summary>3. What does a genuinely multimodal model (handling two modalities together) typically need, beyond two separate single-modality models?</summary>
A way of bringing both modalities' representations into a shared space, so they can be meaningfully related to each other, rather than simply processing each modality independently.
</details>

## Key terms

* **Modality:** a kind of data (vision, audio, language, and others), each with its own typical raw representation.
* **Multimodal model:** a model that combines information from more than one modality.
* **Vision transformer:** an architecture applying attention to image patches, adapting an idea originally developed for language.

## Related

[[CNN Architectures: From LeNet to ResNet]] · [[Multi-Head Attention]] · [[Contrastive Learning]] · [[Capstone: Designing a Deep Learning System End to End]]
