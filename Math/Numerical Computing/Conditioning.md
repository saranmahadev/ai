A problem is **ill-conditioned** when tiny changes in its input cause huge changes in its answer, no matter how carefully you compute. The **condition number** measures that sensitivity. It is a property of the problem, not the algorithm, and it explains why some linear systems and some optimisation landscapes are hard.

**You need:** [[Solving Linear Systems]], [[Eigenvalues and Eigenvectors]] and [[Floating Point]].

## The question it answers

"If my data is slightly noisy or rounded, how wrong can the answer be?" For a well-conditioned problem, not much. For an ill-conditioned one, wildly.

## Intuition: two lines that are almost parallel

Two lines that cross at a good angle meet at a point that barely moves if you nudge one line. Two almost-parallel lines meet far away, and a tiny nudge slides the meeting point a long way. Nearly dependent equations behave the same way.

## The condition number

For a matrix `A` (symmetric, for simplicity), the condition number is the ratio of its largest to smallest eigenvalue magnitude (in general, of largest to smallest singular value):

```text
κ(A) = λ_max / λ_min      relative error in the answer can be up to κ times the relative error in the input
```

`κ = 1` is perfect (like a rotation). A large `κ` means the matrix squashes some direction almost flat, so inverting it amplifies noise in that direction. A singular matrix has `κ = ∞`.

## A worked example

Solve `x + y = 2` and `x + 1.0001 y = 2.0001`:

```text
A = [1  1     ]     b = [2     ]     →   x = 1,  y = 1
    [1  1.0001]         [2.0001]
```

Now change the right-hand side by a hair, `2.0001 → 2.0002` (a change of 0.005%):

```text
0.0001 y = 0.0002    →   y = 2,   x = 0
```

The answer moved from `(1, 1)` to `(0, 2)`: a 0.005% input change produced a 100% change in the solution. The eigenvalues of `A` are about `2.00005` and `0.00005`, so `κ ≈ 40,002`, enough to magnify relative errors by up to about forty thousand times, and, on top of rounding in float32 (relative error `10⁻⁷`), it leaves only about three reliable digits.

The same idea describes optimisation: a loss landscape with very different curvatures in different directions (large `κ` of the Hessian) is a long narrow valley where gradient descent zig-zags (see [[Learning Rate]]).

## Bench

```bench
id: near-singular
title: Two almost-parallel lines
fallback: A slider sets how close to parallel two lines are and another nudges one of them; the bench draws both intersection points, shows the condition number, and how far the solution moves for a tiny nudge.
```

**Try this**

1. Make the lines cross at a good angle and nudge one: how far does the crossing move?
2. Make them nearly parallel and nudge again.
3. Watch the condition number as the lines approach parallel.
4. Compare the size of the nudge with the size of the shift.

**What you should notice:** the nearer to parallel, the larger the condition number and the farther a tiny nudge throws the solution.

## Where it appears in AI

* **Linear regression with correlated features** is ill-conditioned; regularisation (ridge) improves the conditioning.
* **Slow optimisation** in narrow valleys.
* **Normal equations** square the condition number, which is why stable solvers avoid them.
* **Feature scaling** improves conditioning.

## Common pitfalls

* **Blaming the algorithm** for what is really the problem's sensitivity.
* **Forming `AᵀA`,** which squares the condition number.
* **Trusting a solution** when `κ` is comparable to `1 / (machine epsilon)`.
* **Ignoring redundant, highly correlated features.**

## Quick check

<details><summary>1. What is the condition number of the identity matrix?</summary>
1.
</details>

<details><summary>2. If κ = 10⁶ and inputs have relative error 10⁻⁸, what is the worst relative error in the answer?</summary>
About 10⁻².
</details>

<details><summary>3. Does a better algorithm fix an ill-conditioned problem?</summary>
No; it can only avoid making things worse.
</details>

## Key terms

* **Condition number (κ):** the ratio of largest to smallest stretch of a matrix.
* **Ill-conditioned:** very sensitive to small changes.
* **Singular:** having infinite condition number (no inverse).
* **Regularisation:** modifying a problem to improve its conditioning.

## Related

[[Solving Linear Systems]] · [[Eigenvalues and Eigenvectors]] · [[Floating Point]] · [[Regularization as a Constraint]] · [[Learning Rate]]
