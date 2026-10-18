The simplest way to split a document is to cut it every N characters and move on. It's trivial to implement and perfectly predictable — and it will, routinely, slice straight through the middle of a word, a sentence, or a fact, with no regard for where the text's own structure would have suggested cutting.

**You need:** [[Parsing Documents for Retrieval]].

## The question it answers

"What's the simplest way to split a document into chunks, and what does that simplicity cost?" **Fixed-size chunking** cuts at a fixed character (or token) count, wherever that count happens to fall. **Recursive chunking** splits on the text's own structure first — paragraphs, then sentences — packing whole units into a chunk until the next one would push it over the size limit, so a cut only ever falls between units, never through the middle of one.

## Intuition

Cutting a loaf of bread into exactly 2-inch slices with a ruler is fast and consistent, but will occasionally slice right through a raisin. Cutting it at the natural gaps between slices the baker already scored is slightly less uniform in size, but it never cuts through anything that was meant to stay whole.

## Definition and notation

```text
fixed-size(text, size)     = text sliced every `size` characters, ignoring word/sentence boundaries
recursive(text, maxSize)   = sentences packed into a chunk until the next one would exceed maxSize,
                             never splitting a sentence itself
```

## A worked example

A 40-character chunk size, applied to a short returns-policy paragraph:

```text
fixed-size (40 chars): 6 chunks, 4 of 5 chunk boundaries cut mid-word
  "Returns are accepted within 30 days. Ite"
  "ms must be unworn and in original packag"
  "ing. Refunds are issued to the original "
  "payment method within 5 business days. S"
  "tore credit is available as an alternati"
  "ve."

recursive (sentence-aware, ≤40 chars): 4 chunks, 0 broken boundaries
  "Returns are accepted within 30 days."
  "Items must be unworn and in original packaging."
  "Refunds are issued to the original payment method within 5 business days."
  "Store credit is available as an alternative."
```

Fixed-size chunking breaks words apart at 4 of its 5 chunk boundaries — "Ite" / "ms", "packag" / "ing", and so on. Recursive chunking produces fewer, slightly longer chunks (one even exceeds the 40-character target, since it keeps a whole sentence rather than cutting it), but never once cuts through a word.

## Bench

```bench
id: fixed-vs-recursive-chunking
title: Splitting by character count vs. by sentence
fallback: Compare fixed-size chunking against recursive, sentence-respecting chunking on the same text.
```

**Try this**

1. Switch to fixed-size and read each chunk — notice how many start or end mid-word.
2. Switch to recursive and notice every chunk starts and ends at a real sentence boundary.
3. Compare the chunk counts — recursive chunking used fewer, because it let one chunk run slightly over 40 characters rather than cut a sentence.

**What you should notice:** recursive chunking trades strict size control for structural integrity — it occasionally produces a chunk longer than the target size, but it never produces one that starts or ends mid-word.

## Where it appears in AI

* **A chunk that cuts a fact in half is exactly the failure mode [[Chunk Overlap and Size Trade-offs]] covers in more detail** — fixed-size chunking's mid-word cuts are a visible symptom of the same underlying problem.
* **[[Semantic and Structure-Aware Chunking]] goes a step further than recursive chunking** — splitting by meaning or document structure instead of just sentence boundaries.
* **A broken chunk still gets embedded and indexed ([[Bi-Encoders and Dense Embeddings]])** — whatever damage happens at chunking time propagates into every later stage of the pipeline.

## Common pitfalls

* **Assuming fixed-size chunking is "good enough" because it's simple.** The worked example shows it breaks 80% of its own boundaries mid-word on ordinary prose — the simplicity comes at a real, measurable cost.
* **Assuming recursive chunking guarantees every chunk fits the target size exactly.** It prioritizes not splitting a sentence over hitting the size limit precisely — a sentence longer than the target still becomes its own, oversized chunk.
* **Applying character-based chunk sizes to text in a language where character count doesn't track token count well.** The same size parameter can mean a very different amount of actual model-visible content depending on the text.

## Quick check

<details><summary>1. In the worked example, why does fixed-size chunking break so many of its boundaries mid-word?</summary>
It cuts at a fixed character count with no awareness of where words end — a word that happens to straddle the 40-character mark gets split regardless.
</details>

<details><summary>2. Why does recursive chunking sometimes produce a chunk longer than the target maxSize?</summary>
It refuses to split a sentence in the middle, so when the next sentence would push a chunk over the limit, it still keeps that sentence whole rather than cutting it — prioritizing structural integrity over strict size.
</details>

<details><summary>3. Does recursive chunking eliminate every problem fixed-size chunking has?</summary>
No — it only guarantees chunks don't split sentences; it says nothing about whether a chunk boundary falls at a meaningful change of topic, which is what semantic chunking addresses instead.
</details>

## Key terms

* **Fixed-size chunking:** splitting text at a constant character or token count, regardless of word or sentence boundaries.
* **Recursive chunking:** splitting on structural units (paragraphs, sentences) and packing them up to a size limit without ever cutting one in half.
* **Chunk boundary:** the point where one chunk ends and the next begins.

## Related

[[Parsing Documents for Retrieval]] · [[Chunk Overlap and Size Trade-offs]] · [[Semantic and Structure-Aware Chunking]]
