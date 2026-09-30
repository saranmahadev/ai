The **singular value decomposition** (SVD) breaks any matrix into a rotation, a stretch along perpendicular axes, and another rotation: `A = U Σ Vᵀ`. **Principal component analysis** (PCA) applies the same idea to data: it finds the directions along which the data varies most, so you can keep a few and drop the rest.

**You need:** [[Eigenvalues and Eigenvectors]], [[Orthogonality and Projection]] and [[Rank and Null Space]].

## The question it answers

"What are the most important directions in this data, and how much can I throw away?" A dataset with 1,000 features often has only a handful of directions that matter.

## Intuition: find the long axis of the cloud

Picture a cloud of points shaped like a tilted ellipse. Its long axis is the direction of greatest spread, the **first principal component**. The next one is perpendicular to it and captures the most of what remains. Projecting each point onto the first axis alone keeps most of the information in one number instead of two.

## The method

1. **Centre** the data (subtract each feature's mean).
2. Form the **covariance matrix** `C`, whose entries measure how features vary together.
3. Its **eigenvectors** are the principal directions; its **eigenvalues** are the variance along each.

```text
share of variance kept by a direction = its eigenvalue / sum of all eigenvalues
```

The SVD `A = U Σ Vᵀ` of the centred data matrix gives the same directions: the columns of `V` are the principal directions, and the singular values in `Σ` relate to the eigenvalues by `λ = σ² / (n − 1)`. Dropping the small singular values gives the best low-rank approximation of `A`.

## A worked example

Five centred points: `(−2, −1), (−1, −1), (0, 0), (1, 1), (2, 1)`.

```text
Σx² = 10, Σy² = 4, Σxy = 6   (n − 1 = 4)
covariance C = [2.5 1.5]
               [1.5 1.0]

trace = 3.5, determinant = 2.5 − 2.25 = 0.25
λ = (3.5 ± √(12.25 − 1)) / 2 = (3.5 ± 3.354) / 2 = 3.427  and  0.073
```

The first direction carries `3.427 / 3.5 ≈ 97.9%` of the variance. Its direction is `(0.851, 0.526)`, a tilt of about 32° above the x-axis. Keeping only that one coordinate turns 2 numbers per point into 1, losing about 2% of the variance.

## Bench

```bench
id: pca-cloud
title: Principal axes of a point cloud
fallback: Sliders set the spread and tilt of a point cloud; the bench draws the principal axes, reports the share of variance each carries, and can project the points onto the first axis.
```

**Try this**

1. Stretch the cloud and watch the first axis line up with it.
2. Tilt the cloud and watch the axes rotate with it.
3. Make the cloud round. What happens to the axes and the variance shares?
4. Turn on the projection and compare the points before and after.

**What you should notice:** the first axis follows the long direction of the cloud, and a round cloud has no preferred direction.

## Where it appears in AI

* **Dimensionality reduction** for speed, visualisation and noise removal.
* **Embeddings:** compressing vectors with SVD-based methods.
* **Image compression** and recommender systems keep the top singular values.
* **Low-rank adaptation** rests on the same idea.

## Common pitfalls

* **Forgetting to centre** the data first.
* **Not scaling features** so one large-unit feature dominates the variance.
* **Assuming high variance means important for the task.**
* **Reading principal components as original features.** They are combinations.

## Quick check

<details><summary>1. What do PCA's eigenvalues measure?</summary>
The variance of the data along each principal direction.
</details>

<details><summary>2. If two eigenvalues are 9 and 1, what share does the first hold?</summary>
90%.
</details>

<details><summary>3. Why centre the data before PCA?</summary>
PCA describes spread around the mean, so the mean must be at the origin.
</details>

## Key terms

* **SVD:** the factorisation `A = U Σ Vᵀ`.
* **Singular value:** a stretch factor in `Σ`.
* **Principal component:** a direction of maximal variance.
* **Explained variance:** the share of total variance a component holds.

## Related

[[Eigenvalues and Eigenvectors]] · [[Orthogonality and Projection]] · [[Rank and Null Space]] · [[Geometry in Many Dimensions]] · [[Covariance and Correlation]]
