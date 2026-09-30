A **joint distribution** gives the probability of every combination of two or more random variables at once. From it you can recover each variable alone (the **marginal**) by summing out the other, and how one behaves given the other (the **conditional**). It is the complete picture of how variables relate.

**You need:** [[Conditional Probability]], [[Independence]] and [[Random Variables]].

## The question it answers

"How do two uncertain quantities behave together?" Weather and traffic, a word and the word before it, an image and its label all come as pairs.

## Intuition: a table of chances

Write the combinations in a table, one cell per pair `(x, y)`, holding `P(X = x, Y = y)`. All cells add to 1.

* **Marginal:** add along a row or column to get one variable alone.
* **Conditional:** take a row or column and rescale it so it adds to 1.

```text
P(X = x)       = Σ over y  P(X = x, Y = y)             marginal
P(Y = y | X = x) = P(X = x, Y = y) / P(X = x)          conditional
independent  ⇔  P(x, y) = P(x) · P(y)  in every cell
```

## A worked example

Let `X` = "it rained" (0 or 1) and `Y` = "traffic was heavy" (0 or 1):

```text
            Y = 0   Y = 1  | P(X)
X = 0        0.30    0.20  | 0.50
X = 1        0.10    0.40  | 0.50
-----------------------------
P(Y)         0.40    0.60
```

```text
P(Y = 1)             = 0.20 + 0.40 = 0.60                   marginal
P(Y = 1 | X = 1)     = 0.40 / 0.50 = 0.80                   conditional
P(X = 1) · P(Y = 1)  = 0.5 × 0.6   = 0.30  ≠  0.40 = P(X = 1, Y = 1)
```

The product does not match the joint cell, so rain and heavy traffic are **dependent**: rain raises the chance of heavy traffic from 0.6 to 0.8.

This table is also the setting of [[Bayes Theorem]]: the disease-and-test example is a joint table of "sick" and "positive" whose cells are the counts of people.

## Bench

```bench
id: joint-table
title: Joint table, marginals and conditionals
fallback: Sliders set three cells of a two-by-two joint table (the fourth follows); the bench shows the marginals, the conditional probabilities and whether the two variables are independent.
```

**Try this**

1. Start with the example and read the marginals.
2. Set the cells to make X and Y independent (each cell equals the product of its marginals).
3. Compute P(Y = 1 | X = 1) and P(Y = 1 | X = 0).
4. Make the variables strongly dependent.

**What you should notice:** marginals come from row and column sums, conditionals from rescaling one row or column, and independence means every cell is the product of its marginals.

## Where it appears in AI

* **Generative models** learn joint distributions over data.
* **Language models** factor a sentence's joint probability into conditionals: `P(w₁) P(w₂ | w₁) …`.
* **Classifiers** estimate `P(label | features)` from the joint.
* **Mutual information** measures dependence in a joint table (see [[Mutual Information]]).

## Common pitfalls

* **Treating the marginals as enough** to reconstruct the joint (they are not, unless independent).
* **Forgetting to rescale** when forming a conditional.
* **Summing the wrong axis.**
* **Believing zero correlation means independence.**

## Quick check

<details><summary>1. In the example, what is P(X = 0)?</summary>
0.30 + 0.20 = 0.50.
</details>

<details><summary>2. What is P(Y = 1 | X = 0)?</summary>
0.20 / 0.50 = 0.40.
</details>

<details><summary>3. If P(X, Y) = P(X) P(Y) in every cell, what does that mean?</summary>
X and Y are independent.
</details>

## Key terms

* **Joint distribution:** probabilities of combinations of variables.
* **Marginal distribution:** one variable's distribution, summing out the others.
* **Conditional distribution:** a variable's distribution given another's value.
* **Chain rule of probability:** `P(x, y) = P(x) P(y | x)`.

## Related

[[Conditional Probability]] · [[Independence]] · [[Bayes Theorem]] · [[Covariance and Correlation]] · [[Mutual Information]]
