**Summation** (`Σ`) and **product** (`Π`) notation write a long repeated addition or multiplication in one short line. They are literally a loop: "for each i from a to b, add (or multiply) this in". Almost every loss and score in machine learning is a `Σ`.

**You need:** [[Reading Math Notation]] and [[Sequences and Series]].

## The question it answers

"How do I write 'add up all of these' compactly and unambiguously?" Averaging a model's error over a million examples needs a notation that scales.

## Intuition: a for-loop in symbols

```text
     4
     Σ  i²   =  1² + 2² + 3² + 4²  =  1 + 4 + 9 + 16  =  30
    i=1
```

Read it as: "start with `i = 1`, compute `i²`, add it to the total, increase `i` by 1, and stop after `i = 4`." The letter `i` is the **index**, and the numbers below and above are where it starts and stops. In code:

```text
total = 0
for i in 1..4: total = total + i²
```

`Π` works the same way with multiplication: `Π i (i = 1 to 4) = 1 × 2 × 3 × 4 = 24`. This is 4 **factorial**, written `4!`.

## Rules

```text
Σ (a·xᵢ)     = a · Σ xᵢ              constants factor out
Σ (xᵢ + yᵢ)  = Σ xᵢ + Σ yᵢ           sums split
Σ 1 (i = 1..n) = n
Σ i  (i = 1..n) = n(n + 1) / 2
log Π xᵢ     = Σ log xᵢ              a product of numbers becomes a sum of logs
```

The last rule (see [[Logarithms]]) is why log-likelihoods are sums.

## A worked example

Gauss's trick: add 1 to 100. Pair them: `1 + 100 = 101`, `2 + 99 = 101`, and so on, giving 50 pairs.

```text
Σ i (i = 1 to 100) = 100 × 101 / 2 = 5,050
```

Averages use sums: the mean of `x₁ … xₙ` is `(1/n) Σ xᵢ`. For the values 4, 8, 6: `(4 + 8 + 6) / 3 = 6`.

A weighted sum: `ŷ = Σ wᵢ xᵢ + b` with `w = (2, 1, 0.5)`, `x = (4, 3, 2)`, `b = 1` gives `8 + 3 + 1 + 1 = 13`.

## Bench

```bench
id: sum-loop
title: Sum as a loop
fallback: Choose a term (i, i squared or 2 to the i), a range, and Σ or Π, then step through the loop watching the running total build.
```

**Try this**

1. Step through `Σ i` for n = 5, and compare with `n(n + 1)/2`.
2. Switch the term to `i²`.
3. Switch to `Π` and watch the running product.
4. Move the upper limit and see how quickly each grows.

**What you should notice:** a sum is a loop with a running total, and a product grows much faster than a sum of the same terms.

## Where it appears in AI

* **Mean squared error:** `(1/n) Σ (ŷᵢ − yᵢ)²`.
* **Dot products:** `Σ aᵢ bᵢ` (see [[Dot Product]]).
* **Likelihood:** a product of probabilities, turned into a sum with logs.
* **Softmax** divides by `Σ eˣʲ`.

## Common pitfalls

* **Wrong limits.** `i` from 0 to n has n + 1 terms.
* **Pulling non-constants out of a sum.** Only constants factor out.
* **Confusing Σ of a product with a product of Σs.** `Σ aᵢbᵢ ≠ (Σ aᵢ)(Σ bᵢ)`.
* **Forgetting that the index is a dummy name.** `Σ i` and `Σ j` are the same sum.

## Quick check

<details><summary>1. Compute Σ i for i = 1 to 6.</summary>
21 (6 × 7 / 2).
</details>

<details><summary>2. Compute Π i for i = 1 to 5.</summary>
120 (that is 5!).
</details>

<details><summary>3. Write the mean of x₁ … xₙ using Σ.</summary>
(1/n) Σ xᵢ.
</details>

## Key terms

* **Summation (Σ):** the sum of a list of terms.
* **Product (Π):** the product of a list of terms.
* **Index:** the counter running from the lower to the upper limit.
* **Factorial (n!):** the product 1 × 2 × … × n.

## Related

[[Sequences and Series]] · [[Reading Math Notation]] · [[Logarithms]] · [[Dot Product]] · [[Expectation]]
