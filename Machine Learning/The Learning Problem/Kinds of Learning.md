Machine learning problems come in three main flavours, defined by the feedback the learner gets. In **supervised** learning every example comes with the right answer. In **unsupervised** learning there are no answers and the goal is to find structure. In **reinforcement** learning an agent acts and only receives rewards.

**You need:** [[What Is Machine Learning]] and [[Types of Tasks]].

## The question it answers

"What kind of feedback do I have?" The answer decides which algorithms are even possible. Choosing the wrong flavour is like asking a student to mark their own exam without an answer key.

## Intuition: three kinds of teacher

* **Supervised:** a teacher shows a question and the correct answer, thousands of times. Learn the mapping from inputs to answers.
* **Unsupervised:** no teacher, just a pile of material. Notice groups, patterns and unusual items.
* **Reinforcement:** no answers, only a score after the fact. Try things, see what pays off, and adjust.

## Definitions

```text
supervised     data: (x, y) pairs        goal: predict y for new x
                 classification: y is a category   regression: y is a number
unsupervised   data: x only              goal: clusters, structure, compression, outliers
reinforcement  data: states, actions, rewards   goal: a policy that maximises total reward
```

Two hybrids matter: **semi-supervised** learning (a few labels, many unlabelled examples) and **self-supervised** learning (the labels come free from the data itself, such as predicting the next word in a text).

## A worked example

A shop has 10,000 past orders. The same table can frame three different problems.

```text
Predict whether a new order will be returned      supervised (label: returned yes/no)
Group customers with similar buying habits        unsupervised (no label)
Choose which discount to show each visitor,
  learning from whether they buy                  reinforcement (reward: purchase)
```

The first needs a returned column filled in for past orders. The second needs nothing but the order data. The third needs a loop: show a discount, watch the result, update. Labelling costs money, which is why unsupervised and self-supervised methods matter: unlabelled data is plentiful.

## Bench

```bench
id: learning-types
title: Which kind of learning is it?
fallback: Sort eight scenarios into supervised, unsupervised and reinforcement learning, then check your answers with an explanation for each miss.
```

**Try this**

1. Sort all eight scenarios without checking first.
2. Check, and read the reason for any miss.
3. Restart and see whether you can explain each choice by naming the feedback.

**What you should notice:** the deciding question is always what feedback exists: known answers, none, or rewards after actions.

## Where it appears in AI

* **Supervised:** spam filters, image classifiers, price prediction.
* **Unsupervised:** customer segments, anomaly detection, embeddings.
* **Self-supervised:** the pretraining of large language models.
* **Reinforcement:** game-playing agents, robot control, tuning models with human feedback.

## Common pitfalls

* **Calling clustering "prediction".** With no labels there is no answer to be right about.
* **Assuming labels are free.** Labelling is often the main cost.
* **Treating reinforcement as supervised.** Rewards arrive late and only say how good, not what was right.
* **Forgetting hybrids.** Real systems mix several kinds.

## Quick check

<details><summary>1. Grouping news articles by topic with no labels: which kind?</summary>
Unsupervised.
</details>

<details><summary>2. What is the difference between classification and regression?</summary>
Classification predicts a category; regression predicts a number.
</details>

<details><summary>3. Why is predicting the next word called self-supervised?</summary>
The answer (the next word) comes from the text itself, with no human labelling.
</details>

## Key terms

* **Supervised learning:** learning from examples with known answers.
* **Unsupervised learning:** finding structure without answers.
* **Reinforcement learning:** learning from rewards after actions.
* **Self-supervised learning:** learning where the labels come from the data itself.

## Related

[[What Is Machine Learning]] · [[Types of Tasks]] · [[Datasets, Features and Labels]] · [[Agents and Environments]]
