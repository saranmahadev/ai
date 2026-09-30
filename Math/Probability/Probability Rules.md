Every probability, however it is produced, obeys a short list of rules: it lies between 0 and 1, the whole sample space has probability 1, the probability of "not A" is `1 − P(A)`, and for "A or B" you add the two and subtract the overlap. Everything else in probability is built from these.

**You need:** [[Events and Sample Spaces]] and [[Sets and Operations]].

## The question it answers

"How do I combine probabilities of different events consistently?" Whatever a model believes, its numbers must follow these rules or they are not probabilities.

## The rules

```text
0 ≤ P(A) ≤ 1                       nothing is less than impossible or more than certain
P(Ω) = 1                           something in the sample space happens
P(not A) = 1 − P(A)                complement rule
P(A or B) = P(A) + P(B) − P(A and B)     addition rule
```

If `A` and `B` cannot both happen (they are **mutually exclusive**), then `P(A and B) = 0` and the addition rule simplifies to `P(A or B) = P(A) + P(B)`.

## Intuition: probability as area

Draw the sample space as a square of area 1. Each event is a region whose area is its probability. "A or B" is the combined region, and adding the two areas counts the overlap twice, so you subtract it once (exactly the inclusion–exclusion idea from [[Sets and Operations]]).

## A worked example

Draw one card from a standard 52-card deck. Let `H` be "heart" (13 cards) and `K` be "king" (4 cards). One card is both (the king of hearts).

```text
P(H) = 13/52     P(K) = 4/52     P(H and K) = 1/52
P(H or K) = 13/52 + 4/52 − 1/52 = 16/52 ≈ 0.3077
P(not H) = 1 − 13/52 = 39/52 = 0.75
```

Check by counting: hearts (13) plus the three non-heart kings gives 16 cards ✓.

For mutually exclusive events: rolling a die, `P(1 or 2) = 1/6 + 1/6 = 1/3`.

A classifier that outputs probabilities `0.5, 0.3, 0.4` for three exclusive classes breaks the rules: they add to 1.2. That is why softmax normalises outputs to sum to 1 (see [[Softmax and Cross-Entropy in Practice]]).

## Bench

```bench
id: overlap-venn
title: Areas that add up to probabilities
fallback: Sliders set P(A), P(B) and P(A and B) for two overlapping events drawn as areas; the bench shows P(A or B), P(not A), and whether the events are mutually exclusive, keeping the values consistent.
```

**Try this**

1. Make the events mutually exclusive (overlap zero) and read P(A or B).
2. Increase the overlap and watch the union shrink.
3. Try to set an impossible overlap. What limits it?
4. Read the complement P(not A).

**What you should notice:** the union is the two areas minus their overlap, and the overlap can never exceed the smaller event.

## Where it appears in AI

* **Normalisation:** a model's output probabilities must sum to 1.
* **Complement tricks:** `P(at least one) = 1 − P(none)`.
* **Combining evidence** in Bayes' rule uses these rules (see [[Bayes Theorem]]).

## Common pitfalls

* **Adding overlapping events** without subtracting the overlap.
* **Probabilities above 1 or below 0.**
* **Forgetting that mutually exclusive is not the same as independent** (see [[Independence]]).
* **Assuming probabilities of a partition add to less than 1** when the list is incomplete.

## Quick check

<details><summary>1. If P(A) = 0.3, what is P(not A)?</summary>
0.7.
</details>

<details><summary>2. P(A) = 0.5, P(B) = 0.4, P(A and B) = 0.2. What is P(A or B)?</summary>
0.5 + 0.4 − 0.2 = 0.7.
</details>

<details><summary>3. Can P(A) = 0.6 and P(B) = 0.6 be mutually exclusive?</summary>
No: the total would be 1.2.
</details>

## Key terms

* **Complement:** the event that A does not happen.
* **Addition rule:** `P(A or B) = P(A) + P(B) − P(A and B)`.
* **Mutually exclusive:** the events cannot both happen.
* **Probability axioms:** the basic rules all probabilities obey.

## Related

[[Events and Sample Spaces]] · [[Sets and Operations]] · [[Conditional Probability]] · [[Independence]] · [[Softmax and Cross-Entropy in Practice]]
