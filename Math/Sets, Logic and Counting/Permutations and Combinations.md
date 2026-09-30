A **permutation** counts arrangements where **order matters**, and a **combination** counts selections where **order does not matter**. The number of ways to choose `k` items from `n` is written `C(n, k)` ("n choose k"), and these numbers, the **binomial coefficients**, appear throughout probability.

**You need:** [[Counting Rules]] and [[Sums and Products]].

## The question it answers

"In how many ways can I arrange or pick items?" Ranking three finalists is a permutation problem, and choosing a committee of three is a combination problem.

## Intuition

Line up 3 people (A, B, C). The first place has 3 choices, the second 2, the third 1: `3 × 2 × 1 = 6` orderings. That product is `3!` ("3 factorial").

```text
n! = n × (n − 1) × … × 2 × 1          0! = 1
```

To pick an ordered top-2 out of 5, use the first two slots: `5 × 4 = 20`. To pick an unordered *pair*, divide out the orderings of the two chosen: each pair was counted `2! = 2` times, so `20 / 2 = 10`.

## Formulas

```text
permutations (order matters):     P(n, k) = n! / (n − k)!
combinations (order ignored):     C(n, k) = n! / (k! · (n − k)!)
symmetry:                         C(n, k) = C(n, n − k)
```

Binomial coefficients form **Pascal's triangle**, where each entry is the sum of the two above it:

```text
row 0:        1
row 1:       1 1
row 2:      1 2 1
row 3:     1 3 3 1
row 4:    1 4 6 4 1
row 5:  1 5 10 10 5 1
```

Row `n` lists `C(n, 0), C(n, 1), … , C(n, n)`, and each row sums to `2ⁿ`.

## A worked example

```text
P(5, 2) = 5!/3! = 120/6 = 20         ordered pairs from 5
C(5, 2) = 5!/(2!·3!) = 120/12 = 10   unordered pairs from 5
```

Choosing a 5-card poker hand from 52 cards:

```text
C(52, 5) = 52·51·50·49·48 / 120 = 2,598,960
```

If you flip a coin 5 times, the number of sequences with exactly 2 heads is `C(5, 2) = 10`, out of `2⁵ = 32` equally likely sequences, so the probability is `10/32 = 0.3125`.

## Bench

```bench
id: arrangement-counter
title: Permutations, combinations and Pascal's triangle
fallback: Sliders for n and k show the number of ordered and unordered selections, n factorial, and highlight the matching entry of Pascal's triangle.
```

**Try this**

1. Set n = 5, k = 2 and compare P and C.
2. Move k across its range for n = 6. Where is C largest?
3. Watch the highlighted entry in Pascal's triangle.
4. Compare C(n, k) with C(n, n − k).

**What you should notice:** ordered counts are k! times bigger than unordered ones, and combinations peak in the middle and are symmetric.

## Where it appears in AI

* **Binomial probabilities** count success patterns (see [[Discrete Distributions]]).
* **Train/test splits and sampling** choose subsets without order.
* **Feature subsets:** `C(n, k)` ways to pick k of n features shows why exhaustive selection is expensive.

## Common pitfalls

* **Using permutations when order does not matter** (or the reverse).
* **Forgetting 0! = 1.**
* **Ignoring repeats.** These formulas assume distinct items and no replacement.
* **Overflow:** factorials explode; compute ratios carefully (see [[Overflow and Underflow]]).

## Quick check

<details><summary>1. How many ways to order 4 books on a shelf?</summary>
4! = 24.
</details>

<details><summary>2. What is C(6, 2)?</summary>
15.
</details>

<details><summary>3. What is C(10, 9)?</summary>
10 (the same as C(10, 1)).
</details>

## Key terms

* **Factorial (n!):** the product of the numbers from 1 to n.
* **Permutation:** an ordered arrangement.
* **Combination:** an unordered selection.
* **Binomial coefficient:** `C(n, k)`, "n choose k".

## Related

[[Counting Rules]] · [[Sums and Products]] · [[Discrete Distributions]] · [[Events and Sample Spaces]] · [[Overflow and Underflow]]
