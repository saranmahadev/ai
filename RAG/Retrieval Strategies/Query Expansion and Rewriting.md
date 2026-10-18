Sparse retrieval only ever matches the exact words a query happens to use. Query expansion sidesteps that limitation at the query side, before any retrieval happens at all — add related words the document might actually use, and a query that originally shared nothing with a document can suddenly share several.

**You need:** [[Sparse Retrieval with TF-IDF and BM25]].

## The question it answers

"Can a query be improved before retrieval even runs?" **Query expansion** adds related terms — synonyms, alternate phrasings, related concepts — to a query before it's matched against documents. For sparse retrieval specifically, this directly compensates for the exact-vocabulary matching problem: a query that originally had zero overlap with a relevant document can gain several matching terms once expanded with the right synonyms.

## Intuition

Searching a library catalog for "automobile" and getting nothing, then thinking to also try "car" and "vehicle," is something a person does instinctively when a first search comes up empty. Query expansion automates exactly that instinct, adding likely alternate words before the search even runs once.

## Definition and notation

```text
expand(query) = query's own terms ∪ known synonyms of each term
```

## A worked example

The query "automobile repair" against a document about "car maintenance and servicing":

```text
original query terms:  automobile, repair
expanded query terms:  automobile, repair, car, vehicle, maintenance, fix, servicing

original overlap with document: 0 terms
expanded overlap with document: 3 terms  (car, maintenance, servicing)
```

With no expansion, a sparse retrieval method sees zero shared vocabulary and scores this document as entirely unrelated. After expansion, three of the document's words now match the expanded query — a sparse method would now rank this document as a real candidate, where before it couldn't have been found at all.

## Bench

```bench
id: query-expansion
title: Matching words the query never used
fallback: Toggle query expansion and watch a zero-overlap query gain matching terms against a document.
```

**Try this**

1. Look at the unexpanded query and note zero terms match the document.
2. Turn on expansion and watch three new matches appear.
3. Consider what happens if the synonym list is wrong or too broad — what risk does that introduce?

**What you should notice:** expansion doesn't change the document or the retrieval algorithm at all — it only changes what the query itself contains before matching ever starts.

## Where it appears in AI

* **This directly targets the exact-vocabulary limitation shown in [[Sparse Retrieval with TF-IDF and BM25]]'s worked example** — expansion is one fix for that limitation; switching to [[Dense Retrieval]] entirely is another.
* **[[Hypothetical Document Embeddings (HyDE)]] takes a related but different approach**: instead of adding synonyms, it generates an entire hypothetical answer and searches with that.
* **A poorly chosen synonym can introduce false matches**, which [[Common RAG Failure Modes]] covers as "retrieved an irrelevant document because of over-broad query expansion."

## Common pitfalls

* **Assuming expansion is free.** Every added term is also a term that can accidentally match an irrelevant document — expansion trades some precision for recall, not purely a win.
* **Using a fixed, hand-built synonym list that doesn't generalize.** A synonym dictionary built for one domain may add the wrong associations in another (medical "MI" expanding toward geography-related terms, for instance).
* **Expanding so aggressively that the query drifts away from its original intent.** Each added synonym should still be something a document actually answering the question might plausibly contain.

## Quick check

<details><summary>1. In the worked example, why does the original query have zero overlap with the document?</summary>
The query uses "automobile" and "repair," while the document uses "car," "maintenance," and "servicing" — none of the exact words match, even though both describe the same topic.
</details>

<details><summary>2. What's the main risk of adding too many synonyms to a query?</summary>
Each added term can also match documents that aren't actually relevant, trading away some precision in exchange for the added recall — expansion isn't a pure improvement.
</details>

<details><summary>3. Is query expansion useful for dense retrieval the same way it is for sparse retrieval?</summary>
Less so — dense retrieval already captures semantic similarity through embeddings, so it doesn't suffer from the exact-vocabulary-matching problem expansion is specifically designed to fix for sparse methods.
</details>

## Key terms

* **Query expansion:** adding related terms to a query before retrieval, to compensate for exact-vocabulary matching limitations.
* **Synonym:** a word with a similar meaning used to expand a query's matching vocabulary.
* **Precision/recall trade-off:** the cost of expansion — more matching terms can mean more irrelevant matches too.

## Related

[[Sparse Retrieval with TF-IDF and BM25]] · [[Hypothetical Document Embeddings (HyDE)]] · [[Dense Retrieval]]
