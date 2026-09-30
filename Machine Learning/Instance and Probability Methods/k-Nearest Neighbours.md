**k-nearest neighbours** (kNN) classifies a new point by finding the `k` training points closest to it and letting them vote. There is no training step: the model *is* the data. It shows the central trade-off of machine learning in one knob, `k`: small `k` memorises noise, large `k` blurs real structure.

**You need:** [[Scaling and Normalisation]], [[Norms and Distance]] and [[Train, Validation and Test Sets]].

## The question it answers

"What do similar examples say?" If the three houses most like yours sold for about the same price, that is a reasonable guess for yours.

## Intuition: ask the neighbours

To label a new point, measure its distance to every training point, keep the `k` nearest, and take a majority vote (or average, for a number). With `k = 1` the point copies its single nearest neighbour, so the boundary wraps tightly around every training point, including noisy ones. With a large `k` the vote covers a wide area, so the boundary becomes smooth, and eventually so smooth that it ignores real detail.

## Definitions

```text
distance      usually Euclidean, on scaled features
prediction    classification: majority label among the k nearest
              regression:     average value of the k nearest
k             small → flexible, noisy      large → smooth, stiff
```

kNN is **lazy**: fitting costs nothing, but every prediction compares against all stored points. It inherits the curse of dimensionality ([[The Curse of Dimensionality]]) and needs scaled features ([[Scaling and Normalisation]]). Choose `k` on validation data; odd `k` avoids ties in two-class problems.

## A worked example

One hundred and sixty noisy points in two interleaving half-moons (bench data), 80 to train on and 80 held out:

```text
k =  1    training accuracy 100%    held-out accuracy 88%
k =  5    training accuracy  97%    held-out accuracy 86%
k = 15    training accuracy  96%    held-out accuracy 89%
k = 41    training accuracy  81%    held-out accuracy 70%
```

With `k = 1` every training point is its own nearest neighbour, so training accuracy is 100% while held-out accuracy is lower: memorisation. At `k = 41` both scores fall, because the vote spans almost half the data and the moons' shape is lost: underfitting. The best held-out score is in the middle. The gaps between the mid-range values are small with only 80 test points, so treat differences of a few points as noise.

## Bench

```bench
id: knn-regions
title: Neighbours vote
fallback: Two noisy half-moons are coloured by a k-nearest-neighbour vote; a slider changes k and the bench shows the decision regions and the training and held-out accuracy.
```

**Try this**

1. Set k = 1 and look at the boundary around isolated points.
2. Raise k to about 15.
3. Push k to 41.
4. Compare training and held-out accuracy at each.

**What you should notice:** the boundary is jagged at small k and smooth at large k, training accuracy only falls as k grows, and held-out accuracy peaks in between.

## Where it appears in AI

* **Recommendations and search:** "items nearest to this one" (see [[Embeddings and Similarity Search]]).
* **Baselines and anomaly detection:** far from all neighbours means unusual.
* **Retrieval systems** use fast approximate nearest-neighbour search over embeddings.

## Common pitfalls

* **Unscaled features,** where one column decides everything.
* **Too many irrelevant features,** which drown out the useful ones.
* **Slow predictions** on large datasets without an index.
* **Reporting k = 1 training accuracy** (always 100%, so meaningless).

## Quick check

<details><summary>1. What is the training accuracy of 1-NN when there are no duplicate points with different labels?</summary>
100%, since each point's nearest neighbour is itself.
</details>

<details><summary>2. What happens to the decision boundary as k grows?</summary>
It gets smoother, and eventually too smooth, ignoring real structure.
</details>

<details><summary>3. Why does kNN suffer in very high dimensions?</summary>
Distances become nearly equal, so "nearest" carries little information.
</details>

## Key terms

* **Nearest neighbour:** the training point closest to a query.
* **k:** the number of neighbours that vote.
* **Lazy learner:** a method that stores the data and computes only at prediction time.
* **Decision region:** the area of input space assigned to a class.

## Related

[[Norms and Distance]] · [[Scaling and Normalisation]] · [[The Curse of Dimensionality]] · [[Embeddings and Similarity Search]] · [[Naive Bayes]]
