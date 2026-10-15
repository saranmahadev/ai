A **multilayer feedforward network** wires several [[The Artificial Neuron and Activation Functions|artificial neurons]] into layers and runs them in one direction only, input to output, with no loops. Each layer's output is the next layer's input — nothing more mysterious than applying `dense → activation` repeatedly.

**You need:** [[The Artificial Neuron and Activation Functions]] and [[Matrix Multiplication]].

## The question it answers

"Given one neuron's equation `a = f(w · x + b)`, how exactly do many of them combine into a network?" By collecting a whole layer's weights into a matrix and running the same operation layer after layer: this is the **forward pass**.

## Intuition: a pipeline of layers

Picture an assembly line. Raw input enters, each station (layer) transforms it a little, and the final station's output is the network's prediction. "Deep" simply means more stations; "wide" means more units per station. A layer's matrix `W` has one row per unit in that layer and one column per input it receives, so `Wx` computes every unit's weighted sum in one matrix–vector multiply.

## Definitions

```text
layer l:   z⁽ˡ⁾ = W⁽ˡ⁾ a⁽ˡ⁻¹⁾ + b⁽ˡ⁾        a⁽ˡ⁾ = f⁽ˡ⁾(z⁽ˡ⁾)
a⁽⁰⁾ = x (the input)
a⁽ᴸ⁾ = ŷ (the network's output, after L layers)
```

The output layer's activation `f⁽ᴸ⁾` depends on the task: linear (identity) for regression, sigmoid for yes/no classification, [[Softmax and Cross-Entropy in Practice|softmax]] for many classes.

## A worked example

A network with 2 inputs, one hidden layer of 3 ReLU units, and one sigmoid output:

```text
W1 = [[ 0.5, -0.5],         b1 = [ 0.1, -0.2, 0.05]
      [ 0.3,  0.8],
      [-0.6,  0.2]]

W2 = [[0.4, -0.3, 0.6]]     b2 = [0.1]
```

For input `x = (1, 2)`:

```text
z1 = 0.5(1) − 0.5(2) + 0.1  = −0.4  →  ReLU → 0
z2 = 0.3(1) + 0.8(2) − 0.2  =  1.7  →  ReLU → 1.7
z3 = −0.6(1) + 0.2(2) + 0.05 = −0.15 → ReLU → 0

hidden = (0, 1.7, 0)

output pre-activation = 0.4(0) − 0.3(1.7) + 0.6(0) + 0.1 = −0.41
output = sigmoid(−0.41) ≈ 0.3989
```

Two of the three hidden units turned off (ReLU clipped their negative sums to zero); only the middle unit, with activation 1.7, drove the output.

## Bench

```bench
id: mlp-forward
title: Watch a forward pass flow through the layers
fallback: A 2-input, 3-hidden-unit, 1-output network. Move the two input sliders and watch every unit's value update, with brighter nodes meaning a larger activation.
```

**Try this**

1. Start at `x = (1, 2)` and check the hidden and output values against the worked example.
2. Push `x1` very negative. Which hidden units turn off (go to exactly zero)?
3. Find an input where all three hidden units are zero. What is the output then?

**What you should notice:** a hidden unit's brightness snaps to zero the moment its pre-activation sum crosses below zero (ReLU's kink), and the output only depends on whichever hidden units stayed on.

## Where it appears in AI

* **The baseline architecture** underneath specialised ones: a CNN is a feedforward network with weight-sharing (see [[Convolutional Neural Networks]]); a transformer's feedforward block is literally this.
* **Every framework's "model.forward()"** is this computation, done with matrices sized for the real data.

## Common pitfalls

* **Confusing depth and width.** Depth is the number of layers; width is units per layer. They trade off differently (see [[Why Depth Helps]]).
* **Forgetting the output activation depends on the task.** Using a sigmoid output for a regression target, or a linear output for a probability, silently breaks training.
* **Assuming a bigger network is always better.** A wider or deeper network that is not needed just overfits faster (see [[Overfitting and Double Descent]]) and trains slower.

## Quick check

<details><summary>1. In the worked example, why is the first hidden unit's activation exactly 0?</summary>
Its pre-activation sum is −0.4, which is negative, and ReLU clips every negative input to 0.
</details>

<details><summary>2. What is `a⁽⁰⁾` in the layer notation?</summary>
The network's raw input `x`, before any layer has processed it.
</details>

<details><summary>3. What changes between a regression network and a classification network with the same hidden layers?</summary>
Only the output layer's activation function: identity for regression, sigmoid or softmax for classification.
</details>

## Key terms

* **Forward pass:** computing a network's output from its input, layer by layer.
* **Weight matrix:** a layer's weights, one row per unit, one column per input.
* **Depth:** the number of layers in a network.
* **Width:** the number of units in a given layer.

## Related

[[The Artificial Neuron and Activation Functions]] · [[Matrix Multiplication]] · [[A Forward Pass by Hand]] · [[Universal Approximation]] · [[Why Depth Helps]]
