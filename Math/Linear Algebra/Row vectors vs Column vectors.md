A **row vector** and a **column vector** contain the same kind of numerical information, but their **orientation and how they participate in matrix operations** are different.

The simplest distinction:

$$
\boxed{\text{Row vector: }1\times n}
$$

$$
\boxed{\text{Column vector: }n\times1}
$$

---

## Row Vector

A row vector is written horizontally:

$$
\mathbf{x}=
\begin{bmatrix}
2 & 5 & 7
\end{bmatrix}
$$

It has:

* **1 row**
* **3 columns**

Therefore its shape is:

$$
\boxed{1\times3}
$$

You can also write:

$$
\mathbf{x}=[2,5,7]
$$

---

## Column Vector

A column vector is written vertically:

$$
\mathbf{x}=
\begin{bmatrix}
2\\
5\\
7
\end{bmatrix}
$$

It has:

* **3 rows**
* **1 column**

Therefore:

$$
\boxed{3\times1}
$$

---

# They Contain the Same Values

Consider:

$$
\mathbf{x}_{row}=
\begin{bmatrix}
2&5&7
\end{bmatrix}
$$

and:

$$
\mathbf{x}_{column}=
\begin{bmatrix}
2\\5\\7
\end{bmatrix}
$$

The values are identical.

The difference is their **shape**:

$$
\mathbf{x}_{row}:1\times3
$$

$$
\mathbf{x}_{column}:3\times1
$$

This distinction becomes extremely important when doing **matrix multiplication**.

---

# Transpose Converts One Into the Other

The operation that flips a row into a column is called the **transpose**.

If:

$$
\mathbf{x}=
\begin{bmatrix}
2&5&7
\end{bmatrix}
$$

then:

$$
\mathbf{x}^T=
\begin{bmatrix}
2\\
5\\
7
\end{bmatrix}
$$

And vice versa:

$$
\left(
\begin{bmatrix}
2\\
5\\
7
\end{bmatrix}
\right)^T
=
\begin{bmatrix}
2&5&7
\end{bmatrix}
$$

So:

$$
\boxed{
(n\times1)^T=1\times n
}
$$

and:

$$
\boxed{
(1\times n)^T=n\times1
}
$$

---

# Why Does Orientation Matter?

Consider a matrix:

$$
A=
\begin{bmatrix}
1&2&3\\
4&5&6
\end{bmatrix}
$$

Its shape is:

$$
\boxed{2\times3}
$$

Now multiply it by a **3×1 column vector**:

$$
\mathbf{x}=
\begin{bmatrix}
10\\
20\\
30
\end{bmatrix}
$$

We get:

$$
A\mathbf{x}
=
\begin{bmatrix}
1&2&3\\
4&5&6
\end{bmatrix}
\begin{bmatrix}
10\\
20\\
30
\end{bmatrix}
$$

Calculate:

$$
=
\begin{bmatrix}
1(10)+2(20)+3(30)\\
4(10)+5(20)+6(30)
\end{bmatrix}
$$

$$
=
\boxed{
\begin{bmatrix}
140\\
320
\end{bmatrix}}
$$

The result has shape:

$$
(2\times3)(3\times1)=2\times1
$$

---

# The Matrix Multiplication Rule

This is the rule you should memorize:

$$
\boxed{
(m\times n)(n\times p)=m\times p
}
$$

The **inner dimensions must match**.

For example:

$$
(2\times3)(3\times1)
$$

works because:

$$
\color{gray}{2\times\mathbf3}
\quad
\color{gray}{\mathbf3\times1}
$$

The 3s match.

Result:

$$
2\times1
$$

---

# Dot Product: Row × Column

This is one of the most important reasons both orientations exist.

Take:

$$
\mathbf a=
\begin{bmatrix}
1&2&3
\end{bmatrix}
$$

and:

$$
\mathbf b=
\begin{bmatrix}
4\\
5\\
6
\end{bmatrix}
$$

Then:

$$
\mathbf a\mathbf b
$$

is:

$$
\begin{bmatrix}
1&2&3
\end{bmatrix}
\begin{bmatrix}
4\\
5\\
6
\end{bmatrix}
$$

$$
=1(4)+2(5)+3(6)
$$

$$
=\boxed{32}
$$

So:

$$
\boxed{
(1\times3)(3\times1)=1\times1
}
$$

A \(1\times1\) matrix is effectively a scalar.

This is the **dot product**.

---

# Why Not Column × Column?

Suppose:

$$
\mathbf a=
\begin{bmatrix}
1\\2\\3
\end{bmatrix}
$$

and:

$$
\mathbf b=
\begin{bmatrix}
4\\5\\6
\end{bmatrix}
$$

Trying:

$$
\mathbf a\mathbf b
$$

gives:

$$
(3\times1)(3\times1)
$$

The inner dimensions are:

$$
1\neq3
$$

Therefore:

$$
\boxed{\text{Invalid matrix multiplication}}
$$

But you can transpose one:

