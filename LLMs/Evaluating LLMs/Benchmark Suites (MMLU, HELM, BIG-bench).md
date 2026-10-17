Comparing two LLMs fairly requires testing them on the same questions, under the same conditions, at a scale no individual could check by hand. A benchmark suite is exactly that: a large, standardized, repeatable test — but standardized testing has its own well-known blind spot.

**You need:** [[Test-Time Compute Scaling]].

## The question it answers

"How does the field actually measure and compare LLM capability at scale?" **Benchmark suites** (MMLU's broad academic-subject multiple choice, HELM's wide battery of tasks and metrics, BIG-bench's crowd-sourced diverse tasks, among many others) run a model against thousands of fixed questions spanning many categories, then report scores per category and an **overall average** across all of them. The overall average is convenient for ranking models at a glance — and it can also hide a serious weakness in one specific category behind strong performance everywhere else.

## Intuition

A student's overall GPA can look solidly good while hiding a single subject they're genuinely struggling in, if their other grades are strong enough to pull the average up. Anyone looking only at the GPA would never know; anyone looking at the full transcript, subject by subject, would catch it immediately. A benchmark's overall score works exactly the same way — it's a genuinely useful single number, but it's also a number specifically built to average away the detail a per-category breakdown would reveal.

## Definition and notation

```text
overall score = (1/k) · Σ scoreᵢ   across k categories

→ one low-scoring category, averaged with several high-scoring ones,
  can leave the overall score looking comfortably high
```

## A worked example

A toy model's scores across five benchmark categories:

```text
math:        0.85
reading:     0.82
coding:      0.88
safety_qa:   0.40   ← a real weakness
commonsense: 0.80

overall average: 0.750
```

The overall average of 0.750 looks like a solidly competent model — and by four of five categories, it is. But the `safety_qa` category sits at just 0.40, a serious weakness that the overall number alone gives no hint of at all. Anyone comparing models purely by their overall average would never notice this gap unless they specifically looked at the category breakdown.

## Bench

```bench
id: benchmark-category-breakdown
title: One weak score, hidden in the average
fallback: Adjust one category's score and watch how little it moves the overall average, even when that category is seriously weak.
```

**Try this**

1. Set the safety_qa score low and note the overall average.
2. Raise it toward the other categories' level and compare.
3. Consider how different the overall average would need to be before you'd suspect a hidden weak category.

**What you should notice:** the overall average changes only modestly even when one category swings dramatically — averaging across several categories is specifically what dampens the visibility of any single one.

## Where it appears in AI

* **Real benchmark reports (MMLU, HELM, BIG-bench and others) typically do publish per-category breakdowns alongside an overall score**, precisely because the overall number alone is known to obscure category-specific weaknesses.
* **[[Benchmark Contamination and Leakage|a benchmark's score is only meaningful if the model hasn't already seen the test questions]]** — a high score contaminated by leaked test data says nothing real about genuine capability.
* **[[Leaderboards and Their Limits|leaderboards built from these benchmarks]] inherit this same averaging problem**, often compounded by how different leaderboards choose to weight categories against each other.

## Common pitfalls

* **Ranking models purely by overall benchmark score, with no category breakdown.** The worked example shows exactly how a meaningful weakness can hide behind an otherwise-strong average.
* **Assuming a high overall score means uniformly strong performance.** It only means the *average* is high — individual categories can vary far more than the overall number suggests.
* **Treating benchmark categories as equally important for every use case.** A model's weak category might be entirely irrelevant for one application and critical for another — the right way to weigh categories depends on what the model will actually be used for.

## Quick check

<details><summary>1. Why can an overall benchmark average hide a serious weakness in one category?</summary>
Because averaging across several categories dampens the visibility of any single one — strong performance in most categories can pull the overall average up even when one specific category is seriously weak.
</details>

<details><summary>2. In the worked example, what was hidden behind the overall average of 0.750?</summary>
A safety_qa score of just 0.40, a real weakness, while the other four categories all scored 0.80 or above.
</details>

<details><summary>3. Why do real benchmark reports typically publish per-category breakdowns alongside an overall score?</summary>
Because the overall score alone is known to obscure category-specific weaknesses — a per-category breakdown is needed to actually see where a model is strong or weak.
</details>

## Key terms

* **Benchmark suite:** a large, standardized set of test questions used to measure and compare model capability.
* **Overall average:** a single score computed by averaging performance across all benchmark categories.
* **Category breakdown:** per-category scores that reveal strengths and weaknesses an overall average can hide.

## Related

[[Test-Time Compute Scaling]] · [[Benchmark Contamination and Leakage]] · [[Leaderboards and Their Limits]]
