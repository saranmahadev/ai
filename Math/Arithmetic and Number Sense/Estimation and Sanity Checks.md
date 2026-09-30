**Estimation** is getting an answer that is close enough, quickly, and a **sanity check** is asking whether an answer is even plausible. Working models are full of numbers that are wrong by a factor of ten because of a slipped decimal or unit, and this habit catches them.

**You need:** [[Scientific Notation and Scale]] and [[Rounding, Absolute Value and Modulo]].

## The question it answers

"Is this number believable?" A model that reports 250% accuracy, a memory need of 3 bytes, or a probability of −0.2 is wrong before any code is inspected.

## Intuition: round first, calculate second

Replace awkward numbers by friendly ones and compute in your head:

```text
4,872 × 19.6      ≈  5,000 × 20  =  100,000       (exact: 95,491.2)
0.48 × 0.52       ≈  0.5 × 0.5   =  0.25          (exact: 0.2496)
```

The estimate does not have to be exact. It has to be close enough to tell you the **order of magnitude** and to reveal a mistake. If the exact answer was 9,549.12, the estimate 100,000 would tell you a digit was lost.

## Techniques

* **Round to one significant figure.** Turn 4,872 into 5,000.
* **Use powers of ten.** Work with the exponents (see [[Scientific Notation and Scale]]).
* **Bound it.** Find a number it must be larger than and one it must be smaller than.
* **Check units.** Metres per second times seconds gives metres.
* **Check limits.** A probability must lie in 0 to 1, an accuracy in 0% to 100%, a distance is not negative.
* **Fermi estimates.** Break a big unknown into pieces you can guess and multiply them.

## A worked example

How much memory does a model with 350 million parameters need, if each parameter takes 4 bytes?

```text
350 million ≈ 3.5 × 10⁸
3.5 × 10⁸ × 4 = 14 × 10⁸ = 1.4 × 10⁹ bytes ≈ 1.4 gigabytes
```

If your program says the model needs 1.4 kilobytes, or 140 gigabytes, the estimate says something is off by a factor of a million or a hundred.

Another check: a classifier reports 0.95 recall and 0.90 precision. Their harmonic mean (F1) must lie between them, so an answer of 0.5 or 1.2 is impossible.

## Bench

```bench
id: sanity-check
title: Plausible or off?
fallback: A short quiz of numeric claims about models and data; the reader judges each as plausible or off, then sees an order-of-magnitude estimate.
```

**Try this**

1. Answer using only rounding and powers of ten, no calculator.
2. Before choosing, write down the range you would expect.
3. Notice which claims break a hard limit (like probability above 1).

**What you should notice:** most wrong answers are wrong by a factor of ten or by a broken limit, which is easy to spot without exact arithmetic.

## Where it appears in AI

* **Debugging:** a loss of `NaN` or a probability above 1 is a red flag.
* **Capacity planning:** estimating parameters, memory and compute before running anything.
* **Reading results:** judging a claim in a paper or headline against its scale.

## Common pitfalls

* **Trusting a calculation because it printed.** Computers do exactly what they are told, including the wrong thing.
* **Confusing precision with accuracy.** Ten decimals do not make an answer right.
* **Skipping units.** Mixing megabytes and gigabytes is a factor of a thousand.
* **Rounding the wrong way twice.** Rounding both numbers up inflates a product; check the direction.

## Quick check

<details><summary>1. Estimate 312 × 48.</summary>
About 300 × 50 = 15,000 (exact 14,976).
</details>

<details><summary>2. A probability comes out as 1.3. What does that tell you?</summary>
It is impossible; something was computed or normalised wrongly.
</details>

<details><summary>3. Is 10 million parameters at 4 bytes about 40 MB?</summary>
Yes: 10⁷ × 4 = 4 × 10⁷ bytes = 40 MB.
</details>

## Key terms

* **Estimate:** an approximate answer good enough for a purpose.
* **Sanity check:** a quick test of whether an answer is plausible.
* **Order of magnitude:** the power of ten of a number.
* **Fermi estimate:** a rough answer built from a chain of guessable pieces.

## Related

[[Scientific Notation and Scale]] · [[Rounding, Absolute Value and Modulo]] · [[Reading Math Notation]] · [[Numerical Stability]]
