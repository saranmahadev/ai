Often you want the best value **subject to a condition**: the cheapest plan that still meets a target, or the largest area for a fixed perimeter. At the best allowed point, the direction you would like to move is blocked by the constraint, so the gradient of the objective points exactly along the gradient of the constraint. The multiplier `λ` measures how strongly.

**You need:** [[Gradients]], [[Lines, Planes and Circles]] and [[Equations and Solving]].

## The question it answers

"What is the best I can do while respecting a rule?" The unconstrained minimum may be forbidden, so the answer lies on the boundary of what is allowed.

## Intuition: a bead on a wire

Picture a bead sliding on a wire (the constraint) over a landscape (the objective). It settles where moving along the wire no longer changes the height. At that point the wire's direction is a contour line of the landscape, so the objective's gradient is **perpendicular to the wire**, which means it is **parallel to the constraint's gradient**.

```text
minimise f(x, y)  subject to  g(x, y) = 0
at the optimum:    ∇f = λ ∇g          (parallel gradients)
together with:     g(x, y) = 0
```

The number `λ` (the **Lagrange multiplier**) tells you how much the best value would change if the constraint were loosened slightly.

## A worked example

Minimise `f = x² + y²` subject to `x + y = 2`. Here `g = x + y − 2`.

```text
∇f = (2x, 2y)      ∇g = (1, 1)
2x = λ,  2y = λ    →   x = y
x + y = 2          →   x = y = 1,   λ = 2,   f = 2
```

Check: the unconstrained minimum is the origin, but it violates `x + y = 2`. On the line, the point closest to the origin is `(1, 1)`, at distance `√2` (and `f = 2`).

Another: maximise `x·y` with `x + y = 10`. `∇f = (y, x) = λ(1, 1)`, so `x = y = 5`, `xy = 25`, `λ = 5`. Among rectangles with perimeter 20, the square has the largest area.

**Inequality constraints** (`g ≤ 0`) are handled the same way: either the constraint is inactive (the ordinary minimum satisfies it) or the solution sits on the boundary.

## Bench

```bench
id: constrained-contour
title: The best point on a line
fallback: Contours of x squared plus y squared with a constraint line x + y = c; a slider slides a point along the line, showing the objective's value, the two gradient arrows and the angle between them, which vanishes at the best point.
```

**Try this**

1. Slide the point along the line and watch the objective fall then rise.
2. Find the lowest value and check the gradient arrows line up.
3. Change c and see how the best value moves.
4. Read the multiplier at the best point.

**What you should notice:** the best point on the line is where a contour just touches it, and there the two gradients are parallel.

## Where it appears in AI

* **Support vector machines** maximise a margin subject to classification constraints.
* **Regularisation** can be read as a constraint on the size of the weights (see [[Regularization as a Constraint]]).
* **Probability** distributions must sum to 1, a constraint handled with a multiplier (as in deriving softmax-style solutions).
* **Fairness or safety limits** in constrained training.

## Common pitfalls

* **Forgetting the constraint equation** itself.
* **Treating λ as free.** It is solved together with the other unknowns.
* **Missing that the optimum may be on a boundary.**
* **Assuming parallel gradients guarantee a minimum.** It could be a maximum or saddle.

## Quick check

<details><summary>1. Minimise x² + y² subject to x + y = 4. What are x and y?</summary>
x = y = 2 (f = 8).
</details>

<details><summary>2. At a constrained optimum, how are ∇f and ∇g related?</summary>
They are parallel: ∇f = λ ∇g.
</details>

<details><summary>3. What does λ measure?</summary>
How much the optimum changes if the constraint is loosened.
</details>

## Key terms

* **Constraint:** a condition the solution must satisfy.
* **Lagrange multiplier (λ):** the scaling between the two gradients.
* **Feasible set:** the points that satisfy the constraints.
* **Active constraint:** one that holds with equality at the solution.

## Related

[[Gradients]] · [[Lines, Planes and Circles]] · [[Regularization as a Constraint]] · [[Minima, Maxima and Saddle Points]]
