[[Radial Basis Function Networks]] fixed a few, deliberately-placed Gaussian centres. An extreme learning machine (ELM) pushes the same "fix the nonlinear part, solve the linear part" idea as far as it will go: make the *entire* hidden layer's weights random, throw in enough of them, and solve for the output layer exactly — no hidden-layer training step at all, ever.

**You need:** [[Radial Basis Function Networks]].

## The question it answers

"Does a hidden layer's weights need to be carefully placed, or even trained, to be useful?" Not necessarily — a single hidden layer of sigmoid (or similarly shaped) units, with weights drawn entirely at random and never adjusted, already projects the input into a high-dimensional space rich enough that a plain linear readout can fit a wide range of functions well, provided there are enough random units.

## Intuition

[[Radial Basis Function Networks|The previous topic]] hand-picked two centres to solve one specific problem. An ELM instead throws a large number of randomly-shaped nonlinear "features" at the wall — some will happen to be shaped usefully for the function being approximated, some won't — and lets the one trained part, the linear output layer, pick out and weight the useful ones while effectively ignoring the rest. More random units mean a better chance that enough of them are usefully shaped, at the cost of more computation in that one linear solve.

## Definition and notation

```text
hidden layer (fixed, random, never trained):
  hⱼ(x) = sigmoid(wⱼ · x + bⱼ),   wⱼ, bⱼ drawn randomly, j = 1 … H

output layer (the only trained part, by least squares):
  y(x) = Σⱼ βⱼ · hⱼ(x) + b
```

This is structurally identical to [[Radial Basis Function Networks]] — a fixed nonlinear hidden layer feeding a linear, least-squares-solved output — with the specific nonlinearity (sigmoid units with random weights, instead of Gaussian bumps at chosen centres) and the number of hidden units `H` as the main design choices.

## A worked example

Fitting `y = sin(3πx)` on 50 points in `[0, 1]`, using `H` random sigmoid hidden units (random weights and biases drawn once, output layer solved by least squares), mean squared error on those same points:

```text
H = 3:    MSE ≈ 0.300    (far too few random features to capture the curve)
H = 5:    MSE ≈ 0.016    (recognisable shape, still visibly off)
H = 10:   MSE ≈ 0.00005  (essentially an exact fit)
H = 20:   MSE ≈ 0.0000   (exact, to the precision shown)
```

Going from 3 to 10 random hidden units dropped the error by roughly four orders of magnitude — not because any hidden unit was chosen well, but because with enough randomly-shaped units, *some* combination of them, found by the one linear solve, reconstructs the target curve almost exactly.

## Bench

```bench
id: elm-fit
title: Random features, one linear solve
fallback: Fit a wavy target function with a chosen number of random sigmoid hidden units and a single least-squares solve for the output layer, and watch the fit improve as the hidden layer grows.
```

**Try this**

1. Start with very few hidden units and watch the fitted curve barely resemble the target.
2. Increase the hidden unit count and watch the fit tighten, usually quite suddenly.
3. Re-roll the random hidden weights (same count) and compare how much the fit quality varies run to run.

**What you should notice:** quality depends much more on *how many* random units there are than on any property of the specific random weights drawn — a strong hint that the method's power comes from abundance, not from any individual unit being well-chosen.

## Where it appears in AI

* **It is the logical extreme of the whole "fix the nonlinear part, solve the linear part" family** in this subject, after [[Radial Basis Function Networks]] (a few chosen centres) and [[Reservoir Computing and Liquid State Machines]] (a large, fixed recurrent core).
* **It highlights how much of a trained network's power can come from its linear output layer alone**, given a sufficiently rich fixed or random representation underneath — a useful reality check against assuming every parameter in a deep network needs careful training to matter.
* **Random features reappear in kernel approximation methods** on [[Machine Learning]], where a random nonlinear projection is used to approximate an expensive kernel computation cheaply.

## Common pitfalls

* **Assuming more hidden units always help without cost.** Each additional unit adds a column to the linear system being solved; with very many units and limited data, the least-squares fit can start overfitting, the same risk as anywhere a model has many free parameters relative to its data.
* **Treating ELM as "no training happens."** Training does happen — just entirely in the output layer, via an exact linear solve rather than any iterative gradient-based process.
* **Expecting one random draw to always be representative.** Different random hidden weights can give meaningfully different fits for the same hidden-layer size, especially with fewer units.

## Quick check

<details><summary>1. What is the only part of an extreme learning machine that is actually trained?</summary>
The output layer's weights, found by an exact linear least-squares solve.
</details>

<details><summary>2. In the worked example, why did the error drop so sharply between 5 and 10 hidden units?</summary>
With more random hidden units, there is a better chance that enough of them happen to be shaped usefully for approximating the target curve, which the output layer's linear solve can then combine effectively.
</details>

<details><summary>3. How does an ELM's hidden layer differ from an RBF network's?</summary>
An RBF network's hidden units are Gaussian bumps at deliberately chosen centres; an ELM's hidden units are typically sigmoid (or similar) units with entirely random weights and biases — both leave the hidden layer fixed and solve only the output layer.
</details>

## Key terms

* **Random feature:** a fixed, randomly-parameterized nonlinear function used as one "column" of the hidden representation.
* **Extreme learning machine (ELM):** a single-hidden-layer network with random, untrained hidden weights and a least-squares-solved output layer.
* **Mean squared error (MSE):** the average squared difference between predictions and targets, used here to measure fit quality.

## Related

[[Radial Basis Function Networks]] · [[Reservoir Computing and Liquid State Machines]] · [[Least Squares]]
