**Automatic differentiation** (autodiff) is how software computes exact derivatives: it records each operation in a **computational graph**, then applies the chain rule backwards through that graph. It is what powers backpropagation in every modern deep-learning framework.

**You need:** [[Chain Rule]], [[Derivative Rules]] and [[Graphs and Networks]].

## The question it answers

"How can a computer get the gradient of a function with millions of parameters, exactly and cheaply?" Doing it by hand is impossible, and estimating each derivative by nudging inputs would need one full evaluation per parameter.

## Intuition: a recipe written as a graph

Break a calculation into small steps, each a simple operation whose derivative is known: add, multiply, `sin`, `exp`. Draw them as a graph: inputs on the left, the final output on the right.

* **Forward pass:** compute each node's value from left to right.
* **Backward pass:** start at the output with derivative 1, then move right to left. At each node, multiply the incoming derivative by the local derivative and pass it on to the inputs (adding contributions when a value is used more than once).

This is the chain rule, organised so every derivative is computed in **one backward sweep**, no matter how many inputs there are. That is why training a model with a billion parameters costs only a small multiple of running it.

## A worked example

Let `f(x, y) = x·y + sin(x)` at `x = 2`, `y = 3`.

```text
forward:   a = x · y     = 6
           b = sin x     = 0.9093
           f = a + b     = 6.9093

backward:  ∂f/∂a = 1      ∂f/∂b = 1
           ∂a/∂x = y = 3   ∂a/∂y = x = 2      ∂b/∂x = cos x = −0.4161

∂f/∂x = ∂f/∂a·∂a/∂x + ∂f/∂b·∂b/∂x = 1·3 + 1·(−0.4161) = 2.5839
∂f/∂y = ∂f/∂a·∂a/∂y = 1·2 = 2
```

Notice `x` feeds two nodes (`a` and `b`), so its derivative *adds* two paths. Check by the formula: `∂f/∂x = y + cos x = 3 − 0.4161 = 2.5839` ✓.

Compare with **numerical differentiation** (nudging `x` by a tiny amount), which is approximate and needs a separate run per input, and with **symbolic** differentiation, which can produce enormous expressions. Autodiff is exact and efficient.

## Bench

```bench
id: graph-backprop
title: Forward and backward through a graph
fallback: A small computational graph for f(x, y) = x·y + sin x; sliders set x and y, and a stepper walks the forward pass and then the backward pass, showing each node's value and derivative.
```

**Try this**

1. Step forward and watch each value fill in.
2. Step backward and see the derivatives flow right to left.
3. Compare the result with the numerical check.
4. Change x and see which derivatives change.

**What you should notice:** a value used twice collects derivative from both paths, and one backward sweep gives the derivative for every input.

## Where it appears in AI

* **Backpropagation** is reverse-mode autodiff (see [[Backpropagation by Hand]]).
* **Frameworks** (PyTorch, JAX, TensorFlow) build the graph as you compute.
* **Custom losses and layers** need no hand-derived gradients.

## Common pitfalls

* **Forgetting to add paths** when a value is reused.
* **Confusing autodiff with numerical differentiation.**
* **Ignoring memory:** the backward pass needs stored forward values.
* **Non-differentiable operations** (rounding, argmax) give zero or undefined gradients.

## Quick check

<details><summary>1. In f = x·y at x = 2, y = 5, what is ∂f/∂x?</summary>
5.
</details>

<details><summary>2. Why does the backward pass start with derivative 1?</summary>
The derivative of the output with respect to itself is 1.
</details>

<details><summary>3. Why is reverse mode efficient for training?</summary>
One backward sweep gives the gradient for every parameter of a single output (the loss).
</details>

## Key terms

* **Computational graph:** operations and values drawn as a graph.
* **Forward pass:** computing values from inputs to output.
* **Backward pass:** propagating derivatives from output to inputs.
* **Reverse-mode autodiff:** the method behind backpropagation.

## Related

[[Chain Rule]] · [[Graphs and Networks]] · [[Gradients]] · [[Backpropagation by Hand]] · [[A Forward Pass by Hand]]
