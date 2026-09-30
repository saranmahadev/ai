**Bayes' theorem** is the rule for updating how likely you think something is after you see new evidence: `P(H | E) = P(E | H) · P(H) / P(E)`. It explains why a positive result from a good medical test can still mean you are probably healthy, and it is the reasoning behind spam filters and many machine-learning methods.

**You need:** [[Conditional Probability]] and [[Probability Rules]].

## The question it answers

"Given what I just saw, how likely is the cause?" Tests, filters and sensors report `P(evidence | cause)`: how often the test is positive *for a sick person*. What we want is the reverse, `P(cause | evidence)`: how likely a positive person is *sick*.

## Intuition: count the people

Imagine 1,000 people. Suppose 1% are sick, the test catches 90% of the sick, and it wrongly flags 9% of the healthy.

```text
sick:     1% of 1,000     = 10      of whom 90% test positive → 9   true positives
healthy:  990                       of whom  9% test positive → 89  false positives (89.1)
positives in total: 9 + 89 = 98
chance a positive is sick = 9 / 98 ≈ 9.2%
```

Most positives are false alarms, because the healthy crowd is so much larger. The test is good, but the disease is rare.

## The formula

Start from the multiplication rule `P(H and E) = P(E | H) P(H) = P(H | E) P(E)` and divide by `P(E)`:

```text
P(H | E) = P(E | H) · P(H) / P(E)
P(E)     = P(E | H) · P(H) + P(E | not H) · P(not H)
```

The pieces have names: `P(H)` is the **prior** (belief before evidence), `P(E | H)` the **likelihood**, and `P(H | E)` the **posterior** (belief after).

## A worked example: a spam filter

40% of email is spam. The word "prize" appears in 95% of spam and in 2% of legitimate email. An email contains "prize". How likely is it spam?

```text
P(E) = 0.95 × 0.4 + 0.02 × 0.6 = 0.38 + 0.012 = 0.392
P(spam | "prize") = 0.38 / 0.392 ≈ 0.969
```

The same word gives 97% here because spam is common (a high prior). For the rare disease above, the same arithmetic gives 9%. **The prior matters as much as the test.**

## Bench

```bench
id: bayes-frequency
title: 1,000 people, one test
fallback: A grid of 1,000 dots coloured by disease status and test result; sliders for how many are sick, how well the test catches them, and how often it flags the healthy show the chance a positive is truly sick.
```

**Try this**

1. Start with the rare disease. Count true and false positives.
2. Raise the prior to 30%. What happens to the chance a positive is sick?
3. Improve the test's false-positive rate. Which matters more, catching the sick or not flagging the healthy?
4. Try the spam-filter preset.

**What you should notice:** when the condition is rare, false positives from the big healthy group swamp the true positives, unless the false-positive rate is tiny.

## Where it appears in AI

* **Naive Bayes classifiers** multiply likelihoods and priors to classify text.
* **Bayesian updating** refines a belief as data arrives, batch by batch.
* **Probabilistic reasoning** in diagnosis, robotics and recommendation.
* **Reading accuracy claims:** a "99% accurate" detector can still be wrong most times it fires if the target is rare.

## Common pitfalls

* **Confusing `P(E | H)` with `P(H | E)`,** the base-rate fallacy.
* **Ignoring the prior.**
* **Forgetting the false-positive term** in `P(E)`.
* **Applying it with dependent evidence as if independent.**

## Quick check

<details><summary>1. Prior 1%, sensitivity 90%, false-positive rate 9%: roughly how likely is a positive to be sick?</summary>
About 9%: 9 true positives out of about 98 positives.
</details>

<details><summary>2. What are prior, likelihood and posterior?</summary>
Belief before evidence, the chance of the evidence under the hypothesis, and belief after evidence.
</details>

<details><summary>3. If the disease is common, what happens to the chance a positive is truly sick?</summary>
It rises.
</details>

## Key terms

* **Bayes' theorem:** `P(H | E) = P(E | H) P(H) / P(E)`.
* **Prior:** the probability before seeing evidence.
* **Likelihood:** the probability of the evidence given the hypothesis.
* **Posterior:** the probability after seeing evidence.
* **Base rate:** how common the hypothesis is overall.

## Related

[[Conditional Probability]] · [[Independence]] · [[Probability Rules]] · [[Bayesian vs Frequentist]] · [[Where AI Goes Wrong]]
