An **integral** adds up a quantity that changes continuously: the **area under a curve**. It is the reverse of differentiation, and it turns rates into totals: speed into distance, a probability density into a probability.

**You need:** [[Derivatives]], [[Sums and Products]] and [[Areas, Volumes and Scaling]].

## The question it answers

"If I know how fast something is changing, how much has it accumulated?" A speed graph's area is the distance travelled, and a probability density's area is the chance of landing in a range.

## Intuition: slice into thin bars

Cut the region under a curve into thin rectangles and add up their areas. The thinner the bars, the better the total. The exact area is the limit as the bars become infinitely thin:

```text
∫ₐᵇ f(x) dx = lim (n → ∞) Σ f(xᵢ) · Δx        Δx = (b − a) / n
```

The integral sign is a stretched "S" for sum, and `dx` marks the width of the tiny bars.

## The fundamental theorem

Differentiation and integration undo each other. If `F′(x) = f(x)` ( `F` is an **antiderivative** of `f`), then:

```text
∫ₐᵇ f(x) dx = F(b) − F(a)
```

So you can find areas by reversing derivative rules: since `d/dx (x³/3) = x²`, an antiderivative of `x²` is `x³/3`.

## A worked example

The area under `f(x) = x²` from 0 to 2. Exact answer: `F(2) − F(0) = 8/3 − 0 = 2.667`.

Approximate with 4 bars (each of width `0.5`):

```text
left ends  (0, 0.5, 1, 1.5):      (0 + 0.25 + 1 + 2.25) × 0.5   = 1.75    (underestimate)
right ends (0.5, 1, 1.5, 2):      (0.25 + 1 + 2.25 + 4) × 0.5   = 3.75    (overestimate)
midpoints  (0.25, 0.75, 1.25, 1.75): (0.0625 + 0.5625 + 1.5625 + 3.0625) × 0.5 = 2.625
```

The midpoint estimate `2.625` is already close to `2.667`, and more bars improve all three. Area below the axis counts as negative.

## Bench

```bench
id: area-accumulator
title: Add up thin bars under a curve
fallback: Choose a function and a number of bars and a left, right or midpoint rule; the bench draws the bars, shows the approximate total, the exact area and the error.
```

**Try this**

1. Use 4 bars with left and right ends and compare with the exact value.
2. Increase the number of bars and watch the error shrink.
3. Switch to the midpoint rule.
4. Try a function that goes below the axis.

**What you should notice:** more bars mean less error, and the exact integral is what the sums approach.

## Where it appears in AI

* **Probability:** areas under density curves give probabilities (see [[Continuous Distributions]]).
* **Expectations of continuous variables** are integrals (see [[Expectation]]).
* **Total loss over a continuous range** and normalising constants.
* **Monte Carlo methods** approximate integrals by random sampling.

## Common pitfalls

* **Forgetting that area below the axis is negative.**
* **Confusing the integral with the antiderivative.** One is a number, one a function.
* **Using too few bars** and trusting the estimate.
* **Forgetting `dx`** (it tells you the variable and the bar width).

## Quick check

<details><summary>1. What is ∫₀³ 2 dx?</summary>
6 (a rectangle 3 wide and 2 tall).
</details>

<details><summary>2. What is an antiderivative of 3x²?</summary>
x³.
</details>

<details><summary>3. What is ∫₀¹ x dx?</summary>
1/2 (a triangle with base 1 and height 1).
</details>

## Key terms

* **Integral:** the area under a curve.
* **Antiderivative:** a function whose derivative is the given one.
* **Riemann sum:** a sum of thin bar areas.
* **Fundamental theorem of calculus:** `∫ f = F(b) − F(a)`.

## Related

[[Derivatives]] · [[Sums and Products]] · [[Continuous Distributions]] · [[Expectation]] · [[Areas, Volumes and Scaling]]
