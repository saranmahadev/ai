**AI, machine learning, deep learning and generative AI** are nested ideas, like Russian dolls. Each is a smaller, more specific kind of the one before: generative AI is a kind of deep learning, deep learning is a kind of machine learning, and machine learning is a kind of AI.

**You need:** [[What Counts as AI]].

## The question it answers

The four terms get used as if they meant the same thing. They do not. Knowing which doll a system belongs in tells you how it works and what it needs.

## Intuition: dolls inside dolls

```text
Artificial Intelligence (AI)
└── Machine Learning (ML)
    └── Deep Learning (DL)
        └── Generative AI
```

* **AI** is the broadest idea: systems that sense, decide and act towards goals. It includes systems with hand-written rules and systems that search, plan or learn.
* **Machine learning** is the part of AI where the system *learns patterns from data* instead of being given every rule.
* **Deep learning** is the part of machine learning that uses neural networks with many layers. It is what made image recognition, speech recognition and modern language models possible.
* **Generative AI** is the part of deep learning aimed at *creating new content*: text, images, audio, video or code.

The nesting has a consequence people often miss: **some AI is not machine learning.** A program that follows hand-written if-then rules, or one that searches a map for the shortest route, is AI in the broad sense but learns nothing from data.

## Each layer in one sentence

| Term | What it adds | Typical example |
| --- | --- | --- |
| AI | Goal-directed behaviour, by any method | A route finder using search |
| Machine learning | Learn the rules from examples | A spam filter trained on labelled emails |
| Deep learning | Learn with many-layered neural networks | Photo tagging, speech to text |
| Generative AI | Create new content | A chatbot that writes, an image generator |

## A worked example: one product, three layers

A modern phone camera app might combine all of them:

* A **rule** decides the flash fires when brightness drops below a threshold. (AI, no learning.)
* A **trained statistical model** guesses whether the scene is a portrait. (Machine learning.)
* A **deep neural network** recognises faces and sharpens them. (Deep learning.)
* A **generative model** fills in a background you erased. (Generative AI.)

A single product can sit in several dolls at once, so the useful question is about a particular *component*.

## Bench

```bench
id: nested-circles
title: AI, ML, DL and Generative AI
fallback: Twelve example systems to sort into four groups: AI without learning, machine learning, deep learning, and generative AI. Each answer comes with a one-line reason.
```

**Try this**

1. Place everything you are sure about first, then check. Which ones did you get wrong?
2. Look at the three items you put in "AI, but not learning from data". What do they have in common?
3. Think of a real product you use. Which groups do its parts fall into?

**What you should notice:** the groups are nested, so you pick the smallest one that fits. A generative image model is also deep learning, also ML and also AI, but its most specific home is generative AI.

## Where it appears in AI

The rest of the galaxy follows these dolls inwards: [[Machine Learning]], then [[Deep Learning]] and [[Neural Networks]], then [[Transformers]], [[Generative AI]] and [[LLMs]]. Classic, non-learning AI stays in this planet's [[Classic AI]] district.

## Common pitfalls

* **"AI" and "ML" are not synonyms.** Rule-based AI exists and is still widely used.
* **Deep learning is not the only ML.** Simple models such as decision trees are often better on small tables of data.
* **Generative AI is not all of AI.** Most deployed AI systems classify, predict or recommend. They do not create.
* **The nesting is about method, not quality.** A deeper doll is not automatically better.

## Quick check

<details><summary>1. Is a hand-written rule-based expert system machine learning?</summary>
No. It is AI, because it makes goal-directed decisions, but nothing is learned from data.
</details>

<details><summary>2. Which is bigger: deep learning or machine learning?</summary>
Machine learning is bigger. Deep learning is the part of it that uses many-layered neural networks.
</details>

<details><summary>3. Is a system that recognises cats in photos generative AI?</summary>
No. It recognises (classifies) images; it does not create new ones. It is deep learning, not generative AI.
</details>

## Key terms

* **Machine learning:** methods in which a system learns patterns from data instead of following hand-written rules.
* **Neural network:** a model built from many simple connected units whose connection strengths are learned.
* **Deep learning:** machine learning with neural networks that have many layers.
* **Generative AI:** models that create new content such as text, images, audio or code.

## Related

[[What Counts as AI]] · [[Rules vs Learning]] · [[Machine Learning]] · [[Deep Learning]] · [[Generative AI]]
