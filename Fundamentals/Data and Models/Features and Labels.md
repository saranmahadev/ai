**Features** are the measurable facts a model looks at, and a **label** is the answer it is asked to predict. Describing each example as a list of features, its **feature vector**, is how a messy real-world thing becomes something a model can compare.

**You need:** [[Data as Raw Material]].

## The question it answers

Given a fruit, an email or a customer, what exactly does the model look at, and what is it trying to get right?

## Intuition: describing a thing, then naming it

To tell an apple from an orange over the phone, you would describe it: "reddish, smooth, about 150 grams". Each fact is a **feature**. The thing you want at the end, "apple" or "orange", is the **label**. Training examples come as pairs: features plus the correct label. A model learns which features point to which label.

| Example | Features (inputs) | Label (answer) |
| --- | --- | --- |
| A fruit | redness, bumpiness, weight | apple or orange |
| An email | words it contains, sender, time sent | spam or not spam |
| A house | size, bedrooms, location | sale price |
| A customer | months subscribed, support calls | will cancel or not |

## Good and bad features

Some features carry a lot of information about the label, and others carry almost none. A feature that tells apples from oranges well (redness, bumpiness) is worth far more than one that varies at random (the number of seeds counted). Giving a model useless features does not just waste effort; it can lead it to find patterns that are not real.

Choosing and shaping features by hand is called **feature engineering**. One of the big shifts of [[Deep Learning]] is that the model learns useful features for itself from raw data, though hand-crafted features are still valuable, especially for tables of data.

## A worked example: a new fruit

The centre (typical values) of each group, as redness and bumpiness scores from 0 to 1:

```text
apple:  redness 0.72, bumpiness 0.30
orange: redness 0.35, bumpiness 0.70
```

A new fruit has redness 0.40 and bumpiness 0.65. Which group is it closer to? Measure the straight-line distance in feature space:

```text
distance to apple  = √((0.40 − 0.72)² + (0.65 − 0.30)²) = √(0.1024 + 0.1225) ≈ 0.47
distance to orange = √((0.40 − 0.35)² + (0.65 − 0.70)²) = √(0.0025 + 0.0025) ≈ 0.07
```

It is far closer to the orange centre, so the prediction is "orange". A model that compares distances like this is doing exactly what the features let it do: with poor features, the distances mean little.

## Bench

```bench
id: feature-picker
title: Which features separate apples from oranges?
fallback: A scatter plot of 90 fruits on any two of four features (redness, bumpiness, weight, seeds). A simple classifier reports how many fruits land on the correct side of the dividing line.
```

**Try this**

1. Start with **weight** against **seeds**. What percentage lands on the right side? Do the two colours overlap?
2. Switch to **redness** against **bumpiness**. What changed?
3. Put **seeds** on both axes. Is one feature enough to separate the groups?
4. Find a pair that gets above 95%, and a pair that gets below 65%.

**What you should notice:** with weight and seeds only about 63% of fruits are correct, hardly better than guessing, while redness with bumpiness reaches about 98%. The model and the data are the same in both cases. Only the features changed.

## Where it appears in AI

Feature vectors are the input to almost everything in [[Machine Learning]]. Many of the distance and similarity ideas in [[Math]], such as [[Dot Product]], measure how alike two feature vectors are. In [[LLMs]] the features are learned embeddings of words.

## Common pitfalls

* **Features that leak the answer.** A feature that would not be known at prediction time (such as "was refunded" when predicting cancellations) makes a model look brilliant and fail in use.
* **Irrelevant features.** They add noise and cost.
* **Different scales.** A weight in grams dwarfs a score between 0 and 1 unless you rescale.
* **Labels can be wrong.** If people labelled examples carelessly, the model learns their mistakes.

## Quick check

<details><summary>1. In predicting a house price, what is the label and what are the features?</summary>
The label is the sale price. The features are facts such as size, bedrooms and location.
</details>

<details><summary>2. Why can an extra, irrelevant feature hurt?</summary>
It adds noise and can lead the model to find patterns that are not real.
</details>

<details><summary>3. What is feature engineering?</summary>
Choosing and shaping the input features by hand so the model has useful information to work with.
</details>

## Key terms

* **Feature:** one measurable fact about an example.
* **Feature vector:** the list of an example's features.
* **Label:** the answer the model is asked to predict.
* **Feature engineering:** choosing and shaping features by hand to give a model useful information.

## Related

[[Data as Raw Material]] · [[A Model Is a Function]] · [[Types of Tasks]] · [[Dot Product]] · [[Machine Learning]]
