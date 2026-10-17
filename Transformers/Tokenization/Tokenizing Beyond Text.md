Nothing about attention requires its inputs to be words. All it needs is a sequence of vectors — so any data that can be chopped into a sequence of fixed-size pieces can be "tokenized" the same way text is, just with a different rule for cutting it up.

**You need:** [[Tensors and Shapes]], [[Byte Pair Encoding]].

## The question it answers

"How does a transformer consume data that was never made of words in the first place — an image, an audio clip?" By replacing the merge-based vocabulary of [[Byte Pair Encoding|text tokenization]] with a much simpler rule: cut the input into fixed-size, non-overlapping pieces, flatten each one into a vector, and treat that sequence of vectors exactly like a sequence of token embeddings.

## Intuition

A sentence is naturally a sequence of words. An image is naturally a grid, not a sequence — so the first step is deciding how to turn a grid into one. The standard trick, used by Vision Transformers, is to slice the image into a grid of small square **patches**, then flatten each patch into a single long vector, in some fixed left-to-right, top-to-bottom order. Each flattened patch now plays exactly the role a token embedding plays in text: one entry in a sequence that attention can look across. Audio gets the same treatment along a different axis — a waveform is chopped into fixed-length time windows instead of spatial patches.

## Definition and notation

```text
image of height H, width W, patch size P (dividing both evenly):
  number of patches = (H / P) × (W / P)
  each patch flattened to a vector of length P × P (× channels, for colour images)
```

Unlike [[Byte Pair Encoding|BPE]]'s learned, data-dependent merges, patchifying is a fixed, deterministic rule — no training happens at this step. The sequence of flattened patches is still just raw numbers; turning each one into a model-ready vector is the next step, covered in [[Token Embeddings and Embedding Scaling]].

## A worked example

An 8×8 grid of pixel values (numbered 0–63 in row-major order, for traceability), split into non-overlapping 4×4 patches:

```text
number of patches = (8/4) × (8/4) = 2 × 2 = 4
patch dimension    = 4 × 4 = 16

patch 0 (top-left):     [0,1,2,3, 8,9,10,11, 16,17,18,19, 24,25,26,27]
patch 1 (top-right):    [4,5,6,7, 12,13,14,15, 20,21,22,23, 28,29,30,31]
patch 2 (bottom-left):  [32,33,34,35, 40,41,42,43, 48,49,50,51, 56,57,58,59]
patch 3 (bottom-right): [36,37,38,39, 44,45,46,47, 52,53,54,55, 60,61,62,63]
```

Four 16-number vectors — exactly the same shape as a sequence of four token embeddings, ready for the same attention machinery that would process four words.

## Bench

```bench
id: patchify-grid
title: Cutting a grid into a token sequence
fallback: Split a small image grid into patches at a chosen patch size, and see the resulting patch count and each patch's flattened values.
```

**Try this**

1. Change the patch size and watch the patch count change accordingly.
2. Try a patch size that doesn't evenly divide the grid, and see what the edge patches look like.
3. Compare a small patch size (many short, fine-grained patches) against a large one (few, coarse patches).

**What you should notice:** the patch count formula is pure arithmetic on the grid and patch sizes — nothing about it depends on the image's actual content, unlike BPE's data-dependent vocabulary.

## Where it appears in AI

* **It is the entire input mechanism behind [[Vision Transformers]]**, covered in full later on this planet — this topic is only the "how do we cut it into pieces" half of that story.
* **It generalizes directly to other modalities**: audio as fixed-length time windows, video as space-time patches — anything choppable into fixed-size pieces becomes a token sequence this way.
* **[[Multimodal Transformers as an Architecture Pattern|combining modalities]]** relies on exactly this: once both text tokens and image patches are vectors in a sequence, they can sit in the same sequence together.

## Common pitfalls

* **Expecting patchifying to involve learning, like BPE does.** It's a fixed geometric rule chosen before training, not something fit to data.
* **Assuming patch size doesn't matter.** It directly sets both the sequence length (smaller patches mean more of them, more expensive attention) and how much spatial detail survives inside a single patch.
* **Forgetting patches still need positional information.** A flattened patch vector says nothing about *where* in the image it came from — that's handled separately, the same way token position is handled in [[Positional Information Beyond Sinusoids]].

## Quick check

<details><summary>1. What does patchifying have in common with, and differ from, BPE tokenization?</summary>
Both turn raw input into a sequence of fixed vocabulary-like pieces; patchifying uses a fixed geometric rule chosen in advance, while BPE learns its pieces from data.
</details>

<details><summary>2. In the worked example, why did the 8×8 grid produce exactly 4 patches?</summary>
Because (8 / 4) × (8 / 4) = 2 × 2 = 4, dividing both the height and width by the chosen patch size of 4.
</details>

<details><summary>3. What information does a flattened patch vector not contain on its own?</summary>
Its position in the original grid — that has to be supplied separately, the same role positional encoding plays for text tokens.
</details>

## Key terms

* **Patch:** a fixed-size, non-overlapping square region of an image, flattened into one vector.
* **Patchifying:** cutting an input into fixed-size pieces as a deterministic alternative to learned tokenization.
* **Modality:** a type of data (text, image, audio) that can be converted into a token sequence its own way.

## Related

[[Byte Pair Encoding]] · [[Vision Transformers]] · [[Multimodal Transformers as an Architecture Pattern]] · [[Token Embeddings and Embedding Scaling]]
