A single linear unit — a [[The Perceptron|perceptron]] or a [[Logistic Regression as a Classifier|logistic regression]] — can only cut its input space with one straight line (or flat plane). A **neural network** is what you get when you feed the output of several such units, through a non-linear kink, into another unit: stacking turns one straight cut into a boundary of almost any shape.

**You need:** [[The Perceptron]] and [[Logistic Regression as a Classifier]].

## The question it answers

"If one linear unit can only draw a straight line, how do I learn a boundary that bends?" Take the four points of XOR: `(0,0)→0`, `(0,1)→1`, `(1,0)→1`, `(1,1)→0`. No single straight line separates the 0s from the 1s — try to draw one and you will always cut through at least one point on the wrong side.

## Intuition: build the bend out of straight pieces

A single line can compute OR: it scores 1 for any point with `x₁ + x₂` large enough, 0 otherwise, and gets three of the four XOR points right. Another line computes AND: 1 only when both inputs are 1. Neither alone solves XOR — but **XOR is exactly "OR, but not AND"**: true for `(0,1)` and `(1,0)`, false for `(0,0)` and `(1,1)`. Compute OR and AND with two hidden units, then combine them with a third unit that fires on OR but not on AND. That third unit is a new, bent decision boundary built entirely out of straight pieces.

## Definitions

```text
hidden layer    h = f(W₁x + b₁)      — a non-linearity f applied after a linear map
output layer    y = g(W₂h + b₂)
"neural network" with zero hidden layers = an ordinary linear model
```

A **fully connected (dense) layer** connects every input to every output of that layer with its own weight. Without a non-linearity `f` between two linear layers, the pair collapses to one linear layer (a linear map of a linear map is still linear), so the kink is what buys the extra power.

## A worked example

Use the step function `f(z) = 1` if `z > 0` else `0`. Build two hidden units:

```text
h_OR  = step(x₁ + x₂ − 0.5)     fires on (0,1), (1,0), (1,1)
h_AND = step(x₁ + x₂ − 1.5)     fires only on (1,1)
output = step(h_OR − h_AND − 0.5)
```

Checking all four inputs:

```text
(0,0): h_OR=0, h_AND=0  →  step(0 − 0 − 0.5) = step(−0.5) = 0   ✓
(0,1): h_OR=1, h_AND=0  →  step(1 − 0 − 0.5) = step(0.5)  = 1   ✓
(1,0): h_OR=1, h_AND=0  →  step(0.5) = 1                        ✓
(1,1): h_OR=1, h_AND=1  →  step(1 − 1 − 0.5) = step(−0.5) = 0   ✓
```

Two hidden units and one output unit solve XOR exactly — something no single linear unit can do. The single best line (plain OR) only gets three of the four points right.

## Bench

```bench
id: xor-stack
title: One line vs two layers
fallback: The four XOR points, coloured by class. Switch between a single linear unit (which gets 3 of 4 right) and the two-layer network above (4 of 4), and watch the shaded decision region change shape.
```

**Try this**

1. Start on "Single linear unit" and note which point it gets wrong.
2. Switch to "Two-layer network" and see the region bend around all four points.
3. Think about which hidden unit (OR or AND) is responsible for the corner that single line could never reach.

**What you should notice:** the single unit's region is a half-plane split by one straight edge; the two-layer region has a corner in it — something a single straight cut can never produce.

## Where it appears in AI

* **Every deep architecture** — CNNs, RNNs, transformers — is this same recipe repeated: a linear map, a non-linearity, another linear map, and so on.
* **Zero hidden layers:** logistic regression and softmax classifiers are neural networks with no hidden layer at all.
* **Historically**, the discovery that a single perceptron cannot learn XOR (Minsky and Papert, 1969) slowed neural-network research for over a decade, until multi-layer networks and a practical way to train them (see [[Backpropagation by Hand]]) revived it.

## Common pitfalls

* **Stacking linear layers with no non-linearity between them.** It still collapses to one linear layer; the kink is mandatory.
* **Thinking "neural network" means something exotic.** It is linear algebra and a non-linearity, repeated.
* **Assuming any two-layer network solves XOR.** It needs the right hidden units; a hidden layer with the wrong weights is still just as stuck as one linear unit.

## Quick check

<details><summary>1. Why can't one linear unit learn XOR?</summary>
XOR's two classes are not linearly separable: no single straight line puts all the 0s on one side and all the 1s on the other.
</details>

<details><summary>2. What happens if you remove the non-linearity between two stacked linear layers?</summary>
The two layers collapse into one equivalent linear layer, so you gain nothing from stacking.
</details>

<details><summary>3. In the worked example, which logical functions do the two hidden units compute?</summary>
OR and AND. The output combines them as "OR, but not AND", which is exactly XOR.
</details>

## Key terms

* **Hidden layer:** a layer of units between the input and the output, not observed directly.
* **Non-linearity (activation function):** a function applied after each linear map that lets stacking add power.
* **Fully connected (dense) layer:** a layer connecting every input to every output with its own weight.
* **Linearly separable:** classes a single straight line (or hyperplane) can divide.

## Related

[[The Perceptron]] · [[Logistic Regression as a Classifier]] · [[The Artificial Neuron and Activation Functions]] · [[The Multilayer Feedforward Network]] · [[Why Depth Helps]]
