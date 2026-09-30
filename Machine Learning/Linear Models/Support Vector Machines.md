Many lines separate two classes, so which is best? A **support vector machine** picks the one with the widest empty street between the classes: the maximum margin. Only the points touching the edge of the street, the **support vectors**, decide where it goes. A strictness knob `C` decides how much the street may be violated by stray points.

**You need:** [[The Perceptron]], [[Ridge and Lasso]] and [[Orthogonality and Projection]].

## The question it answers

"Among all separating lines, which will generalise best?" A line close to the data is fragile: a small nudge to a point flips its label. A line as far as possible from both classes leaves the most room for error.

## Intuition: the widest street

Draw the separating line, then push two parallel lines outward until each touches a class. The gap between them is the **margin**. The SVM maximises this width. Points far behind the street play no part; only the few on its edges (the support vectors) hold it in place, so the model is defined by a handful of points.

## Definitions

```text
boundary       b + w · x = 0             street edges  b + w · x = ±1
street width   2 / ‖w‖                   → widest street = smallest ‖w‖
soft margin    minimise  ½‖w‖² + C · Σ max(0, 1 − yᵢ(b + w · xᵢ))
```

The last term is the **hinge loss**: zero for points safely outside the street, growing for points inside it or on the wrong side. `C` is the strictness: large `C` punishes violations heavily (narrow street, fits the training data tightly); small `C` tolerates violations (wide street, smoother). Choose `C` on validation data. Non-linear boundaries come from kernels (see [[Kernel Methods]]).

## A worked example

Two points on a line: `x = 1` labelled −1 and `x = 3` labelled +1. The widest street has edges at each point, so the boundary sits halfway at `x = 2`.

```text
w · x + b = ±1 at the two points:   w·3 + b = 1,   w·1 + b = −1   →   w = 1,  b = −2
street width = 2 / ‖w‖ = 2 / 1 = 2        (exactly the gap between the points)
```

Both points are support vectors. With 28 points in two clouds (bench data), strictness changes the picture:

```text
C = 0.01:  street width 7.93   support vectors 28   (everything holds the street)
C = 1:     street width 1.11   support vectors  9
C = 100:   street width 0.50   support vectors  5
```

A low `C` gives a very wide, relaxed street; a high `C` hugs the data. Adding one stray class-0 point deep in class-1 territory drags the strict solution (`C = 100`) to width 0.73 and 7 support vectors, and the stray is still misclassified: training accuracy 93% (27 of 29 points), because no straight line can fix it.

## Bench

```bench
id: margin-maximiser
title: Widest street between two classes
fallback: Two classes with a linear support vector machine: a slider sets the strictness C, the bench draws the boundary, street edges and support vectors, and a switch adds a stray point in the other class.
```

**Try this**

1. Start at C = 1 and note the street width and support vectors.
2. Lower C to 0.01, then raise it to 100.
3. Add the stray point at each setting.
4. Find the setting that keeps the street wide and accuracy high.

**What you should notice:** support vectors sit on the street's edges, the street narrows as C grows, and a stray point matters far more when C is large.

## Where it appears in AI

* **Text and image classification** before deep learning made them routine.
* **Small, high-dimensional datasets,** such as genomics.
* **The margin idea** lives on in loss functions that demand confident, not just correct, predictions.

## Common pitfalls

* **Unscaled features,** which distort the margin (see [[Scaling and Normalisation]]).
* **Choosing C on training accuracy.**
* **Assuming an SVM gives probabilities;** its scores need calibration.
* **Large datasets:** kernel SVMs scale poorly with the number of examples.

## Quick check

<details><summary>1. What is the width of the street when ‖w‖ = 0.5?</summary>
2 / 0.5 = 4.
</details>

<details><summary>2. What happens to the margin when C grows large?</summary>
It narrows: violations are punished so the model fits the training data more tightly.
</details>

<details><summary>3. Which points determine an SVM's boundary?</summary>
The support vectors: points on or inside the edges of the street.
</details>

## Key terms

* **Margin:** the width of the empty street between the classes.
* **Support vector:** a point on or inside the street's edge.
* **Hinge loss:** the penalty max(0, 1 − y · score).
* **C:** the strictness parameter trading margin width against violations.

## Related

[[The Perceptron]] · [[Kernel Methods]] · [[Ridge and Lasso]] · [[Orthogonality and Projection]] · [[Norms and Distance]]