$$
\mathbf a^T\mathbf b
$$

giving:

$$
(1\times3)(3\times1)
$$

which works.

---

# Column × Row Is Different

Now do:

$$
\mathbf a\mathbf b^T
$$

where:

$$
\mathbf a=
\begin{bmatrix}
1\\2\\3
\end{bmatrix}
$$

and:

$$
\mathbf b^T=
\begin{bmatrix}
4&5&6
\end{bmatrix}
$$

Then:

$$
\begin{bmatrix}
1\\2\\3
\end{bmatrix}
\begin{bmatrix}
4&5&6
\end{bmatrix}
$$

produces:

$$
\begin{bmatrix}
4&5&6\\
8&10&12\\
12&15&18
\end{bmatrix}
$$

This is a:

$$
\boxed{3\times3}
$$

matrix.

This operation is called an **outer product**.

Compare:

### Dot product

$$
\boxed{
\mathbf a^T\mathbf b
\rightarrow scalar
}
$$

### Outer product

$$
\boxed{
\mathbf a\mathbf b^T
\rightarrow matrix
}
$$

This distinction is extremely important in linear algebra and ML.

---

# Why ML Usually Uses Column Vectors Conceptually

Suppose you have 3 features:

$$
x_1,x_2,x_3
$$

Represent them as:

$$
\mathbf{x}
=
\begin{bmatrix}
x_1\\
x_2\\
x_3
\end{bmatrix}
$$

Now a linear transformation can be written:

$$
\mathbf y=A\mathbf x
$$

For example:

$$
A=
\begin{bmatrix}
w_{11}&w_{12}&w_{13}\\
w_{21}&w_{22}&w_{23}
\end{bmatrix}
$$

Then:

$$
\mathbf y=
A\mathbf x
$$

gives:

$$
\begin{bmatrix}
y_1\\
y_2
\end{bmatrix}
=
\begin{bmatrix}
w_{11}&w_{12}&w_{13}\\
w_{21}&w_{22}&w_{23}
\end{bmatrix}
\begin{bmatrix}
x_1\\
x_2\\
x_3
\end{bmatrix}
$$

Therefore:

$$
\boxed{
y_1=w_{11}x_1+w_{12}x_2+w_{13}x_3
}
$$

and:

$$
\boxed{
y_2=w_{21}x_1+w_{22}x_2+w_{23}x_3
}
$$

This is exactly the kind of operation used throughout neural networks.

---

# But You'll Often See Row Vectors in Machine Learning

Here's an important practical complication.

Mathematically, we might describe one sample as:

$$
\mathbf{x}\in\mathbb R^n
$$

and conceptually treat it as:

$$
n\times1
$$

But software libraries often store batches of samples as **rows**.

Suppose you have 4 samples, each with 3 features:

$$
X=
\begin{bmatrix}
x_{11}&x_{12}&x_{13}\\
x_{21}&x_{22}&x_{23}\\
x_{31}&x_{32}&x_{33}\\
x_{41}&x_{42}&x_{43}
\end{bmatrix}
$$

Shape:

$$
\boxed{4\times3}
$$

Interpretation:

```text
        Features
        ↓ ↓ ↓

Sample 1 [• • •]
Sample 2 [• • •]
Sample 3 [• • •]
Sample 4 [• • •]
```

Each **row = one example**.

Each **column = one feature**.

This is extremely common in NumPy, pandas, scikit-learn, PyTorch, etc., although conventions can vary by operation/API.

---

# This Leads to a Crucial Concept: Shape

When working with vectors and matrices, don't just look at the numbers.

Always ask:

> **What is the shape?**

For example:

$$
[1,2,3]
$$

could represent:

$$
1\times3
$$

while:

$$
\begin{bmatrix}
1\\2\\3
\end{bmatrix}
$$

represents:

$$
3\times1
$$

And these behave differently.

---

# A Simple Mental Model

Think of:

### Row vector

> **One person, many attributes**

```text
Person → [age, height, weight, income]
```

Shape:

$$
1\times4
$$

### Column vector

> **Many attributes stacked vertically**

```text
age
height
weight
income
```

Shape:

$$
4\times1
$$

The underlying values can be the same.

---

# The Three Operations You Should Know

Given:

$$
\mathbf a=
\begin{bmatrix}
a_1\\a_2\\a_3
\end{bmatrix}
$$

and:

$$
\mathbf b=
\begin{bmatrix}
b_1\\b_2\\b_3
\end{bmatrix}
$$

### Dot product

$$
\boxed{
\mathbf a^T\mathbf b
=
a_1b_1+a_2b_2+a_3b_3
}
$$

Result:

$$
1\times1
$$

→ **scalar**

---

### Outer product

$$
\boxed{
\mathbf a\mathbf b^T
}
$$

Result:

$$
3\times3
$$

→ **matrix**

---

### Matrix transformation

$$
\boxed{
A\mathbf x
}
$$

Result depends on \(A\)'s dimensions.

→ **transformed vector**

---
