Most AI problems fall into a few kinds: **classify** (pick a category), **predict a number**, **group similar things** without labels, **generate** new content, or **choose actions** over time. Recognising the kind of task tells you what data you need and which methods apply.

**You need:** [[Features and Labels]] and [[A Model Is a Function]].

## The question it answers

You have a problem in the real world. How do you turn it into something a model can do?

## The five kinds

| Task | The question | Output | Needs labels? | Example |
| --- | --- | --- | --- | --- |
| **Classification** | Which category? | one of a fixed set | yes | spam or not, cat or dog, fraud or fine |
| **Regression** | How much? | a number | yes | house price, tomorrow's temperature, delivery time |
| **Clustering** | Which things belong together? | groups | no | customer segments, related news stories |
| **Generation** | Create something new | text, image, audio, code | learns from examples | a story, a picture from a prompt |
| **Decision and control** | What should I do next? | an action | learns from feedback | robot arm, game moves |

The first two are usually called **supervised learning**, because each training example comes with the right answer. Clustering is **unsupervised**, because no answers are given. Choosing actions from feedback is **reinforcement learning**, and it links back to the agent loop. Generative models often learn by predicting parts of data from other parts.

## A worked example: one business, five tasks

An online shop could use every kind of task:

* **Classify** each review as positive or negative.
* **Predict** how many units of an item will sell next week.
* **Group** its customers into similar segments.
* **Generate** a product description from a list of features.
* **Choose** which item to show next, learning from what people click.

## Bench

```bench
id: task-matcher
title: What kind of task is it?
fallback: Twelve everyday problems to sort into five task types: classify, predict a number, group similar things, generate new content, and choose actions over time. Each answer comes with a one-line reason.
```

**Try this**

1. Sort the problems you are sure about first, then check.
2. Which problems could be framed two ways? How would you decide?
3. Pick a problem from your own work or life and ask which type it is.

**What you should notice:** the question ("which one?", "how much?", "what groups?", "make something", "what next?") is the giveaway. The categories overlap at the edges, since a system that ranks results is doing something between classification and regression, and translation is generation.

## Turning a vague goal into a task

Real goals rarely arrive labelled. "Reduce customer churn" is a business aim, not a task. The same aim can be framed several ways, and each framing needs different data and gives a different kind of answer:

| Framing | Task type | What you would need | What you would get |
| --- | --- | --- | --- |
| Which customers will cancel this month? | Classification | past customers labelled "cancelled" or "stayed" | a yes/no flag per customer |
| How many days until each customer cancels? | Regression | past customers with days-to-cancel | a number per customer |
| What kinds of customer do we have? | Clustering | customer records, no labels | groups to study and name |
| Which offer should we show this customer? | Decision and control | offers tried, with feedback on what worked | a chosen action |

No framing is "right". The best one is the one whose answer you can act on. Choosing it is a judgement about the goal, made before any model is built, and it is where many projects go wrong.

## Where it appears in AI

These task types organise the whole of [[Machine Learning]]: supervised learning for the first two, unsupervised for clustering, reinforcement learning for actions. [[Generative AI]] and [[LLMs]] handle generation. And any of them can sit inside the decide phase of an [[PDA Loop]].

## Common pitfalls

* **Framing the problem badly.** Predicting "will they cancel: yes or no" and "how many days until they cancel" are different tasks with different data.
* **Assuming you have labels.** Classification and regression need correct answers for each example, which someone has to produce.
* **Forcing everything into one type.** Some problems, such as ranking, do not fit neatly.
* **Skipping the goal.** The task type follows from what decision you need to support.

## Quick check

<details><summary>1. Predicting tomorrow's rainfall in millimetres: which task?</summary>
Regression, since the answer is a number.
</details>

<details><summary>2. Finding groups of similar customers with no labels: which task?</summary>
Clustering, which is unsupervised.
</details>

<details><summary>3. Why does reinforcement learning fit "choose actions over time"?</summary>
It learns from feedback about the results of actions, and each action affects what comes next.
</details>

## Key terms

* **Classification:** predicting which category an example belongs to.
* **Regression:** predicting a number.
* **Clustering:** grouping similar examples when no labels are given.
* **Supervised learning:** learning from examples that come with correct answers.
* **Reinforcement learning:** learning which actions to take from feedback about their results.

## Related

[[Features and Labels]] · [[A Model Is a Function]] · [[Training vs Inference]] · [[Machine Learning]] · [[Generative AI]]
