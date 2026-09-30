A **limit** is the value a function approaches as its input gets closer and closer to some point, even if the function never actually reaches (or is not even defined at) that point. Limits are what make the instantaneous rate of change well defined.

**You need:** [[Functions]] and [[Rate of Change]].

## The question it answers

"What value is this heading toward?" The expression `(x² − 4)/(x − 2)` is undefined at `x = 2` (it gives 0/0), yet as `x` approaches 2 it clearly heads somewhere.

## Intuition: sneak up on a point

You cannot stand at the point, but you can approach from both sides and watch the outputs. If they close in on the same number, that number is the limit.

```text
lim (x → a) f(x) = L      "as x approaches a, f(x) approaches L"
```

Take `f(x) = (x² − 4)/(x − 2)`:

```text
x = 1.9:    (3.61 − 4) / (−0.1)   = 3.9
x = 1.99:   (3.9601 − 4) / (−0.01) = 3.99
x = 2.01:   (4.0401 − 4) / 0.01    = 4.01
x = 2.1:    (4.41 − 4) / 0.1       = 4.1
```

Both sides head to **4**, so the limit is 4, although `f(2)` itself does not exist. Algebra confirms it: for `x ≠ 2`, `(x² − 4)/(x − 2) = (x + 2)(x − 2)/(x − 2) = x + 2`, which tends to 4.

## Notation and one-sided limits

A limit exists only if the left-hand and right-hand limits agree. For a function that jumps (like a step), the two sides give different numbers and the limit does not exist. Limits can also describe behaviour at infinity: `lim (x → ∞) 1/x = 0`, since `1/x` shrinks toward 0 as `x` grows.

## Rules

Limits behave nicely with arithmetic: the limit of a sum is the sum of the limits, and similarly for products and quotients (as long as the bottom limit is not zero).

## A worked example

Find `lim (x → 0) sin(x)/x`. Try small values:

```text
x = 0.5:    sin 0.5 / 0.5  = 0.9589
x = 0.1:    0.09983 / 0.1  = 0.9983
x = 0.01:   0.0099998 / 0.01 = 0.99998
```

The limit is **1**, a classic result: for tiny angles (in radians), `sin x ≈ x`.

## Bench

```bench
id: limit-zoom
title: Sneak up on a limit
fallback: Choose a function with a hole or a tricky point; a slider moves x toward the point from the left or the right, and a table shows the outputs approaching the limit.
```

**Try this**

1. Approach x = 2 from the left, then the right, on the first function.
2. Compare the table with f(2) (a hole).
3. Switch to sin x / x at 0.
4. Try the step function and see when the two sides disagree.

**What you should notice:** outputs can settle on a value even where the function is undefined, and if the two sides disagree, there is no limit.

## Where it appears in AI

* **The derivative is a limit** (see [[Derivatives]]).
* **Convergence:** an optimiser's iterates approach a limit.
* **Asymptotic behaviour:** sigmoid tends to 1 and 0 at the extremes.

## Common pitfalls

* **Confusing the limit with the function's value** at the point.
* **Checking only one side.**
* **Substituting 0/0 and stopping.** Simplify first.
* **Assuming every limit exists.**

## Quick check

<details><summary>1. What is lim (x → 3) of (x² − 9)/(x − 3)?</summary>
x + 3 → 6.
</details>

<details><summary>2. What is lim (x → ∞) of 5/x?</summary>
0.
</details>

<details><summary>3. When does a two-sided limit fail to exist?</summary>
When the left and right limits differ.
</details>

## Key terms

* **Limit:** the value a function approaches.
* **One-sided limit:** the value approached from just one side.
* **Indeterminate form:** an expression like 0/0 that needs simplifying.
* **Asymptote:** a value approached at infinity.

## Related

[[Rate of Change]] · [[Continuity]] · [[Derivatives]] · [[Integrals]]
