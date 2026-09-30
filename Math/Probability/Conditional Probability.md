**Conditional probability** is the probability of an event *given that another has happened*: `P(A | B)`, read "the probability of A given B". Learning that `B` happened shrinks the world of possibilities to `B`, and `P(A | B)` asks how much of that smaller world is also `A`.

**You need:** [[Probability Rules]] and [[Events and Sample Spaces]].

## The question it answers

"How does new information change how likely something is?" The chance a card is a king is 1 in 13, but if you are told it is a face card, the chance rises to 1 in 3.

## Intuition: shrink the sample space

Once you know `B` happened, outcomes outside `B` are ruled out. The new sample space is just `B`. Among the outcomes left, count those that are also in `A`:

```text
P(A | B) = P(A and B) / P(B)          (needs P(B) > 0)
```

Rearranged, this gives the **multiplication rule**: `P(A and B) = P(A | B) · P(B)`.

Watch the order: `P(A | B)` and `P(B | A)` are usually different. The chance of being wet given rain is high; the chance of rain given that you are wet (you might have used a sprinkler) is lower.

## A worked example: two dice

Roll two dice. `B` = "first die is 6" (6 outcomes out of 36). `A` = "sum ≥ 10".

```text
A and B: (6,4) (6,5) (6,6)  →  3 outcomes  →  P(A and B) = 3/36
P(B) = 6/36
P(A | B) = (3/36) / (6/36) = 1/2
```

Unconditionally `P(A) = 6/36 = 1/6`, so knowing the first die is a 6 tripled the chance. Cards: `P(king | face card) = (4/52) / (12/52) = 1/3`, since a face card is a jack, queen or king.

A medical one: if 2% of emails are phishing and 90% of phishing emails contain a link, then `P(phishing and link) = 0.9 × 0.02 = 0.018`.

## Bench

```bench
id: restricted-grid
title: Shrink the world to what you know
fallback: The 36 outcomes of two dice are drawn as a grid; choose a condition B and an event A; the grid dims outside B and shows P(A), P(B), P(A and B) and P(A given B).
```

**Try this**

1. Set B to "first die is 6" and A to "sum ≥ 10". Read the conditional probability.
2. Change B to "sum is even" and compare P(A | B) with P(A).
3. Find a B for which P(A | B) is 1.
4. Find a B for which P(A | B) equals P(A).

**What you should notice:** conditioning simply restricts the grid to B, and the answer is the share of that smaller grid that is also A.

## Where it appears in AI

* **Classifiers estimate `P(label | features)`.**
* **Language models** give `P(next word | previous words)`.
* **Bayes' rule** turns `P(evidence | cause)` into `P(cause | evidence)` (see [[Bayes Theorem]]).

## Common pitfalls

* **Confusing `P(A | B)` with `P(B | A)`.**
* **Dividing by the wrong denominator.** The bottom is `P(B)`, not 1.
* **Conditioning on an impossible event.**
* **Treating "given" as "and".** `P(A and B)` is smaller than `P(A | B)` in general.

## Quick check

<details><summary>1. P(A and B) = 0.1 and P(B) = 0.4. What is P(A | B)?</summary>
0.25.
</details>

<details><summary>2. P(king | face card)?</summary>
1/3.
</details>

<details><summary>3. Are P(A | B) and P(B | A) always equal?</summary>
No.
</details>

## Key terms

* **Conditional probability:** `P(A | B)`, the probability of A given B.
* **Multiplication rule:** `P(A and B) = P(A | B) P(B)`.
* **Condition / given:** what is assumed to have happened.
* **Restricted sample space:** the outcomes consistent with B.

## Related

[[Probability Rules]] · [[Independence]] · [[Bayes Theorem]] · [[Joint and Marginal Distributions]]
