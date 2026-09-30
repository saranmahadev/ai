A **sample space** is the set of all outcomes that could happen, and an **event** is any collection of those outcomes. When every outcome is equally likely, the probability of an event is just the number of outcomes in it divided by the total.

**You need:** [[Sets and Operations]], [[Counting Rules]] and [[Fractions, Ratios and Percentages]].

## The question it answers

"What can happen, and what fraction of the possibilities are the ones I care about?" Before you can say how likely something is, you must list what could occur.

## Intuition: list everything, then circle what you want

Roll a die. The sample space is `Ω = {1, 2, 3, 4, 5, 6}`. The event "even" is the subset `{2, 4, 6}`. If all six outcomes are equally likely:

```text
P(event) = (number of outcomes in the event) / (number of outcomes in Ω)
P(even)  = 3 / 6 = 0.5
```

An event is a **set**, so the set operations from [[Sets and Operations]] apply: `A ∪ B` is "A or B", `A ∩ B` is "A and B", and `Aᶜ` is "not A".

## A worked example: two dice

Roll two dice. The sample space has `6 × 6 = 36` equally likely outcomes, written `(first, second)`.

```text
sum = 7:    (1,6) (2,5) (3,4) (4,3) (5,2) (6,1)         6 outcomes → 6/36 = 1/6
sum ≥ 10:   (4,6) (5,5) (6,4) (5,6) (6,5) (6,6)         6 outcomes → 6/36 = 1/6
doubles:    (1,1) (2,2) … (6,6)                         6 outcomes → 6/36 = 1/6
at least one 6:  11 outcomes → 11/36 ≈ 0.306
```

The last one is easiest through the complement: "no 6 at all" has `5 × 5 = 25` outcomes, so "at least one 6" is `36 − 25 = 11`.

Not every experiment has equally likely outcomes: a weighted coin, a rainy day, or a spam email do not. Then each outcome gets its own probability, which must still add up to 1.

## Bench

```bench
id: outcome-grid
title: Two dice and their outcomes
fallback: A 6 by 6 grid shows all 36 outcomes of rolling two dice; choose an event (a sum, doubles, or at least one six) to highlight its outcomes and read its probability, and roll the dice to see one outcome.
```

**Try this**

1. Highlight "sum is 7" and count the cells.
2. Change the sum and find the most and least likely totals.
3. Highlight "at least one six" and count the complement instead.
4. Roll several times and see which cells appear.

**What you should notice:** probability here is counting cells, and totals near the middle are likelier because more cells produce them.

## Where it appears in AI

* **Classification outputs** are probabilities over a small sample space of labels.
* **Language models** assign probability to every word in the vocabulary.
* **Data splits and sampling** rely on equally likely picks.

## Common pitfalls

* **Assuming outcomes are equally likely** when they are not (the sum of two dice is not).
* **Forgetting the order** in `(first, second)` and undercounting.
* **Mixing up outcome and event.** An outcome is one result; an event is a set of them.
* **Double counting overlaps** in "or" events.

## Quick check

<details><summary>1. What is P(sum = 4) with two dice?</summary>
3/36 = 1/12: (1,3), (2,2), (3,1).
</details>

<details><summary>2. What is P(not a 6) on one die?</summary>
5/6.
</details>

<details><summary>3. How many outcomes when flipping a coin 3 times?</summary>
2³ = 8.
</details>

## Key terms

* **Sample space (Ω):** the set of all possible outcomes.
* **Event:** a subset of the sample space.
* **Outcome:** one possible result.
* **Equally likely:** each outcome having the same probability.

## Related

[[Sets and Operations]] · [[Counting Rules]] · [[Probability Rules]] · [[Random Variables]]
