**Artificial intelligence** has no single agreed definition, so whether something "counts" depends on the question you ask. The most useful definition for learning is a practical one: a system that senses its world, chooses actions to pursue a goal, and often improves from experience.

**You need:** nothing. This is where the road starts.

## The question it answers

Is a thermostat AI? A chess program? A chatbot? Ask ten people and you will get different answers, and they can all be reasonable. The disagreement is not about the machines. It is about what the word is supposed to mean.

## Intuition: a word with a moving target

The phrase "artificial intelligence" first appeared in a 1955 proposal for a summer workshop at Dartmouth College, held in 1956, and that workshop is widely seen as the birth of the field. The founders wanted to study machines that could use language, form concepts and improve themselves. Nobody defined exactly where the boundary sat.

The boundary has kept moving. Many people notice an **"AI effect"**: once a task is solved and becomes ordinary, such as reading postal codes or recommending a film, it stops feeling like AI. The word then points at whatever still seems hard or surprising.

## Four ways to define it

A widely used textbook, Russell and Norvig's *Artificial Intelligence: A Modern Approach*, sorts definitions along two questions: does the system **think or act**, and is the standard **human or rational**?

| | Human standard | Rational standard |
| --- | --- | --- |
| **Acting** | Acting humanly: behave so that people cannot tell you from a person (the Turing test) | Acting rationally: do the best thing for your goal (a rational agent) |
| **Thinking** | Thinking humanly: reproduce how human minds work | Thinking rationally: reason by correct logical rules |

Alan Turing's 1950 paper "Computing Machinery and Intelligence", published in the journal *Mind*, proposed the imitation game (now called the Turing test) as a way to sidestep the question "can machines think?". Modern AI leans towards the bottom-right cell: **acting rationally**. A rational agent does not have to imitate people. It has to choose actions that do well at its goal.

## A working definition for this site

We will use three traits that most definitions reach for:

1. **It senses its world** (it takes in data about its situation).
2. **It chooses actions towards a goal** (it decides, not just calculates).
3. **It improves from experience** (it learns), though not every system that we call AI does.

The more traits a system has, the more comfortably it sits under the word.

## A worked example

Score three systems on the three traits.

| System | Senses | Goal-directed | Learns |
| --- | --- | --- | --- |
| Pocket calculator | no | no | no |
| Thermostat | yes (temperature) | yes (hold a target) | no |
| Spam filter that learns from your reports | yes (email text) | yes (keep junk out) | yes |

The calculator has none of the traits: it only computes what it is told. The thermostat has two: under a broad, rational-agent definition it counts, but many people would not call it AI. The learning spam filter has all three, and almost everyone would.

## Bench

```bench
id: is-it-ai
title: Is it AI? You choose the definition
fallback: Twelve systems, each with three traits (senses, pursues a goal, learns). You tick which traits a system needs to be called AI, and the list splits into those that count and those that do not.
```

**Try this**

1. Start with the **Broad** preset (senses and pursues a goal). Which surprising systems count?
2. Press **Common: must also learn**. Which systems drop out?
3. Untick everything. What happens to the word "AI"?
4. Find a set of requirements that includes a self-driving car but excludes a robot vacuum. Is the line you drew easy to defend?

**What you should notice:** the systems never change, only your definition does. That is why arguments about "is it really AI?" are usually arguments about definitions.

## Where it appears in AI

Almost every later topic uses this vocabulary. **Agents** are systems that sense, decide and act. **Machine learning** is the "improves from experience" trait made systematic. When someone says "AI" in a product name, ask which traits it actually has.

## Common pitfalls

* **AI is not the same as robots.** Most AI is software with no body.
* **AI does not have to be human-like.** A system can be far better than people at one narrow task and useless at everything else.
* **"Intelligence" is not all or nothing.** Systems have more or less of each trait.
* **The label is often marketing.** A product called "AI-powered" may be a fixed set of rules.

## Quick check

<details><summary>1. Why is "is a thermostat AI?" hard to answer?</summary>
Because it depends on the definition. A thermostat senses and pursues a goal, so it counts under a broad rational-agent view, but it does not learn, so it fails a stricter definition.
</details>

<details><summary>2. What is the difference between "acting humanly" and "acting rationally"?</summary>
Acting humanly means behaving so that people cannot tell you from a person. Acting rationally means choosing the actions that best serve a goal, whether or not a human would do the same.
</details>

<details><summary>3. What is the "AI effect"?</summary>
The tendency to stop calling a technique AI once it works reliably and becomes ordinary.
</details>

## Key terms

* **Artificial intelligence (AI):** the field, and the systems, aimed at machines that sense, decide and act towards goals.
* **Turing test:** Turing's imitation game, in which a judge tries to tell a machine from a person by conversation alone.
* **Rational agent:** an agent that chooses the action expected to best achieve its goal, given what it knows.
* **AI effect:** the habit of no longer calling a technique AI once it has become routine.

## Related

[[AI, ML, DL and Generative AI]] · [[Rules vs Learning]] · [[Agents and Environments]] · [[PDA Loop]]
