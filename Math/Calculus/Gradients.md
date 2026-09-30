The **gradient** collects all the partial derivatives of a function into one vector, `∇f = (∂f/∂x, ∂f/∂y, …)`. It points in the direction of steepest ascent, and its length tells you how steep that climb is. Going the opposite way is the fastest way down, which is the whole idea of training a model.

**You need:** [[Partial Derivatives]], [[Scalars and Vectors]] and [[Norms and Distance]].

## The question it answers

"Standing at this point on a surface, which way should I step to climb (or descend) fastest?" With many parameters you cannot try directions one by one; the gradient tells you at once.

## Intuition: the compass on a hillside

Imagine a hill. At your feet, the gradient is an arrow pointing straight uphill along the steepest line, and it is longer where the slope is steeper. Contour lines (paths at constant height) run perpendicular to it. **Negative** the gradient points straight downhill.

```text
∇f(x, y) = ( ∂f/∂x , ∂f/∂y )
steepest ascent direction:   ∇f / ‖∇f‖
steepest descent direction:  −∇f / ‖∇f‖
slope in that direction:     ‖∇f‖
```

The gradient is zero at flat spots: minima, maxima and saddle points.

## A worked example

Take the bowl `f(x, y) = x² + y²`:

```text
∇f = (2x, 2y)
at (3, 4):  ∇f = (6, 8),   ‖∇f‖ = √(36 + 64) = 10
```

At `(3, 4)` the steepest climb points along `(6, 8)`, away from the bottom at `(0, 0)`, with slope 10. The steepest **descent** points along `(−6, −8)`, straight toward the bottom.

Take a small step of size `0.1` against the gradient: `(3, 4) − 0.1 · (6, 8) = (2.4, 3.2)`, and `f` drops from `25` to `5.76 + 10.24 = 16`. That is one step of **gradient descent** (see [[Gradient Descent]]).

The directional slope in any direction `u` (a unit vector) is `∇f · u` (a dot product), which is largest when `u` points along `∇f`. That is why the gradient is the steepest direction.

## Bench

```bench
id: contour-gradient
title: Follow the gradient on a contour map
fallback: A shaded contour map of a two-variable function; choose a function, drag a point, and see the gradient arrow, the downhill arrow, and the slope, with numbers for both partial derivatives.
```

**Try this**

1. Drag the point on the bowl and see the arrow always point away from the centre.
2. Check the arrow is perpendicular to the colour bands.
3. Switch to the saddle and find where the gradient vanishes.
4. Find where the arrow is longest.

**What you should notice:** the gradient is perpendicular to the contour lines, longest where the colour changes fastest, and zero at flat spots.

## Where it appears in AI

* **Gradient descent** steps along `−∇L` (see [[Gradient Descent]]).
* **Backpropagation** computes the gradient of the loss for every parameter.
* **Saliency maps** show which input pixels most affect a prediction.

## Common pitfalls

* **Confusing gradient with slope in one direction.** It is a vector.
* **Stepping along `+∇` when minimising.**
* **Ignoring scale:** the gradient depends on units and on the function's shape.
* **Assuming zero gradient means minimum.** It might be a maximum or saddle.

## Quick check

<details><summary>1. What is ∇f for f = 3x + 2y?</summary>
(3, 2).
</details>

<details><summary>2. For f = x² + y², what is ∇f at (1, −2)?</summary>
(2, −4).
</details>

<details><summary>3. Which direction reduces f fastest?</summary>
Opposite the gradient, along −∇f.
</details>

## Key terms

* **Gradient:** the vector of partial derivatives.
* **Steepest ascent:** the direction of fastest increase.
* **Contour line:** a path of constant function value.
* **Critical point:** where the gradient is zero.

## Related

[[Partial Derivatives]] · [[Dot Product]] · [[Jacobian]] · [[Gradient Descent]] · [[Minima, Maxima and Saddle Points]]
