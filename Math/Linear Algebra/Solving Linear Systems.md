A **linear system** is several linear equations that must all hold at once, such as `x + y = 5` and `x − y = 1`. Solving it means finding the values that satisfy every equation, and written with matrices it becomes the tidy form `A x = b`.

**You need:** [[Equations and Solving]], [[Linear Functions]] and [[Transpose, Identity and Inverse]].

## The question it answers

"Which numbers satisfy all these conditions together?" Many learning problems, such as fitting a model exactly to a few points, are linear systems.

## Intuition: where lines meet

Each equation with two unknowns is a line in the plane. A solution is a point on **all** the lines: where they cross.

* **One solution:** the lines cross at a single point.
* **No solution:** the lines are parallel and never meet.
* **Infinitely many:** the lines are the same line.

## Solving by hand

**Elimination:** combine equations to cancel an unknown.

```text
x + y = 5
x − y = 1
adding:   2x = 6   →   x = 3        then  y = 5 − 3 = 2
```

Check both: `3 + 2 = 5` ✓ and `3 − 2 = 1` ✓.

## Matrix form

```text
[1  1] [x]   [5]
[1 −1] [y] = [1]        A x = b

x = A⁻¹ b      when A has an inverse
```

The system has exactly one solution when `A` is invertible (`det A ≠ 0`), and then `x = A⁻¹ b`. If `det A = 0`, the equations are either redundant or contradictory.

## A worked example

Solve `2x + y = 7` and `x + y = 4`:

```text
A = [2 1]   b = [7]      det A = 2·1 − 1·1 = 1
    [1 1]       [4]

A⁻¹ = [ 1 −1]      x = A⁻¹ b = [ 1·7 − 1·4]   [3]
      [−1  2]                  [−1·7 + 2·4] = [1]
```

So `x = 3`, `y = 1`. Check: `2·3 + 1 = 7` ✓ and `3 + 1 = 4` ✓.

Now `x + 2y = 3` and `2x + 4y = 7`: the second left side is twice the first, but `7 ≠ 2·3`, so the equations contradict each other: no solution (parallel lines).

## Bench

```bench
id: two-lines
title: Where do the lines meet?
fallback: Sliders set two lines a1·x + b1·y = c1 and a2·x + b2·y = c2; the bench draws them, shows the determinant, and says whether there is one solution, none, or infinitely many.
```

**Try this**

1. Find the crossing point of two lines and read the solution.
2. Make the lines parallel. What does the determinant show?
3. Make them the same line.
4. Change one constant and watch the solution move.

**What you should notice:** a single crossing corresponds to a non-zero determinant, and parallel or identical lines correspond to a zero one.

## Where it appears in AI

* **Exact fits** of a model to as many points as it has parameters.
* **Normal equations** in regression (see [[Least Squares]]).
* **Closed-form solutions** and many numerical routines sit on linear solves.
* **Networks of constraints** in planning and optimisation.

## Common pitfalls

* **Assuming a solution always exists.** Contradictory equations have none.
* **Computing `A⁻¹` when a direct solve is safer** (see [[Conditioning]]).
* **Dropping an equation** and getting a family of solutions.
* **Arithmetic slips** when eliminating. Always check in the originals.

## Quick check

<details><summary>1. Solve x + y = 10, x − y = 2.</summary>
x = 6, y = 4.
</details>

<details><summary>2. What does det A = 0 tell you about A x = b?</summary>
There is no unique solution: either none or infinitely many.
</details>

<details><summary>3. How many solutions do two parallel distinct lines have?</summary>
None.
</details>

## Key terms

* **Linear system:** several linear equations solved together.
* **Elimination:** cancelling unknowns by combining equations.
* **Consistent / inconsistent:** having / lacking a solution.
* **Coefficient matrix:** the matrix `A` in `A x = b`.

## Related

[[Equations and Solving]] · [[Transpose, Identity and Inverse]] · [[Determinant]] · [[Rank and Null Space]] · [[Least Squares]]
