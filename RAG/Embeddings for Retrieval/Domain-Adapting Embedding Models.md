A general-purpose embedding model learned its sense of "similar" from broad, general text — which means it can genuinely confuse two meanings of the same term if one of them is specific to a domain it rarely saw. "MI" means something very different in a hospital's charts than it does on a map, and a model never shown much medical text has no strong reason to know which sense a query intends.

**You need:** [[Bi-Encoders and Dense Embeddings]], [[Continued Pretraining and Domain Adaptation]].

## The question it answers

"What happens when an embedding model's general-purpose training doesn't match the vocabulary of the collection it's searching?" A term with a rare, specialized meaning (like a medical abbreviation) sits ambiguously in a general-purpose model's embedding space — it may even end up closer to the *wrong*, more common sense. Fine-tuning the embedding model on in-domain text (pairs of medical queries and medical passages, for instance) pulls the ambiguous term's embedding toward the sense that actually matters for that domain's documents.

## Intuition

Someone who's only ever heard "MI" used to mean the state of Michigan will naturally read a new mention of "MI" that way too, unless they spend time specifically immersed in contexts (a hospital, a cardiology textbook) where it means something else entirely. Domain adaptation is that immersion, applied to an embedding model.

## Definition and notation

```text
general-purpose:  similarity("MI", medical sense) and similarity("MI", geographic sense) are close,
                  with no strong training signal for which sense a medical query intends
domain-adapted:   fine-tuned on in-domain (query, relevant passage) pairs, pulling "MI" toward
                  the domain's own dominant sense
```

## A worked example

A query containing the ambiguous term "MI", checked against embeddings for its two senses under both models:

```text
general-purpose model:
  similarity to medical sense:      0.9806
  similarity to geographic sense:   0.9950   ← actually scores HIGHER for the wrong sense

domain-adapted model (fine-tuned on medical text):
  similarity to medical sense:      0.9997
  similarity to geographic sense:   0.2195
```

The general-purpose model doesn't just fail to clearly prefer the medical sense — it scores the *wrong* sense slightly higher. After domain adaptation, the gap flips decisively: the medical sense scores almost perfectly (0.9997) while the geographic sense drops far below it (0.2195).

## Bench

```bench
id: domain-adapted-embedding
title: The same two letters, two very different meanings
fallback: Compare a general-purpose embedding's sense confusion against a domain-adapted one's clean separation.
```

**Try this**

1. Look at the general-purpose model's two similarity scores — notice how close they are, and which one is actually higher.
2. Switch to the domain-adapted model and watch the gap open up decisively in the correct direction.
3. Think of another term that means something completely different inside a specific domain (legal, financial, medical) than it does in everyday language.

**What you should notice:** domain adaptation doesn't just sharpen an existing correct preference — in this worked example, it actually *reverses* a general-purpose model's wrong preference.

## Where it appears in AI

* **This reuses the exact fine-tuning mechanism already covered as [[Continued Pretraining and Domain Adaptation]] in LLMs**, applied here specifically to embedding models rather than generation models.
* **A domain-adapted embedding model is still a bi-encoder ([[Bi-Encoders and Dense Embeddings]])** — adaptation changes what the model has learned to consider similar, not the architecture itself.
* **Getting this wrong directly causes the kind of retrieval failure [[Common RAG Failure Modes]] catalogs**: confidently retrieving a document about the wrong sense of an ambiguous term.

## Common pitfalls

* **Assuming a general-purpose embedding model is "good enough" for any domain.** The worked example shows it can actively prefer the wrong sense of an ambiguous term, not just fail to prefer the right one.
* **Fine-tuning on too little in-domain data to shift the embedding space meaningfully.** Domain adaptation needs enough representative (query, relevant passage) pairs to actually move the ambiguous term's embedding, not just a handful of examples.
* **Over-adapting to one narrow sub-domain and losing general capability.** A model fine-tuned exclusively on cardiology text may develop new blind spots for other medical sub-specialties it saw less of.

## Quick check

<details><summary>1. In the worked example, why is the general-purpose model's result more concerning than simply "uncertain"?</summary>
It doesn't just fail to distinguish the two senses — it actually scores the wrong (geographic) sense higher than the right (medical) one, meaning a retrieval system built on it would be actively more likely to retrieve the wrong document.
</details>

<details><summary>2. What kind of training data is needed to domain-adapt an embedding model for this term?</summary>
In-domain (query, relevant passage) pairs — in this case, medical queries paired with the medical passages they should retrieve — so the model learns that in this domain's context, "MI" belongs with the medical sense.
</details>

<details><summary>3. Does domain adaptation change the embedding model's architecture?</summary>
No — it's still a bi-encoder producing dense vectors the same way; adaptation changes what the model has learned to consider similar, via further training on in-domain data.
</details>

## Key terms

* **Domain adaptation:** fine-tuning a general-purpose model on data from a specific domain so it better reflects that domain's vocabulary and conventions.
* **Sense ambiguity:** a term having multiple distinct meanings, with the correct one depending on context or domain.
* **In-domain training pairs:** (query, relevant passage) examples drawn from the specific domain a model is being adapted to.

## Related

[[Bi-Encoders and Dense Embeddings]] · [[Continued Pretraining and Domain Adaptation]] · [[Common RAG Failure Modes]]
