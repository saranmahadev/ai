A **proof** is an argument that a statement is true in every case, built from clear steps. **Quantifiers** ("for all", "there exists") say how many cases a statement covers. You will not write many proofs on this road, but you will read claims like "for every input" and it helps to know what such claims promise.

**You need:** [[Logic and Truth Tables]].

## The question it answers

"What does it mean to be *sure* something is true, and how do I read a mathematical claim precisely?" Testing a thousand examples does not prove a statement, but one counterexample disproves it.

## Quantifiers

```text
∀ x : P(x)     for all x, the property P holds
∃ x : P(x)     there exists at least one x with property P
```

* "For every real `x`, `x² ≥ 0`" is a `∀` claim, true.
* "There exists an `x` with `x² = 4`" is an `∃` claim, true (`x = 2`).

To **disprove a ∀ claim**, give one **counterexample**: "every prime is odd" is false because 2 is prime and even. To **prove an ∃ claim**, give one example. Negating swaps the quantifier: the opposite of "for all x, P" is "there is some x where P fails".

## Ways to prove

* **Direct proof:** start from what you know and reach the claim step by step.
* **Contradiction:** assume the claim is false and show that leads to nonsense, so it must be true.
* **Induction:** show it for the first case, then show that each case implies the next, like dominoes.

## A worked example

**Claim:** the sum of two even numbers is even. **Direct proof:**

```text
1. An even number has the form 2m for some integer m.
2. Let the two numbers be 2m and 2n.
3. Their sum is 2m + 2n.
4. That equals 2(m + n).
5. m + n is an integer, so the sum is 2 times an integer: even.  ∎
```

**Induction sketch:** claim `1 + 2 + … + n = n(n + 1)/2`. Base case `n = 1`: `1 = 1·2/2` ✓. Step: if it holds for `n`, then for `n + 1` the sum is `n(n+1)/2 + (n+1) = (n+1)(n+2)/2`, which is the formula with `n + 1`. So it holds for every `n`.

## Bench

```bench
id: proof-arranger
title: Put the proof in order
fallback: The steps of a short proof appear shuffled; click them in the correct order and the bench tells you when a step belongs earlier or later.
```

**Try this**

1. Read all the steps first and find the starting assumption.
2. Click the steps in order. A wrong pick tells you it does not come next.
3. Try the second proof (induction).

**What you should notice:** every step follows from the ones before it, and the conclusion comes only at the end.

## Where it appears in AI

* **Guarantees** such as "gradient descent converges for convex losses" are proved statements with stated conditions.
* **"For all inputs" claims** in verification and safety.
* **Counterexamples** are how adversarial examples and failure cases are found.

## Common pitfalls

* **Testing a few cases and calling it proved.**
* **Assuming what you want to prove** (circular reasoning).
* **Negating "for all" wrongly.** It becomes "for some … not".
* **Ignoring the conditions.** A theorem holds only under its assumptions.

## Quick check

<details><summary>1. How do you disprove "all birds fly"?</summary>
Give one counterexample, such as a penguin.
</details>

<details><summary>2. What is the negation of "for all x, P(x)"?</summary>
There exists an x for which P(x) is false.
</details>

<details><summary>3. What are the two parts of an induction proof?</summary>
The base case, and the step from n to n + 1.
</details>

## Key terms

* **Proof:** an argument showing a statement holds in every case.
* **Quantifier:** ∀ (for all) or ∃ (there exists).
* **Counterexample:** a case that breaks a "for all" claim.
* **Induction:** proving a claim for every whole number via a base case and a step.

## Related

[[Logic and Truth Tables]] · [[Counting Rules]] · [[Sequences and Series]] · [[Convex vs Non-Convex]]
