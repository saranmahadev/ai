A **dataset** is a table: each row is an example, each column a measurement. The columns the model reads are **features**; the column it should predict is the **label** (or target). Choosing which columns count as features, and keeping the answer out of them, is the first real decision in a project.

**You need:** [[What Is Machine Learning]], [[Features and Labels]] and [[Tensors and Shapes]].

## The question it answers

"What exactly do I feed the model, and what do I ask it to predict?" A model can only use what it is shown, and it will happily use anything that predicts the label, even something unavailable at prediction time.

## Intuition: what would I know on the day?

Imagine predicting a house's sale price. On the day you need the prediction, you know size, bedrooms and age. You do not know the agent's final quote, because that comes after the sale. If a model is trained with a column that will not exist at prediction time, it looks brilliant in testing and fails in use. This mistake is called **leakage**.

## Definitions

```text
example      one row: one house, one email, one image
features x   the inputs, often a vector       x = (size, bedrooms, age)
label y      the answer to predict            y = price
dataset      n examples                       X has shape (n, d),  y has shape (n,)
```

`X` is a matrix with `n` rows and `d` feature columns; `y` is a vector of `n` labels.

## A worked example

Three houses, with two features and a label.

```text
size (m²)   bedrooms   price (thousands)
   60          2            170
   80          3            220
  100          3            260
```

Here `X` has shape `(3, 2)` and `y` has shape `(3,)`. A simple model `price = 50 + 2 × size` predicts 170, 210 and 250: right for the first, 10 too low for the second and third. Now add a column "agent's final quote": 171, 219, 262. A model can read that column and be almost exactly right, but on the day you must predict, that number does not exist. The model's apparent accuracy is an illusion of leakage.

A quieter trap is an identifier column such as a listing number. If numbers happen to rise with price in the training data, a model may use it, and it means nothing.

## Bench

```bench
id: feature-roles
title: Pick the features, predict the price
fallback: Tick which columns of a house dataset the model may use, then see its error on training homes and on unseen homes; including the agent's final quote makes the error suspiciously small.
```

**Try this**

1. Use size and bedrooms and note both errors.
2. Add age.
3. Tick the agent's final quote and watch the error collapse.
4. Add the listing number and see whether it helps on unseen homes.

**What you should notice:** the leaking column gives an unrealistically small error, while a meaningless column adds nothing on unseen homes.

## Where it appears in AI

* **Tabular models** (loans, churn, prices) live or die by feature choice.
* **Deep learning** learns features from raw pixels or text, but leakage still applies to the label and the split.
* **Medical and fraud models** are especially prone to leakage from data recorded after the outcome.

## Common pitfalls

* **Leakage:** features only known after the outcome.
* **Identifiers as features:** row numbers and IDs carry no real signal.
* **Mixing up X and y** when reshaping or splitting.
* **Ignoring units and missing values** (see [[Missing Values and Cleaning]]).

## Quick check

<details><summary>1. If X has 500 examples and 8 features, what is its shape?</summary>
(500, 8).
</details>

<details><summary>2. Why is "agent's final quote" a bad feature for predicting sale price?</summary>
It is only known after the sale, so it will not exist when you need a prediction (leakage).
</details>

<details><summary>3. What is a label?</summary>
The answer the model is trained to predict.
</details>

## Key terms

* **Feature:** an input column the model reads.
* **Label (target):** the value the model predicts.
* **Example:** one row of the dataset.
* **Leakage:** using information at training time that will not exist at prediction time.

## Related

[[Features and Labels]] · [[What Is Machine Learning]] · [[Train, Validation and Test Sets]] · [[Missing Values and Cleaning]]
