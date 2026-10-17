A benchmark score only means something if the model is actually being tested, rather than recalling something it already saw. The problem: with pretraining corpora drawn from huge swaths of the internet, there's a real chance a benchmark's own questions — or close paraphrases of them — ended up inside the training data.

**You need:** [[Benchmark Suites (MMLU, HELM, BIG-bench)]], [[Data Deduplication and Quality Filtering]].

## The question it answers

"How can you tell whether a model's high benchmark score reflects genuine capability or memorized test questions?" **Contamination** means a benchmark's test examples (or close variants) appeared in the model's training data. The same [[Data Deduplication and Quality Filtering|n-gram overlap technique]] used to find near-duplicate training documents can be turned around and used to check a specific concern: does a benchmark question show substantial overlap with anything in the training corpus? High overlap is a direct, checkable red flag for contamination.

## Intuition

A standardized test is only meaningful if the person taking it hasn't already seen the answer key. If it later turns out the exact questions (or very close paraphrases) were accidentally included in the study materials beforehand, a high score on that test says a lot less about genuine ability than it first appeared to. Checking a benchmark's questions against a model's training data for suspicious overlap is exactly like checking whether a specific set of exam questions somehow leaked into the study guide ahead of time.

## Definition and notation

```text
contamination check: overlap_fraction(benchmark_question, training_document, n)
  (the exact same n-gram Jaccard overlap mechanism used for deduplication,
   applied here specifically to a benchmark question against training text)

high overlap → the benchmark question (or a close paraphrase)
  was likely present in training data → the score is suspect
```

## A worked example

A benchmark question checked against two different training documents using 5-grams:

```text
benchmark question:  "what is the capital of australia and what is its population"

contaminated document:  "the quiz asks what is the capital of australia and
  what is its population exactly"
  → overlap: 100%   (every 5-gram of the question appears in this document)

clean document:  "canberra became the capital in 1927 after a long design competition"
  → overlap: 0%     (no shared 5-grams at all)
```

The contaminated document shares every single 5-gram with the benchmark question — it clearly contains the question nearly verbatim. The clean document, despite being topically related (it's also about Canberra becoming the capital), shares no 5-grams with the question's exact phrasing at all, and raises no contamination concern.

## Bench

```bench
id: contamination-detection
title: Did the model already see the test?
fallback: Check a benchmark question against two training documents for n-gram overlap, and see which one gets flagged as contaminated.
```

**Try this**

1. Check the question against the contaminated document.
2. Switch to the clean document and compare.
3. Adjust the n-gram length and see how it changes detection sensitivity.

**What you should notice:** topical relatedness alone (the clean document is also about the same subject) doesn't trigger a contamination flag — only substantial overlap in actual phrasing does.

## Where it appears in AI

* **Major benchmark releases now routinely report contamination analyses**, checking how much of the benchmark's content can be found, verbatim or near-verbatim, in commonly used pretraining corpora.
* **Contamination inflates reported capability in a way that's easy to miss without explicitly checking for it** — a contaminated score looks exactly like a genuine high score unless someone specifically goes looking for overlap.
* **It's closely related to [[Memorization and Training Data Leakage|memorization more broadly]]**: contamination is specifically the case where the memorized content happens to be benchmark material, making the resulting evaluation misleading rather than just a general privacy or copyright concern.

## Common pitfalls

* **Treating a high score as proof of contamination without checking overlap directly.** A model can genuinely be good at a benchmark's subject matter without having seen the exact questions — overlap checking distinguishes the two possibilities.
* **Assuming contamination only matters for exact-match questions.** Close paraphrases of benchmark questions, not just verbatim copies, can still meaningfully inflate scores if a model has effectively memorized the pattern.
* **Checking only a tiny sample of benchmark questions for overlap.** A thorough contamination audit needs to check a representative portion of the benchmark, not just a few spot checks, to produce a trustworthy overall assessment.

## Quick check

<details><summary>1. What does it mean for a benchmark to be "contaminated"?</summary>
That the benchmark's test examples, or close variants of them, appeared in the model's training data — meaning a high score may reflect memorization rather than genuine capability.
</details>

<details><summary>2. In the worked example, why did the clean document raise no contamination concern despite being on the same topic as the benchmark question?</summary>
Because topical similarity alone doesn't create n-gram overlap — the clean document shared no 5-grams with the question's actual phrasing, even though it discussed the same underlying subject.
</details>

<details><summary>3. Why is contamination checking essentially the same technique as deduplication?</summary>
Both use n-gram overlap to detect when two pieces of text are suspiciously similar — deduplication applies it to find near-duplicate documents within a corpus, while contamination checking applies it to compare specific benchmark questions against the training corpus.
</details>

## Key terms

* **Contamination:** when benchmark test material (or close variants) appears in a model's training data.
* **Leakage:** another term for the same phenomenon — evaluation material unintentionally present in training data.
* **Overlap check:** using n-gram similarity to detect suspicious overlap between a benchmark question and training text.

## Related

[[Benchmark Suites (MMLU, HELM, BIG-bench)]] · [[Data Deduplication and Quality Filtering]] · [[Memorization and Training Data Leakage]]
