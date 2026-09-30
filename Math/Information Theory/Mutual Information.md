**Mutual information** `I(X; Y)` measures how much knowing one variable reduces your uncertainty about the other. It is zero when the variables are independent and larger the more they depend on each other, in any way, not just linearly. In decision trees the same quantity is called **information gain**.

**You need:** [[Joint and Conditional Entropy]], [[KL Divergence]] and [[Independence]].

## The question it answers

"How much does X tell me about Y?" Unlike correlation, it also catches curved and complicated relationships, which makes it useful for choosing informative features.

## Intuition: uncertainty saved

Start with the uncertainty of `Y` alone, `H(Y)`. Learn `X`, and the remaining uncertainty is `H(Y | X)`. The **saving** is the mutual information:

```text
I(X; Y) = H(Y) − H(Y | X) = H(X) + H(Y) − H(X, Y)
        = D( p(x, y) ‖ p(x) p(y) )
```

The last form says: mutual information is the KL divergence between the true joint distribution and the one you would have if `X` and `Y` were independent. Zero divergence means independent.

```text
I(X; Y) ≥ 0        I(X; Y) = 0 ⇔ X and Y are independent        I(X; Y) = I(Y; X)   (symmetric)
```

## A worked example

Take the joint table from [[Joint and Conditional Entropy]] (rain and heavy traffic): `H(X) = 1`, `H(Y) = 0.971`, `H(X, Y) = 1.846`.

```text
I(X; Y) = 1 + 0.971 − 1.846 = 0.125 bits
```

Knowing whether it rained saves about 0.125 bits of uncertainty about traffic: a modest but real dependence. If instead the table were independent (every cell the product of its marginals), the joint entropy would equal `H(X) + H(Y)` and `I = 0`.

**Information gain in a decision tree:** suppose 10 examples are 5 positive, 5 negative (entropy 1 bit). A feature splits them into a group of 4 with 4 positives (entropy 0) and a group of 6 with 1 positive and 5 negatives (entropy `−(1/6·log₂ 1/6 + 5/6·log₂ 5/6) = 0.650`).

```text
average entropy after the split = 0.4 × 0 + 0.6 × 0.650 = 0.390
information gain = 1 − 0.390 = 0.610 bits
```

The tree prefers splits with the largest gain.

## Bench

```bench
id: dependence-meter
title: How much does X tell you about Y?
fallback: Sliders set a two-by-two joint table; the bench shows the entropies, the mutual information and a meter comparing it with the largest value possible, and it reports when the variables are independent.
```

**Try this**

1. Make X and Y independent and read the mutual information.
2. Make them strongly linked.
3. Make Y determined by X and compare with H(Y).
4. Compare the mutual information with how the table looks.

**What you should notice:** mutual information is zero exactly at independence, and it can never exceed the smaller of the two entropies.

## Where it appears in AI

* **Decision trees** pick splits by information gain.
* **Feature selection** ranks features by mutual information with the label.
* **Representation learning** maximises information between a representation and the data.
* **Fairness and privacy** measure how much a prediction reveals about a protected attribute.

## Common pitfalls

* **Confusing it with correlation.** It also detects non-linear dependence.
* **Estimating it from little data:** small samples give biased values.
* **Assuming a large value means causation.**
* **Comparing values across different variable sizes** without care.

## Quick check

<details><summary>1. What is I(X; Y) if X and Y are independent?</summary>
0.
</details>

<details><summary>2. H(Y) = 1.0 and H(Y | X) = 0.4. What is I(X; Y)?</summary>
0.6 bits.
</details>

<details><summary>3. Is I(X; Y) equal to I(Y; X)?</summary>
Yes.
</details>

## Key terms

* **Mutual information:** the reduction in uncertainty about one variable from knowing another.
* **Information gain:** the same quantity, used to score decision-tree splits.
* **Independence:** the case where mutual information is zero.
* **Symmetric:** the same in both directions.

## Related

[[Joint and Conditional Entropy]] · [[KL Divergence]] · [[Independence]] · [[Covariance and Correlation]] · [[Entropy]]
