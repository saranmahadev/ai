A few discrete distributions describe most counting situations. **Bernoulli** is a single yes/no trial, **binomial** counts the yeses in a fixed number of independent trials, and **Poisson** counts rare events over a period of time. Knowing their formulas lets you answer "how likely is exactly this many?" directly.

**You need:** [[Random Variables]], [[Permutations and Combinations]] and [[Independence]].

## The question it answers

"How many successes should I expect, and how likely is each count?" Emails that are spam in a batch of 10, users who click among 1,000 visitors, requests that arrive in a second.

## The distributions

**Bernoulli(p):** one trial, success with probability `p`.

```text
P(X = 1) = p        P(X = 0) = 1 − p        mean p        variance p(1 − p)
```

**Binomial(n, p):** the number of successes in `n` independent Bernoulli(p) trials.

```text
P(X = k) = C(n, k) · pᵏ · (1 − p)ⁿ⁻ᵏ        mean n·p        variance n·p·(1 − p)
```

The `C(n, k)` counts the ways to place `k` successes among `n` trials (see [[Permutations and Combinations]]).

**Poisson(λ):** the number of events in a fixed interval when events occur independently at an average rate `λ`.

```text
P(X = k) = e⁻ᵛ · λᵏ / k!        (with v = λ)        mean λ        variance λ
```

## A worked example

Five fair coin flips: `Binomial(5, 0.5)`.

```text
P(exactly 2 heads) = C(5,2) · 0.5² · 0.5³ = 10 / 32 = 0.3125
```

A spam filter sees 10 emails, each 30% spam, independent: `Binomial(10, 0.3)`.

```text
P(exactly 3 spam) = C(10,3) · 0.3³ · 0.7⁷ = 120 × 0.027 × 0.0823543 ≈ 0.2668
mean = 10 × 0.3 = 3        variance = 10 × 0.3 × 0.7 = 2.1
```

A help desk gets on average 2 calls a minute: `Poisson(2)`.

```text
P(no calls)   = e⁻² = 0.1353
P(2 calls)    = e⁻² · 2² / 2! = 0.1353 × 2 = 0.2707
```

## Bench

```bench
id: discrete-dist
title: Bernoulli, binomial and Poisson
fallback: Choose Bernoulli, binomial or Poisson and set its parameters; the bench draws the probability of each count as bars and shows the mean and variance, marking one count whose exact probability is listed.
```

**Try this**

1. On the binomial, set n = 10 and vary p from 0.1 to 0.9.
2. Increase n and watch the bars become bell-shaped.
3. Switch to Poisson and compare it with a binomial with large n and small p.
4. Read off P(exactly k) for a chosen k.

**What you should notice:** the binomial's centre is np, its bars widen with n, and a Poisson looks like a binomial with many trials and a tiny success chance.

## Where it appears in AI

* **Binary labels** are Bernoulli variables, and log loss is their negative log-likelihood.
* **Counting events** (clicks, arrivals, word counts) use binomial and Poisson models.
* **Dropout** keeps each unit with a Bernoulli probability.
* **Evaluating a classifier** on `n` examples: the number correct is roughly binomial.

## Common pitfalls

* **Assuming independence** when trials influence each other.
* **Forgetting the `C(n, k)`** factor.
* **Using a Poisson for counts with a fixed maximum.**
* **Confusing the mean of a binomial** (`np`) with the probability `p`.

## Quick check

<details><summary>1. What is the mean of Binomial(20, 0.25)?</summary>
5.
</details>

<details><summary>2. What is P(0 heads) in 3 fair flips?</summary>
1/8 = 0.125.
</details>

<details><summary>3. What are the mean and variance of Poisson(4)?</summary>
Both equal 4.
</details>

## Key terms

* **Bernoulli trial:** one experiment with two outcomes.
* **Binomial distribution:** the number of successes in `n` independent trials.
* **Poisson distribution:** counts of rare independent events in an interval.
* **Rate (λ):** the average number of events per interval.

## Related

[[Random Variables]] · [[Permutations and Combinations]] · [[Independence]] · [[Continuous Distributions]] · [[Central Limit Theorem]]
