A **variable** is a letter that stands for a number that can change or that we do not know yet, and an **expression** combines variables, numbers and operations into a calculation. Substituting values into an expression is how every formula, and every model, produces an answer.

**You need:** [[Order of Operations and Properties]] and [[Reading Math Notation]].

## The question it answers

"How do I write a rule that works for any number, not just one?" Instead of "a rectangle 3 wide and 4 tall has area 12", we write `area = w × h` once and it covers every rectangle.

## Intuition: a recipe with blanks

An expression is a recipe with blanks. `5n + 3` says "multiply the number of items by 5, then add 3". The letter `n` is the blank. Fill it in with 4 and you get `5 × 4 + 3 = 23`; fill it with 10 and you get 53.

## Definition and vocabulary

```text
term        one piece added or subtracted: in 5n + 3, the terms are 5n and 3
coefficient the number multiplying a variable: in 5n, the coefficient is 5
constant    a term with no variable: 3
like terms  terms with the same variable part: 2x and 7x can be combined
```

Simplifying combines like terms and uses the distributive property:

```text
3x + 2x           = 5x
2(x + 4)          = 2x + 8
4x + 3 + 2x − 1   = 6x + 2
```

**Substitution** means replacing each variable by a number and calculating, following the [[Order of Operations and Properties]].

## A worked example

A phone plan costs 12 dollars a month plus 0.5 dollars per gigabyte. With `g` gigabytes, the monthly cost is:

```text
cost = 12 + 0.5g
```

For `g = 10`: `12 + 0.5 × 10 = 17`. For `g = 30`: `12 + 15 = 27`. One expression gives every case.

Expressions can be expanded and simplified: `(x + 3)(x + 2)` is `x·x + 2x + 3x + 6 = x² + 5x + 6`. Check with `x = 1`: the left side is `4 × 3 = 12` and the right side is `1 + 5 + 6 = 12`. ✓

## Bench

```bench
id: expression-plug
title: Plug numbers into an expression
fallback: Choose a formula (rectangle area, phone plan, or a weighted sum) and move sliders for its variables to see the substitution and result update.
```

**Try this**

1. Change one variable at a time and watch the result.
2. Find the input that makes the result zero, if one exists.
3. Switch to the weighted sum and change one weight.

**What you should notice:** the *form* of the expression stays fixed while the inputs vary, and the result responds to each variable in a predictable way.

## Where it appears in AI

* **Model formulas** like `ŷ = w₁x₁ + w₂x₂ + b` are expressions in the inputs `x` and the parameters `w, b`.
* **Loss and score formulas** are expressions evaluated for every example.
* **Code variables** are the same idea, and programs are expressions evaluated in order.

## Common pitfalls

* **Combining unlike terms.** `2x + 3y` cannot be simplified to `5xy`.
* **Forgetting to distribute to every term.** `2(x + 4) = 2x + 8`, not `2x + 4`.
* **Dropping the multiplication.** `3x` means 3 times x, not the digit pair "3x".
* **Substituting negatives without brackets.** For `x = −2`, `x²` is `(−2)² = 4`.

## Quick check

<details><summary>1. Simplify 4x + 3x − 2.</summary>
7x − 2.
</details>

<details><summary>2. Evaluate 2n + 7 for n = 5.</summary>
17.
</details>

<details><summary>3. Expand 3(a + 2).</summary>
3a + 6.
</details>

## Key terms

* **Variable:** a letter standing for a number that can vary or is unknown.
* **Expression:** numbers, variables and operations combined.
* **Coefficient:** the number multiplying a variable.
* **Substitution:** replacing variables with values.

## Related

[[Order of Operations and Properties]] · [[Equations and Solving]] · [[Functions]] · [[Linear Functions]]
