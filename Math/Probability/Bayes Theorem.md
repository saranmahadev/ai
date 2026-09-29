**Bayes' theorem** is the rule for updating how likely you think something is after you see new evidence. It explains why a positive result from a good medical test can still mean you are probably healthy, and it is the reasoning behind spam filters and many machine-learning methods.

**You need:** [[Probability Fundamentals]] (probabilities as numbers between 0 and 1) and [[Conditional Probability]] (the probability of one thing *given* another).

## The question it answers

You believe something with some confidence. Then you get a piece of evidence. How much should your belief change?

The answer has two ingredients: how likely the evidence would be *if you were right*, and how likely you thought you were right *before* the evidence. Bayes' theorem combines them.

## The formula

Call the thing you are unsure about **H** (a hypothesis, for example "I have the disease") and the evidence **E** (for example "the test is positive").

```text
P(H | E) = P(E | H) × P(H) / P(E)
```

Each part has a name:

| Part | Name | Plain meaning |
| --- | --- | --- |
| P(H) | **Prior** | how likely H is before the evidence |
| P(E \| H) | **Likelihood** | how likely this evidence is if H is true |
| P(E) | **Evidence** | how likely this evidence is overall |
| P(H \| E) | **Posterior** | how likely H is now, after the evidence |

The overall chance of the evidence adds up both ways it can happen: with H true, and with H false.

```text
P(E) = P(E | H) × P(H) + P(E | not H) × P(not H)
```

## A worked example: the medical test

A disease affects **1%** of people. A test catches **90%** of people who have it (this is its *sensitivity*), and wrongly flags **9%** of healthy people (its *false-positive rate*). You test positive. What is the chance you actually have the disease?

Most people guess about 90%. Count real people instead: take 1,000.

* **10** are sick. The test catches 90% of them: **9** true positives (and 1 missed).
* **990** are healthy. The test wrongly flags 9% of them: about **89** false positives.
* So about **98** people test positive, and only **9** of them are sick.

```text
P(sick | positive) = 9 / 98 ≈ 9%
```

The formula gives the same answer, more precisely:

```text
P(sick | positive) = (0.90 × 0.01) / (0.90 × 0.01 + 0.09 × 0.99) = 0.009 / 0.0981 ≈ 0.092
```

A positive result took you from a 1% prior to about 9%. That is a large jump, and yet you are still very probably healthy. The reason is the **base rate**: healthy people are so common that even a small false-positive rate produces far more false alarms than the rare disease produces true hits.

## Bench

```bench
id: bayes-frequency
title: 1,000 people, one test
fallback: A grid of 1,000 dots shows who is sick and who tests positive. Sliders set the disease rate, the test's sensitivity and its false-positive rate, and the page reports the chance that a positive result is a true case.
```

**Try this**

1. Press **Rare disease (1%)** and find the dots for false positives and true positives. Which colour dominates among people who tested positive?
2. Press **Common disease (30%)**. The test has not changed. What happened to the chance that a positive is a true case?
3. Press **Near-perfect test** (99% sensitivity, 1% false positives). Even so, is a positive result close to certain? Then drag the disease rate up and down.
4. Press **Spam filter (40% spam)**. Why does the same style of test work so much better here?

**What you should notice:** the same test gives very different answers depending on the prior. The test's accuracy is not the whole story; you must also ask how common the thing is.

## Updating again: the posterior becomes the next prior

Evidence can arrive in stages. After one positive test your belief is 9.2%. Treat that as the new prior and update again on a second, separate positive test.

The easiest way is with **odds**. Bayes' theorem becomes: posterior odds = prior odds × likelihood ratio, where the likelihood ratio here is 0.90 / 0.09 = 10.

```text
prior odds  = 0.01 / 0.99          ≈ 0.0101
after test 1: 0.0101 × 10          ≈ 0.101   (about 9.2%)
after test 2: 0.101  × 10          ≈ 1.01    (about 50%)
```

Two positives bring you to about 50%. This assumes the two tests err independently of each other, which is often not true in practice (a condition that confuses one test may confuse the other in the same way).

## Where it appears in AI

* **Naive Bayes classifiers** use exactly this rule to decide, for example, whether an email is spam given the words it contains. See [[Machine Learning]].
* **Bayesian thinking:** a model starts with prior beliefs about its parameters and updates them as data arrives.
* **Base rates in evaluation:** a classifier that is "95% accurate" may still produce mostly false alarms if the thing it hunts for is rare. It is the same effect as the medical test.
* **Probabilities and language:** the idea of turning uncertain evidence into updated probabilities recurs throughout [[LLMs]] and [[Agents]] that must weigh uncertain information.

## Common pitfalls

* **Confusing P(A | B) with P(B | A).** "Most sick people test positive" is not "most people who test positive are sick". This mix-up is sometimes called the prosecutor's fallacy.
* **Ignoring the prior (base-rate neglect).** A strong-looking test on a rare condition is often misleading.
* **Assuming separate pieces of evidence are independent.** If they share a cause, multiplying their effects overcounts.
* **A prior of exactly 0 (or 1) can never change.** No amount of evidence moves you; that is why priors are usually kept a little away from the extremes.

## Quick check

<details><summary>1. "The test is 99% accurate, so a positive means I'm 99% sure to be ill." What is missing?</summary>
The base rate (prior). If the illness is rare, many of the positives are false alarms. The chance depends on how common the illness is, on the sensitivity and on the false-positive rate together.
</details>

<details><summary>2. Your prior is 50% and the evidence is 4 times more likely if H is true. What is the posterior?</summary>
Prior odds are 1 : 1. Multiply by 4 to get 4 : 1, which is 4 / 5 = 80%.
</details>

<details><summary>3. If your prior for H is exactly 0, what is the posterior after any evidence?</summary>
It stays 0, because the formula multiplies by the prior P(H) = 0. No evidence can change a belief held with absolute certainty.
</details>

## Related

[[Probability Fundamentals]] · [[Conditional Probability]] · [[Probability Distributions]] · [[Machine Learning]]
