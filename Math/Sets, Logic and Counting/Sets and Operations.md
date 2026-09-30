A **set** is a collection of distinct things, and a few operations (union, intersection, difference, complement) combine sets. Sets are how probability describes events and how data scientists describe groups: the emails that are spam, the users who clicked.

**You need:** [[Numbers and Their Kinds]] and [[Reading Math Notation]].

## The question it answers

"How do I describe a group and combine groups precisely?" "Emails that are spam and contain a link" is an intersection, and the fraction of them is a probability.

## Intuition: circles that overlap

Draw a set as a circle with its members inside. Two sets that share members overlap in a **Venn diagram**.

```text
A = {1, 2, 3, 4}       B = {3, 4, 5}
```

A set has no order and no repeats: `{1, 2, 3}` and `{3, 2, 1, 1}` are the same set.

## Operations

```text
x ∈ A         x is an element of A          A ⊂ B      A is a subset of B
A ∪ B         union: in A or B (or both)    A ∩ B      intersection: in both
A \ B         difference: in A but not B    Aᶜ         complement: everything not in A
|A|           size (number of elements)     ∅          the empty set
```

The size of a union corrects for double counting:

```text
|A ∪ B| = |A| + |B| − |A ∩ B|
```

A set with `n` elements has `2ⁿ` subsets (each element is in or out).

## A worked example

With `A = {1, 2, 3, 4}` and `B = {3, 4, 5}`, and everything drawn from `{1, …, 6}`:

```text
A ∪ B = {1, 2, 3, 4, 5}        |A ∪ B| = 5
A ∩ B = {3, 4}                 |A ∩ B| = 2
A \ B = {1, 2}
Aᶜ    = {5, 6}
check: 4 + 3 − 2 = 5 ✓
```

For a two-group survey: 40 people like tea, 30 like coffee, 15 like both. People liking at least one: `40 + 30 − 15 = 55`.

## Bench

```bench
id: set-venn
title: Sets and their overlaps
fallback: Twelve numbers can each be placed in set A, set B, both or neither; a Venn diagram shows the union, intersection, difference or complement of your choice and checks the size formula.
```

**Try this**

1. Put some numbers in A and some in B, including a few in both.
2. Switch between union, intersection, difference and complement.
3. Read the sizes and check |A ∪ B| = |A| + |B| − |A ∩ B|.
4. Try making A a subset of B.

**What you should notice:** the overlap is counted twice in |A| + |B|, so it must be subtracted once.

## Where it appears in AI

* **Events in probability** are sets of outcomes (see [[Events and Sample Spaces]]).
* **Vocabularies and label sets** are sets of tokens or classes.
* **Set overlap metrics** such as intersection-over-union (IoU) score object detectors.

## Common pitfalls

* **Counting the overlap twice** when adding sizes.
* **Confusing ∈ and ⊂.** `3 ∈ A` for an element, `A ⊂ B` for a set.
* **Treating a set as ordered.** Sets have no order.
* **Forgetting the universe.** A complement depends on what "everything" is.

## Quick check

<details><summary>1. If |A| = 10, |B| = 8 and |A ∩ B| = 3, what is |A ∪ B|?</summary>
15.
</details>

<details><summary>2. How many subsets does {a, b, c} have?</summary>
2³ = 8.
</details>

<details><summary>3. What is A \ A?</summary>
The empty set.
</details>

## Key terms

* **Set:** a collection of distinct elements.
* **Union / intersection:** elements in either / in both sets.
* **Complement:** elements not in the set.
* **Subset:** a set contained within another.

## Related

[[Logic and Truth Tables]] · [[Counting Rules]] · [[Events and Sample Spaces]] · [[Probability Rules]]
