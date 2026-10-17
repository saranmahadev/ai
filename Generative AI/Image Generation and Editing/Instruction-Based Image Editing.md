Masks and locked structural coordinates both require drawing an exact region by hand. This note covers editing an image by just describing the change in words instead — and the mechanism that makes "edit the cat, leave the background alone" work without anyone drawing a mask.

**You need:** [[Cross-Attention Conditioning for Generation]].

## The question it answers

"How can an edit instruction know *where* in an image to apply itself, with no mask at all?" The instruction's embedding attends over the image's patches via [[Cross-Attention Conditioning for Generation|the same cross-attention mechanism used for text-to-image conditioning]], and the resulting attention weight for each patch becomes how strongly that patch is nudged toward the edit. Patches the instruction has nothing to do with get low attention and barely change; patches it's clearly about get high attention and change a lot — a *soft*, learned localization, rather than a hard, hand-drawn boundary.

## Intuition

Tell someone "make the cat red" while they're looking at a photo, and they intuitively know to leave the sky and background alone — not because you drew a box around the cat, but because the instruction itself only makes sense applied to the cat. Cross-attention gives a model the same kind of implicit targeting: the instruction "attends" most strongly to whichever parts of the image it's actually about, and the edit is applied in proportion to that attention, with no explicit mask required.

## Definition and notation

```text
instruction embedding → query
image patches         → keys and values

attention weight(patch) = how strongly the instruction's query matches that patch's key
edit strength(patch)    = attention weight(patch)
edited patch = original patch + edit_strength · (target feature − original patch)
```

## A worked example

Four image patches — background, cat-face, cat-body, sky — with the instruction "make the cat red" as the query:

```text
attention to background: 0.190
attention to cat-face:    0.317   ← highest
attention to cat-body:    0.303
attention to sky:         0.190
```

Shifting each patch toward a "red" target feature in proportion to its attention weight:

```text
background edited with strength 0.190 (barely shifted)
cat-face   edited with strength 0.317 (shifted the most)
cat-body   edited with strength 0.303 (shifted almost as much)
sky        edited with strength 0.190 (barely shifted, same as background)
```

Nobody told the model which pixels belong to "the cat" — the two cat-related patches simply had embeddings more similar to the instruction's, earning them higher attention weight and a stronger edit, exactly mirroring how [[Cross-Attention Conditioning for Generation|text-to-image conditioning]] already worked, just applied to an edit instruction instead of a generation prompt.

## Bench

```bench
id: instruction-edit
title: An instruction edits what it attends to
fallback: Choose an edit instruction and see which image patch it attends to most strongly, and how much each patch is edited as a result.
```

**Try this**

1. Try "make the cat red" and confirm the cat patches get the strongest edit.
2. Try "make the sky red" and compare which patches shift most this time.
3. Notice the background patch's edit strength barely changes between the two instructions.

**What you should notice:** which patches get edited strongly is entirely determined by how similar each patch's embedding is to the instruction's — there's no separate step that decides "this is the region the instruction applies to."

## Where it appears in AI

* **Instruction-based image editing models (prompted with "make X do Y" rather than a text-to-image description) rely on exactly this soft localization**, letting one short instruction edit the right region of a photo with no mask drawn by the user.
* **It's a weaker, "soft" version of [[ControlNet-Style Structural Conditioning|structural conditioning]]'s hard locking**: nothing is ever fully exempt from the edit (even the lowest-attention patch still shifts a little), it just shifts far less.
* **Attention maps from this exact mechanism can be visualized directly**, showing which regions of an image an edit instruction actually targeted — a genuine window into why an edit landed where it did.

## Common pitfalls

* **Expecting a hard, mask-like boundary.** Every patch gets edited at least a little, proportional to its attention weight — there's no sharp cutoff between "edited" and "untouched" regions unless the attention weights happen to be extreme.
* **Assuming the instruction's wording alone determines the edit location.** It's the *similarity* between the instruction's embedding and each patch's embedding that determines attention — an ambiguous instruction, or patches with similar embeddings to unrelated content, can misdirect the edit.
* **Confusing this with [[Image-to-Image Translation and Style Transfer|style transfer]].** Style transfer changes statistics across the *whole* image; instruction-based editing specifically concentrates its effect on the patches the instruction's embedding is most similar to.

## Quick check

<details><summary>1. What determines how strongly a given image patch is edited by an instruction?</summary>
The cross-attention weight between the instruction's query embedding and that patch's key embedding — a higher similarity means a higher attention weight, and so a stronger edit.
</details>

<details><summary>2. In the worked example, why did the cat-face and cat-body patches receive the strongest edit for "make the cat red"?</summary>
Their feature embeddings were built to be similar to the instruction's embedding, giving them higher attention weights (0.317 and 0.303) than the unrelated background and sky patches (0.190 each).
</details>

<details><summary>3. Is there a sharp boundary between "edited" and "unedited" regions in this mechanism?</summary>
No — every patch is shifted by some amount proportional to its attention weight; low-attention patches shift only a little rather than not at all.
</details>

## Key terms

* **Instruction-based editing:** editing an image by describing the desired change in natural language, with the edit's location determined implicitly by attention rather than a drawn mask.
* **Soft localization:** concentrating an effect on the most relevant regions by degree (via attention weight), rather than with a hard included/excluded boundary.
* **Edit strength:** how much a given patch is shifted toward the target of an edit, proportional to its attention weight.

## Related

[[Cross-Attention Conditioning for Generation]] · [[ControlNet-Style Structural Conditioning]] · [[Image-to-Image Translation and Style Transfer]]
