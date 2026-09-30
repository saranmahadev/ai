A **logarithm** answers "what power do I raise this base to, to get that number?" `log₂ 8 = 3` because `2³ = 8`. Logarithms turn multiplication into addition and squash huge ranges into small ones, which is why they appear in loss functions, probabilities and information.

**You need:** [[Exponents and Roots]] and [[Scientific Notation and Scale]].

## The question it answers

"How many times must I multiply (or double) to get there?" It is the reverse of an exponent. If a power says "2 multiplied by itself 5 times gives 32", the logarithm says "to get 32 you need 5 doublings".

## Intuition: counting doublings

Start at 1 and keep doubling: 1, 2, 4, 8, 16, 32. Reaching 32 took 5 doublings, so `log₂ 32 = 5`. A logarithm counts *steps of multiplication* rather than the size itself, so a huge number needs only a few steps: a million is about 20 doublings, and a billion about 30.

## Definition

```text
logᵦ(x) = y    means    βʸ = x

log₂ 8    = 3     (2³ = 8)
log₁₀ 1000 = 3    (10³ = 1,000)
log_b 1   = 0     (b⁰ = 1)
log_b b   = 1
```

Common bases: **10** (common log), **2** (used for bits) and **e ≈ 2.71828** (the **natural log**, written `ln`). In machine-learning code, `log` almost always means the natural log.

## The key rules

```text
log(a × b) = log a + log b       multiplication becomes addition
log(a ÷ b) = log a − log b
log(aⁿ)   = n × log a            a power becomes a multiple
log_b(x) = ln(x) / ln(b)         change of base
```

The first rule is the exponent rule `aᵐ × aⁿ = aᵐ⁺ⁿ` read backwards. It is also why logarithms once powered slide rules, and why they help computers: sums are safer than products of tiny numbers (see [[Numerical Stability]]).

## A worked example

Take the product of three probabilities, each 0.001:

```text
0.001 × 0.001 × 0.001 = 0.000000001 = 10⁻⁹
```

With base-10 logs:

```text
log₁₀ 0.001 = −3
sum of three logs = −3 + −3 + −3 = −9        (and 10⁻⁹ is the product)
```

Adding −3 three times is easier and safer than multiplying tiny numbers.

Another: how many bits to number 1,000 items? `log₂ 1000 = ln 1000 / ln 2 = 6.9078 / 0.6931 ≈ 9.97`, so 10 bits (as in [[Exponents and Roots]]).

## Bench

```bench
id: log-mirror
title: Logarithm and exponent as mirrors
fallback: A slider picks a number; the bench shows how many doublings reach it, the matching logarithm in several bases, and a plot on a linear and a logarithmic axis.
```

**Try this**

1. Move the number to 8, 16, 1024. Read the number of doublings.
2. Switch the base from 2 to 10 to e. How do the values change, and how do they relate?
3. Turn on the logarithmic axis. What happens to the curve?
4. Try a number below 1. What sign does the logarithm take?

**What you should notice:** the logarithm grows slowly; each doubling of the number adds a constant amount. Numbers below 1 have negative logarithms.

## Where it appears in AI

* **Log-likelihood and cross-entropy** loss sum logarithms of probabilities (see [[Cross-Entropy]]).
* **Information** in bits is `−log₂ p` (see [[Surprise and Information]]).
* **Log scales** plot quantities spanning many orders of magnitude, like loss over training.
* **Softmax and log-sum-exp** rely on log and exp being inverses (see [[Numerical Stability]]).

## Common pitfalls

* **Taking the log of zero or a negative number.** It is undefined for real numbers.
* **`log(a + b) ≠ log a + log b`.** The rule is for products.
* **Mixing bases.** `ln`, `log₂` and `log₁₀` give different numbers for the same input.
* **Forgetting that `log x` grows without bound.** It is slow, not bounded.

## Quick check

<details><summary>1. What is log₂ 64?</summary>
6, since 2⁶ = 64.
</details>

<details><summary>2. Simplify log 5 + log 4.</summary>
log 20 (a sum of logs is the log of the product).
</details>

<details><summary>3. What is log₁₀ 0.01?</summary>
−2, since 10⁻² = 0.01.
</details>

## Key terms

* **Logarithm:** the exponent needed to reach a number from a base.
* **Natural logarithm (ln):** the logarithm with base e ≈ 2.718.
* **Base:** the number being raised to a power.
* **Change of base:** converting between logarithm bases.

## Related

[[Exponents and Roots]] · [[Exponential and Logarithmic Functions]] · [[Entropy]] · [[Cross-Entropy]] · [[Numerical Stability]]
