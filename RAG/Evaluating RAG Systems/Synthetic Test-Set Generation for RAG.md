Hand-writing one evaluation question per chunk doesn't scale — a person can write maybe a few dozen good questions in a day, but a real document collection can hold thousands or millions of chunks. Generating test questions automatically, one per chunk, using a model, scales to the whole collection at once.

**You need:** [[End-to-End RAG Evaluation Frameworks]].

## The question it answers

"How do you build an evaluation set large enough to actually represent a real document collection?" **Synthetic test-set generation** prompts a model to produce a plausible question (and its expected answer) directly from each chunk — automatically creating (question, answer, source chunk) triples at the same rate chunks exist, rather than at the rate a human can write by hand. Coverage scales with the corpus automatically; hand-written coverage is capped by how much human time is available.

## Intuition

Spot-checking a textbook's quality by hand-writing one review question per chapter works fine for a 10-chapter book, but completely fails to scale to a 10,000-page reference library — automating "generate one question per section" is the only way to get evaluation coverage across something that large.

## Definition and notation

```text
hand-written coverage  = min(corpus size, writing rate × hours available)
synthetic coverage     = corpus size   (one generated question per chunk, automatically)
```

## A worked example

Coverage at three corpus sizes, comparing one workday of hand-writing (at 10 questions/hour) against synthetic generation:

```text
corpus    50 chunks:  hand-written covers 50  (100%)   synthetic covers 50  (100%)
corpus   500 chunks:  hand-written covers 80  (16%)    synthetic covers 500 (100%)
corpus 5,000 chunks:  hand-written covers 80  (2%)     synthetic covers 5,000 (100%)
```

At a small corpus size, hand-writing keeps up easily. Past a few hundred chunks, a single workday's hand-written coverage stays flat at 80 questions (the most one person can write in that time) while the corpus keeps growing — coverage collapses to single-digit percentages. Synthetic generation's coverage scales with the corpus by construction, staying at 100% regardless of size.

## Bench

```bench
id: synthetic-testset-coverage
title: One workday of writing questions by hand
fallback: Slide corpus size and compare how much of it a human could hand-write test questions for against automatic synthetic generation.
```

**Try this**

1. Start at a small corpus size and note hand-written coverage is still near 100%.
2. Slide toward 5,000 and watch hand-written coverage collapse toward single digits.
3. Imagine a real production collection with a million chunks — what would hand-written coverage be?

**What you should notice:** hand-written coverage isn't gradually declining — it's capped at a fixed number of questions (however many a workday allows), so its *percentage* coverage drops sharply as the corpus simply grows past that fixed cap.

## Where it appears in AI

* **A synthetic test set is exactly what [[End-to-End RAG Evaluation Frameworks]]'s scorecard needs to run against** — the scorecard's metrics are only as representative as the test set they're computed over.
* **The question-generation step is itself a generation task**, subject to the same risk of producing plausible-but-wrong content covered broadly in Generative AI — a generated question's "expected answer" still needs some form of validation.
* **[[A-B and Online Evaluation of RAG]] is a complementary approach**: instead of a synthetic (or hand-written) fixed test set, it measures quality against real user interactions directly.

## Common pitfalls

* **Trusting generated questions and answers without any validation.** A model generating a question from a chunk can also generate a subtly wrong expected answer — synthetic generation solves the coverage problem, not the correctness problem.
* **Generating only easy, directly-stated questions.** A model prompted naively tends to generate questions that restate a chunk's content almost verbatim, missing the harder multi-hop or inference-based questions a real evaluation should also cover.
* **Assuming 100% chunk coverage means 100% meaningful evaluation.** Covering every chunk with one question each doesn't test multi-chunk reasoning, conflicting-context handling, or any of the failure modes [[Common RAG Failure Modes]] catalogs that only show up with harder, multi-part questions.

## Quick check

<details><summary>1. In the worked example, why does hand-written coverage stay at 80 questions regardless of corpus size past a few hundred chunks?</summary>
80 questions is the fixed cap of what one person can write in a single workday at 10 questions per hour — that absolute number doesn't grow just because the corpus does, so its *percentage* of the corpus shrinks as the corpus grows.
</details>

<details><summary>2. Does synthetic test-set generation solve the problem of verifying that generated questions and answers are actually correct?</summary>
No — it solves the coverage problem (having an evaluation question for every chunk), not the correctness problem; generated questions and their expected answers can still be subtly wrong and need their own validation.
</details>

<details><summary>3. What kind of evaluation question does naive synthetic generation tend to miss?</summary>
Harder questions requiring reasoning across multiple chunks or handling conflicting information — a model prompted to generate a question from a single chunk tends to produce questions directly answerable from that one chunk alone.
</details>

## Key terms

* **Synthetic test-set generation:** automatically producing (question, answer, source) evaluation triples from a document collection.
* **Coverage:** the fraction of a corpus that has at least one associated evaluation question.
* **Question-answer triple:** a generated question paired with its expected answer and the source chunk it was derived from.

## Related

[[End-to-End RAG Evaluation Frameworks]] · [[A-B and Online Evaluation of RAG]] · [[Common RAG Failure Modes]]
