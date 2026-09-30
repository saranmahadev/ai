**Logistic regression** answers yes/no questions with a probability. It takes a weighted sum of the inputs, exactly like linear regression, and squashes it through the **sigmoid** so the output lies between 0 and 1. It is trained by minimising log loss, and its gradient is strikingly simple.

**You need:** [[Functions AI Loves]], [[Cross-Entropy]], [[Derivatives of Exp, Log and Sigmoid]] and [[Linear Regression End to End]].

## The question it answers

"How likely is this to be a yes?" Will this email be spam, will this student pass, will this customer click? A raw line can predict 1.7 or −0.4; a probability must stay between 0 and 1.

## The model

```text
score  z = w·x + b            (a linear function of the inputs)
p = σ(z) = 1 / (1 + e⁻ᶻ)      probability of the "yes" class
predict yes if p ≥ 0.5, which is the same as z ≥ 0
```

The **decision boundary** is where `z = 0`. With one input `x`, that is the point `x = −b / w`. The weight `w` sets how sharply the probability changes across it.

## Training: log loss and its gradient

For a label `y ∈ {0, 1}` the loss is the cross-entropy of the true label against the prediction:

```text
L = −[ y ln p + (1 − y) ln(1 − p) ]
```

Combining the chain rule with `σ′ = σ(1 − σ)` gives a remarkably clean result for the gradient with respect to the score:

```text
∂L/∂z = p − y            and therefore     ∂L/∂w = (p − y)·x,    ∂L/∂b = p − y
```

The gradient is just "prediction minus truth", scaled by the input.

## A worked example

One input, `w = 1`, `b = −3`. The boundary is at `x = 3`.

```text
x = 3:   z = 0    p = 0.5
x = 5:   z = 2    p = σ(2)  = 0.8808
x = 1:   z = −2   p = σ(−2) = 0.1192
```

If the true label at `x = 1` is `y = 1` (a yes the model doubted): `L = −ln 0.1192 = 2.127`. Gradient with respect to the score: `p − y = 0.1192 − 1 = −0.881`, so the update pushes the score for that example up. If instead `y = 0`, the loss is `−ln(1 − 0.1192) = 0.127` (small: the model was right).

Notice it uses [[Cross-Entropy]] from the information-theory district, the sigmoid from the algebra district, and the chain rule from calculus.

## Bench

```bench
id: boundary-drawer
title: Draw the decision boundary
fallback: Two classes of points on a line; sliders for the weight and bias draw the sigmoid curve and the decision boundary, showing accuracy and log loss, with a button that trains the model by gradient descent.
```

**Try this**

1. Move the boundary between the two groups and read the accuracy.
2. Increase the weight to sharpen the curve and watch the loss.
3. Place the boundary badly and see the loss rise.
4. Press "Train" and compare with your best manual setting.

**What you should notice:** accuracy depends only on where the boundary sits, while the loss also rewards confident correct predictions and punishes confident wrong ones.

## Where it appears in AI

* **Binary classifiers** end in a sigmoid.
* **Every neuron with a sigmoid** is a tiny logistic regression.
* **Log loss** and its gradient `p − y` recur in nearly all classification.

## Common pitfalls

* **Treating the output as a certain answer** rather than a probability.
* **Using squared error** for classification (log loss trains better).
* **Very confident wrong predictions** that dominate the loss.
* **Assuming a linear boundary** can separate any data.

## Quick check

<details><summary>1. With w = 2 and b = −4, where is the boundary?</summary>
x = 2.
</details>

<details><summary>2. What is σ(0)?</summary>
0.5.
</details>

<details><summary>3. What is ∂L/∂z for p = 0.9 and y = 0?</summary>
0.9.
</details>

## Key terms

* **Logistic regression:** a linear score passed through a sigmoid to give a probability.
* **Decision boundary:** where the predicted probability is 0.5.
* **Log loss:** the cross-entropy of the true label against the predicted probability.
* **Logit:** the score `z` before the sigmoid.

## Related

[[Functions AI Loves]] · [[Cross-Entropy]] · [[Derivatives of Exp, Log and Sigmoid]] · [[Lines, Planes and Circles]] · [[Softmax and Cross-Entropy in Practice]]
