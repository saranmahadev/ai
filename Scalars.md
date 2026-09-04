# 1.1.1 Scalars

A **scalar** is the simplest mathematical object: **a single value**.

Examples:

$$
5,\quad -3,\quad 0,\quad 2.5,\quad 100
$$

These are all scalars.

---

## 1. What does "scalar" mean?

A scalar represents a **magnitude without direction**.

For example:

* Temperature → `25°C`
* Age → `30`
* Price → `$50`
* Learning rate → `0.001`
* Weight of a neural network parameter → `0.42`

Each is represented by **one number**.

Compare:

| Mathematical object |                                  Example | What it represents                         |
| ------------------- | ---------------------------------------: | ------------------------------------------ |
| **Scalar**          |                                    \(5\) | One value                                  |
| **Vector**          |                              \([5,2,8]\) | Multiple values with direction/coordinates |
| **Matrix**          | \(\begin{bmatrix}1&2\\3&4\end{bmatrix}\) | 2D arrangement of values                   |
| **Tensor**          |                 Higher-dimensional array | Generalized multidimensional data          |

So the hierarchy starts roughly as:

$$
\boxed{\text{Scalar} \rightarrow \text{Vector} \rightarrow \text{Matrix} \rightarrow \text{Tensor}}
$$

---

# 2. Scalars in Machine Learning

Scalars appear **everywhere** in ML.

### Example: Learning rate

Suppose:

$$
\alpha = 0.001
$$

Here, \(\alpha\) is a scalar.

Gradient descent might use:

$$
w_{\text{new}} = w_{\text{old}} - \alpha \nabla L
$$

where:

* \(w\) → parameter/vector
* \(\nabla L\) → gradient/vector
* \(\alpha\) → **scalar**

The scalar controls **how large a step** we take.

---

### Example: Neural-network weight

A single neural-network parameter might be:

$$
w = 0.73
$$

That's a scalar.

A neuron may have thousands of weights:

$$
W =
\begin{bmatrix}
0.2 & -0.4 & 0.8 & \cdots
\end{bmatrix}
$$

Now we're dealing with a **vector/matrix**, rather than one scalar.

---

### Example: Loss

A model might produce:

$$
L = 0.243
$$

The loss is usually a **scalar**.

That's important because training ultimately tries to minimize this single quantity:

$$
\boxed{\min_\theta L(\theta)}
$$

---

# 3. Scalar Arithmetic

Scalars behave like ordinary numbers.

### Addition

$$
3 + 5 = 8
$$

### Subtraction

$$
3 - 5 = -2
$$

### Multiplication

$$
3 \times 5 = 15
$$

### Division

$$
\frac{10}{2}=5
$$

Nothing special yet.

The important thing is that **scalars become important when we start operating on vectors and matrices**.

---

# 4. Scalars vs Vectors

This distinction is fundamental.

A scalar:

$$
x = 5
$$

contains **one value**.

A vector:

$$
\mathbf{x} =
\begin{bmatrix}
5\\
2\\
8
\end{bmatrix}
$$

contains **three values**.

You can multiply a vector by a scalar:

$$
3
\begin{bmatrix}
5\\
2\\
8
\end{bmatrix}
=
\begin{bmatrix}
15\\
6\\
24
\end{bmatrix}
$$

Here, \(3\) is the **scalar** and the vector is being **scaled**.

This operation is called **scalar multiplication**.

---

# 5. Why Scalars Matter for AI

You don't need to study scalars for very long. The key concepts to internalize are:

1. **A scalar is a single number.**
2. Scalars have **magnitude but no direction**.
3. Scalars are used extensively as parameters, constants, losses, probabilities, learning rates, etc.
4. A scalar can **scale** a vector or matrix.
5. Scalars are the building blocks from which vectors, matrices, and tensors are constructed.

For example, in a neural network:

$$
\boxed{
\text{Scalar weights}
\rightarrow
\text{Vectors/Matrices}
\rightarrow
\text{Tensor operations}
\rightarrow
\text{Neural network}
}
$$

---

## What you should be able to answer

Before moving to **vectors**, make sure these are clear:

* What is a scalar?
* Why is \(5\) a scalar?
* Is \(5 \times 7\) a scalar? **Yes — 35.**
* Is \(0.001\) a scalar? **Yes.**
* Is a neural-network weight a scalar? **A single weight is.**
* Is a loss value a scalar? **Usually, yes.**
* Can a scalar multiply a vector? **Yes.**
* What does scalar multiplication do? **It scales every component of the vector/matrix.**

**Next topic: Vectors.**
