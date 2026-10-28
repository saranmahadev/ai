A language model's "knowledge" isn't stored the way a database stores facts. It's baked into millions of weight values during training, which means updating it means retraining — there's no row to edit. Retrieval gives a model a second, very different kind of knowledge: a document store it can search at answer-time, which can be edited the instant a new document arrives.

**You need:** [[Embeddings and Similarity Search]].

## The question it answers

"Where does a model's knowledge actually live, and why does that matter?" **Parametric knowledge** is whatever got compressed into a model's weights during training — implicit, diffuse across millions of parameters, and frozen until the next training run. **Non-parametric knowledge** is an external store (documents, a database) the model consults at answer-time — explicit, inspectable, and editable immediately, with no retraining at all.

## Intuition

Parametric knowledge is like a fact a person memorized years ago from a textbook: it's genuinely theirs, but updating it means re-studying. Non-parametric knowledge is like handing that same person a current reference book before they answer: anyone can add a page to the book the moment new information exists, with no need for the person to "relearn" anything.

## Definition and notation

```text
parametric answer(fact)      = lookup in trained weights         (frozen until retrained)
non-parametric answer(fact)  = lookup in an external document store (editable anytime)
```

## A worked example

A fact that didn't exist when the model was trained, checked before and after a new document is added to the store:

```text
before the document is added:
  parametric model:       "unknown — not in this source"
  retrieval-augmented:    "unknown — not in this source"

after the document is added to the store (no retraining):
  parametric model:       "unknown — not in this source"   (unchanged — its weights never moved)
  retrieval-augmented:    "effective March 2026"            (found the new document instantly)
```

The retrieval-augmented answer changed the moment a document was added. The parametric model's answer didn't move at all — and won't, until it's retrained on data that includes this fact.

## Bench

```bench
id: parametric-vs-retrieved
title: One of these can be updated without retraining
fallback: Add a new document to a store and compare how a parametric and a retrieval-augmented answer respond.
```

**Try this**

1. Note both answers are "unknown" before anything is added.
2. Click to add the new document and see only one answer change.
3. Imagine this fact changing again next month — which approach handles that without any extra training work?

**What you should notice:** adding a document changes what the retrieval-augmented system can answer immediately; it changes nothing about the parametric model, which stays wrong (or honestly "unknown") until someone retrains it.

## Where it appears in AI

* **This is the entire reason retrieval-augmented generation exists**: every topic in this subject is, in one way or another, about building and using the non-parametric half of this picture well.
* **[[Hallucination and Knowledge Cutoff]] is what happens when a model is forced to answer from parametric knowledge alone, past the point where that knowledge is current or complete.**
* **[[RAG vs. Fine-Tuning vs. Long-Context]] compares this topic's two knowledge stores against a third option — stuffing non-parametric information directly into the prompt instead of a searchable store.**

## Common pitfalls

* **Assuming fine-tuning and retrieval solve the same problem.** Fine-tuning changes parametric knowledge (slowly, in bulk, requiring retraining); retrieval adds non-parametric knowledge (instantly, per-document, requiring no retraining) — they're genuinely different mechanisms with different trade-offs.
* **Expecting a parametric model to "know" something just because it's true and recent.** If it wasn't in the training data, it isn't in the weights — there's no partial credit for information existing on the internet somewhere.
* **Forgetting that non-parametric knowledge is only as good as what's actually in the store.** A retrieval-augmented system can't retrieve a fact that was never added to its document collection either.

## Quick check

<details><summary>1. In the worked example, why does the parametric model's answer stay "unknown" even after the document is added to the store?</summary>
Adding a document to the store doesn't touch the model's weights at all — the parametric model's answer only changes if the model is retrained on data that includes the new fact.
</details>

<details><summary>2. Is non-parametric knowledge "better" than parametric knowledge in general?</summary>
Not universally — it's better for facts that need to stay current or be added instantly, but parametric knowledge captures patterns, language ability and reasoning that aren't naturally expressed as retrievable documents.
</details>

<details><summary>3. What has to happen for a parametric model's knowledge about a given fact to change?</summary>
Retraining (or fine-tuning) on data that includes that fact — there's no equivalent of "adding a document" for weights that have already been trained.
</details>

## Key terms

* **Parametric knowledge:** information implicitly stored in a model's trained weights, updatable only by retraining.
* **Non-parametric knowledge:** information kept in an external, searchable store, updatable immediately without touching the model.
* **Retrieval-augmented generation (RAG):** combining a model's parametric knowledge with non-parametric knowledge fetched from a document store at answer-time.

## Related

[[Hallucination and Knowledge Cutoff]] · [[RAG vs. Fine-Tuning vs. Long-Context]] · [[Anatomy of a RAG Pipeline]]
