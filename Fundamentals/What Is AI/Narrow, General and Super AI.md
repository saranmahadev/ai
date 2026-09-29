**Narrow AI** does one job, or a small family of jobs, very well. **General AI** would handle a wide range of tasks the way a person can. **Superintelligence** would go far beyond human ability. Every AI system in daily use is narrow or somewhere along the road towards broad, and "general" is a contested word without an agreed test.

**You need:** [[What Counts as AI]] and [[AI, ML, DL and Generative AI]].

## The question it answers

Headlines talk about machines that "think like us", and a chess program cannot even read an email. How do those fit together? The three labels give a rough map of how much a system can do, and where science fiction begins.

## Intuition: a specialist and a generalist

Picture a world-class surgeon and a capable general practitioner. The surgeon is unbeatable at one operation but is not the person to ask about your allergies. The general practitioner covers many things competently. Narrow AI is the specialist, and the hope (or fear) behind "general AI" is a system that can turn its hand to almost anything.

| Label | Meaning | Status |
| --- | --- | --- |
| **Narrow AI** (also "weak AI") | Built for one task or a tight family of tasks | Every deployed system |
| **General AI** (AGI) | Flexible across most intellectual tasks a person can do, able to learn new ones | A goal and a debate, with no agreed definition or test |
| **Superintelligence** | Far better than the best humans at nearly everything | Hypothetical |

The term *superintelligence* is associated with the philosopher Nick Bostrom, who wrote a book of that name in 2014.

## Why "general" is slippery

Ask ten researchers what counts as general intelligence and you will get different answers: matching an average adult across all tasks, matching experts, earning money autonomously, learning any new skill from a few examples. Because there is no agreed test, claims that a system "is" or "is not" AGI mostly reflect which definition the speaker chose. This site treats AGI as an open question, not a milestone with a date.

It also helps to see capability as a **spectrum**, not a switch. A chess engine sits at one end. A language-model chatbot can attempt many text-based tasks, from essays to summaries to simple classification, and yet it is not a specialist at any of them, cannot steer a car, and can be confidently wrong. Ability is **uneven**: brilliant at one thing, and oddly weak at a neighbouring thing.

## A worked example: counting what a system can do

Score six systems on six tasks (chess, labelling a photo, filtering spam, writing an essay, vacuuming a room, steering a car), where "yes" or "partly" both count:

| System | Tasks it can touch (of 6) |
| --- | --- |
| Chess engine | 1 (chess) |
| Robot vacuum | 1 (vacuuming) |
| Spam filter | 1 (spam) |
| Self-driving software | 2 (steering, and partly recognising objects) |
| Language-model chatbot | 4 (essays, and partly chess, photos and spam) |

The chatbot is far broader than the specialists, but it is still far from covering everything, and "partly" hides a wide gap in quality. Breadth is not the same as general intelligence.

## Bench

```bench
id: capability-matrix
title: What can each system do?
fallback: A grid of six kinds of AI system against six tasks, marking which each can do fully, partly or not at all, with a sentence about each system.
```

**Try this**

1. Click each system in turn. Which is the broadest? Which is the deepest at its own task?
2. Look at the language-model chatbot's row. Which "partly" cells would you want to check before trusting it?
3. Imagine adding a seventh task, "diagnose a car engine from its sound". Which systems would score anything?

**What you should notice:** the strongest systems at a task are usually specialists, and the broadest system is rarely the best at any single task. The table is a rough guide for typical systems, and general-purpose models change quickly, so check current abilities before relying on any row.

## Where it appears in AI

The specialist-versus-generalist tension runs through the galaxy. [[Machine Learning]] usually builds specialists. Large [[LLMs]] and [[Generative AI]] models are trained broadly, then adapted to tasks, which is why they feel so different. [[Agents]] combine a broad model with tools to reach further.

## Common pitfalls

* **"AI" in a headline usually means narrow AI.** Being superhuman at one task says little about anything else.
* **Breadth is not depth.** Doing many things acceptably is different from doing one thing at expert level.
* **Do not treat AGI as a settled finish line.** Definitions differ, so claims about it need the definition attached.
* **Fluent is not the same as reliable.** A system that sounds confident across many topics can still be wrong in any of them.

## Quick check

<details><summary>1. Is a chess engine that beats every human a general intelligence?</summary>
No. It is superhuman at one narrow task and cannot do anything outside it, so it is narrow AI.
</details>

<details><summary>2. Why is it hard to say whether a system is AGI?</summary>
There is no agreed definition or test, so the answer depends on which definition is used.
</details>

<details><summary>3. What does it mean that ability is "uneven"?</summary>
A system can be excellent at one task and weak at a similar-looking one, so judging it from a single strength is misleading.
</details>

## Related

[[What Counts as AI]] · [[AI, ML, DL and Generative AI]] · [[A Short History of AI]] · [[LLMs]] · [[Agents]]
