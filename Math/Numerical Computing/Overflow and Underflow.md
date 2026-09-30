**Overflow** happens when a result is too large to store and becomes infinity; **underflow** happens when it is too small and becomes zero. Both are common in machine learning, where exponentials and long products of probabilities quickly leave the representable range.

**You need:** [[Floating Point]], [[Exponents and Roots]] and [[Logarithms]].

## The question it answers

"Why did my loss turn into `inf` or `NaN`, or my probability into exactly zero?" Usually a number left the range a floating-point type can hold.

## Intuition: a fixed-size box

Each float type has a largest and a smallest positive value. Going beyond the top gives `inf`; going below the smallest gives `0`. Then further arithmetic on those values gives `NaN` ("not a number"): `inf − inf`, `0 · inf` and `inf / inf` are all `NaN`.

```text
float64:  largest ≈ 1.8 × 10³⁰⁸,   smallest positive ≈ 5 × 10⁻³²⁴     e^x overflows for x > about 709.78
float32:  largest ≈ 3.4 × 10³⁸,    smallest normal   ≈ 1.2 × 10⁻³⁸     e^x overflows for x > about 88.7
```

## Two classic cases

**Exponentials grow fast.** `e^710` is already `inf` in float64, and `e^89` in float32. A softmax that exponentiates raw scores can blow up (see [[Numerical Stability]]).

**Products of small probabilities vanish.** The probability of a sequence is a product of many numbers below 1. Multiply 400 probabilities of 0.1:

```text
0.1 × 0.1 × … (400 times) = 10⁻⁴⁰⁰   →  underflows to 0 in float64
```

The exact value is not representable, but its **logarithm** is perfectly ordinary:

```text
log(10⁻⁴⁰⁰) = 400 × log(0.1) = 400 × (−2.3026) = −921.03
```

So instead of multiplying probabilities, add their logs. That is why models compute log-probabilities and losses like cross-entropy, and why [[Logarithms]] turning products into sums is a practical necessity, not just a trick.

## A worked example

```text
170! ≈ 7.26 × 10³⁰⁶      fits in float64
171! ≈ 1.24 × 10³⁰⁹      overflows (larger than 1.8 × 10³⁰⁸)  → inf
```

Computing a binomial coefficient `C(1000, 500)` as `1000! / (500! · 500!)` overflows at the very first step, even though the answer, about `2.7 × 10²⁹⁹`, barely fits. Compute with logs (`lgamma`) and exponentiate at the end.

## Bench

```bench
id: exp-blowup
title: Where the numbers run out
fallback: A slider raises the argument of the exponential and a choice picks float32 or float64; the bench shows where e to the x becomes infinite, and a second control multiplies many small probabilities to show underflow next to the safe sum of logarithms.
```

**Try this**

1. In float64, raise x until `e^x` becomes infinity.
2. Repeat in float32 and compare the threshold.
3. Multiply 50, 200, then 400 probabilities of 0.1.
4. Compare the product with the sum of logs.

**What you should notice:** exponentials overflow at surprisingly small arguments, long products of probabilities underflow to zero, and log-space keeps working.

## Where it appears in AI

* **Softmax and cross-entropy** are computed in log-space for safety.
* **Likelihoods of long sequences** are always handled as log-likelihoods.
* **Half-precision training** overflows sooner, which is why loss scaling exists.

## Common pitfalls

* **Exponentiating large scores directly.**
* **Multiplying many probabilities** instead of summing logs.
* **Ignoring `NaN` warnings,** which spread once they appear.
* **Assuming float32 has the same range as float64.**

## Quick check

<details><summary>1. What does inf − inf give?</summary>
NaN.
</details>

<details><summary>2. How do you safely compute the product of 500 probabilities?</summary>
Sum their logarithms.
</details>

<details><summary>3. At about what argument does e^x overflow in float64?</summary>
About 709.8.
</details>

## Key terms

* **Overflow:** a result too large to store, becoming infinity.
* **Underflow:** a result too small to store, becoming zero.
* **NaN:** the value of an undefined operation such as `inf − inf`.
* **Log-space:** working with logarithms of values to avoid extremes.

## Related

[[Floating Point]] · [[Logarithms]] · [[Numerical Stability]] · [[Permutations and Combinations]] · [[Loss Functions]]
