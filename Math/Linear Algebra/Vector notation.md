There are several common ways to write a vector.

### Arrow notation

$$
\vec{A}
$$

The arrow above \(A\) tells us that \(A\) is a vector.

---

### Bold notation

$$
\mathbf{A}
$$

Instead of an arrow, vectors are sometimes written in **bold**.

So:

$$
\vec{A} = \mathbf{A}
$$

conceptually means the same thing.

---

### Component notation

A vector in 2D can be written as:

$$
\vec{A} =
\begin{bmatrix}
3\\
4
\end{bmatrix}
$$

This says:

* Move **3 units horizontally**
* Move **4 units vertically**

We can visualize it as:

```text
       ● (3,4)
      /|
     / |
    /  | 4
   /   |
  /    |
 ●─────●
(0,0)  3
```

---

# The Components of a Vector

Consider:

$$
\vec{A} =
\begin{bmatrix}
3\\
4
\end{bmatrix}
$$

The numbers **3** and **4** are called the **components** of the vector.

We can also write:

$$
\vec{A} = (3,4)
$$

or

$$
\vec{A} = 3\hat{i} + 4\hat{j}
$$

where:

* \(\hat{i}\) = unit vector in the **x direction**
* \(\hat{j}\) = unit vector in the **y direction**

So:

$$
\boxed{\vec{A}=3\hat{i}+4\hat{j}}
$$

means:

> 3 units in the x-direction + 4 units in the y-direction.

---

# 5. Why Do We Use \(i\), \(j\), and \(k\)?

For 3D vectors, we need three directions.

$$
\hat{i},\hat{j},\hat{k}
$$

They represent:

```text
          z
          ↑
          |
          |
          ●────────→ x
         /
        /
       ↙
      y
```

Therefore:

$$
\vec{A}=a\hat{i}+b\hat{j}+c\hat{k}
$$

means:

* \(a\) → x component
* \(b\) → y component
* \(c\) → z component

For example:

$$
\boxed{\vec{A}=3\hat{i}+4\hat{j}+5\hat{k}}
$$

can also be represented as:

$$
\boxed{
\vec{A}=
\begin{bmatrix}
3\\
4\\
5
\end{bmatrix}}
$$

---

# Magnitude of a Vector

The **magnitude** means the length of the vector.

For:

$$
\vec{A}=
\begin{bmatrix}
3\\
4
\end{bmatrix}
$$

we use the Pythagorean theorem:

$$
|\vec{A}|=\sqrt{3^2+4^2}
$$

$$
=\sqrt{9+16}
$$

$$
=\sqrt{25}
$$

$$
\boxed{|\vec{A}|=5}
$$

So this vector has:

* Components → \(3,4\)
* Magnitude → \(5\)

This is the classic **3-4-5 triangle**.

---

# Magnitude in 3D

Suppose:

$$
\vec{A}=
\begin{bmatrix}
3\\
4\\
5
\end{bmatrix}
$$

Then:

$$
|\vec{A}|=
\sqrt{3^2+4^2+5^2}
$$

$$
=\sqrt{9+16+25}
$$

$$
=\sqrt{50}
$$

$$
\boxed{|\vec{A}|=5\sqrt2}
$$

In general, for:

$$
\vec{A}=
\begin{bmatrix}
a\\
b\\
c
\end{bmatrix}
$$

the magnitude is:

$$
\boxed{
|\vec{A}|=\sqrt{a^2+b^2+c^2}
}
$$

---

# Direction of a Vector

A vector isn't just about its length. We also need its **direction**.

For:

$$
\vec{A}=(3,4)
$$

the angle from the positive x-axis is:

$$
\theta=\tan^{-1}\left(\frac{4}{3}\right)
$$

Therefore:

$$
\boxed{\theta\approx53.13^\circ}
$$

So we could describe the vector as:

> **Magnitude = 5 units, direction = 53.13° above the x-axis.**

This is one of the most important ideas in vectors:

$$
\boxed{\text{Vector}=\text{Magnitude}+\text{Direction}}
$$

---

# 9. Position Vector

Suppose we have a point:

$$
P=(3,4)
$$

The vector from the origin to \(P\) is called the **position vector**.

$$
\vec{OP}
=
\begin{bmatrix}
3\\
4
\end{bmatrix}
$$

Graphically:

```text
y
↑
5 |
4 |        ● P(3,4)
3 |       /
2 |      /
1 |     /
0 |────●────────→ x
      O
```

This is why vectors are often represented as coordinates.

---

# 10. Vector Between Two Points

Suppose:

$$
A=(2,3)
$$

and

$$
B=(7,5)
$$

The vector from \(A\) to \(B\) is:

$$
\vec{AB}=B-A
$$

Therefore:

$$
\vec{AB}
=
(7,5)-(2,3)
$$

$$
\boxed{\vec{AB}=(5,2)}
$$

Meaning:

> From A, move 5 units right and 2 units up to reach B.

---

# 11. Important Distinction: Point vs Vector

This distinction becomes extremely important later.

A **point** represents a **location**.

$$
P=(3,4)
$$

A **vector** represents a **displacement/direction**.

$$
\vec{v}=(3,4)
$$

They may look identical mathematically, but conceptually they are different.

### Point

> "Where am I?"

### Vector

> "How do I move?"

For example:

$$
P=(3,4)
$$

means location.

While:

$$
\vec{v}=(3,4)
$$

means:

> Move 3 units in x and 4 units in y.

---

# 12. Zero Vector

A vector with zero magnitude is called the **zero vector**.

