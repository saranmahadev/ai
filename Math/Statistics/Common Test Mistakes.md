Statistical tests are easy to misuse. Running many tests and reporting the winners, trying analyses until one works (**p-hacking**), and stopping an experiment when it looks good all produce "significant" findings that are really chance. Knowing the traps is what keeps evaluations honest.

**You need:** [[Hypothesis Testing and P-values]] and [[Independence]].

## The question it answers

"How do I avoid fooling myself?" With enough tries, luck will always produce something that looks like a discovery.

## Multiple comparisons

A 5% significance level means a true-null test has a 5% chance of a false alarm. Run `m` independent tests where nothing is going on:

```text
P(at least one false positive) = 1 − (1 − 0.05)ᵐ
m = 1:   5.0%        m = 10:  40.1%        m = 20:  64.2%        m = 100:  99.4%
```

Test 20 jelly-bean colours for a link to acne and you should expect about one "significant" colour by chance alone. A simple fix is the **Bonferroni correction**: require `p < α / m` for each test (0.05 / 20 = 0.0025).

## Other common traps

* **p-hacking:** trying different variables, subgroups, exclusions or cut-offs until p < 0.05 and reporting only that.
* **Peeking:** checking results repeatedly and stopping as soon as p dips below 0.05 inflates false positives.
* **Base-rate neglect:** if few hypotheses are true, most "significant" findings are false (the same logic as [[Bayes Theorem]]).
* **Confusing absence of evidence with evidence of absence:** a non-significant result on small data may just mean low **power**, the chance of detecting a real effect.
* **Using the test set repeatedly** while tuning a model: it stops being independent data.

## A worked example

You compare a new model with the old one on 20 different data slices, testing each at `α = 0.05`. Suppose the models are actually identical.

```text
expected false positives = 20 × 0.05 = 1
P(at least one "significant" slice) = 1 − 0.95²⁰ = 0.642
```

If you report only the slice where the new model "wins significantly", you have a 64% chance of a fake headline. With the Bonferroni threshold `0.0025`, the chance of a false positive across all 20 drops to about `1 − 0.9975²⁰ ≈ 4.9%`.

## Bench

```bench
id: jelly-bean
title: Twenty tests on pure noise
fallback: Choose how many tests to run on random data with no real effect; the bench draws p-values, marks those below 0.05, and shows how often at least one appears over many repetitions, with and without the Bonferroni correction.
```

**Try this**

1. Run 20 tests. How many "discoveries" appear?
2. Run it several times and see how often at least one shows up.
3. Turn on Bonferroni and repeat.
4. Increase the number of tests to 100.

**What you should notice:** with many tests, false positives are practically guaranteed, and a stricter threshold restores control.

## Where it appears in AI

* **Benchmark chasing:** picking the best of many runs or seeds.
* **Hyperparameter search** on a fixed validation set.
* **Subgroup analyses** in fairness audits.
* **Leaderboards:** repeated submissions overfit to the test set.

## Common pitfalls

* **Reporting only significant results.**
* **Not counting the tests you tried.**
* **Peeking and stopping early.**
* **Ignoring power** on small samples.

## Quick check

<details><summary>1. Ten independent null tests at α = 0.05. Chance of at least one false positive?</summary>
1 − 0.95¹⁰ ≈ 40%.
</details>

<details><summary>2. What is the Bonferroni threshold for 5 tests at α = 0.05?</summary>
0.01.
</details>

<details><summary>3. What is p-hacking?</summary>
Trying analyses until a significant result appears, then reporting it.
</details>

## Key terms

* **Multiple comparisons problem:** false positives multiplying with the number of tests.
* **Bonferroni correction:** dividing α by the number of tests.
* **p-hacking:** analysing until a result is significant.
* **Power:** the chance of detecting a real effect.

## Related

[[Hypothesis Testing and P-values]] · [[Independence]] · [[Bayes Theorem]] · [[Generalization]] · [[Overfitting in Statistics]]
