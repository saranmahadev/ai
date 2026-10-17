An ordinary artificial neuron on [[Deep Learning]] responds to a *direction* — a weighted sum, a dot product between input and weight vector. A radial basis function (RBF) unit responds to a *distance* instead: how close the input is to the unit's own centre. That one change makes a hard problem like XOR solvable without any iterative training at all.

**You need:** [[The Artificial Neuron and Activation Functions]], [[Norms and Distance]].

## The question it answers

"What if a hidden unit measured closeness to a point, instead of alignment with a direction?" An RBF network's hidden layer does exactly that — each unit has a centre, and fires strongest when the input is near that centre, fading smoothly as the input moves away. Once that hidden layer is fixed, the output layer is just a linear combination of those closeness scores, which can be **solved for directly** with linear algebra instead of trained iteratively.

## Intuition

Instead of neurons that ask "does this input point in roughly the direction I care about?", imagine neurons that each ask "how close is this input to *my* particular spot?" A unit centred near the data you want it to recognise lights up strongly; move far enough away and it fades to near zero. With enough well-placed centres, any function can be approximated as a weighted sum of these localized "bumps" — and because the bumps themselves aren't being trained (just placed), finding the best weights for combining them is an ordinary least-squares problem.

## Definition and notation

The standard RBF unit uses a Gaussian:

```text
φ(x) = exp(−‖x − c‖² / (2σ²))
```

`c` is the unit's centre, `σ` controls how quickly its response fades with distance. The network's output is a linear combination of several such units' responses:

```text
y(x) = Σᵢ wᵢ · φᵢ(x) + b
```

Because `y` is *linear* in the weights `w` (even though each `φᵢ` is a nonlinear function of `x`), fitting `w` to a set of training examples is an ordinary linear least-squares problem — the same kind of calculation as [[Least Squares]] — once the centres and widths are chosen.

## A worked example

Two RBF units, centred at `c₁ = [0, 0]` and `c₂ = [1, 1]`, with `σ = 0.5`, fit to the four XOR points — exactly the function [[The Perceptron|a single linear unit]] cannot represent:

```text
input    φ₁(x)    φ₂(x)    target
[0,0]    1.000    0.018      0
[0,1]    0.135    0.135      1
[1,0]    0.135    0.135      1
[1,1]    0.018    1.000      0
```

Solving the linear least-squares fit `y = w₁φ₁ + w₂φ₂ + b` for these four points gives `w₁ ≈ −1.338`, `w₂ ≈ −1.338`, `b ≈ 1.362`, and plugging back in:

```text
predictions: 0.000, 1.000, 1.000, 0.000  — an exact fit
```

No gradient descent, no iteration — two well-placed Gaussian bumps turned XOR into a problem a single linear solve could finish exactly.

## Bench

```bench
id: rbf-xor
title: Solving XOR with two Gaussian bumps
fallback: Place two RBF centres and set their width, then solve the linear output layer exactly and see how well the resulting function fits the XOR points.
```

**Try this**

1. Move the two centres and watch how well the fit holds up as they drift away from the two XOR "corners."
2. Shrink the width σ and see the function become sharply peaked rather than smooth.
3. Try fitting with only one centre and see the least-squares solution fail to separate the four points.

**What you should notice:** the hidden layer never trains at all in this bench — only its centres and width are chosen by hand, and the entire fitting happens in the one linear solve for the output weights.

## Where it appears in AI

* **It is a direct example of solving instead of iterating**: once the nonlinear part of the model (the centres) is fixed, the rest is exactly the kind of problem [[Least Squares]] already solves in closed form.
* **It foreshadows [[Extreme Learning Machines]]**, covered later in this district, which pushes the same idea further: make *all* of the hidden layer's parameters fixed (not just placed by hand) and solve for the output weights alone.
* **Kernel methods on [[Machine Learning]]**, particularly kernel-based [[Support Vector Machines|SVMs]], use a mathematically related idea — measuring similarity via a kernel function rather than a raw dot product.

## Common pitfalls

* **Assuming more centres always help.** Too many centres can overfit, just as adding too many features can elsewhere on [[Machine Learning]].
* **Placing centres badly.** If no centre sits near a region of the input space, the network has very little signal to work with there — the width and placement of centres matter as much as the number of them.
* **Forgetting the output layer is still linear.** Fitting it is cheap and exact, but it can still only combine the fixed hidden responses — it cannot invent new nonlinear structure the chosen centres didn't already provide.

## Quick check

<details><summary>1. What does an RBF unit respond to, as opposed to an ordinary artificial neuron?</summary>
Closeness (distance) to a fixed centre, rather than alignment (a dot product) with a weight direction.
</details>

<details><summary>2. Why can the RBF network's output weights be solved for directly, without gradient descent?</summary>
Because the output is a linear combination of the (fixed, nonlinear) hidden-layer responses — linear in the weights being fit, which makes it an ordinary least-squares problem.
</details>

<details><summary>3. In the worked example, why could two RBF units solve XOR when a single linear unit cannot?</summary>
Each RBF unit's response is already a nonlinear function of distance to its centre, giving the output layer nonlinear features to combine linearly — unlike a single linear unit, which can only combine the raw inputs linearly.
</details>

## Key terms

* **Centre:** the fixed point in input space an RBF unit measures distance from.
* **Width (σ):** how quickly an RBF unit's response fades as the input moves away from its centre.
* **Closed-form solution:** a solution obtained by direct computation (here, linear least squares), rather than iterative optimization.

## Related

[[The Artificial Neuron and Activation Functions]] · [[Least Squares]] · [[Extreme Learning Machines]]
