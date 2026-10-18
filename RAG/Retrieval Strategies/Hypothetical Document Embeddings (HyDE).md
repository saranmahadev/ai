A short question and the long passage that answers it don't always sit very close together in embedding space — a question is phrased like a question, while the answer is phrased like an answer, and those are different styles of text. HyDE's trick is to skip embedding the question at all: generate a plausible answer first, then embed *that*, since a generated answer's phrasing is naturally much closer to the real answer's phrasing than the bare question ever was.

**You need:** [[Dense Retrieval]].

## The question it answers

"Can retrieval do better than embedding the query exactly as it was asked?" **HyDE (Hypothetical Document Embeddings)** uses a language model to generate a hypothetical answer to the query — not necessarily a correct one, just a plausible one, written in the style of a real passage — and embeds that generated text instead of the bare question. Because the hypothetical answer is phrased more like the documents being searched than the original question was, its embedding tends to land closer to the real, relevant document.

## Intuition

Looking for a specific paragraph in a textbook by first sketching, from memory, roughly what that paragraph probably says, then searching for text that resembles your sketch, works better than searching with the bare question alone — your sketch is already written in the style of an answer, which is exactly the style the real paragraph is written in too.

## Definition and notation

```text
bare query embedding:          embed(question)
HyDE embedding:                embed(generate_hypothetical_answer(question))
```

## A worked example

Comparing both embeddings against the same real, relevant document:

```text
bare question similarity to real document:        0.7962
hypothetical-answer similarity to real document:  0.9997
```

The generated hypothetical answer — plausible, but not necessarily factually correct — lands far closer to the real document's embedding than the bare question did. The hypothetical answer doesn't need to be *true* to help retrieval; it only needs to be phrased like the kind of passage that would actually answer the question, which makes its embedding naturally closer to real passages that do.

## Bench

```bench
id: hyde-retrieval
title: Embedding a guessed answer instead of the question
fallback: Compare a bare query's similarity to a real document against a generated hypothetical answer's similarity.
```

**Try this**

1. Check the bare question's similarity to the real document.
2. Switch to the hypothetical-answer embedding and see the gap close almost entirely.
3. Consider why a *wrong* hypothetical answer could still help retrieval, as long as it's phrased the right way.

**What you should notice:** the improvement doesn't come from the hypothetical answer being correct — it comes from its phrasing matching the style of real documents far better than a bare question's phrasing does.

## Where it appears in AI

* **This reuses [[Dense Retrieval]]'s exact similarity mechanism** — HyDE changes what gets embedded, not how embeddings are compared.
* **It's a generation-time technique, requiring a call to the generating model *before* retrieval even happens** — an extra cost [[Cost and Latency of RAG Systems]] has to account for.
* **[[Query Expansion and Rewriting]] is a cheaper, non-generative alternative aimed at a similar underlying problem** (query phrasing not matching document phrasing), without needing a model call per query.

## Common pitfalls

* **Assuming the hypothetical answer needs to be factually correct.** It doesn't — HyDE works because of phrasing similarity to real documents, not because the generated guess happens to be true.
* **Ignoring the added cost of generating a hypothetical answer before every single retrieval.** Unlike query expansion's cheap synonym lookup, HyDE requires a full generation call per query, adding real latency and cost.
* **Using HyDE on a domain the generating model knows little about.** A hypothetical answer generated with no real domain knowledge may be phrased badly too, losing the advantage this technique depends on.

## Quick check

<details><summary>1. In the worked example, why does the hypothetical answer's embedding land closer to the real document than the bare question's does?</summary>
A generated hypothetical answer is phrased like an answer — similar in style to the real passages being searched — while a bare question is phrased like a question, a different style that happens to sit further away in embedding space from answer-style text.
</details>

<details><summary>2. Does the hypothetical answer need to be factually accurate for HyDE to work?</summary>
No — its usefulness comes from matching the phrasing style of real answers, not from being correct; even a plausible-but-wrong guess can improve retrieval this way.
</details>

<details><summary>3. What extra cost does HyDE add compared to embedding the query directly?</summary>
A full generation call to produce the hypothetical answer, before retrieval can even begin — a real latency and compute cost on top of the embedding and search steps every query already requires.
</details>

## Key terms

* **HyDE (Hypothetical Document Embeddings):** embedding a generated hypothetical answer instead of the bare query, to better match the phrasing of real documents.
* **Hypothetical answer:** a plausible, not-necessarily-correct generated response used only to improve retrieval, not shown to the user.
* **Phrasing mismatch:** the stylistic gap between how a question is phrased and how its answer is phrased, which hurts a bare query's embedding similarity to the real answer.

## Related

[[Dense Retrieval]] · [[Query Expansion and Rewriting]] · [[Cost and Latency of RAG Systems]]
