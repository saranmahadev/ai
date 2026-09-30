A straight line cannot separate every problem, but a straight line in a *richer* space can. The **kernel trick** lets a method such as a support vector machine work as if every point had been lifted into a huge, even infinite, feature space, while only ever computing a similarity between pairs of points.

**You need:** [[Support Vector Machines]], [[Feature Engineering]] and [[Dot Product]].

## The question it answers

"How do I draw a curved boundary with a method that only draws straight lines?" By changing the space, not the method: add the right features and the curve becomes straight.

## Intuition: lift, then cut

Points on a line: class 0 in the middle, class 1 on both sides. No single cut on that line separates them. Add a second feature `x²` and the points rise onto a parabola: middle points stay low, outer points climb high, and one horizontal cut separates the classes. A straight line in the lifted space is a curved boundary in the original.

## Definitions

```text
feature map       φ(x) = (x, x²)            a lift into a new space
kernel            k(a, b) = φ(a) · φ(b)     similarity of two points in the lifted space
linear kernel     k(a, b) = a · b
polynomial kernel k(a, b) = (a · b + 1)^d
RBF kernel        k(a, b) = exp(−γ · ‖a − b‖²)    1 for identical points, → 0 far apart
```

SVMs and other methods only ever need dot products between points. Replace each dot product with `k(a, b)` and you get the lifted model without computing φ, which for the RBF kernel would need infinitely many features. The RBF parameter `γ` sets how local the similarity is: large `γ` means only very near points count, giving a wiggly boundary; small `γ` gives a smooth one.

## A worked example

Four points on a line: class 1 at `x = −1.8` and `x = 1.8`, class 0 at `x = −0.5` and `x = 0.5`. The best single cut on `x` gets three of four right (75%).

```text
x      x²      class
−1.8   3.24    1
−0.5   0.25    0
 0.5   0.25    0
 1.8   3.24    1        cut at x² = 1  →  all four correct
```

RBF similarities with `γ = 1`:

```text
k(0, 0) = e⁰  = 1.000       k(0, 1) = e⁻¹ = 0.368       k(0, 2) = e⁻⁴ = 0.018
```

Similarity is 1 for the same point, drops to about a third at distance 1, and is nearly zero at distance 2: it is a soft neighbourhood. On the bench's 36 points, the best single cut in `x` reaches 75%, while a cut on `x²` at height 1 to 1.4 reaches 100%; a badly placed cut at 2.0 drops to 92%.

## Bench

```bench
id: kernel-lift
title: Lift the data one dimension up
fallback: Points from two classes lie on a line so no cut separates them; a switch adds the feature x squared, lifting them onto a parabola where a slider-controlled horizontal cut can separate the classes.
```

**Try this**

1. Note the best possible cut in the original one-dimensional x.
2. Turn on **add the feature x²**.
3. Slide the cut height until accuracy is 100%.
4. Push the cut too high or too low.

**What you should notice:** nothing about the points changed, only the space they live in, and a flat cut in the new space is two cuts in the old one.

## Where it appears in AI

* **Kernel SVMs** were the state of the art for many tasks before deep learning.
* **Gaussian processes and kernel ridge regression** use the same idea.
* **Neural networks** learn their lift instead of fixing a kernel.
* **Attention scores** are similarities between vectors, a cousin of kernels.

## Common pitfalls

* **Choosing γ too large,** which memorises the training data.
* **Kernel methods on huge datasets,** since they compare every pair of points.
* **Skipping feature scaling,** which distorts every distance-based kernel.
* **Believing the kernel removes the need to choose a model:** it is a choice of geometry.

## Quick check

<details><summary>1. What does the kernel k(a, b) compute?</summary>
The dot product of a and b in the lifted feature space, that is a similarity.
</details>

<details><summary>2. What does a very large γ do in the RBF kernel?</summary>
Only very close points count as similar, giving a wiggly boundary that may overfit.
</details>

<details><summary>3. Why is the kernel trick useful?</summary>
It gives the power of a huge feature space without ever computing the features.
</details>

## Key terms

* **Feature map:** a function lifting inputs into a new space.
* **Kernel:** a similarity function equal to a dot product in some feature space.
* **RBF kernel:** the similarity exp(−γ‖a − b‖²).
* **Kernel trick:** using k(a, b) in place of explicit features.

## Related

[[Support Vector Machines]] · [[Feature Engineering]] · [[Dot Product]] · [[Cosine Similarity]] · [[Attention as Dot Products]]
