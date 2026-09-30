A **sequence** is an ordered list of numbers that follows a rule, and a **series** is what you get by adding its terms. Two sequences matter most: **arithmetic** (add a fixed step each time) and **geometric** (multiply by a fixed factor each time).

**You need:** [[Equations and Solving]] and [[Exponents and Roots]].

## The question it answers

"What is the pattern, what is the n-th term, and what do the first n terms add up to?" Training runs, learning-rate schedules and the sizes of network layers all form sequences.

## Intuition

* **Arithmetic:** 3, 7, 11, 15, 19, … Each term is 4 more than the last. Like climbing stairs of equal height.
* **Geometric:** 2, 6, 18, 54, … Each term is 3 times the last. Like a rumour that triples every hour.
* **Fibonacci:** 1, 1, 2, 3, 5, 8, … Each term is the sum of the previous two. A rule that refers to earlier terms is a **recurrence**.

## Formulas

Write the terms as `a₁, a₂, a₃, …`.

```text
arithmetic, step d:      aₙ = a₁ + (n − 1)·d
  sum of first n terms:  Sₙ = n/2 × (a₁ + aₙ)

geometric, ratio r:      aₙ = a₁ · rⁿ⁻¹
  sum of first n terms:  Sₙ = a₁ (rⁿ − 1) / (r − 1)     (r ≠ 1)
  if |r| < 1, the infinite sum is a₁ / (1 − r)
```

## A worked example

Arithmetic: `3, 7, 11, 15, 19`. Here `a₁ = 3`, `d = 4`.

```text
a₅ = 3 + 4 × 4 = 19
S₅ = 5/2 × (3 + 19) = 2.5 × 22 = 55       (3 + 7 + 11 + 15 + 19 = 55 ✓)
```

Geometric: `2, 6, 18, 54`. Here `a₁ = 2`, `r = 3`.

```text
a₄ = 2 × 3³ = 54
S₄ = 2 × (3⁴ − 1) / (3 − 1) = 2 × 80 / 2 = 80     (2 + 6 + 18 + 54 = 80 ✓)
```

An infinite geometric series can have a finite total: `1 + ½ + ¼ + ⅛ + … = 1 / (1 − ½) = 2`.

## Bench

```bench
id: sequence-stepper
title: Build a sequence
fallback: Choose arithmetic, geometric or Fibonacci, set the start and step or ratio, and step through the terms shown as bars, with the running total.
```

**Try this**

1. Pick arithmetic and change the step. What shape do the bars follow?
2. Switch to geometric with ratio 2, then ratio 0.5.
3. Compare the running total in each case.
4. Try the Fibonacci rule.

**What you should notice:** arithmetic sequences grow by equal steps, geometric ones by equal *factors*, and a ratio below 1 shrinks toward zero.

## Where it appears in AI

* **Learning-rate schedules** decay geometrically (`ηₙ = η₀ · 0.95ⁿ`).
* **Layer widths** often double at each stage (64, 128, 256, …).
* **Recurrences** underlie recurrent networks, where each step depends on the previous.
* **Discounted rewards** in reinforcement learning are a geometric series.

## Common pitfalls

* **Off-by-one in the n-th term.** The formula uses `n − 1` steps.
* **Confusing arithmetic and geometric growth.** One adds, one multiplies.
* **Using the infinite-sum formula when |r| ≥ 1.** It diverges.
* **Assuming a pattern from too few terms.** Many rules fit the same first few terms.

## Quick check

<details><summary>1. What is the 10th term of 5, 8, 11, …?</summary>
5 + 9 × 3 = 32.
</details>

<details><summary>2. What is the sum of 1 + 2 + 4 + 8 + 16?</summary>
31 (a₁ = 1, r = 2, n = 5: (2⁵ − 1)/(2 − 1) = 31).
</details>

<details><summary>3. What is 1 + ⅓ + ⅑ + … to infinity?</summary>
1 / (1 − ⅓) = 1.5.
</details>

## Key terms

* **Sequence:** an ordered list following a rule.
* **Series:** the sum of a sequence's terms.
* **Common difference / ratio:** the fixed step or factor.
* **Recurrence:** a rule defining each term from earlier ones.

## Related

[[Exponents and Roots]] · [[Sums and Products]] · [[Exponential and Logarithmic Functions]] · [[Markov Chains]]