$$
\boxed{\vec{0}=
\begin{bmatrix}
0\\
0
\end{bmatrix}}
$$

In 3D:

$$
\boxed{
\vec{0}=
\begin{bmatrix}
0\\
0\\
0
\end{bmatrix}}
$$

It has **magnitude 0** and therefore no meaningful direction.

---

# 13. Unit Vector

A **unit vector** has magnitude exactly 1.

For example:

$$
\hat{i}=
\begin{bmatrix}
1\\
0
\end{bmatrix}
$$

Its magnitude:

$$
|\hat{i}|=\sqrt{1^2+0^2}=1
$$

Similarly:

$$
\hat{j}=
\begin{bmatrix}
0\\
1
\end{bmatrix}
$$

and in 3D:

$$
\hat{k}=
\begin{bmatrix}
0\\
0\\
1
\end{bmatrix}
$$

---

# 14. Normalizing a Vector

Suppose:

$$
\vec{A}=
\begin{bmatrix}
3\\
4
\end{bmatrix}
$$

Its magnitude is:

$$
|\vec{A}|=5
$$

To convert it into a unit vector, divide by its magnitude:

$$
\hat{A}=\frac{\vec{A}}{|\vec{A}|}
$$

Therefore:

$$
\hat{A}
=
\frac{1}{5}
\begin{bmatrix}
3\\
4
\end{bmatrix}
$$

$$
\boxed{
\hat{A}=
\begin{bmatrix}
0.6\\
0.8
\end{bmatrix}}
$$

Now:

$$
|\hat{A}|=1
$$

This process is called **normalization**.

---

# 15. Vector Addition

Suppose:

$$
\vec{A}=(3,4)
$$

and:

$$
\vec{B}=(2,1)
$$

Then:

$$
\vec{A}+\vec{B}
=
(3+2,4+1)
$$

$$
\boxed{\vec{A}+\vec{B}=(5,5)}
$$

You simply add corresponding components.

```text
A = (3,4)
B = (2,1)

A+B = (5,5)
```

---

# 16. Vector Subtraction

Similarly:

$$
\vec{A}-\vec{B}
=
(3-2,4-1)
$$

$$
\boxed{\vec{A}-\vec{B}=(1,3)}
$$

---

# 17. Scalar Multiplication

A vector can be multiplied by a number.

Suppose:

$$
\vec{A}=(3,4)
$$

Then:

$$
2\vec{A}
=
2(3,4)
$$

$$
\boxed{2\vec{A}=(6,8)}
$$

The direction stays the same, but the magnitude doubles.

If:

$$
-2\vec{A}=(-6,-8)
$$

the direction is reversed and the magnitude doubles.

---

# 18. The Most Important Notation

You will encounter vectors in several equivalent forms:

### Geometric

$$
\vec{A}
$$

### Coordinate

$$
\vec{A}=(a,b,c)
$$

### Column vector

$$
\vec{A}=
\begin{bmatrix}
a\\
b\\
c
\end{bmatrix}
$$

### Unit-vector notation

$$
\vec{A}=a\hat{i}+b\hat{j}+c\hat{k}
$$

These are different **representations of the same vector**.

---

# 19. A Useful Mental Model

Think of a vector as an **instruction for movement**.

For example:

$$
\vec{v}=
\begin{bmatrix}
5\\
-2\\
3
\end{bmatrix}
$$

means:

> **Move 5 right, 2 down, and 3 up in the z-direction.**

The vector doesn't care where you start.

You can put the same vector anywhere:

```text
      ●──────────►
      │    v

              ●──────────►
              │    v
```

Both arrows represent the **same vector** if their magnitude and direction are identical.

That property is called **translation invariance** of a free vector.

---

# 20. Why This Becomes Extremely Important in AI

If you're learning vectors in the context of **AI/ML**, the concept becomes much more interesting.

A vector doesn't have to mean physical movement.

For example, a model might represent:

$$
\text{"cat"}
$$

as a high-dimensional vector:

$$
\mathbf{x}
=
[
0.21,\,
-0.73,\,
0.14,\,
\dots,\,
0.82
]
$$

Maybe it has **768 dimensions**.

That vector can encode information about the word/concept.

This is the foundation of **embeddings**.

Instead of:

> "This word means X"

we can represent it numerically:

$$
\boxed{\text{Concept} \rightarrow \text{Vector}}
$$

Then we can calculate things such as:

$$
\text{similarity}(\mathbf{x},\mathbf{y})
$$

using operations such as **dot products** and **cosine similarity**.

For example, conceptually:

```text
cat      → [0.21, -0.73, 0.14, ...]
dog      → [0.19, -0.69, 0.17, ...]
car      → [-0.52, 0.31, 0.82, ...]
```

`cat` and `dog` may be geometrically close in the embedding space because their vectors encode related information.

---

## The hierarchy to remember

```text
VECTOR
  │
  ├── Magnitude
  │      └── How large/long?
  │
  ├── Direction
  │      └── Which way?
  │
  └── Components
         ├── x → î
         ├── y → ĵ
         └── z → k̂
```

And mathematically:

$$
\boxed{
\vec{v}
=
v_x\hat{i}
+
v_y\hat{j}
+
v_z\hat{k}
}
$$

with magnitude:

$$
\boxed{
|\vec{v}|=
\sqrt{v_x^2+v_y^2+v_z^2}
}
$$

That is the core notation from which **dot products → angles → projections → matrices → transformations → vector spaces → embeddings → neural networks** build up.
