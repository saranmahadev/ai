**Logic** deals with statements that are either true or false and the ways of combining them: **AND**, **OR**, **NOT**, **XOR** and **IF … THEN**. A **truth table** lists every case, so you can check exactly what a combination means.

**You need:** [[Sets and Operations]].

## The question it answers

"When is a combined condition true?" Rules such as "flag the email if it has a link AND the sender is unknown" are logic, and so is every `if` in a program.

## Intuition: switches and gates

Each statement is a switch that is on (true, `T`) or off (false, `F`). Combining connectives correspond to set operations: AND is intersection, OR is union, NOT is complement.

```text
p ∧ q    AND    true only when both are true
p ∨ q    OR     true when at least one is true
¬p       NOT    flips true and false
p ⊕ q    XOR    true when exactly one is true
p → q    IF p THEN q     false only when p is true and q is false
```

## The truth tables

```text
 p  q | p∧q  p∨q  p⊕q  p→q
 T  T |  T    T    F    T
 T  F |  F    T    T    F
 F  T |  F    T    T    T
 F  F |  F    F    F    T
```

The last column surprises people: `p → q` is true whenever `p` is false. A promise "if it rains I will take an umbrella" is only broken when it rains and you don't.

## Equivalences

Two statements are **equivalent** if their truth tables match. Useful ones:

```text
p → q       ≡  ¬p ∨ q
¬(p ∧ q)    ≡  ¬p ∨ ¬q        (De Morgan)
¬(p ∨ q)    ≡  ¬p ∧ ¬q        (De Morgan)
```

## A worked example

Is `¬(p ∧ q)` the same as `¬p ∨ ¬q`? Check each row:

```text
 p  q | p∧q  ¬(p∧q) | ¬p  ¬q  ¬p∨¬q
 T  T |  T      F   |  F   F     F
 T  F |  F      T   |  F   T     T
 F  T |  F      T   |  T   F     T
 F  F |  F      T   |  T   T     T
```

The columns `¬(p ∧ q)` and `¬p ∨ ¬q` are identical, so De Morgan's law holds. A rule engine that says "NOT (has link AND unknown sender)" can be rewritten as "no link OR known sender".

## Bench

```bench
id: truth-table
title: Build a truth table
fallback: Pick two logical formulas; the bench draws each one's truth table, highlights rows where they differ, and says whether the formulas are equivalent.
```

**Try this**

1. Look at p → q. Which rows make it false?
2. Compare `p → q` with `¬p ∨ q`.
3. Compare `¬(p ∧ q)` with `¬p ∨ ¬q`, then with `¬p ∧ ¬q`.
4. Find two formulas that are *not* equivalent and see which row differs.

**What you should notice:** equivalent formulas have identical columns, and one differing row is enough to tell them apart.

## Where it appears in AI

* **Rule-based and expert systems** are logic (see [[Logic and Knowledge Representation]]).
* **Decision trees** ask a chain of yes/no questions.
* **Masks and filters** in data code combine boolean conditions.
* **Neural units** approximate logic gates; XOR famously needs more than one layer.

## Common pitfalls

* **Reading `p → q` as "q causes p".** It is only a truth condition.
* **Misapplying De Morgan.** NOT flips AND to OR.
* **Confusing OR with XOR.** Ordinary OR includes "both".
* **Treating "if" and "if and only if" alike.**

## Quick check

<details><summary>1. When is p ∨ q false?</summary>
Only when both p and q are false.
</details>

<details><summary>2. When is p → q false?</summary>
Only when p is true and q is false.
</details>

<details><summary>3. What does ¬(p ∨ q) equal?</summary>
¬p ∧ ¬q.
</details>

## Key terms

* **Truth table:** a list of all cases and the resulting truth value.
* **Connective:** AND, OR, NOT, XOR or IF-THEN.
* **Equivalent:** having identical truth tables.
* **De Morgan's laws:** the rules for negating AND and OR.

## Related

[[Sets and Operations]] · [[Reading Proofs and Quantifiers]] · [[Logic and Knowledge Representation]] · [[Expert Systems and Their Limits]]
