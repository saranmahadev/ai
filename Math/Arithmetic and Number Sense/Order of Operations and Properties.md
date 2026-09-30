An expression such as `2 + 3 × 4` has one right answer because everyone agrees on the **order of operations**: parentheses first, then powers, then multiplication and division, then addition and subtraction. Alongside it sit a few **properties** (commutative, associative, distributive) that tell you which rearrangements are always safe.

**You need:** [[Fractions, Ratios and Percentages]].

## The question it answers

"In what order do I calculate, and what can I move around without changing the answer?" Every formula in the rest of this planet depends on reading expressions the same way a computer does.

## Intuition: strong glue and weak glue

Multiplication binds tighter than addition, like strong glue. In `2 + 3 × 4` the `3 × 4` is glued together first, giving 12, and then 2 is added, giving 14 (not 20). Parentheses override the glue: `(2 + 3) × 4 = 20`.

## The order

```text
1. Parentheses ( )      inside out
2. Exponents and roots  a², √a
3. Multiplication and division   left to right
4. Addition and subtraction      left to right
```

Same-level operations run **left to right**: `10 − 4 − 3 = (10 − 4) − 3 = 3`, not `10 − (4 − 3) = 9`.

## The properties

```text
commutative:   a + b = b + a         a × b = b × a
associative:   (a + b) + c = a + (b + c)        (a × b) × c = a × (b × c)
distributive:  a × (b + c) = a × b + a × c
```

Addition and multiplication are commutative and associative. **Subtraction and division are not**: `5 − 3 ≠ 3 − 5` and `8 ÷ 4 ≠ 4 ÷ 8`. The distributive property links the two operations and is the reason factoring and expanding work.

## A worked example

Evaluate `3 + 4 × (2 + 1)² − 6 ÷ 3`:

```text
step 1: parentheses     (2 + 1) = 3            → 3 + 4 × 3² − 6 ÷ 3
step 2: exponent        3² = 9                 → 3 + 4 × 9 − 6 ÷ 3
step 3: × and ÷         4 × 9 = 36, 6 ÷ 3 = 2  → 3 + 36 − 2
step 4: + and −         3 + 36 − 2 = 37
```

Using the distributive property to check a smaller piece: `4 × (2 + 1) = 4 × 2 + 4 × 1 = 12`.

## Bench

```bench
id: order-of-operations
title: Evaluate step by step
fallback: Pick an expression and step through its evaluation one operation at a time, with the operation being done highlighted in the expression.
```

**Try this**

1. Step through `2 + 3 × 4`. Which operation runs first?
2. Choose the expression with parentheses. Which step changes?
3. Compare `10 − 4 − 3` step by step. Why is the answer 3?
4. Predict each step before you press Step.

**What you should notice:** the same digits give different answers depending on order, so the order is a rule of reading, not a choice.

## Where it appears in AI

* **Formulas in code and papers** rely on the order: `w × x + b` multiplies first.
* **Vectorised code** (see [[Tensors and Shapes]]) reorders operations for speed, which is safe only because of associativity, and slightly unsafe with floating point (see [[Floating Point]]).
* **Loss functions** combine sums, squares and averages in a fixed order.

## Common pitfalls

* **Left-to-right slip.** `8 ÷ 2 × 4` is 16, not 1.
* **Negative powers of a negative.** `−3²` is −9 (the power binds first), while `(−3)²` is 9.
* **Assuming subtraction is associative.** It is not.
* **Skipping the parentheses that hide inside fractions.** In `(a + b) / c` the bar groups the top.

## Quick check

<details><summary>1. What is 6 + 2 × 5?</summary>
16 (multiply first: 6 + 10).
</details>

<details><summary>2. What is −4²? What is (−4)²?</summary>
−16 and 16.
</details>

<details><summary>3. Is (8 − 3) − 2 equal to 8 − (3 − 2)?</summary>
No: 3 versus 7. Subtraction is not associative.
</details>

## Key terms

* **Order of operations:** the agreed sequence for evaluating an expression.
* **Commutative:** the order of two operands does not change the result.
* **Associative:** regrouping does not change the result.
* **Distributive property:** `a(b + c) = ab + ac`.

## Related

[[Fractions, Ratios and Percentages]] · [[Exponents and Roots]] · [[Variables and Expressions]] · [[Floating Point]]
