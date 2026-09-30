Models do arithmetic, so categories such as "Paris" or "XL" must become numbers. The way you do it decides what the model thinks about them. **Integer codes** claim an order and equal spacing; **one-hot encoding** makes every category equally different from every other.

**You need:** [[Scaling and Normalisation]] and [[Vector Operations]].

## The question it answers

"How do I turn words into numbers without lying?" If Paris is 0, Tokyo 1, Lima 2, Oslo 3, the model may conclude Oslo is three times as far from Paris as Tokyo is, and that Lima is halfway between them. None of that is true of cities.

## Intuition: an honest number line or separate switches

Some categories really are ordered: S < M < L < XL. A number line is honest for those. Cities have no order, so give each its own switch (a column) and turn on exactly one. Then no city is "closer" to another than any other pair.

## Definitions

```text
integer (label) codes   Paris→0, Tokyo→1, Lima→2, Oslo→3     one column, imposes order
ordinal codes           S→1, M→2, L→3, XL→4                  right when the order is real
one-hot                 Paris→(1,0,0,0)  Tokyo→(0,1,0,0) …   one column per category
```

A category with many levels (thousands of postcodes) makes one-hot enormous, so alternatives exist: group rare levels into "other", use **target encoding** (replace each level with the average label, computed carefully to avoid leakage), or learn an **embedding**.

## A worked example

Distances between cities (Euclidean, from [[Norms and Distance]]):

```text
integer codes:   Paris–Tokyo = |0 − 1| = 1      Paris–Oslo = |0 − 3| = 3
one-hot:         any two cities = √(1² + 1²) = √2 ≈ 1.41
```

With integer codes the model sees Paris and Tokyo as close and Paris and Oslo as far, purely because of the arbitrary order in the list. With one-hot every pair is 1.41 apart, which is the honest statement "these are all different". For shirt sizes the opposite holds: S and M really are closer than S and XL, so ordinal codes are correct and one-hot would throw that information away.

## Bench

```bench
id: encode-categories
title: Encode the categories
fallback: Switch between city names and shirt sizes, and between integer codes and one-hot columns; the bench shows each category's encoded vector and the table of distances between every pair.
```

**Try this**

1. With cities, use integer codes and read the distance table.
2. Switch to one-hot and compare.
3. Switch to shirt sizes and repeat both.

**What you should notice:** integer codes invent distances between unordered categories, one-hot treats every pair alike, and for genuinely ordered categories the integer distances are actually right.

## Where it appears in AI

* **Tabular models:** one-hot and target encoding are the standard tools.
* **Language models** turn each token into an embedding, a learned dense vector.
* **Recommenders** embed users and items rather than one-hot encoding millions of IDs.

## Common pitfalls

* **Integer-coding unordered categories** for models that read numbers as magnitudes.
* **Categories in test data unseen in training,** which need an "unknown" bucket.
* **Target encoding without care,** which leaks the label.
* **The dummy trap:** with an intercept, one one-hot column is redundant (it equals one minus the sum of the others).

## Quick check

<details><summary>1. How many one-hot columns for 5 categories?</summary>
Five.
</details>

<details><summary>2. When are integer codes appropriate?</summary>
When the categories have a real order, such as sizes or ratings.
</details>

<details><summary>3. What is the distance between any two categories under one-hot encoding?</summary>
√2 (about 1.41), the same for every pair.
</details>

## Key terms

* **One-hot encoding:** one column per category with a single 1.
* **Ordinal encoding:** integer codes that respect a real order.
* **Target encoding:** replacing a category with the average label for it.
* **Embedding:** a learned dense vector standing for a category.

## Related

[[Scaling and Normalisation]] · [[Vector Operations]] · [[Feature Engineering]] · [[Embeddings and Similarity Search]]
