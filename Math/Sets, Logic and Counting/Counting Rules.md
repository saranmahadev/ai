**Counting** answers "how many ways can this happen?" without listing them all. Two rules do most of the work: the **multiplication rule** (do this, then that: multiply) and the **addition rule** (do this or that: add). Probability is built on top of counting.

**You need:** [[Sets and Operations]] and [[Exponents and Roots]].

## The question it answers

"How many possibilities are there?" How many passwords, how many possible outputs, how many ways to split data. Knowing the count tells you whether brute force is even possible.

## Intuition: a tree of choices

Choose a shirt (3 options), then trousers (4 options). For each shirt there are 4 trouser choices, so there are `3 × 4 = 12` outfits. Add shoes (2 options): `3 × 4 × 2 = 24`. Independent choices **multiply**.

If instead you are choosing *one thing from two separate lists*, such as one drink from 5 teas or 3 coffees, the ways **add**: `5 + 3 = 8`.

## The rules

```text
multiplication:  n₁ × n₂ × … × nₖ          (a sequence of independent choices)
addition:        n₁ + n₂                   (either-or, with no overlap)
inclusion–exclusion:  |A ∪ B| = |A| + |B| − |A ∩ B|
repeated choices:     nᵏ                   (k choices, n options each)
```

## A worked example

A password has 3 letters (26 options each), then 2 digits (10 options each):

```text
26 × 26 × 26 × 10 × 10 = 17,576 × 100 = 1,757,600
```

An 8-bit string has `2⁸ = 256` possibilities. A four-letter lowercase word has up to `26⁴ = 456,976` combinations.

**Overlap:** how many numbers from 1 to 20 are multiples of 2 or 3? Multiples of 2: 10. Multiples of 3: 6. Multiples of both (6): 3. So `10 + 6 − 3 = 13`. Adding without subtracting would count 6, 12 and 18 twice.

## Bench

```bench
id: counting-tree
title: A tree of choices
fallback: Sliders set how many options there are at each of three stages; a branching tree is drawn and the total number of outcomes is shown as the product.
```

**Try this**

1. Set the stages to 3, 4 and 2. Count the leaves and compare with the product.
2. Add one option to the last stage. How many leaves does it add?
3. Set a stage to 1: what happens?
4. Try equal stages (say 2, 2, 2) and compare with 2³.

**What you should notice:** every extra stage multiplies the total, so counts grow very quickly.

## Where it appears in AI

* **Search spaces:** the number of possible moves, paths or hyperparameter combinations.
* **Probability** with equally likely outcomes is a ratio of counts (see [[Events and Sample Spaces]]).
* **Combinatorial explosion:** why exhaustive search stops working ([[Growth Rates and Big-O]]).

## Common pitfalls

* **Adding when you should multiply.** A sequence of choices multiplies.
* **Forgetting overlaps** in either-or counts.
* **Assuming choices are independent** when earlier ones limit later ones.
* **Underestimating how fast `nᵏ` grows.**

## Quick check

<details><summary>1. How many 2-digit codes use digits 0–9?</summary>
10 × 10 = 100.
</details>

<details><summary>2. 4 starters and 5 mains: how many meals with one of each?</summary>
20.
</details>

<details><summary>3. How many binary strings of length 10?</summary>
2¹⁰ = 1,024.
</details>

## Key terms

* **Multiplication rule:** independent choices multiply.
* **Addition rule:** either-or choices add.
* **Inclusion–exclusion:** subtracting overlaps when adding counts.
* **Combinatorial explosion:** counts growing too fast to enumerate.

## Related

[[Sets and Operations]] · [[Permutations and Combinations]] · [[Events and Sample Spaces]] · [[Growth Rates and Big-O]]
