[[Unified Multimodal Generation|a unified vocabulary]] lets text and image tokens share one generation mechanism. This note covers a more general version of the same idea: encoding *every* supported modality into one shared embedding space, so that generating "any modality out" from "any modality in" is just a matter of which encoder and decoder you plug into the ends.

**You need:** [[Unified Multimodal Generation]].

## The question it answers

"How can one system take in any of several modalities and generate any other, through a single interface?" An **any-to-any model** trains a separate encoder for each supported modality (text, image, audio, ...), all projecting into the *same* shared embedding space — so that "cat" the word, a photo of a cat, and the sound of a cat meowing all land near each other in that space, regardless of which modality they came from. Generation is then: encode whatever input you have into that shared space, then decode the resulting point using whichever modality-specific decoder you want the output in.

## Intuition

Imagine a translator fluent in many languages who doesn't translate directly between any two of them, but instead converts everything into one private internal "meaning," and converts that meaning back out into whichever language is needed. Adding a new output language only means building one new decoder from that shared meaning-space — not a new translation rule for every existing language it might need to connect to. An any-to-any generative model does the same thing with modalities instead of languages: encode into one shared space, decode out to any target.

## Definition and notation

```text
one shared embedding space, dimension d
encoder_text(x), encoder_image(x), encoder_audio(x), ...  →  all map into that same d-dim space

similarity(a, b) = cosine(a, b) = (a · b) / (‖a‖ ‖b‖)

decoding to modality M: find (or generate from) the point in M's own
  representation whose encoding is closest to the shared-space query
```

## A worked example

Four small embeddings in a shared 3-dimensional space, representing the same concept ("cat") and one different concept ("dog") across three different modalities:

```text
image: cat    (0.90, 0.30, 0.10)
text: cat     (0.85, 0.35, 0.05)
audio: meow   (0.88, 0.28, 0.15)
text: dog     (0.10, 0.90, 0.20)
```

Measuring cosine similarity from "image: cat" to each of the others:

```text
cos(image:cat, text:cat)    = 0.9964   ← very close
cos(image:cat, audio:meow)  = 0.9983   ← very close
cos(image:cat, text:dog)    = 0.4295   ← far less similar
```

Despite coming from three completely different modalities, "image: cat," "text: cat," and "audio: meow" all sit nearly on top of each other in the shared space — while "text: dog," a different concept even in the same modality as one of the matches, sits much further away. An any-to-any system exploits exactly this: given "image: cat" as input, decoding to text finds "cat" (not "dog") as the closest match, and decoding to audio finds "meow," purely because of where each one sits in the shared space.

## Bench

```bench
id: any-to-any-shared-space
title: One shared space, any modality in, any modality out
fallback: Pick an input concept and see which other modality's embeddings sit closest to it in a shared embedding space.
```

**Try this**

1. Start from "image: cat" and check which other-modality concept is closest.
2. Switch to "text: dog" and see how little it resembles any of the cat-related embeddings.
3. Notice modality doesn't determine closeness — concept does.

**What you should notice:** closeness in the shared space tracks *meaning*, not modality — two embeddings of the same concept in different modalities sit closer together than two embeddings of different concepts in the same modality.

## Where it appears in AI

* **Models like CLIP build exactly this kind of shared image-text space** (though only for two modalities and for *matching*, not generation) — any-to-any generative systems extend the same idea to more modalities and add decoders that can actually produce content in each one.
* **Adding a new modality to an any-to-any system mainly means training one new encoder and one new decoder** into and out of the existing shared space, rather than redesigning the whole system.
* **[[Unified Multimodal Generation|the discrete codebook approach]] and this shared-embedding approach are two different solutions to a similar problem** — one makes every modality speak through a shared discrete vocabulary, the other through a shared continuous space.

## Common pitfalls

* **Assuming a shared embedding space is automatically well-aligned across all modalities.** It only becomes well-aligned through training on data that links modalities together (a captioned image, for instance) — nothing about having "one space" guarantees meaningful alignment by itself.
* **Confusing cross-modal similarity with cross-modal translation quality.** Being close in the shared space is necessary for finding the right output, but a decoder still has to turn that point into a genuinely good output in the target modality.
* **Forgetting new modalities need a trained encoder and decoder, not just a label.** The shared space doesn't automatically know how to represent a modality it's never seen trained examples of.

## Quick check

<details><summary>1. What is the shared embedding space in an any-to-any model actually shared across?</summary>
Every supported modality's encoder maps into the same embedding space, so representations of the same concept from different modalities (e.g., an image of a cat and the word "cat") land near each other regardless of modality.
</details>

<details><summary>2. In the worked example, why was "image: cat" much closer to "audio: meow" than to "text: dog"?</summary>
Because closeness in the shared space tracks concept, not modality or input type — "image: cat" and "audio: meow" represent the same underlying concept, while "text: dog" represents a different one even though it's in the same modality as another embedding.
</details>

<details><summary>3. What does adding support for a new modality require in an any-to-any system?</summary>
Training a new encoder (to map that modality into the shared space) and a new decoder (to generate output in that modality from a point in the shared space) — not redesigning the whole system from scratch.
</details>

## Key terms

* **Any-to-any model:** a system that can take input from any supported modality and generate output in any other, through one shared representation.
* **Shared embedding space:** a common representation that different modalities' encoders all map into, so semantically related content lands close together regardless of modality.
* **Cosine similarity:** a measure of how closely two vectors point in the same direction, used to compare embeddings across modalities.

## Related

[[Unified Multimodal Generation]] · [[Multimodal Transformers as an Architecture Pattern]] · [[Latent Space Interpolation and Manipulation]]
