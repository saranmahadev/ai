Real data often has many columns that mostly move together, so its true variety is far smaller than its width suggests. **Dimensionality reduction** finds a few new directions that keep most of the information. PCA, the standard tool, rotates the data to the directions of greatest spread and lets you keep only the leading ones.

**You need:** [[SVD and PCA]], [[The Curse of Dimensionality]] and [[Covariance and Correlation]].

## The question it answers

"Can I describe this data with fewer numbers without losing much?" Fewer dimensions mean faster models, less overfitting, and the chance to visualise the data.

## Intuition: keep the directions with the most spread

Five sensor readings that all rise and fall with two underlying causes are really two-dimensional data wearing five columns. Rotate the axes so the first points along the direction of greatest variation, the next along the greatest remaining variation at right angles, and so on. Later directions capture mostly noise. Keep the first few, and every example needs only that many numbers.

## Definitions

```text
principal components   the eigenvectors of the covariance matrix, sorted by eigenvalue
explained variance     eigenvalue_k / (sum of all eigenvalues)
project                z = (x − mean) · component        (the coordinates you keep)
reconstruct            x̂ = mean + Σ zₖ · componentₖ      error = what the dropped components held
```

Centre the data first; standardise the features if their scales differ ([[Scaling and Normalisation]]). PCA is linear and unsupervised: it keeps high-variance directions, which are not always the ones useful for prediction. Non-linear alternatives (t-SNE, UMAP, autoencoders) suit visualising curved structure.

## A worked example

One hundred examples with five features generated from two hidden causes plus a little noise (bench data). The share of variance in each principal component:

```text
component          1      2      3      4      5
share of variance  85.9%  10.8%  1.4%   1.1%   0.8%
cumulative         85.9%  96.7%  98.1%  99.2%  100%

components kept    1      2      3      4      5
reconstruction     0.454  0.221  0.169  0.109  0.000     (RMS error per value)
```

Two components keep 96.7% of the variance; the remaining three hold only noise. Storing 2 numbers per example instead of 5 cuts the data by 60% while the reconstruction is off by about 0.22 per value, against readings whose overall spread is several times that. The steep drop after component 2 (the "scree") is the hint that the data is really two-dimensional.

## Bench

```bench
id: pca-variance
title: Keep the components that matter
fallback: Five correlated features are decomposed by PCA; a bar chart shows the share of variance in each component with the cumulative total, and a slider sets how many components are kept, showing the variance retained and the reconstruction error.
```

**Try this**

1. Keep 1 component and read the variance kept.
2. Raise to 2, then 3.
3. Find the smallest number of components that keeps 95%.
4. Compare the reconstruction error at 2 and at 5 components.

**What you should notice:** a couple of components carry nearly everything, adding more buys little, and keeping all of them reconstructs the data exactly.

## Where it appears in AI

* **Preprocessing:** compress features before another model.
* **Visualisation:** project embeddings to two dimensions.
* **Denoising and compression:** drop the low-variance components.
* **Embeddings and autoencoders** are learned, non-linear relatives.

## Common pitfalls

* **Forgetting to centre or scale the data.**
* **Assuming high variance means high usefulness for the label.**
* **Fitting PCA on all the data** before splitting.
* **Interpreting components as real-world causes;** they are mathematical axes.

## Quick check

<details><summary>1. What does the first principal component point along?</summary>
The direction of greatest variance in the data.
</details>

<details><summary>2. Components explain 70%, 20%, 5%, 5%. How many keep at least 90%?</summary>
Two (70% + 20%).
</details>

<details><summary>3. Why might PCA discard something useful for prediction?</summary>
It ranks directions by variance, not by relevance to the label.
</details>

## Key terms

* **Principal component:** a direction of high variance found by PCA.
* **Explained variance:** the share of total variance a component holds.
* **Scree plot:** the chart of variance per component.
* **Reconstruction error:** what is lost by keeping fewer components.

## Related

[[SVD and PCA]] · [[Covariance and Correlation]] · [[The Curse of Dimensionality]] · [[Scaling and Normalisation]] · [[Embeddings and Similarity Search]]
