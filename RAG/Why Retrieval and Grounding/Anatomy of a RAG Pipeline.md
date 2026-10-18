Every retrieval-augmented system, however elaborate, is built from the same handful of stages in the same order: a question comes in, it becomes a vector, that vector finds relevant passages, those passages get assembled into context, and the model generates an answer from that context. Everything else on this planet is a deeper look at one of these five stages.

**You need:** [[Embeddings and Similarity Search]].

## The question it answers

"What are the actual steps between a user's question and a grounded answer?" Five stages, in order: **query** (the raw question arrives), **embed** (the query becomes a vector), **retrieve** (that vector is compared against every document's vector, keeping the closest few), **assemble** (the retrieved passages are arranged into a prompt), and **generate** (the model answers, using only what was assembled).

## Intuition

A reference librarian answering a question does roughly the same five things: hears the question, mentally narrows down what kind of thing they're looking for, pulls the handful of books most likely to have the answer, skims and arranges the relevant passages, and only then actually answers — using what they just pulled, not purely from memory.

## Definition and notation

```text
query  → embed  → retrieve (top-k by similarity)  → assemble (context)  → generate (answer)
```

Each arrow is a real engineering decision this planet covers in depth: how to embed ([[Bi-Encoders and Dense Embeddings]]), how to retrieve ([[Dense Retrieval]], [[Sparse Retrieval with TF-IDF and BM25]]), how to assemble ([[Context Assembly and Ordering]]), how to generate faithfully ([[Grounded Generation and Faithfulness]]).

## A worked example

One toy query against four 2D document embeddings, walked through all five stages:

```text
query: "how long do refunds take"
embed: query vector = [0.90, 0.10]

retrieve (cosine similarity against 4 documents):
  "refund timeline"   0.9983
  "returns policy"     0.9980
  "shipping times"     0.8882
  "product warranty"   0.1625
  → top 2 kept: "refund timeline", "returns policy"

assemble: both passages inserted into the prompt, ahead of the question

generate: the model answers using only "refund timeline" and "returns policy" —
  never "product warranty", which scored far lower and was never retrieved
```

The document that actually discusses refunds scores far above the one about an unrelated topic (0.998 vs. 0.163) — exactly the separation retrieval depends on to keep irrelevant content out of the model's context.

## Bench

```bench
id: rag-pipeline-anatomy
title: One question, five stages
fallback: Step through a RAG pipeline's stages on one toy query, from embedding to retrieval to a grounded answer.
```

**Try this**

1. Step through all five stages and read each one's description.
2. At the retrieve stage, compare the similarity scores for all four documents — notice how far "product warranty" trails the other three.
3. Imagine "product warranty" had scored 0.994 instead of 0.163 — would it have changed which documents got assembled?

**What you should notice:** generation only ever sees what survived the retrieve and assemble stages — a document that scores low never reaches the model at all, which is both the whole point of retrieval and exactly where it can go wrong if the wrong documents score highest.

## Where it appears in AI

* **Every later district on this planet is a deeper treatment of one arrow in this diagram**: chunking happens before embedding even starts; embeddings, indexing and retrieval strategies fill in the retrieve stage; assembly and faithful generation fill in the last two.
* **[[RAG vs. Fine-Tuning vs. Long-Context]] compares this entire five-stage pipeline against alternatives that skip some or all of these stages.**
* **The capstone ([[Capstone: A Question Answered, Traced from Query to Grounded Answer]]) walks this same five-stage shape again, at the end of the planet, with every stage built out using the planet's own verified techniques.**

## Common pitfalls

* **Assuming "RAG" means one specific technique.** It names this whole five-stage shape; nearly every other topic on this planet is a different, swappable way to implement one of its stages.
* **Treating retrieval as a single step that either works or doesn't.** The worked example's numeric scores show retrieval is a *ranking*, not a binary decision — "top-k" always involves a cutoff choice with real consequences.
* **Forgetting that assembly is a real stage with real decisions.** Which retrieved passages go first, how they're separated, and how many fit are all choices — not an automatic consequence of retrieval.

## Quick check

<details><summary>1. In the worked example, why does "product warranty" never reach the generation stage?</summary>
Its cosine similarity to the query (0.1625) is far below the other three documents', so it falls outside the top 2 kept at the retrieve stage and is never assembled into the prompt the model generates from.
</details>

<details><summary>2. Which stage of the pipeline is responsible for deciding how many retrieved passages actually fit in the model's context?</summary>
The assemble stage — retrieve produces a ranked list, but assemble is where a decision gets made about how many of those ranked passages to actually include.
</details>

<details><summary>3. If retrieval returns the wrong documents, can a strong generation stage still produce a correct answer?</summary>
Not reliably — generation only has access to what was assembled, so a retrieval failure (the right documents never making the top-k) caps how good the final answer can be, regardless of how capable the generating model is.
</details>

## Key terms

* **Query:** the user's raw question before any processing.
* **Top-k:** the number of highest-scoring documents kept after retrieval, out of the full collection.
* **Assembly:** arranging retrieved passages into the prompt the model will actually generate from.

## Related

[[RAG vs. Fine-Tuning vs. Long-Context]] · [[Parametric vs. Non-Parametric Knowledge]] · [[Dense Retrieval]]
