The **Jacobian** is the matrix of all first partial derivatives of a function that takes several inputs and gives several outputs. Near any point it says how a tiny change in the inputs turns into a change in the outputs: the best *linear* stand-in for a curved function.

**You need:** [[Partial Derivatives]], [[Gradients]] and [[Matrices as Transformations]].

## The question it answers

"If I nudge the inputs a little, how do all the outputs move?" A neural-network layer maps a vector to a vector, and the Jacobian says how its outputs respond to each input.

## Intuition: zoom in and it becomes a matrix

Any smooth function looks linear when you zoom in far enough. For a function with several outputs, "linear" means a matrix acting on the small change. That matrix is the Jacobian. Row `i` holds the gradient of output `i`; column `j` shows how every output responds to input `j`.

```text
For f(x, y) = (f₁, f₂):        J = [ ∂f₁/∂x  ∂f₁/∂y ]
                                   [ ∂f₂/∂x  ∂f₂/∂y ]

f(p + δ) ≈ f(p) + J(p) · δ          for a small change δ
```

A function from `n` inputs to `m` outputs has an `m × n` Jacobian. If there is one output (`m = 1`), the Jacobian is just the gradient written as a row.

## A worked example

Let `f(x, y) = (x²y, 5x + sin y)`.

```text
∂f₁/∂x = 2xy      ∂f₁/∂y = x²
∂f₂/∂x = 5        ∂f₂/∂y = cos y

J(x, y) = [ 2xy   x²    ]        at (1, 0):  J = [0  1]
          [ 5    cos y  ]                        [5  1]
```

Predict what happens for a small step `δ = (0.1, 0.1)` from `(1, 0)`:

```text
f(1, 0) = (0, 5)        J δ = (0·0.1 + 1·0.1,  5·0.1 + 1·0.1) = (0.1, 0.6)
estimate:  (0, 5) + (0.1, 0.6) = (0.1, 5.6)
truth:     f(1.1, 0.1) = (0.121, 5.5 + sin 0.1) = (0.121, 5.5998)
```

The linear estimate is close, and gets better the smaller the step. The determinant of the Jacobian (see [[Determinant]]) tells you how the map scales area locally.

## Bench

```bench
id: local-linear
title: A curved map and its linear stand-in
fallback: A small grid around a chosen point is sent through a curved function and, separately, through its Jacobian; a slider changes the size of the neighbourhood so you can see the two images agree when it is small.
```

**Try this**

1. Start with a tiny neighbourhood: do the curved and linear images match?
2. Grow the neighbourhood and watch them drift apart.
3. Move the base point and see the Jacobian's columns change.
4. Switch functions.

**What you should notice:** the Jacobian is exact only in the limit of very small changes, and it improves the closer you zoom in.

## Where it appears in AI

* **Backpropagation** multiplies Jacobians layer by layer (see [[Backpropagation by Hand]]).
* **Sensitivity of a network's output** to its input (adversarial examples).
* **Change of variables** in probability and flow models uses the Jacobian determinant.

## Common pitfalls

* **Mixing up the shape.** Rows are outputs, columns are inputs.
* **Trusting the linear estimate for big steps.**
* **Forgetting it depends on the point.**
* **Confusing the Jacobian with the Hessian.** The Jacobian has first derivatives.

## Quick check

<details><summary>1. What shape is the Jacobian of a function from 3 inputs to 2 outputs?</summary>
2 × 3.
</details>

<details><summary>2. For f = (2x, 3y), what is J?</summary>
[[2, 0], [0, 3]].
</details>

<details><summary>3. What does J·δ estimate?</summary>
The change in the outputs for a small change δ in the inputs.
</details>

## Key terms

* **Jacobian:** the matrix of first partial derivatives.
* **Local linearisation:** replacing a function by its Jacobian near a point.
* **Vector-valued function:** a function with several outputs.
* **Jacobian determinant:** the local area scaling.

## Related

[[Partial Derivatives]] · [[Gradients]] · [[Matrices as Transformations]] · [[Determinant]] · [[Backpropagation by Hand]]
