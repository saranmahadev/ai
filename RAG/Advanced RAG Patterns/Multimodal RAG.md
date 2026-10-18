A text query can retrieve an image directly — no caption, no text description needed as an intermediary — as long as the text and the image were embedded into the same shared space in the first place. "A photo of a golden retriever" and an actual photo of one land close together in that space, the same way two pieces of text about the same topic would.

**You need:** [[Dense Retrieval]], [[Contrastive Learning]].

## The question it answers

"Can retrieval work across different modalities — text queries finding images, or the reverse?" Multimodal RAG retrieves content in a different modality than the query, by embedding both into the same shared space (built the way [[Contrastive Learning|contrastive learning]] already covered: pulling matching text-image pairs together, pushing unrelated ones apart, during training). Once both modalities share a space, retrieval is the same cosine-similarity operation as always — it just happens to be comparing a text vector to an image vector instead of two text vectors.

## Intuition

A bilingual catalog where every photo and every caption, regardless of which language wrote the caption, gets filed by subject rather than by language lets someone search in one language and find a photo captioned in a different one entirely — because the filing system organizes by *meaning*, not by modality or language. A shared embedding space does the same thing for text and images.

## Definition and notation

```text
shared_space:  embed_text(query) and embed_image(photo) land in the same vector space
score(query, image) = cosine_similarity(embed_text(query), embed_image(image))
```

## A worked example

A text query ranked against three images, using embeddings in a shared text-image space:

```text
query: "a photo of a golden retriever"

golden_retriever.jpg   similarity 0.9997
invoice_scan.png       similarity 0.7809
siamese_cat.jpg        similarity 0.2815
```

The matching photo scores almost perfectly (0.9997), despite the query never containing a single pixel of image data. A mismatched photo (a cat) scores far lower, and an entirely unrelated image (a scanned invoice) lands in between — closer to the query than the cat photo, interestingly, since it shares no strong signal pulling it toward *either* concept.

## Bench

```bench
id: multimodal-rag-retrieval
title: A text query, ranking images directly
fallback: Rank images by cross-modal similarity to a text query in a shared embedding space.
```

**Try this**

1. Check which image ranks highest for "a photo of a golden retriever."
2. Switch the query to "a photo of a cat" and watch the ranking flip.
3. Consider why the invoice scan's similarity sits between the two animal photos' scores rather than at the very bottom.

**What you should notice:** retrieval itself hasn't changed at all — it's still cosine similarity between two vectors; the only thing multimodal RAG adds is that those two vectors can now come from genuinely different kinds of content.

## Where it appears in AI

* **This reuses [[Dense Retrieval]]'s exact similarity mechanism**, with the only change being which modality each side's embedding comes from.
* **Building the shared space in the first place is exactly [[Contrastive Learning]]**, already covered on the Deep Learning planet — this topic is about using that shared space for retrieval, not re-deriving how it's trained.
* **A multimodal RAG system's generation stage often needs a model capable of reasoning over the retrieved image directly**, not just citing it as text — connecting back to multimodal generation covered on the Generative AI planet.

## Common pitfalls

* **Assuming any embedding model works across modalities by default.** A shared text-image space has to be deliberately trained that way (contrastively, on paired text-image data) — a text-only embedding model has no meaningful way to compare against an image at all.
* **Expecting cross-modal similarity scores to behave exactly like same-modality ones.** The worked example's invoice scan scoring higher than the mismatched cat photo isn't necessarily meaningful — cross-modal similarity scales can behave differently from same-modality comparisons, and absolute score values are less directly interpretable.
* **Retrieving an image without a plan for how generation will actually use it.** Finding the right image is only half the pipeline — the generating model also needs to be able to process that image as input, not just receive a filename.

## Quick check

<details><summary>1. Why does "a photo of a golden retriever" retrieve the matching photo without any text caption or description of the image being involved?</summary>
Both the text query and the image were embedded into the same shared space, trained so that matching text-image pairs land close together — the comparison happens directly between the query's text embedding and the image's own embedding.
</details>

<details><summary>2. What training approach builds the shared space multimodal RAG depends on?</summary>
Contrastive learning — pulling matching text-image pairs' embeddings together and pushing unrelated pairs apart during training, the same mechanism already covered for same-modality representation learning.
</details>

<details><summary>3. Does a text-only embedding model support multimodal retrieval?</summary>
No — it has no trained relationship between text embeddings and image embeddings; multimodal retrieval requires an embedding model specifically trained (typically contrastively) on paired data across the modalities involved.
</details>

## Key terms

* **Multimodal RAG:** retrieval where the query and the retrieved content are in different modalities (text and images, for instance).
* **Shared embedding space:** a vector space where content from multiple modalities is embedded so that semantically related items land close together regardless of modality.
* **Cross-modal similarity:** a similarity score computed between embeddings from two different modalities.

## Related

[[Dense Retrieval]] · [[Contrastive Learning]] · [[Multimodal Generation]]
