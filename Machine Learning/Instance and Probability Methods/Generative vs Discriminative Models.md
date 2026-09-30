There are two ways to build a classifier. A **generative** model learns what each class looks like (how its examples are distributed) and uses Bayes' rule to decide. A **discriminative** model skips that and learns the boundary between classes directly. Naive Bayes is generative; logistic regression and support vector machines are discriminative.

**You need:** [[Naive Bayes]] and [[Logistic Regression as a Classifier]].

## The question it answers

"Should I model the data, or just the decision?" Each choice has strengths, and the difference shows up when the data is unusual.

## Intuition: portraits or a border

A generative model paints a portrait of each class: "spam looks like this, ham like that". To classify, it asks which portrait a new example resembles more. A discriminative model never paints portraits; it only asks "which side of the border is this on?" Portraits can also be used to *generate* new examples, and they are efficient when data is scarce and the portrait's assumptions hold. Borders make fewer assumptions and are usually more accurate when there is plenty of data.

## Definitions

```text
generative       learns P(x | class) and P(class), classifies with Bayes' rule
                 examples: naive Bayes, Gaussian class models, hidden Markov models, language models
discriminative   learns P(class | x) directly (or just a boundary)
                 examples: logistic regression, SVM, neural-network classifiers
```

Setting class-wise Gaussian bell curves with a shared spread gives a straight boundary through the midpoint of the class means, tilted by the priors. Logistic regression also gives a straight boundary, but it places it by minimising classification error rather than by describing each class.

## A worked example

Sixty points from two overlapping clouds (bench data). Fit both models.

```text
                                generative (Gaussians)   logistic regression
accuracy on the 60 points              96.7%                   96.7%
```

Now add eight extreme but easy class-1 points far to the right (around `x = 4.2`). They are on the right side of any sensible boundary, so a discriminative model barely needs to care.

```text
                                generative (Gaussians)   logistic regression
accuracy on the original 60            93.3%                   96.7%
```

The generative model's class-1 mean has been dragged rightward by the far points, dragging its boundary with it, and it now misclassifies two original points. Logistic regression ignores points that are already correctly and confidently classified. The generative model was forced to describe *all* the data, including parts irrelevant to the decision.

## Bench

```bench
id: two-approaches
title: Model the classes, or model the boundary
fallback: Two classes with two decision lines, one from class-wise Gaussian models and one from logistic regression; a switch adds extreme but easy class-1 points and the accuracies on the original points are shown.
```

**Try this**

1. Compare the two lines on the original data.
2. Add the extreme class-1 points.
3. Watch which line moves and read both accuracies.

**What you should notice:** the generative boundary shifts because its class description changed, while the discriminative boundary stays put.

## Where it appears in AI

* **Language models** are generative: they model the probability of text itself.
* **Image generators** are generative models of pictures.
* **Most production classifiers** are discriminative.
* **Generative classifiers** shine with little data, missing features, or when you also need to sample or detect outliers.

## Common pitfalls

* **Believing generative models are always better because they "understand" the data.** Their assumptions can be wrong.
* **Believing discriminative models can't handle missing data,** which is harder for them, not impossible.
* **Comparing them on tiny test sets.**
* **Using a generative model's probabilities without checking calibration.**

## Quick check

<details><summary>1. Which of naive Bayes and logistic regression is generative?</summary>
Naive Bayes.
</details>

<details><summary>2. What does a generative model learn that a discriminative one does not?</summary>
How the features are distributed within each class, P(x | class).
</details>

<details><summary>3. Why can extreme, easy points move a generative boundary?</summary>
They change its estimates of each class's shape (mean and spread), which the boundary is computed from.
</details>

## Key terms

* **Generative model:** a model of how each class produces data.
* **Discriminative model:** a model of the boundary or of P(class | x).
* **Class-conditional distribution:** the distribution of features within one class.
* **Decision boundary:** the surface where two classes are equally likely.

## Related

[[Naive Bayes]] · [[Logistic Regression as a Classifier]] · [[Maximum Likelihood]] · [[Continuous Distributions]] · [[Support Vector Machines]]
