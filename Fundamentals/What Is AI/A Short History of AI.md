AI's history is a pattern of **big promises, real breakthroughs, disappointment and funding cuts, then a new approach and a new wave**. The two long slumps are called **AI winters**. Knowing the pattern helps you judge today's claims more calmly.

**You need:** [[What Counts as AI]] and [[Rules vs Learning]].

## The question it answers

How did we get from a 1950 thought experiment to chatbots, and why did progress come in bursts?

## The story in five acts

**1. Birth (1950s).** In 1950 Alan Turing published "Computing Machinery and Intelligence" in the journal *Mind* and proposed the imitation game. In 1955 John McCarthy, Marvin Minsky, Nathaniel Rochester and Claude Shannon proposed a summer workshop at Dartmouth College, held in 1956; their proposal was the first known use of the phrase "artificial intelligence". In 1958 Frank Rosenblatt introduced the **perceptron**, an early system that learned to classify images from labelled examples.

**2. Early optimism (1960s).** Programs solved algebra problems, proved theorems and played games. In 1966 Joseph Weizenbaum's **ELIZA** imitated a psychotherapist using simple pattern rules, and people still confided in it: an early lesson in how easily we credit machines with understanding.

**3. The first winter (mid-1970s).** Progress on hard, real-world problems was slower than promised. In 1973 a British report by James Lighthill was very pessimistic about the field's achievements, and it contributed to cuts in AI funding. The slump lasted until around 1980.

**4. Expert systems, then a second winter (1980s).** In 1980 Digital Equipment Corporation deployed **XCON**, a rule-based system that configured computer orders, and companies began investing heavily in expert systems. They proved costly to maintain and brittle outside their narrow domain. By the late 1980s funding and many AI companies had collapsed, in what is usually called the second winter (roughly 1987 to 1993). Meanwhile, in 1986, Rumelhart, Hinton and Williams published a widely read account of training multi-layer neural networks with **backpropagation**.

**5. The learning era (1990s to now).** In May 1997 IBM's **Deep Blue** beat world chess champion Garry Kasparov, a triumph of search. In 2012 **AlexNet**, a deep neural network, won the ImageNet image recognition challenge with a top-5 error of about 15%, far ahead of the runner-up's 26%, and deep learning took off. In March 2016 **AlphaGo** beat Go champion Lee Sedol four games to one. In 2017 Google researchers published "Attention Is All You Need", introducing the **transformer**. And on 30 November 2022 OpenAI released **ChatGPT**, which reached a mass audience within weeks.

## Why the pattern repeats

Three ingredients decide how far AI can go at any moment: **algorithms** (the methods), **data** (examples to learn from) and **compute** (the computing power to use them). The winters came when the methods of the day ran into limits that data and compute could not yet overcome. The recent boom came when all three matured together, and when learning from data beat hand-written rules on messy real-world problems.

## A worked example: reading a claim through the timeline

Suppose a headline says a new system will "replace all experts within five years". History gives you questions to ask:

* Is it **narrow or general**? (Expert systems shone in narrow domains and failed beyond them.)
* Does it **need hand-written knowledge** or **learn from data**? (The first is costly to maintain; the second needs data.)
* Has it been **tested outside the demo**? (Each earlier wave looked strongest in controlled demonstrations.)

## Bench

```bench
id: ai-timeline
title: Seventy years of AI
fallback: A scrubbable timeline from 1950 to 2022 with thirteen events, and shaded bands for the two AI winters (roughly 1974 to 1980 and 1987 to 1993).
```

**Try this**

1. Slide from 1950 to 1973. What did people expect by then, and what does the event at the end tell you?
2. Step through the events in order. Which ones were about **rules and search**, and which about **learning**?
3. Look at the gap between 1986 and 2012. What was missing from backpropagation's early years that AlexNet had?
4. Find the two shaded bands. What was happening in AI just before each?

**What you should notice:** the winters follow booms built on narrow successes, and the recent surge follows the arrival of data and compute for learning methods.

## Where it appears in AI

The rest of the galaxy tells the last act in detail: [[Neural Networks]] and [[Deep Learning]] for 1986 and 2012, [[Transformers]] for 2017, and [[LLMs]] for the chatbot wave. [[Expert Systems and Their Limits]] in this planet covers act four.

## Common pitfalls

* **Dates are convenient labels, not clean breaks.** Winters and booms overlapped with quiet progress. The winter dates here are approximate.
* **A winter did not stop all research.** Work on neural networks and statistics continued through the slumps.
* **A milestone is not a general breakthrough.** Beating a champion at a game is impressive and narrow.
* **History does not predict the future.** It only suggests good questions.

## Quick check

<details><summary>1. What is an "AI winter"?</summary>
A period, after a wave of hype, when disappointment led to sharply reduced funding and interest in AI.
</details>

<details><summary>2. Which three ingredients decide how far AI can go?</summary>
Algorithms, data and compute.
</details>

<details><summary>3. Why did expert systems fade?</summary>
They were narrow and brittle, and keeping their hand-written rules up to date was expensive.
</details>

## Related

[[What Counts as AI]] · [[Rules vs Learning]] · [[Narrow, General and Super AI]] · [[Expert Systems and Their Limits]] · [[Deep Learning]] · [[Transformers]]
