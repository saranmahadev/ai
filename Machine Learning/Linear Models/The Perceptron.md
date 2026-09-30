The **perceptron** is the oldest learning machine: compute a weighted sum of the inputs, answer "yes" if it is positive and "no" otherwise, and after every mistake nudge the weights so that mistake is a little less likely. It always finds a separating line if one exists, and never settles if none does.

**You need:** [[Logistic Regression as a Classifier]] and [[Dot Product]].

## The question it answers

"Can a machine learn a rule just by being corrected when it is wrong?" Yes, for problems where a straight line can separate the classes, and the way it does so is the seed of every neural network.

## Intuition: correct the mistake, nothing else

Each point has a label, +1 or −1. Look at points one at a time. If the current line puts a point on the right side, do nothing. If it puts a point on the wrong side, move the line toward that point's correct side: add the point to the weights for a +1 mistake, subtract it for a −1 mistake. Repeat until no mistakes remain.

## Definitions

```text
score       s = b + w · x
predict     +1 if s > 0, else −1
update on a mistake with label y ∈ {+1, −1}:
            w ← w + y·x          b ← b + y
```

**Convergence theorem:** if the classes are linearly separable, the perceptron makes a finite number of mistakes and stops. If they are not, it cycles forever. A single perceptron can only draw straight lines, so it cannot learn XOR; stacking them into layers removes that limit (see [[Neural Networks]]).

## A worked example

Two points: `A = (1, 3)` labelled +1 and `B = (3, 1)` labelled −1. Start with `b = 0, w = (0, 0)`; a score of 0 counts as a mistake.

```text
A:  s = 0 → mistake.  y = +1:  w = (1, 3),  b = 1
B:  s = 1 + 1·3 + 3·1 = 7 > 0 → predicts +1 but label is −1 → mistake.
    y = −1:  w = (1−3, 3−1) = (−2, 2),  b = 1 − 1 = 0
check A: 0 + (−2)(1) + 2(3) =  4 > 0  ✓        check B: (−2)(3) + 2(1) = −4 < 0  ✓
```

Two updates, and the line `−2x + 2y = 0` (that is, `y = x`) separates the points. On the bench's 24 easy points the same rule needs 6 updates.

## Bench

```bench
id: perceptron-steps
title: The perceptron, one mistake at a time
fallback: Twenty-four points of two classes; step through the perceptron rule one mistake at a time, watching the line move and the misclassified count fall, then make the classes overlap to see it never settle.
```

**Try this**

1. Press **Fix one mistake** repeatedly and watch the line.
2. Reset and press **Play**.
3. Turn on **Make the data overlap** and play again.
4. Count how many updates it takes on each dataset.

**What you should notice:** on separable data it stops with zero mistakes; on overlapping data it keeps fixing one mistake by creating another, and gives up.

## Where it appears in AI

* **Historic:** the 1958 perceptron launched neural-network research.
* **Modern:** each neuron in a network computes a score much like this; training replaces the mistake rule with gradients.
* **Online learning:** update-on-error rules still appear in streaming systems.

## Common pitfalls

* **Expecting convergence on non-separable data.**
* **Treating the final line as special:** many lines separate the data, and the perceptron stops at the first it finds (compare [[Support Vector Machines]]).
* **Forgetting the bias term.**
* **Order dependence:** a different point order gives a different line.

## Quick check

<details><summary>1. What is the update after a mistake on a point with label −1?</summary>
Subtract the point from the weights and subtract 1 from the bias.
</details>

<details><summary>2. When does the perceptron stop?</summary>
When no point is misclassified, which is guaranteed only for linearly separable data.
</details>

<details><summary>3. Why can't a single perceptron learn XOR?</summary>
XOR cannot be separated by one straight line.
</details>

## Key terms

* **Perceptron:** a linear threshold unit trained by mistake-driven updates.
* **Linearly separable:** classes that a straight line can divide.
* **Bias:** the constant term shifting the boundary.
* **Convergence theorem:** the guarantee of finitely many mistakes when data is separable.

## Related

[[Dot Product]] · [[Logistic Regression as a Classifier]] · [[Support Vector Machines]] · [[Neural Networks]] · [[Backpropagation by Hand]]
