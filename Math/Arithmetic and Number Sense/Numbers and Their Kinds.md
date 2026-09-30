Numbers come in nested families: **natural** numbers for counting, **integers** that add negatives, **rational** numbers that are fractions, and **real** numbers that fill the whole number line. Knowing which family a quantity belongs to tells you what you can do with it, and what a computer can and cannot store exactly.

## The question it answers

"What kind of number is this, and does it matter?" It matters more than it seems. A count of images can never be 2.5, a temperature can be negative, and the value of π can never be written out in full. Models handle all of these, so it helps to know the families.

## Intuition: rooms that contain each other

Think of four rooms, each inside the next:

* **Natural numbers** (ℕ): 1, 2, 3, … the numbers you count with. (Some books also include 0; this site does not, and says so when it matters.)
* **Integers** (ℤ): the naturals, zero and the negatives: …, −2, −1, 0, 1, 2, … Every natural number is an integer.
* **Rational numbers** (ℚ): anything that can be written as a fraction of two integers, like ½, −¾ or 7 (which is 7/1). Every integer is rational.
* **Real numbers** (ℝ): every point on the number line. This adds the **irrational** numbers such as √2 and π, which cannot be written as a fraction of integers.

## Definition and notation

```text
ℕ ⊂ ℤ ⊂ ℚ ⊂ ℝ         (⊂ means "is contained in")
rational:   p / q  with integers p and q, q ≠ 0
irrational: a real number that is not rational
```

A rational number written as a decimal either stops (0.75) or repeats forever (0.333…). An irrational number's decimal never stops and never repeats.

## A worked example

Classify each number by the **smallest** family that contains it:

```text
7      → natural  (also an integer, rational, real)
−3     → integer  (not natural: it is negative)
0.75   → rational (it equals 3/4)
22/7   → rational (a fraction, even though it is close to π)
√2     → irrational (about 1.41421356…, never repeating)
π      → irrational (about 3.14159265…)
```

Note that 22/7 ≈ 3.142857 is only *close* to π ≈ 3.141593. A fraction can approximate an irrational number but never equal it.

## Bench

```bench
id: number-kinds
title: Which family is it?
fallback: A sorting exercise: place numbers such as 7, −3, 0.75, √2 and π into the smallest family that contains them (natural, integer, rational, irrational), then check your answers.
```

**Try this**

1. Place the easy ones first (7, −3), then the fractions.
2. Which numbers look rational but might be a trap? Read the explanation after checking.
3. Restart and try again without looking at the hints.

**What you should notice:** a number's family depends on what it *equals*, not how it is written. √9 looks like a root but equals 3, a natural number.

## Where it appears in AI

* **Counts** (words in a document, pixels in an image) are natural numbers or integers.
* **Model weights** and activations are real numbers, stored on a computer as close rational approximations (see [[Floating Point]]).
* **Category labels** are often integers, but they are *names*, not quantities: label 3 is not "more" than label 1.

## Common pitfalls

* **Treating labels as quantities.** Averaging the labels 1 (cat), 2 (dog), 3 (bird) is meaningless.
* **Thinking 0.999… differs from 1.** They are the same number.
* **Assuming a computer stores reals exactly.** It stores only a finite set of rationals; see [[Floating Point]].
* **Forgetting that dividing integers can leave the family.** 3 ÷ 2 is not an integer.

## Quick check

<details><summary>1. What is the smallest family that contains −5?</summary>
The integers. It is negative, so it is not natural.
</details>

<details><summary>2. Is 0.125 rational?</summary>
Yes. It stops, and equals 1/8.
</details>

<details><summary>3. Is √16 irrational?</summary>
No. √16 = 4, a natural number.
</details>

## Key terms

* **Natural number:** a counting number: 1, 2, 3, …
* **Integer:** a whole number, positive, negative or zero.
* **Rational number:** a number that can be written as a fraction of two integers.
* **Irrational number:** a real number that is not rational, like √2 or π.
* **Real number:** any point on the number line.

## Related

[[Fractions, Ratios and Percentages]] · [[Exponents and Roots]] · [[Floating Point]] · [[Sets and Operations]]
