A test set, synthetic or hand-written, measures a RAG system against questions someone anticipated. Real users ask questions nobody anticipated, and their actual satisfaction — a thumbs up, a follow-up question, abandoning the chat — is the measurement that ultimately matters. A/B testing is how you tell whether a change actually helped real users, rather than just scoring better on a fixed benchmark.

**You need:** [[Hypothesis Testing and P-values]], [[End-to-End RAG Evaluation Frameworks]].

## The question it answers

"How do you know a change to a RAG system actually improved things for real users, rather than looking better on paper?" An A/B test routes real traffic to two variants of the system and compares a real outcome metric (thumbs-up rate, follow-up rate) between them. The same [[Hypothesis Testing and P-values|hypothesis-testing]] logic already covered in Math applies directly: an observed difference between two variants' rates isn't automatically trustworthy — it needs enough sample size for the difference to be statistically distinguishable from noise.

## Intuition

Noticing that a coin landed heads 6 times out of 10 flips doesn't prove it's biased — flip it 10,000 times, and a similarly lopsided ratio would be far more convincing. The same logic applies to comparing two RAG variants: a gap that looks real after 100 user interactions each might just be noise, while the identical gap after thousands of interactions each becomes a real signal.

## Definition and notation

```text
z = (p1 − p2) / standard_error(p1, p2, n1, n2)
|z| ≥ 1.96 is the usual cutoff for statistical significance at the 95% confidence level
```

## A worked example

Two RAG variants, A (62% thumbs-up rate) and B (70% thumbs-up rate), tested at two different sample sizes:

```text
n = 100 per variant:   |z| = 1.194  →  not significant at 95% confidence
n = 2,000 per variant: |z| = 5.340  →  significant at 95% confidence
```

The exact same 8-percentage-point gap between A and B isn't trustworthy at a small sample size — it could plausibly be noise. At a larger sample size, the same gap crosses well past the significance threshold, becoming strong evidence that B genuinely performs better, not just that this particular batch of 100 users happened to prefer it.

## Bench

```bench
id: ab-test-significance
title: The same gap, more or less convincing
fallback: Slide sample size and watch the same observed difference between two RAG variants cross the significance threshold.
```

**Try this**

1. Start at a small sample size and note the gap isn't significant.
2. Slide sample size up and watch the z-score cross the 1.96 threshold.
3. Imagine shipping variant B based on the small-sample result alone — what's the risk?

**What you should notice:** the *observed* rates (62% vs. 70%) never change as you slide the sample size — only the *confidence* that this gap reflects something real, rather than noise, changes.

## Where it appears in AI

* **This is a direct application of [[Hypothesis Testing and P-values]]**, already covered in depth in Math — this topic is specifically about applying that logic to RAG variant comparisons, not re-deriving significance testing.
* **An A/B test's outcome metric is often a proxy for exactly what [[Faithfulness and Answer Relevancy Metrics]] measures offline** (a thumbs-up roughly correlating with a relevant, faithful answer) — online evaluation checks whether offline metrics actually predict real user satisfaction.
* **[[Synthetic Test-Set Generation for RAG]] and A/B testing are complementary, not competing**: a synthetic test set catches regressions before deployment; A/B testing catches whether a change that passed offline evaluation actually helps real users.

## Common pitfalls

* **Shipping a change based on a small-sample A/B result that "looks" better.** The worked example's small-sample scenario shows the exact same gap that's meaningful at scale can be statistically indistinguishable from noise with too few observations.
* **Running an A/B test and stopping it as soon as the result looks significant.** Checking significance repeatedly during a test and stopping at the first significant-looking moment inflates the false-positive rate — a pre-committed sample size or duration avoids this.
* **Using an outcome metric that doesn't actually reflect what matters.** A thumbs-up rate is a proxy, not a direct measure of correctness — a system that produces confidently wrong but satisfying-sounding answers could score well on this proxy while actually performing poorly.

## Quick check

<details><summary>1. In the worked example, why does the same 8-percentage-point gap between variants A and B become significant only at the larger sample size?</summary>
Statistical significance depends on whether an observed difference is large relative to the *noise* expected from sampling variation, and that noise shrinks as sample size grows — the same absolute gap becomes more and more unlikely to be pure chance as more observations back it up.
</details>

<details><summary>2. What's the risk of shipping a change based on a small, not-yet-significant A/B result?</summary>
The observed improvement might be due to random variation in which users happened to be in each group, rather than the change actually being better — shipping on this basis risks rolling out a change that doesn't actually help, or even hurts, real usage.
</details>

<details><summary>3. Why are A/B testing and offline evaluation (synthetic test sets, the end-to-end scorecard) both still useful, rather than one replacing the other?</summary>
Offline evaluation is fast, repeatable, and catches regressions before anything reaches real users; A/B testing is slower and requires real traffic, but checks whether offline improvements actually translate into better real-world outcomes — each covers a gap the other leaves open.
</details>

## Key terms

* **A/B testing:** comparing two system variants by routing real traffic to each and measuring an outcome metric.
* **Online evaluation:** measuring a system against real user behavior, as opposed to a fixed offline test set.
* **Statistical significance:** whether an observed difference is large enough, relative to sample size, to be distinguishable from random noise.

## Related

[[Hypothesis Testing and P-values]] · [[End-to-End RAG Evaluation Frameworks]] · [[Synthetic Test-Set Generation for RAG]]
