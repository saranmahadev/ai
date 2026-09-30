An **equation** says two expressions are equal, and **solving** it means finding the value of the unknown that makes the statement true. The method is always the same: do the same thing to both sides until the unknown stands alone.

**You need:** [[Variables and Expressions]].

## The question it answers

"Which number makes this true?" Training a model is a huge version of this question: find the parameter values that make predictions match the data.

## Intuition: a balanced scale

An equation is a balanced scale. Whatever you do to one side, you must do to the other, or it tips. To undo an operation, apply its opposite: subtract to undo adding, divide to undo multiplying.

## The method

Solve `3x + 5 = 20`:

```text
3x + 5 = 20
3x + 5 − 5 = 20 − 5      subtract 5 from both sides
3x = 15
3x ÷ 3 = 15 ÷ 3         divide both sides by 3
x = 5
```

**Check** by substituting back: `3 × 5 + 5 = 20`. ✓ Always check; it costs seconds and catches slips.

## When the unknown is on both sides

Collect the unknowns on one side first.

```text
7x − 4 = 3x + 8
7x − 3x − 4 = 8          subtract 3x from both sides
4x = 12                  add 4 to both sides
x = 3
```

Check: left `7×3 − 4 = 17`, right `3×3 + 8 = 17`. ✓

## Special cases

* **No solution:** `x + 1 = x + 2` reduces to `1 = 2`, which is never true.
* **Every number works:** `2(x + 1) = 2x + 2` reduces to `2 = 2`, always true.
* **More than one unknown** needs more than one equation, which is [[Solving Linear Systems]].

## A worked example

A phone plan costs `12 + 0.5g` dollars (see [[Variables and Expressions]]). How many gigabytes can you use for exactly 27 dollars?

```text
12 + 0.5g = 27
0.5g = 15
g = 30
```

## Bench

```bench
id: balance-scale
title: Keep the scale balanced
fallback: Solve an equation like 3x + 5 = 20 by choosing operations (subtract, add, divide, multiply) that apply to both sides, watching the equation simplify until x stands alone.
```

**Try this**

1. Solve the first equation using as few moves as you can.
2. Try a wrong move first (only one side). Does the bench allow it?
3. Generate a new equation and solve it again.

**What you should notice:** every valid move is applied to both sides, and the solution is what remains when only `x` is left.

## Where it appears in AI

* **Closed-form solutions:** some models (like linear regression) can be solved directly as equations (see [[Least Squares]]).
* **Fixed points and constraints** are equations a system must satisfy.
* **Optimization** sets a derivative equal to zero and solves (see [[Minima, Maxima and Saddle Points]]).

## Common pitfalls

* **Changing only one side.** It breaks the equality.
* **Dividing only one term.** Divide the *whole* side: `(3x + 6) ÷ 3 = x + 2`.
* **Skipping the check.** A sign slip is easy to miss.
* **Dividing by zero or an unknown that could be zero.**

## Quick check

<details><summary>1. Solve 2x − 7 = 9.</summary>
2x = 16, so x = 8.
</details>

<details><summary>2. Solve 5x + 2 = 2x + 14.</summary>
3x = 12, so x = 4.
</details>

<details><summary>3. How many solutions does x + 3 = x + 5 have?</summary>
None: it reduces to 3 = 5.
</details>

## Key terms

* **Equation:** a statement that two expressions are equal.
* **Solution:** a value of the unknown that makes the equation true.
* **Inverse operation:** the operation that undoes another.
* **Both sides:** the rule that any move must apply to each side.

## Related

[[Variables and Expressions]] · [[Inequalities]] · [[Solving Linear Systems]] · [[Least Squares]]
