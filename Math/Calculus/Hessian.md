The **Hessian** is the matrix of all second partial derivatives of a function. It describes how the surface curves in every direction, and its **eigenvalues** tell you whether a flat spot is a bowl (minimum), a hill (maximum) or a saddle.

**You need:** [[Higher Derivatives and Curvature]], [[Partial Derivatives]] and [[Eigenvalues and Eigenvectors]].

## The question it answers

"At a flat spot in many dimensions, what shape is the surface?" With one variable the second derivative decides; with many you need a matrix.

## Intuition: curvature in every direction

For `f(x, y)` the Hessian collects how each slope changes along each direction:

```text
H = [ ∂²f/∂x²    ∂²f/∂x∂y ]
    [ ∂²f/∂y∂x   ∂²f/∂y²  ]
```

(The mixed terms are equal for smooth functions, so `H` is symmetric.) The Hessian's eigenvectors are the principal directions of curvature and its eigenvalues are the curvatures along them.

## Classifying a flat spot

At a point where the gradient is zero:

```text
all eigenvalues > 0     bowl: local minimum
all eigenvalues < 0     hill: local maximum
mixed signs             saddle: up in some directions, down in others
some eigenvalue = 0     flat in some direction: inconclusive
```

## A worked example

```text
f = x² + 3y²        H = [2 0]       eigenvalues 2 and 6     → minimum (a bowl,
                        [0 6]                                  curving 3× more sharply in y)

f = x² − y²         H = [2  0]      eigenvalues 2 and −2    → saddle
                        [0 −2]

f = x² + xy + y²    H = [2 1]       eigenvalues 3 and 1     → minimum
                        [1 2]       (trace 4, determinant 3)
```

For the second, moving along `x` goes up and along `y` goes down from the flat spot at the origin: a saddle, like a mountain pass. The condition number, the ratio of the largest to smallest eigenvalue (6/2 = 3 for the first example), tells you how stretched the bowl is; very elongated bowls make gradient descent zig-zag (see [[Learning Rate]]).

## Bench

```bench
id: saddle-bowl
title: Bowl, hill or saddle?
fallback: Sliders for a, b and c in f = a x squared + b x y + c y squared draw a contour map, show the Hessian and its eigenvalues, and say whether the flat spot at the origin is a minimum, maximum or saddle.
```

**Try this**

1. Make a and c positive: read the eigenvalues.
2. Flip the sign of c to create a saddle.
3. Make both negative for a hill.
4. Add the xy term and watch the axes of the bowl rotate.

**What you should notice:** the signs of the eigenvalues decide the shape, and a mix of signs gives a saddle.

## Where it appears in AI

* **Saddle points** are far more common than local minima in high-dimensional loss surfaces.
* **Second-order optimisers** (Newton's method) use the Hessian to scale steps.
* **Sharpness of a minimum** (large Hessian eigenvalues) is linked to how well a model generalises.

## Common pitfalls

* **Ignoring the mixed terms.** They rotate the axes of curvature.
* **Assuming a zero gradient means a minimum.**
* **Computing the full Hessian for huge models.** It has `n²` entries.
* **Confusing the Hessian with the Jacobian.**

## Quick check

<details><summary>1. What is the Hessian of f = 2x² + 5y²?</summary>
[[4, 0], [0, 10]].
</details>

<details><summary>2. Eigenvalues 3 and −1: minimum, maximum or saddle?</summary>
A saddle.
</details>

<details><summary>3. Why is the Hessian symmetric?</summary>
The mixed partial derivatives are equal for smooth functions.
</details>

## Key terms

* **Hessian:** the matrix of second partial derivatives.
* **Saddle point:** a flat spot that rises in some directions and falls in others.
* **Positive definite:** all eigenvalues positive (a bowl).
* **Condition number:** the ratio of largest to smallest eigenvalue.

## Related

[[Higher Derivatives and Curvature]] · [[Eigenvalues and Eigenvectors]] · [[Minima, Maxima and Saddle Points]] · [[Learning Rate]] · [[Convex vs Non-Convex]]
