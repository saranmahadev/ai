An **exponent** says how many times to multiply a number by itself, and a **root** undoes it. Powers are how quantities grow and shrink in AI: a network's layers, a learning rate that decays, and the count of possible inputs all use them.

**You need:** [[Order of Operations and Properties]].

## The question it answers

"What is repeated multiplication, and how do I reverse it?" Doubling something ten times is `2¹⁰`, and asking "what number times itself gives 49?" is a root.

## Intuition: repeated multiplication

```text
aⁿ = a × a × … × a      (n copies of a)
2⁵ = 2 × 2 × 2 × 2 × 2 = 32
```

Each extra power multiplies once more, so growth is fast: `2¹⁰ = 1,024` and `2²⁰ = 1,048,576`.

## The rules

```text
aᵐ × aⁿ = aᵐ⁺ⁿ            2³ × 2⁴ = 2⁷ = 128
aᵐ ÷ aⁿ = aᵐ⁻ⁿ            2⁷ ÷ 2⁴ = 2³ = 8
(aᵐ)ⁿ  = aᵐⁿ             (2³)² = 2⁶ = 64
a⁰     = 1                any number to the power 0
a⁻ⁿ    = 1 / aⁿ           2⁻³ = 1/8 = 0.125
a^(1/n) = ⁿ√a             9^(1/2) = √9 = 3
```

Multiplying powers with the same base **adds** the exponents. That single idea is why [[Logarithms]] turn multiplication into addition.

## Roots

The **square root** `√a` is the number that, multiplied by itself, gives `a`. `√49 = 7` because 7 × 7 = 49. The **cube root** `∛a` is the number that, multiplied by itself three times, gives `a`: `∛27 = 3`. Any root can be written as a fractional exponent: `√a = a^(1/2)`.

Negative numbers have no real square root, since a positive times itself and a negative times itself are both positive. Not every root is a whole number: `√2 ≈ 1.41421`, which is irrational (see [[Numbers and Their Kinds]]).

## A worked example

How many different 8-bit patterns exist? Each bit has 2 choices, and the choices multiply:

```text
2 × 2 × 2 × 2 × 2 × 2 × 2 × 2 = 2⁸ = 256
```

Going the other way, how many bits do you need for 1,000 different values? Since 2⁹ = 512 is too few and 2¹⁰ = 1,024 is enough, you need 10 bits. (That "how many doublings" question is exactly what [[Logarithms]] answer.)

Check a rule: `(2³)² = 8² = 64` and `2⁶ = 64`. ✓

## Bench

```bench
id: exponent-growth
title: Powers and roots
fallback: Sliders for a base and an exponent show the power as a growing bar, along with the matching root and the exponent rules worked with the chosen numbers.
```

**Try this**

1. Set base 2 and step the exponent up from 1 to 12. How does the bar grow?
2. Try base 0.5. What happens as the exponent grows?
3. Set the exponent to 0, then to a negative number.
4. Set the exponent to 0.5 and compare with the square root.

**What you should notice:** a base above 1 grows faster and faster, a base between 0 and 1 shrinks toward 0, and a negative exponent turns the power into a reciprocal.

## Where it appears in AI

* **Counting possibilities:** an image with 784 pixels of 256 levels has `256⁷⁸⁴` possible values.
* **Squared error** squares each miss, so big misses count much more.
* **Learning-rate decay** multiplies by a factor below 1 repeatedly (`0.9ⁿ`).
* **Vanishing and exploding gradients** are powers of numbers below or above 1 across many layers.

## Common pitfalls

* **Adding when you should multiply exponents.** `(a²)³ = a⁶`, not `a⁵`.
* **Distributing powers over addition.** `(a + b)² ≠ a² + b²`.
* **Forgetting the negative.** `2⁻³` is 1/8, not −8.
* **Taking the square root of a negative number** and expecting a real result.

## Quick check

<details><summary>1. What is 3⁴?</summary>
3 × 3 × 3 × 3 = 81.
</details>

<details><summary>2. Simplify 5² × 5³.</summary>
5⁵ = 3,125 (add the exponents).
</details>

<details><summary>3. What is 16^(1/2)?</summary>
4, since 4 × 4 = 16.
</details>

## Key terms

* **Exponent (power):** the number of times a base is multiplied by itself.
* **Base:** the number being multiplied.
* **Root:** the number that, raised to a power, gives a target.
* **Reciprocal:** `1/a`, the number that multiplies `a` to give 1.

## Related

[[Order of Operations and Properties]] · [[Scientific Notation and Scale]] · [[Logarithms]] · [[Exponential and Logarithmic Functions]]
