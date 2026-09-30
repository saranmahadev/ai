Computers store real numbers in **floating point**: a fixed number of significant binary digits and an exponent. Most decimal fractions, even 0.1, cannot be stored exactly, so every calculation carries tiny rounding errors, and the gap between neighbouring representable numbers grows with the size of the number.

**You need:** [[Numbers and Their Kinds]], [[Scientific Notation and Scale]] and [[Rounding, Absolute Value and Modulo]].

## The question it answers

"Why does `0.1 + 0.2` not equal `0.3` in code, and how much can I trust a computed number?" Every model weight and activation is a floating-point value, so their limits shape training.

## Intuition: scientific notation in binary

A floating-point number is `± mantissa × 2^exponent`. The **mantissa** holds a fixed number of significant bits, so precision is *relative*: about the same number of significant digits at every scale, not the same absolute gap.

```text
float64 ("double"): 53 significant bits ≈ 15–16 decimal digits,  range up to about 1.8 × 10³⁰⁸
float32 ("float"):  24 significant bits ≈  7 decimal digits,     range up to about 3.4 × 10³⁸
float16 (half):     11 significant bits ≈  3 decimal digits,     range up to about 65,504
machine epsilon: the gap just above 1  →  2.2 × 10⁻¹⁶ (float64),  1.2 × 10⁻⁷ (float32)
```

Just as 1/3 cannot be written exactly in decimal (0.3333…), 1/10 cannot be written exactly in binary (0.000110011…), so 0.1 is stored as the nearest representable number.

## The gap grows with the number

Near 1, float64 numbers are about `2.2 × 10⁻¹⁶` apart. Near `10¹⁶` the gap is 2. So adding 1 to `10¹⁶` changes nothing: the exact sum is not representable and rounds back.

## A worked example

```text
0.1 + 0.2        = 0.30000000000000004      (not exactly 0.3)
0.1 + 0.2 == 0.3 → false
10¹⁶ + 1         = 10¹⁶                     (the 1 is lost; spacing there is 2)
(1e16 + 1) − 1e16 = 0, but 1 + (1e16 − 1e16) = 1     order of operations matters
```

Two lessons: **never compare floats with `==`** (use a tolerance such as `abs(a − b) < 1e-9`), and **adding numbers of very different sizes loses the small ones**. Sum a long list from smallest to largest, or use compensated summation, when accuracy matters.

Float32 has far fewer digits: in float32, `16,777,217` (2²⁴ + 1) is not representable, so `16,777,216 + 1 = 16,777,216`. That is why training sometimes uses float32 accumulators even when the weights are stored in half precision.

## Bench

```bench
id: precision-zoom
title: How finely can numbers be told apart?
fallback: A slider picks a magnitude and a precision (float32 or float64); the bench shows the gap between neighbouring numbers there, the relative gap, whether adding 1 changes the number, and the famous 0.1 plus 0.2 example.
```

**Try this**

1. In float64, slide the magnitude up and watch the gap between neighbours grow.
2. Find the size where adding 1 stops changing the number.
3. Switch to float32 and compare.
4. Read the value stored for 0.1 in each precision.

**What you should notice:** the *relative* gap stays about constant, the absolute gap grows with the number, and float32 loses 1 far sooner than float64.

## Where it appears in AI

* **Mixed-precision training** stores weights in float16 or bfloat16 to save memory, and accumulates in float32.
* **Loss and gradient spikes** can come from lost precision.
* **Reproducibility:** summing in a different order gives slightly different results.

## Common pitfalls

* **Comparing floats with `==`.**
* **Subtracting nearly equal numbers,** which cancels the correct digits (see [[Numerical Stability]]).
* **Accumulating a huge sum in low precision.**
* **Assuming decimal fractions are exact.**

## Quick check

<details><summary>1. Why is 0.1 + 0.2 not exactly 0.3 in code?</summary>
0.1, 0.2 and 0.3 cannot be stored exactly in binary, and the rounding errors do not cancel.
</details>

<details><summary>2. How should you compare two floats?</summary>
Check whether their difference is smaller than a tolerance.
</details>

<details><summary>3. Which has more precision, float32 or float64?</summary>
float64.
</details>

## Key terms

* **Floating point:** storing a number as mantissa times a power of two.
* **Machine epsilon:** the gap between 1 and the next representable number.
* **Precision (float16/32/64):** the number of significant bits.
* **Rounding error:** the difference between the true value and the stored one.

## Related

[[Scientific Notation and Scale]] · [[Rounding, Absolute Value and Modulo]] · [[Overflow and Underflow]] · [[Numerical Stability]]
