Every AI system, from a thermostat to a chatbot, can be described with the same seven parts: a **goal**, the **data** it uses, a **model or rule**, and a loop of **perceive, decide, act**, all **judged** by some measure of success. This topic pulls the whole planet together and shows you where the rest of the galaxy fits.

**You need:** everything on this planet so far, especially [[PDA Loop]], [[A Model Is a Function]] and [[Measuring Performance]].

## The question it answers

Faced with any AI product, how do you make sense of it quickly?

## The seven parts

| Part | Question | Where you met it |
| --- | --- | --- |
| **Goal** | What is it trying to achieve? | [[Goals, Utility and Rationality]] |
| **Data** | What does it learn from or use? | [[Data as Raw Material]] |
| **Model or rule** | What turns inputs into outputs? | [[A Model Is a Function]], [[Rules vs Learning]] |
| **Perceive** | What does it sense right now? | [[PDA Loop]] |
| **Decide** | How does it choose? | [[Search]], [[Logic and Knowledge Representation]] |
| **Act** | What does it change in the world? | [[Agents and Environments]] |
| **Judge** | How do we know it works? | [[Measuring Performance]], [[Generalization]] |

Some parts may be simple or missing. A thermostat has a rule but no data to learn from. A learned system has data and a model. Every system, though, has a goal, a way to sense, a way to choose, a way to act and some measure of success.

## A worked example: a spam filter, part by part

| Part | The spam filter |
| --- | --- |
| Goal | Keep junk out of the inbox without hiding real mail |
| Data | Thousands of emails labelled spam or not spam |
| Model | Word weights learned from those examples |
| Perceive | Reads the text of an arriving email |
| Decide | Scores it as probably spam |
| Act | Moves it to the spam folder |
| Judge | Spam caught (recall) and real mail wrongly hidden (precision) |

Change any part and the system changes: a different goal (never hide anything from a boss), different data (new spam tactics), a different model, or a different measure.

## Bench

```bench
id: label-the-system
title: Anatomy of an AI system
fallback: Four familiar systems (thermostat, spam filter, self-driving car, chatbot). For each, seven statements are sorted into the roles they play: goal, data, model or rule, perceive, decide, act and how we judge it.
```

**Try this**

1. Label the **Spam filter**, then check. Which roles were easiest to mix up?
2. Try the **Thermostat**. Which part of the anatomy is thin or missing compared with the spam filter?
3. Label the **Chatbot**. Which of the seven parts is hardest to define for it?
4. Pick a product you use and write its seven parts.

**What you should notice:** the same seven questions apply to a rule-based thermostat and a billion-parameter chatbot. The answers differ enormously, and the framework keeps you oriented.

## The road ahead

The rest of the galaxy takes each piece further:

* [[Math]]: the language every model is written in: vectors, gradients, probability.
* [[Machine Learning]]: how models learn patterns from data, and how to judge them properly.
* [[Deep Learning]] and [[Neural Networks]]: models built from many layers of simple units, which learn their own features.
* [[Transformers]]: the architecture behind today's language and image models.
* [[Generative AI]]: models that create text, images, audio and code.
* [[LLMs]]: transformers trained to predict the next token, and the many ways they are used.
* [[RAG]]: giving a model fresh, real documents to work from.
* [[Agents]]: systems that perceive, decide and act, with a language model in the decide step.

Each of them is a deeper look at one or two of the seven parts.

## Common pitfalls

* **Describing only the model.** Goal, data and how success is judged matter just as much.
* **Forgetting the loop.** A system that acts changes what it sees next.
* **Skipping the judge.** A system without a measure of success cannot be improved or trusted.
* **Treating the parts as independent.** Data limits the model, and the goal shapes the measure.

## Quick check

<details><summary>1. Name the seven parts of an AI system.</summary>
Goal, data, model or rule, perceive, decide, act, and how it is judged.
</details>

<details><summary>2. Which parts does a simple thermostat have, and which are thin?</summary>
It has a goal, a rule, a sensor, a decision and an action. It has almost no data to learn from, and its measure of success is simple.
</details>

<details><summary>3. Why is the "judge" part essential?</summary>
Without a measure of success you cannot tell whether the system works, improve it or decide whether to trust it.
</details>

## Key terms

* **System:** a goal, data, a model or rule, a perceive–decide–act loop and a measure of success working together.
* **Metric:** a number that summarises how well a system does its job.
* **Deployment:** putting a trained system into real use.
* **Pipeline:** the chain of steps from raw data to a decision and an action.

## Related

[[PDA Loop]] · [[A Model Is a Function]] · [[Measuring Performance]] · [[Machine Learning]] · [[Agents]]
