An **exponential function** `f(t) = a·bᵗ` multiplies by the same factor every step, so it grows (or decays) faster and faster. Its inverse, the **logarithmic function**, grows slower and slower. Together they describe compounding, decay, probabilities and learning curves.

**You need:** [[Exponents and Roots]], [[Logarithms]] and [[Graphs and Transformations]].

## The question it answers

"What happens when the change is proportional to the current size?" A savings account, a virus, a network's signal passing through layers and a radioactive sample all follow this pattern.

## Intuition: growth that feeds itself

A linear function adds the same *amount* each step. An exponential multiplies by the same *factor* each step, so bigger values grow by more. Start at 100 and grow 5% per year:

```text
year 0: 100       year 1: 105       year 2: 110.25       year 14: about 198
```

If the base `b` is above 1 it **grows**; if `b` is between 0 and 1 it **decays**.

## Definition

```text
f(t) = a · bᵗ           a = starting amount, b = factor per step
natural exponential:    eᵗ      where e ≈ 2.71828
inverse:                logᵦ(x) = the t with bᵗ = x
```

The number **e** is the base for which growth at any moment is proportional to the current value at the smoothest possible rate; that is why the natural exponential and natural log (`ln`) dominate calculus and machine learning.

Half-life and **doubling time** are two natural questions. Doubling time solves `bᵗ = 2`:

```text
t = ln 2 / ln b
```

## A worked example

Money grows by 5% a year: `f(t) = 100 × 1.05ᵗ`.

```text
f(14) = 100 × 1.05¹⁴ ≈ 100 × 1.9799 = 197.99
doubling time = ln 2 / ln 1.05 = 0.6931 / 0.04879 ≈ 14.2 years
```

Decay works the same way: a model's error shrinking 10% per epoch follows `E(t) = E₀ × 0.9ᵗ`; after 10 epochs it is `0.9¹⁰ ≈ 0.349` of the start.

The logarithm is the mirror image: it takes the *size* and returns the *number of steps*. `log₁.₀₅ 2 ≈ 14.2` is the doubling time again.

## Bench

```bench
id: growth-decay
title: Linear, polynomial and exponential growth
fallback: Sliders set a starting value and growth rates; the plot compares linear, quadratic and exponential growth on a linear or logarithmic vertical axis, with a doubling-time readout.
```

**Try this**

1. Start with equal values and watch which curve overtakes the others.
2. Switch to a logarithmic vertical axis: what shape does the exponential become?
3. Set a factor below 1 to see decay.
4. Read off the doubling time for different growth rates.

**What you should notice:** an exponential eventually beats any polynomial, and on a log axis it becomes a straight line.

## Where it appears in AI

* **Softmax** uses `eˣ` to turn scores into positive weights (see [[Softmax and Cross-Entropy in Practice]]).
* **Learning-rate decay** and **discounting** are exponential.
* **Log-likelihood** turns products of probabilities into sums.
* **Vanishing and exploding gradients:** repeated multiplication by a factor below or above 1.

## Common pitfalls

* **Confusing "grows fast" with linear.** Exponentials accelerate.
* **Reading percentages as additive.** 5% per year twice is 10.25%, not 10%.
* **Forgetting that `e^(−t)` decays.** The sign of the exponent matters.
* **Taking log of a non-positive number.** Undefined for real numbers.

## Quick check

<details><summary>1. What is 3 × 2⁴?</summary>
48.
</details>

<details><summary>2. A quantity halves every step. What is b?</summary>
0.5.
</details>

<details><summary>3. What is ln(e³)?</summary>
3.
</details>

## Key terms

* **Exponential function:** `a·bᵗ`, multiplying by a fixed factor each step.
* **Growth / decay:** base above 1 or between 0 and 1.
* **e:** the natural base, about 2.71828.
* **Doubling time / half-life:** steps to double or halve.

## Related

[[Exponents and Roots]] · [[Logarithms]] · [[Composition and Inverses]] · [[Functions AI Loves]] · [[Derivatives of Exp, Log and Sigmoid]]
