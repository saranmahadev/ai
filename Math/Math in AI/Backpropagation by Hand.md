**Backpropagation** computes how the loss changes with every weight in a network by applying the chain rule backwards from the output. Its results are exactly the gradients that gradient descent needs. This topic does it by hand for the tiny network of [[A Forward Pass by Hand]], then takes one learning step.

**You need:** [[A Forward Pass by Hand]], [[Chain Rule]], [[Automatic Differentiation]] and [[Gradient Descent]].

## The question it answers

"How does a network know which way to nudge each of its weights?" Every weight influences the loss through a chain of later operations. The chain rule multiplies the sensitivities along that chain.

## The method

Work backwards, keeping track of `∂L/∂(value)` at each node. Two local facts do most of the work:

* Sigmoid followed by log loss: `∂L/∂z₂ = ŷ − y` (see [[Logistic Regression and the Sigmoid]]).
* ReLU passes the gradient through where the input was positive and blocks it where it was not.

For a linear step `z = W a + b`: `∂L/∂W = (∂L/∂z) ⊗ aᵀ`, `∂L/∂b = ∂L/∂z`, and the gradient sent back to `a` is `Wᵀ · ∂L/∂z`.

## A worked example

Using the forward pass: `x = (1, 2)`, `z₁ = (−1.5, 2.5)`, `a₁ = (0, 2.5)`, `z₂ = 1.0`, `ŷ = 0.7311`, and `y = 1`.

**Output layer:**

```text
∂L/∂z₂ = ŷ − y = 0.7311 − 1 = −0.2689
∂L/∂w₂ = (−0.2689) · a₁ = ( 0 , −0.6724 )
∂L/∂b₂ = −0.2689
∂L/∂a₁ = (−0.2689) · w₂ = ( −0.2689 , −0.2152 )
```

**Through the ReLU** (the first unit had a negative `z₁`, so its gradient is blocked):

```text
∂L/∂z₁ = ( 0 , −0.2152 )
```

**Hidden layer weights:**

```text
∂L/∂W₁ = ∂L/∂z₁ ⊗ x  =  [ 0        0      ]
                         [ −0.2152  −0.4303 ]
∂L/∂b₁ = ( 0 , −0.2152 )
```

**Check** with a tiny nudge: increasing `W₁[2,1]` by `10⁻⁶` changes the loss by `−0.215 × 10⁻⁶`, matching `−0.2152` ✓.

**One step** of gradient descent with `η = 0.5`:

```text
w₂ = (1, 0.8 + 0.5 × 0.6724) = (1, 1.1362)      b₂ = −1 + 0.5 × 0.2689 = −0.8655
W₁ row 2 = (1 + 0.5×0.2152, 0.5 + 0.5×0.4303) = (1.1076, 0.7152)     b₁ = (0, 0.6076)
new forward pass: ŷ = 0.9375   loss = 0.0645   (down from 0.3133)
```

One step took the loss from 0.313 to 0.065. Repeat it many times, on many examples, and you have training.

## Bench

```bench
id: gradient-flow
title: Trace the gradient backwards
fallback: A stepper walks the tiny network forward, then backwards, then applies one gradient-descent update; each step shows the values or gradients at each node, and a numerical check compares one gradient with a finite-difference estimate.
```

**Try this**

1. Step forward, then backward, and check the gradients against the numbers above.
2. Find where the gradient is blocked by the ReLU.
3. Apply the update and compare the loss before and after.
4. Change the learning rate and see the effect of the step.

**What you should notice:** the gradient shrinks or is blocked as it flows back, the numerical check agrees, and one update lowers the loss.

## Where it appears in AI

* **Every neural network** is trained by backpropagation.
* **Frameworks** automate it with automatic differentiation.
* **Vanishing and exploding gradients** are products of these factors across many layers.

## Common pitfalls

* **Forgetting the ReLU mask** in the backward pass.
* **Using the wrong forward values** (backprop needs the stored activations).
* **Updating with the wrong sign.**
* **Mixing up `Wᵀ` and `W`** when passing the gradient back.

## Quick check

<details><summary>1. What is ∂L/∂z for sigmoid plus log loss with ŷ = 0.9, y = 0?</summary>
0.9.
</details>

<details><summary>2. What does ReLU do to the gradient where its input was negative?</summary>
Blocks it (zero).
</details>

<details><summary>3. Which way do we move a weight whose gradient is negative?</summary>
Up (increase it).
</details>

## Key terms

* **Backpropagation:** applying the chain rule backwards through a network.
* **Local gradient:** the derivative of one node's output with respect to its input.
* **Gradient check:** comparing an analytic gradient with a numerical estimate.
* **Update step:** subtracting the learning rate times the gradient.

## Related

[[Chain Rule]] · [[Automatic Differentiation]] · [[Jacobian]] · [[A Forward Pass by Hand]] · [[Gradient Descent]]
