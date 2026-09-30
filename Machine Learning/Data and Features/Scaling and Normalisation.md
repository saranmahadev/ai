Features measured in different units can have wildly different sizes: age in tens, income in tens of thousands. Many models compare or combine features by adding them up, so the big-number feature drowns out the rest. **Scaling** rewrites each feature onto a comparable scale before learning.

**You need:** [[Missing Values and Cleaning]], [[Norms and Distance]] and [[Variance and Standard Deviation]].

## The question it answers

"Why does my model ignore a feature that obviously matters?" Often it is not ignoring it; the numbers are just so small next to another column that they barely register in a distance or a gradient.

## Intuition: dollars against years

Ask who is "most similar" to a 32-year-old earning 60,000. A 60-year-old earning 52,000 and a 30-year-old earning 50,000 are candidates. In raw numbers the income gap (thousands) swamps the age gap (years), so income alone decides. Yet we would say the 30-year-old is more alike. Scaling makes a year of age and a "typical amount" of income count comparably.

## Definitions

```text
standardise (z-score)   z = (x − mean) / std        result: mean 0, spread 1
min-max                  x′ = (x − min) / (max − min)   result: between 0 and 1
```

Fit the mean, std, min and max on **training** data only, then reuse them. Scaling matters for distance-based methods ([[k-Nearest Neighbours]]), for regularised and gradient-trained models, and for [[Support Vector Machines]]. Tree-based models do not care.

## A worked example

Query `Q = (age 32, income 60,000)`; candidates `A = (30, 50,000)` and `B = (60, 52,000)`.

```text
raw distance:   QA = √(2² + 10,000²)  ≈ 10,000.0
                QB = √(28² + 8,000²)  ≈  8,000.0     → B looks nearer
```

Standardise with age standard deviation 10 and income standard deviation 20,000:

```text
QA = √((2/10)² + (10,000/20,000)²) = √(0.04 + 0.25) = 0.539
QB = √((28/10)² + (8,000/20,000)²) = √(7.84 + 0.16) = 2.83    → A is nearer
```

The ranking flips. Raw distance said "same income, forget age"; scaled distance says the 30-year-old is far closer overall.

## Bench

```bench
id: scale-features
title: Distance depends on scale
fallback: Forty people are plotted by age and income; drag a query point and see its three nearest neighbours and vote under raw, standardised and min-max distances, with the accuracy of the nearest-neighbour rule on the other people.
```

**Try this**

1. With raw numbers, drag the query left and right and watch which neighbours are chosen.
2. Switch to standardised distance and repeat.
3. Compare the accuracy readout and the age share for each mode.

**What you should notice:** with raw numbers the neighbours track income alone (age share near zero) and the rule is poor; scaling brings age back into the distance and accuracy jumps.

## Where it appears in AI

* **Preprocessing pipelines** almost always standardise numeric inputs.
* **Neural networks** train faster and steadier on scaled inputs; normalisation layers do this inside the network.
* **Embeddings** are often length-normalised before comparing.

## Common pitfalls

* **Scaling before splitting,** which leaks test statistics.
* **Scaling the label by mistake** and forgetting to undo it for predictions.
* **Min-max scaling with outliers,** which squashes everything else into a corner (standardising or clipping helps).
* **Scaling one-hot columns** without thinking about what it does.

## Quick check

<details><summary>1. Standardise x = 70 when the mean is 50 and the standard deviation 10.</summary>
z = 2.
</details>

<details><summary>2. Which models are insensitive to feature scale?</summary>
Tree-based models, since they only compare each feature with thresholds.
</details>

<details><summary>3. Where should the mean and standard deviation be computed?</summary>
On the training data only, then reused for validation and test data.
</details>

## Key terms

* **Standardisation:** rescaling to mean 0 and standard deviation 1.
* **Normalisation (min-max):** rescaling to a fixed range such as 0 to 1.
* **Z-score:** how many standard deviations a value is from the mean.
* **Feature scale:** the typical size of a feature's values.

## Related

[[Norms and Distance]] · [[Missing Values and Cleaning]] · [[Encoding Categories]] · [[k-Nearest Neighbours]] · [[Learning Rate]]
