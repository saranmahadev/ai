A **hypothesis test** asks whether a result could plausibly be due to chance alone. You assume a boring **null hypothesis** (no effect), work out how surprising your data would be under it, and report that as a **p-value**: the probability of a result at least as extreme as yours *if the null were true*.

**You need:** [[Central Limit Theorem]], [[Continuous Distributions]] and [[Conditional Probability]].

## The question it answers

"Is this difference real, or could luck explain it?" A new model scores 60% and the old scored 50% on the same 100 cases. Was the gain real?

## Intuition: how surprising is the data if nothing is going on?

1. State the **null hypothesis** `H₀` (for a coin: it is fair).
2. Choose a **test statistic** (number of heads).
3. Ask: if `H₀` were true, how often would we see a result this extreme or more? That fraction is the **p-value**.
4. If the p-value is small (below a chosen **significance level** such as 0.05), the data would be surprising under `H₀`, and we **reject** it.

A small p-value means "the data is unlikely if the null is true". It does **not** mean "the null is unlikely" or "the effect is large or important".

## A worked example

A coin lands heads 60 times in 100 flips. Under `H₀` (fair coin) the number of heads has mean `50` and standard deviation `√(100 × 0.5 × 0.5) = 5`.

```text
z = (60 − 50) / 5 = 2
two-sided p-value = P(|Z| ≥ 2) ≈ 0.046
```

(Exact binomial calculation gives about 0.057; the normal approximation is close.) At the 0.05 level the normal calculation just rejects fairness, while the exact one just fails to: a reminder that 0.05 is a convention, not a cliff, and that a result near the line is weak evidence either way.

Notice two effects. More data makes the same fraction more convincing: 600 heads in 1,000 flips gives `z = 6.3`, an astronomically small p-value. And a tiny real difference becomes "significant" with enough data, even if it matters little: **statistical significance is not practical importance**.

## Bench

```bench
id: null-distribution
title: Simulate the null world
fallback: Set the number of flips and the observed heads; the bench simulates thousands of experiments with a fair coin, draws the histogram of head counts, shades results at least as extreme as yours and reports the simulated and normal-approximation p-values.
```

**Try this**

1. With 100 flips, set the observed heads to 60 and read the p-value.
2. Slide to 55, then 65.
3. Increase the flips while keeping 60% heads.
4. Find the smallest observed count that gives p < 0.05.

**What you should notice:** the same 60% heads is unremarkable with 10 flips and very surprising with 1,000, because the null distribution narrows with more data.

## Where it appears in AI

* **Comparing models:** is the accuracy gain larger than noise?
* **A/B tests** in products and experiments.
* **Feature significance** in statistical models.

## Common pitfalls

* **Reading the p-value as the probability that the null is true.**
* **Treating 0.05 as a magic line.**
* **Confusing significant with important.**
* **Testing many things** and reporting the winner (see [[Common Test Mistakes]]).

## Quick check

<details><summary>1. What does a p-value of 0.01 mean?</summary>
If the null were true, results this extreme would occur about 1% of the time.
</details>

<details><summary>2. Does p = 0.03 prove the effect is large?</summary>
No: it says nothing about size.
</details>

<details><summary>3. What happens to the p-value of a fixed fraction of heads as flips increase?</summary>
It gets smaller.
</details>

## Key terms

* **Null hypothesis:** the "no effect" assumption.
* **p-value:** the probability of data at least this extreme if the null is true.
* **Significance level (α):** the threshold below which we reject the null.
* **Test statistic:** the number summarising the data for the test.

## Related

[[Central Limit Theorem]] · [[Continuous Distributions]] · [[Confidence Intervals]] · [[Common Test Mistakes]] · [[Measuring Performance]]
