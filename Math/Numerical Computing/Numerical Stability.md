A formula that is correct on paper can give wrong answers on a computer, because rounding errors get magnified. **Numerical stability** means rewriting a calculation, without changing its value, so that those errors stay small. Two rewrites do most of the work in machine learning: subtract the maximum before exponentiating (stable softmax and log-sum-exp) and avoid subtracting nearly equal numbers.

**You need:** [[Floating Point]], [[Overflow and Underflow]] and [[Exponential and Logarithmic Functions]].

## The question it answers

"The maths is right, so why is the answer `NaN` or garbage?" Because the order and form of the arithmetic matter when numbers have finite precision.

## Stable softmax and log-sum-exp

The softmax turns scores `zᵢ` into probabilities: `pᵢ = e^zᵢ / Σ e^zⱼ`. With scores near 1,000, every `e^z` overflows and the result is `inf / inf = NaN`.

The fix uses the fact that dividing top and bottom by the same number changes nothing. Subtract the largest score `m` from every score first:

```text
pᵢ = e^(zᵢ − m) / Σ e^(zⱼ − m)          the largest exponent is now e⁰ = 1: no overflow
log Σ e^zⱼ  =  m + log Σ e^(zⱼ − m)      log-sum-exp
```

Result: exactly the same probabilities, computed safely.

## A worked example

Scores `z = (1000, 1001, 1002)`:

```text
naive:  e^1000 = inf, so every ratio is inf / inf = NaN
stable: m = 1002, shifted scores (−2, −1, 0)
        e^ = (0.1353, 0.3679, 1.0000),  sum = 1.5032
        softmax = (0.0900, 0.2447, 0.6652)
        log-sum-exp = 1002 + ln 1.5032 = 1002.408
```

Note the softmax of `(1000, 1001, 1002)` equals that of `(−2, −1, 0)`: softmax ignores a constant shift.

## Catastrophic cancellation

Subtracting two nearly equal numbers wipes out the leading digits they share, leaving mostly rounding error. Computing a variance as `E[x²] − (E[x])²` for data like `100,000,001, 100,000,002, 100,000,003` subtracts two enormous, nearly equal numbers and can give a wrong or even negative variance. The two-pass form, `Σ (x − mean)²`, subtracts first and squares the small differences, and is stable.

Other standard tricks: use `log1p(x)` instead of `log(1 + x)` for tiny `x`, compute log-probabilities directly (a fused log-softmax) rather than `log(softmax(z))`, and clip probabilities away from exactly 0 and 1 before taking logs.

## Bench

```bench
id: softmax-stability
title: Naive versus stable softmax
fallback: Sliders set three scores and an offset added to all of them; the bench computes the softmax the naive way and the stable way, in float32 or float64, and shows where the naive version turns to NaN while the stable one is unchanged.
```

**Try this**

1. With a zero offset, compare the two answers.
2. Raise the offset toward 1,000 and watch the naive version break.
3. Switch to float32 and find where it breaks sooner.
4. Confirm the stable answer does not depend on the offset.

**What you should notice:** softmax is unchanged by adding a constant to all scores, yet the naive formula fails when the scores are large, and the shifted formula never does.

## Where it appears in AI

* **Every softmax, cross-entropy and attention layer** uses the shifted form.
* **Log-sum-exp** appears in probabilistic models and normalising constants.
* **Batch statistics** use stable running means and variances.

## Common pitfalls

* **`log(softmax(z))`** computed in two steps instead of a fused log-softmax.
* **Variance by `E[x²] − mean²`** on data with a large mean.
* **`log(0)`** from probabilities that underflowed.
* **Assuming a mathematically equal formula is numerically equal.**

## Quick check

<details><summary>1. Does softmax change if you add 100 to every score?</summary>
No.
</details>

<details><summary>2. What do you subtract before exponentiating in a stable softmax?</summary>
The largest score.
</details>

<details><summary>3. Why is E[x²] − mean² risky?</summary>
It subtracts two nearly equal large numbers, losing precision.
</details>

## Key terms

* **Numerical stability:** small input or rounding errors stay small.
* **Log-sum-exp:** `log Σ e^z`, computed as `m + log Σ e^(z − m)`.
* **Catastrophic cancellation:** losing digits by subtracting nearly equal numbers.
* **log1p:** an accurate `log(1 + x)` for small `x`.

## Related

[[Overflow and Underflow]] · [[Floating Point]] · [[Exponential and Logarithmic Functions]] · [[Softmax and Cross-Entropy in Practice]] · [[Variance and Standard Deviation]]
