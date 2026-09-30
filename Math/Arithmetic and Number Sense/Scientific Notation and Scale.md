**Scientific notation** writes a number as a digit-and-decimal part times a power of ten, so `6,000,000` becomes `6 × 10⁶` and `0.00042` becomes `4.2 × 10⁻⁴`. It makes numbers that differ by many **orders of magnitude** easy to read and compare.

**You need:** [[Exponents and Roots]].

## The question it answers

"How do I write and compare numbers that are enormously large or tiny?" A large language model has about 10¹¹ parameters, a small learning rate is 10⁻⁴, and a probability of a specific 100-token sentence may be smaller than 10⁻²⁰⁰. Plain digits do not survive at those sizes.

## Intuition: count the zeros

Each power of ten moves the decimal point one place:

```text
10³ = 1,000        10⁻³ = 0.001
10⁶ = 1,000,000    10⁻⁶ = 0.000001
```

Scientific notation puts one non-zero digit before the point and lets the exponent carry the size:

```text
34,500      = 3.45 × 10⁴        (point moved 4 places left)
0.0072      = 7.2  × 10⁻³       (point moved 3 places right)
```

An **order of magnitude** is a factor of 10. A number that is 10⁵ is "five orders of magnitude" above 1. Comparing exponents tells you at a glance which number is bigger and roughly by how much.

## Rules

```text
(a × 10ᵐ) × (b × 10ⁿ) = (a·b) × 10ᵐ⁺ⁿ
(a × 10ᵐ) ÷ (b × 10ⁿ) = (a/b) × 10ᵐ⁻ⁿ
```

Add exponents when multiplying, subtract when dividing, then tidy so the front part is between 1 and 10.

## A worked example

A model has 7 × 10⁹ parameters, each stored in 4 bytes. How much memory?

```text
7 × 10⁹  ×  4  =  28 × 10⁹  =  2.8 × 10¹⁰ bytes
```

Since 10⁹ bytes is a gigabyte, that is 28 gigabytes.

Comparing scales: a learning rate of 10⁻³ is 100 times larger than 10⁻⁵, because the exponents differ by 2 and each step is a factor of 10.

Many benches and tools also print numbers in **e-notation**: `2.8e10` means 2.8 × 10¹⁰ and `4.2e-4` means 4.2 × 10⁻⁴.

## Bench

```bench
id: scale-zoom
title: Zoom across orders of magnitude
fallback: A slider moves across powers of ten from 10⁻¹⁵ to 10²⁶ and shows the number in scientific notation, in full digits, and an example of something at that scale.
```

**Try this**

1. Slide from small to large and watch the exponent change.
2. Find the power of ten closest to the width of a human hair.
3. Compare two scales that differ by 6 exponents. How many times bigger is one?
4. Watch the plain-digit form stop being readable as the exponent grows.

**What you should notice:** each step of the exponent is a factor of ten, so a wide range of sizes fits on a short slider once you count in exponents.

## Where it appears in AI

* **Parameter counts** are quoted as 10⁹ (billion) or 10¹² (trillion).
* **Learning rates and tolerances** are small powers of ten like 10⁻³ or 10⁻⁸.
* **Probabilities of long sequences** get so small that models work with their logarithms instead (see [[Numerical Stability]]).
* **Compute budgets** are counted in FLOPs (floating-point operations) such as 10²³.

## Common pitfalls

* **Losing a sign on the exponent.** 10⁻³ is tiny; 10³ is large.
* **Mixing units.** A kilobyte, megabyte and gigabyte differ by 10³ each (or 2¹⁰ in some conventions).
* **Forgetting to renormalise.** `12 × 10⁵` is `1.2 × 10⁶`.
* **Reading e-notation as a base.** `1e5` is 100,000, not "1 to the 5".

## Quick check

<details><summary>1. Write 45,000 in scientific notation.</summary>
4.5 × 10⁴.
</details>

<details><summary>2. Compute (2 × 10³) × (3 × 10⁴).</summary>
6 × 10⁷.
</details>

<details><summary>3. How many times larger is 10⁻² than 10⁻⁵?</summary>
1,000 times (3 orders of magnitude).
</details>

## Key terms

* **Scientific notation:** a number as `a × 10ⁿ` with `1 ≤ a < 10`.
* **Order of magnitude:** a factor of ten.
* **E-notation:** the same thing written `aeN`.
* **Exponent:** here, the power of ten that sets the scale.

## Related

[[Exponents and Roots]] · [[Logarithms]] · [[Numerical Stability]] · [[Estimation and Sanity Checks]]
