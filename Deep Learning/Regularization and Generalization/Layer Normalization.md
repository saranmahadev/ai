**Layer normalization** computes exactly the same mean-and-variance normalization as [[Batch Normalization|batch normalization]] — but across a single example's own features, instead of across the batch. That one change in which axis you average over removes batch normalization's biggest practical headache: needing a sizeable, reliable batch to compute statistics from.

**You need:** [[Batch Normalization]] and [[Vector Operations]].

## The question it answers

"Batch normalization needs a batch to compute statistics from — what do I do when there isn't a meaningful batch, like generating one sequence element at a time?" Normalize across the example's own features instead, which needs nothing from any other example at all.

## Intuition: average down a column, or across a row

Lay a mini-batch out as a table: one row per example, one column per feature. Batch normalization computes each column's mean and variance — down the column, across examples, one statistic per feature. Layer normalization computes each row's mean and variance instead — across the row, across features, one statistic per example. Same arithmetic, different axis.

## Definitions

```text
batch norm (per feature j):   μⱼ, σⱼ² over all examples in the batch, for that one feature
layer norm (per example i):   μᵢ, σᵢ² over all features of that one example, needing no other example

both then apply:  x̂ = (x − μ) / √σ²        y = γ·x̂ + β
```

Because layer normalization's statistics come entirely from one example, it works identically whether the batch size is 256 or 1, and it needs no running statistics at test time — unlike batch normalization, there is no train/test mismatch to manage.

## A worked example

A tiny batch of 3 examples, 4 features each:

```text
     f0  f1  f2  f3
e0:   2   4   4   4
e1:   5   1   3   6
e2:   0   2   8   2
```

**Batch norm** (down each column, across the 3 examples):

```text
feature       f0      f1      f2      f3
mean         2.333   2.333   5.000   4.000
variance     4.222   1.556   4.667   2.667
```

**Layer norm** (across each row, across the 4 features):

```text
example       e0      e1      e2
mean         3.500   3.750   3.000
variance     0.750   3.688   9.000
```

Both compute a mean and a variance with the identical formula — they simply slide along different axes of the same table.

## Bench

```bench
id: layernorm-axis
title: Batch norm's column vs layer norm's row
fallback: A small table of raw values. Toggle between batch normalization (statistics down each column) and layer normalization (statistics across each row) and watch which cells get highlighted together and what each one's mean and variance come out to.
```

**Try this**

1. Switch between "batch norm" and "layer norm" and watch the highlighted group of cells rotate from columns to rows.
2. Edit a single value and see that it changes one column's statistics under batch norm, but only its own row's statistics under layer norm.
3. Shrink the table to a single row (one example) and see that batch norm's statistics per feature become degenerate, while layer norm is unaffected.

**What you should notice:** the two methods compute literally the same formula; the only difference is which group of cells — a column of same-feature values across examples, or a row of same-example values across features — is treated as the group to normalize over.

## Where it appears in AI

* **Recurrent networks and transformers** (see [[Recurrent Neural Networks]] and [[Multi-Head Attention]]) use layer normalization almost by default, since sequence lengths and batch composition vary too much for batch statistics to stay reliable.
* **Any setting with a batch size of 1** (generating one example at a time, as in [[Encoder-Decoder Architectures with Attention|many generation setups]]) needs layer norm or similar, since batch norm has no batch to work with.
* **Group normalization and instance normalization** are further variants, each choosing a different grouping of cells to normalize over.

## Common pitfalls

* **Assuming layer norm is strictly "better" than batch norm.** They solve different problems; batch norm's cross-example statistics can act as a mild regulariser that layer norm's per-example statistics do not provide.
* **Forgetting layer norm still has learned γ and β**, just like batch norm — only the statistics it normalizes with are computed differently.
* **Mixing up which axis is which when implementing either from scratch** — a frequent source of silent bugs, since both use the exact same formula.

## Quick check

<details><summary>1. What is the key difference between batch norm and layer norm?</summary>
Batch norm computes mean and variance across the batch, per feature; layer norm computes them across the features, per example — otherwise the formula is identical.
</details>

<details><summary>2. Why does layer norm work fine with a batch size of 1?</summary>
Its statistics come entirely from one example's own features, so it never needs more than one example to compute a meaningful mean and variance.
</details>

<details><summary>3. In the worked example, why do batch norm and layer norm produce different mean and variance numbers from the same table?</summary>
They average over different groups of cells — columns (across examples) for batch norm, rows (across features) for layer norm — so the same raw numbers produce different statistics.
</details>

## Key terms

* **Layer normalization:** normalizing across one example's own features, independent of the batch.
* **Batch normalization:** normalizing across the batch, for each feature (see [[Batch Normalization]]).
* **Train/test mismatch:** the need for running statistics at test time that batch norm has and layer norm avoids.

## Related

[[Batch Normalization]] · [[Vector Operations]] · [[Recurrent Neural Networks]] · [[Multi-Head Attention]]
