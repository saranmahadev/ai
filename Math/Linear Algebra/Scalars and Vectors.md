A **scalar** is a single number, and a **vector** is an ordered list of numbers. A vector can be read two ways: as an arrow with a length and direction, or as a row of data describing one thing, like a house or a word. Both views are the same object.

**You need:** [[Coordinates and Distance]] and [[Reading Math Notation]].

## The question it answers

"How do I represent one thing described by several numbers?" A house has a size, a number of rooms and an age. Together they form one vector, and that vector is what a model actually receives.

## Intuition: an arrow and a list

In the plane, the vector `v = (3, 4)` is an arrow from the origin to the point 3 across, 4 up. As data it is just two numbers in order. The numbers are its **components**, and their count is its **dimension**: `(3, 4)` has dimension 2, and `(90, 3, 12)` (size, rooms, age) has dimension 3.

A scalar has no direction; it only scales. Speed 5 is a scalar, while "5 metres per second north" is a vector.

## Notation

```text
v = (3, 4)  or  v = [3, 4]        vₙ is the n-th component:  v₁ = 3,  v₂ = 4
v ∈ ℝ²                            "v is a vector of two real numbers"
```

Vectors are written as **columns** or **rows**. The list is the same; the layout matters when matrices enter:

```text
column vector: [3]        row vector: [3  4]
               [4]
```

The length (or **norm**) of a vector is `‖v‖ = √(3² + 4²) = 5`, from [[Coordinates and Distance]]. A vector of length 1 is a **unit vector**.

## A worked example

Describe two houses as vectors `(size in m², rooms, age in years)`:

```text
a = (90, 3, 12)      b = (120, 4, 5)
```

Each is a point (or arrow) in 3-dimensional space. The first component of `a` is `a₁ = 90`. Closeness in this space means similar houses. A **zero vector** `(0, 0, 0)` is the origin. A model that predicts price takes such a vector in and returns a scalar out.

Images are vectors too: a 28 × 28 grey image unrolled row by row is a vector of `28 × 28 = 784` numbers.

## Bench

```bench
id: vector-arrow
title: A vector as an arrow and as a list
fallback: Drag the tip of an arrow on a grid, or move sliders, to see the vector's two components, its length and its direction update together.
```

**Try this**

1. Drag the tip and read the components.
2. Set the components to (3, 4) and read the length.
3. Make a vector that points straight left.
4. Set both components to zero.

**What you should notice:** the arrow and the pair of numbers are one object, and the length always comes from both components together.

## Where it appears in AI

* **Feature vectors** describe each example.
* **Embeddings** turn words and images into vectors of hundreds of numbers.
* **Model parameters** are stored as huge vectors and matrices.

## Common pitfalls

* **Treating a vector as a single number.** Its components are distinct.
* **Mixing dimensions.** You cannot add a 2D and a 3D vector.
* **Confusing a scalar with a 1-component vector** (they behave alike, but keep them straight).
* **Forgetting that order matters.** `(90, 3)` and `(3, 90)` are different vectors.

## Quick check

<details><summary>1. What is the dimension of (2, 5, 1, 7)?</summary>
4.
</details>

<details><summary>2. What is the length of (6, 8)?</summary>
10.
</details>

<details><summary>3. Is "temperature 20 degrees" a scalar or a vector?</summary>
A scalar.
</details>

## Key terms

* **Scalar:** a single number.
* **Vector:** an ordered list of numbers.
* **Component:** one number in a vector.
* **Dimension:** the number of components.
* **Norm:** the length of a vector.

## Related

[[Coordinates and Distance]] · [[Vector Operations]] · [[Norms and Distance]] · [[Tensors and Shapes]]
