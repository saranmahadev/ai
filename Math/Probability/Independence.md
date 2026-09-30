Two events are **independent** when knowing one happened tells you nothing about the other: `P(A | B) = P(A)`. Equivalently, the probability of both is the product: `P(A and B) = P(A) · P(B)`. Independence is the assumption that lets us multiply probabilities, and it is often an approximation.

**You need:** [[Conditional Probability]] and [[Probability Rules]].

## The question it answers

"Does one thing affect the chance of another?" Two coin flips do not influence each other. But whether you carry an umbrella and whether it is raining certainly do.

## Intuition: no information passes between them

If learning `B` leaves the chance of `A` unchanged, `A` and `B` are independent. In area terms, `B` covers the same fraction of `A` as it does of the whole sample space.

```text
independent:   P(A and B) = P(A) · P(B)
               (equivalently P(A | B) = P(A))
```

Do not confuse *independent* with *mutually exclusive*. Mutually exclusive events (both cannot happen) are actually strongly dependent: if `A` happened, `B` cannot.

## A worked example

Roll two dice. `A` = "first die is even" (`P = 1/2`), `B` = "second die is above 4" (`P = 2/6 = 1/3`).

```text
P(A and B) = 3 × 2 = 6 outcomes out of 36 = 1/6
P(A) · P(B) = 1/2 × 1/3 = 1/6      equal → independent
```

A surprising one: `A` = "sum is 7" (`P = 1/6`), `B` = "first die is 1" (`P = 1/6`). Only `(1, 6)` satisfies both: `P(A and B) = 1/36 = 1/6 × 1/6`, so these are independent too. But `A` = "sum is 8" and `B` = "first die is 1": no outcome satisfies both, so `P(A and B) = 0 ≠ 1/36`, and they are dependent.

For `n` independent events, multiply all their probabilities: the chance of five heads in a row is `(1/2)⁵ = 1/32 ≈ 0.031`.

## Bench

```bench
id: linked-spinners
title: Independent or linked?
fallback: Sliders set P(A), P(B) and how strongly they are linked; the bench shows the four cells of the joint table, compares P(A and B) with P(A) times P(B), and says whether the events are independent.
```

**Try this**

1. Set the link to "independent" and check the product rule.
2. Make A and B positively linked and watch P(A and B) rise above the product.
3. Make them negatively linked.
4. Compare P(A | B) with P(A) in each case.

**What you should notice:** independence is the special setting where the joint probability equals the product, and any link pushes it above or below.

## Where it appears in AI

* **Naive Bayes** assumes features are independent given the class.
* **Sampling** assumes independent draws.
* **Dependent data** (time series, neighbouring pixels) breaks that assumption, which affects how errors are estimated.

## Common pitfalls

* **Assuming independence** when events are related (a common source of overconfident models).
* **Confusing independent with mutually exclusive.**
* **Multiplying probabilities of dependent events.**
* **Believing in the gambler's fallacy:** past coin flips do not change the next one.

## Quick check

<details><summary>1. P(A) = 0.5, P(B) = 0.2, independent. What is P(A and B)?</summary>
0.1.
</details>

<details><summary>2. Chance of three sixes in a row on a fair die?</summary>
(1/6)³ = 1/216.
</details>

<details><summary>3. Can mutually exclusive events with positive probability be independent?</summary>
No: P(A and B) = 0 but P(A)P(B) > 0.
</details>

## Key terms

* **Independent events:** one gives no information about the other.
* **Product rule:** `P(A and B) = P(A) P(B)` for independent events.
* **Dependent:** not independent.
* **Gambler's fallacy:** believing past independent trials affect the next.

## Related

[[Conditional Probability]] · [[Probability Rules]] · [[Bayes Theorem]] · [[Joint and Marginal Distributions]] · [[Correlation vs Causation]]
