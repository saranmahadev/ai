Four small operations show up constantly: **rounding** (to the nearest whole number or a set of decimals), **floor and ceiling** (always down or always up), **absolute value** (distance from zero) and **modulo** (the remainder after division, which wraps around like a clock).

**You need:** [[Numbers and Their Kinds]] and [[Order of Operations and Properties]].

## The question it answers

"How do I turn a messy number into a tidy one, and how do I measure size regardless of sign?" These operations turn continuous values into whole steps, measure errors, and make indices wrap around.

## Intuition

**Rounding** picks the nearest value at some precision. 3.14159 rounded to two decimals is 3.14. A halfway value such as 2.5 needs a tie rule: many programming languages round halves to the nearest *even* number, so 2.5 becomes 2 and 3.5 becomes 4. Others round halves up.

**Floor** ⌊x⌋ always goes down and **ceiling** ⌈x⌉ always goes up: ⌊3.7⌋ = 3, ⌈3.2⌉ = 4, and for negatives ⌊−2.3⌋ = −3. **Truncation** simply drops the decimal part: trunc(−2.3) = −2. Floor and truncation differ for negative numbers.

**Absolute value** |x| is the distance from zero, so it is never negative: |−5| = 5 = |5|. The distance between two numbers is |a − b|.

**Modulo** `a mod n` is the remainder when `a` is divided by `n`. Picture a clock: 14 o'clock is 2 o'clock, because `14 mod 12 = 2`. The result always lies from 0 up to `n − 1`.

## Definitions

```text
round(x)   nearest integer            round(2.4) = 2, round(2.6) = 3
⌊x⌋        largest integer ≤ x        ⌊−2.3⌋ = −3
⌈x⌉        smallest integer ≥ x       ⌈−2.3⌉ = −2
|x|        x if x ≥ 0, else −x        |−7.5| = 7.5
a mod n    a − n × ⌊a / n⌋            17 mod 5 = 2
```

## A worked example

You have 17 items to pack into boxes of 5.

```text
full boxes  = ⌊17 / 5⌋ = 3
left over   = 17 mod 5 = 2
boxes needed in total = ⌈17 / 5⌉ = 4
```

Check: `3 × 5 + 2 = 17`. ✓

A prediction of 8.4 for a true value of 10 has error `|8.4 − 10| = 1.6`. A prediction of 11.5 has error `|11.5 − 10| = 1.5`. The absolute value lets over- and under-shoot count equally.

## Bench

```bench
id: rounding-dial
title: Round, floor, ceiling, absolute value and modulo
fallback: A slider picks a number; the bench shows its rounded, floor, ceiling, truncated and absolute values, and a clock face showing the result of modulo for a chosen divisor.
```

**Try this**

1. Move the number through 2.5 and 3.5 and watch how rounding handles the tie.
2. Slide into negative numbers. Where do floor and truncation disagree?
3. Change the modulo divisor and watch the clock hand wrap.
4. Compare |x| with x for negatives.

**What you should notice:** floor, ceiling and truncation agree for positive numbers and split for negatives. Modulo always lands on the clock, however large the input.

## Where it appears in AI

* **Absolute error** (`|prediction − truth|`) and its cousins measure how wrong a model is (see [[Loss Functions]]).
* **Quantisation** rounds weights to a few bits to shrink models.
* **Batching and padding** use floor, ceiling and modulo to split data into chunks.
* **Circular buffers and positional patterns** use modulo to wrap around.

## Common pitfalls

* **Floor vs truncation for negatives.** ⌊−2.3⌋ = −3 but trunc(−2.3) = −2.
* **Assuming "round half up".** Languages differ; check the tie rule.
* **Modulo of a negative number.** Conventions differ between languages; `−1 mod 5` is 4 in maths and Python, but −1 in some others.
* **Thinking |a − b| ≠ |b − a|.** They are equal.

## Quick check

<details><summary>1. What are ⌊4.9⌋ and ⌈4.1⌉?</summary>
4 and 5.
</details>

<details><summary>2. What is 23 mod 7?</summary>
2 (23 = 3 × 7 + 2).
</details>

<details><summary>3. What is |3 − 9|?</summary>
6.
</details>

## Key terms

* **Rounding:** replacing a number by the nearest one at a chosen precision.
* **Floor and ceiling:** the nearest integer below and above.
* **Absolute value:** a number's distance from zero.
* **Modulo:** the remainder after division.

## Related

[[Numbers and Their Kinds]] · [[Estimation and Sanity Checks]] · [[Loss Functions]] · [[Floating Point]]
