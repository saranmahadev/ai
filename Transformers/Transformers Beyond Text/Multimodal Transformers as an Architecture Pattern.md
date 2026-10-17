[[Vision Transformers|Image patches]] and text tokens both end up as the exact same thing by the time attention sees them: a vector of width `d_model`. Once that's true, nothing stops putting both kinds of vectors in the *same* sequence and letting one attention computation mix freely across both.

**You need:** [[Vision Transformers]], [[Token Embeddings and Embedding Scaling]].

## The question it answers

"How does a transformer combine information from genuinely different kinds of input — text and images — in a single model?" By making every modality produce vectors of the same width, however each one gets there: a text token through the embedding-table lookup from [[Token Embeddings and Embedding Scaling]], an image patch through the linear projection from [[Vision Transformers]]. Concatenate both sets of vectors into one sequence, and ordinary self-attention does the rest — every position, text or image, can attend to every other position, with no architectural distinction between the two once they're in the sequence.

## Intuition

Attention doesn't actually know or care where a vector in its input sequence came from — it just computes queries, keys and values from whatever vectors it's handed and compares them. That's exactly what makes multimodal transformers possible with so little new machinery: get text and images into the same vector width through their own, separate front-ends, lay them out one after another as a single longer sequence, and the self-attention mechanism built for one modality turns out to require no changes at all to mix information across two.

## Definition and notation

```text
text_embeddings  = [embedding_table[id] for id in text_token_ids]       — d_model-wide
patch_embeddings = [W_proj · patch for patch in image_patches]          — d_model-wide

combined_sequence = text_embeddings ++ patch_embeddings
run the combined sequence through ordinary transformer blocks
```

Each modality keeps its own front-end (an embedding table for text, a linear projection for patches) — only the output width has to match for the sequences to be concatenated and processed together.

## A worked example

A combined sequence of 2 text tokens and 2 image patches, all projected to `d_model = 4`, run through one self-attention sublayer:

```text
combined sequence: [text₀, text₁, patch₀, patch₁]   (4 positions total)

text position 0's attention weights over all four positions:
  [0.2027, 0.2683, 0.2706, 0.2584]    (sums to 1.0000)

attention spent on the two image patches alone: 0.2706 + 0.2584 = 0.5290
```

A text token's attention spreads across *both* the other text token and both image patches, in a single computation — more than half its attention mass (52.9%) went to the image patches here, with no special mechanism needed to let that happen; it's the same self-attention formula used throughout this entire planet.

## Bench

```bench
id: multimodal-attention
title: One sequence, two modalities
fallback: Combine a few text tokens and image patches into one sequence and see how attention spreads across both modalities at once.
```

**Try this**

1. Compare how much of a text position's attention goes to text versus image positions.
2. Change the number of text tokens or image patches and watch the attention distribution shift.
3. Consider what would need to change if text and image embeddings had different widths.

**What you should notice:** the attention computation itself has no notion of "modality" at all — it only sees a sequence of same-width vectors, and whatever structure the sequence has (which vectors came from text, which from images) is entirely a property of how the sequence was built, not of attention itself.

## Where it appears in AI

* **It is the standard pattern behind models that jointly process text and images**, extending cleanly to audio, video, or any other modality with its own front-end producing `d_model`-wide vectors.
* **It requires no new attention mechanism at all** — every efficiency and architecture topic covered earlier on this planet (masking, positional schemes, KV-caching) applies to a multimodal sequence exactly as it would to a single-modality one.
* **It closes the loop this planet opened in [[Tokenizing Beyond Text]]**: once anything can become a token sequence, combining several different anythings into one sequence is a natural, almost free extension.

## Common pitfalls

* **Assuming multimodal transformers need a fundamentally different attention mechanism.** They don't — the entire trick is getting every modality into the same vector width before attention ever runs.
* **Forgetting positional information needs care across modalities.** A position in the text portion and a position in the image portion aren't comparable the same way two text positions are — real multimodal models often use modality-aware positional schemes.
* **Expecting equal attention split across modalities by default.** Nothing enforces a particular split — how much a position attends to each modality is entirely learned, as the worked example's roughly-even-but-not-exact split shows.

## Quick check

<details><summary>1. What has to be true of text and image embeddings before they can be combined into one sequence?</summary>
They have to be the same width (d_model) — each modality can use its own front-end to get there, but the output dimension has to match for concatenation to make sense.
</details>

<details><summary>2. In the worked example, what fraction of the text token's attention went to the image patches, and what does that demonstrate?</summary>
About 53% — demonstrating that a single attention computation genuinely mixes information across modalities, with no special cross-modal mechanism required beyond ordinary self-attention.
</details>

<details><summary>3. What, if anything, does the attention computation itself need to know about which positions are text and which are images?</summary>
Nothing — attention only operates on vectors and has no built-in notion of modality; any distinction between modalities exists only in how the sequence and its positional information were constructed.
</details>

## Key terms

* **Modality:** a type of input data (text, image, audio) with its own front-end producing vectors of a shared width.
* **Combined sequence:** a single sequence built by concatenating vectors from more than one modality.
* **Cross-modal attention:** attention weights spreading across positions from different modalities within one computation.

## Related

[[Vision Transformers]] · [[Token Embeddings and Embedding Scaling]] · [[Tokenizing Beyond Text]]
