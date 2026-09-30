A **forward pass** pushes an input through a network layer by layer to produce a prediction. Each layer is the same recipe: multiply by a weight matrix, add a bias, apply an activation function. This topic computes a tiny two-layer network by hand, so you can see that a neural network is nothing more than the matrix maths you already know.

**You need:** [[Matrix Multiplication]], [[Matrices as Transformations]], [[Functions AI Loves]] and [[Composition and Inverses]].

## The question it answers

"What actually happens inside a neural network when it makes a prediction?" It is a chain of matrix products with a bend (the activation) between each pair.

## The network

Two inputs, two hidden units with ReLU, one output with a sigmoid:

```text
input x (2 numbers)  →  hidden layer: a₁ = ReLU(W₁ x + b₁)  →  output: ŷ = σ(w₂ · a₁ + b₂)
```

Shapes: `W₁` is `(2 × 2)`, `x` is `(2)`, so `W₁ x` is `(2)`. The output weights `w₂` are `(2)` and dot with `a₁` to give one number. Without the ReLU between them, the two layers would collapse into a single linear layer (see [[Functions AI Loves]]).

## A worked example

```text
x  = (1, 2)
W₁ = [0.5  −1 ]     b₁ = (0, 0.5)
     [1     0.5]
w₂ = (1, 0.8)        b₂ = −1
```

**Layer 1.** Multiply, add the bias:

```text
z₁ = W₁ x + b₁ = ( 0.5·1 − 1·2 + 0 ,  1·1 + 0.5·2 + 0.5 ) = ( −1.5 , 2.5 )
a₁ = ReLU(z₁)  = ( 0 , 2.5 )                   the negative one is switched off
```

**Layer 2.** Dot product, bias, sigmoid:

```text
z₂ = w₂ · a₁ + b₂ = 1·0 + 0.8·2.5 − 1 = 1.0
ŷ  = σ(1.0) = 0.731
```

If the true label is `y = 1`, the loss (log loss) is `−ln 0.731 = 0.313`.

Read it as functions: the network is `ŷ = σ(w₂ · ReLU(W₁ x + b₁) + b₂)`, a composition of a linear map, a non-linearity, another linear map and a sigmoid. A real network has many more units and layers, but the arithmetic is exactly this, done for a whole batch at once with bigger matrices (see [[Tensors and Shapes]]).

## Bench

```bench
id: tiny-network
title: Step through a tiny network
fallback: Sliders set the two inputs and one of the output weights; a stepper walks through the forward pass layer by layer, showing the numbers at each step, ending with the predicted probability and the loss.
```

**Try this**

1. Step through with the default inputs and check each number.
2. Change x₁ and see which steps change.
3. Make a hidden unit's score negative and see it switch off.
4. Change the output weight and watch the prediction.

**What you should notice:** a hidden unit with a negative score contributes nothing, and small changes to the inputs flow forward through the same chain of operations.

## Where it appears in AI

* **Every neural network's inference** is a forward pass.
* **Batches** stack many inputs so one matrix product processes them all.
* **Training** runs a forward pass, then a backward pass (see [[Backpropagation by Hand]]).

## Common pitfalls

* **Skipping the bias or the activation.**
* **Getting the matrix shapes wrong.**
* **Stacking layers without activations,** which collapses to one linear layer.
* **Confusing the pre-activation `z` with the activation `a`.**

## Quick check

<details><summary>1. Where W₁ x + b₁ = (−3, 4), what is ReLU of it?</summary>
(0, 4).
</details>

<details><summary>2. What is σ(0)?</summary>
0.5.
</details>

<details><summary>3. Why is an activation needed between layers?</summary>
Without it the layers collapse into one linear function.
</details>

## Key terms

* **Forward pass:** computing the output from the input through the layers.
* **Hidden layer:** a layer between input and output.
* **Pre-activation / activation:** the value before / after the activation function.
* **Bias:** the constant added in each layer.

## Related

[[Matrix Multiplication]] · [[Functions AI Loves]] · [[Composition and Inverses]] · [[Backpropagation by Hand]] · [[Tensors and Shapes]]
