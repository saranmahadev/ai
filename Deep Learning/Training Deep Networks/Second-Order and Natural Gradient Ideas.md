Plain gradient descent uses only the slope — first-derivative information — to decide which way to step. **Second-order methods** also use the [[Hessian|Hessian]] (curvature) to decide not just *which way* but *how far*, and can reach a quadratic minimum exactly, in one step. They are rarely used directly in deep learning, for a very concrete reason: the Hessian is too big to compute.

**You need:** [[Hessian]] and [[Gradient Descent]].

## The question it answers

"Gradient descent crawls down shallow directions and bounces across steep ones — why not just use curvature to fix the step size per direction?" That is exactly what second-order methods do, and it works strikingly well — the catch is cost, not effectiveness.

## Intuition: a ravine, and knowing its shape

Picture a loss surface shaped like a steep-walled, shallow-floored ravine. Gradient descent, using only the slope, takes a step that is too large for the steep walls (so it bounces back and forth across them) or too small for the shallow floor (so it crawls slowly along it) — whichever single step size you pick, it's wrong for one of the two directions. A second-order method measures the curvature in *each* direction separately and divides the step size by it: steep directions get small steps, shallow directions get large ones, both tuned exactly right.

## Definitions

```text
gradient descent:     Δx = −lr · g
Newton's method:      Δx = −H⁻¹ g             (H = the Hessian, the matrix of second derivatives)
```

For a quadratic loss, Newton's method reaches the exact minimum in a single step, because `H⁻¹g` is exactly the step that undoes the curvature in every direction at once. The cost: `H` has one entry per *pair* of parameters — for a network with a million parameters, that is 10¹² numbers, far too many to even store, let alone invert.

## A worked example

A loss `L(x, y) = 5x² + 0.5y²` — steep in `x`, shallow in `y` — starting at `(x, y) = (1, 1)`. The gradient there is `g = (10, 1)` and the Hessian is `diag(10, 1)`.

```text
Newton's step:   Δ = −H⁻¹g = −(10/10, 1/1) = (−1, −1)   →  new point (0, 0): exact minimum, one step.

gradient descent, lr = 0.1 (the largest safe rate for the steep x direction):
step 1:  x = 1 − 0.1(10) = 0.0      y = 1 − 0.1(1) = 0.9
step 2:  x = 0.0                     y = 0.9 − 0.1(0.9) = 0.81
step 3:  x = 0.0                     y = 0.81 − 0.1(0.81) = 0.729
         ⋮  (y keeps shrinking by a factor of 0.9 every step)
```

Gradient descent reaches the minimum in `x` immediately — but the same learning rate, safe for `x`'s steep curvature, is far too cautious for `y`'s shallow curvature, so `y` crawls toward 0 at 90% of its previous value every step, needing dozens of steps to get as close as Newton's single step already is.

## Bench

```bench
id: newton-vs-gd
title: One Newton step vs many gradient-descent steps
fallback: An elongated bowl with two independently adjustable curvatures. Compare Newton's single, exact step against gradient descent's slower path, stepping through the gradient-descent path one step at a time.
```

**Try this**

1. Keep the default steep/shallow bowl and watch Newton land exactly on the minimum in one step.
2. Step gradient descent forward and count how many steps it needs to get as close as Newton already is.
3. Make the bowl more extreme (steeper in one direction, shallower in the other) and watch gradient descent's path get even slower while Newton is unaffected.

**What you should notice:** Newton's step size automatically adapts to each direction's curvature; gradient descent's single learning rate is always a compromise, exactly right for no direction unless the bowl happens to be perfectly round.

## Where it appears in AI

* **Why Newton's method itself is not used for deep networks:** storing and inverting a Hessian over millions of parameters is computationally impossible.
* **Adam and other adaptive optimizers** (see [[Momentum and Adam]]) use a cheap, diagonal approximation to curvature — tracking each parameter's own gradient variance — as a lightweight substitute for the full Hessian.
* **K-FAC and natural gradient methods** approximate the curvature with structured, cheaper-to-invert matrices, trading some accuracy for tractability.

## Common pitfalls

* **Assuming Adam is "second-order."** It only tracks a per-parameter scale from gradient statistics, not true curvature information between different parameters.
* **Expecting Newton's method to generalise to non-quadratic losses in one step.** Real loss surfaces are not perfectly quadratic, so Newton's method there takes several steps too, just usually far fewer than gradient descent.
* **Ignoring that an ill-conditioned loss (very different curvatures in different directions) is exactly where gradient descent struggles most**, and exactly where second-order information helps most.

## Quick check

<details><summary>1. In the worked example, why does gradient descent need many more steps than Newton's method?</summary>
Its single learning rate is tuned to be safe for the steep `x` direction, which makes it far too small to make fast progress in the shallow `y` direction.
</details>

<details><summary>2. Why isn't Newton's method used directly to train deep networks?</summary>
Its Hessian has one entry per pair of parameters — computationally far too large to store or invert for networks with millions of parameters.
</details>

<details><summary>3. Does Adam use the true Hessian?</summary>
No — it uses a cheap, diagonal approximation built from tracking each parameter's own gradient statistics, not the full curvature matrix.
</details>

## Key terms

* **Second-order method:** an optimization method that uses curvature (second-derivative) information, not just the gradient.
* **Newton's method:** the second-order update `Δx = −H⁻¹g`, exact in one step for a quadratic loss.
* **Ill-conditioned loss:** a loss surface with very different curvatures in different directions.

## Related

[[Hessian]] · [[Gradient Descent]] · [[Momentum and Adam]] · [[Convex vs Non-Convex]]
