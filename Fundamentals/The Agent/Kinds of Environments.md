Some AI problems are easy and others are brutal, and much of the difference lies in the **environment**. Five yes-or-no questions about an environment, such as whether the agent can see everything and whether other agents act in it, predict how hard the problem is and which techniques it needs.

**You need:** [[Agents and Environments]], [[PDA Loop]] and [[State and Representation]].

## The question it answers

Why can a program beat every human at chess yet struggle to drive down a street? The rules of the task are not the whole story. The *kind of world* the agent lives in changes everything.

## The five questions

The following properties come from Russell and Norvig's textbook *Artificial Intelligence: A Modern Approach*, which lists more; these five are enough to see the pattern.

| Question | Easier | Harder |
| --- | --- | --- |
| Can the agent see everything relevant? | **Fully observable**: the state is visible | **Partly observable**: parts are hidden or sensors are noisy |
| Is the next state fully determined by the current state and the action? | **Deterministic** | **Stochastic**: chance is involved |
| Do decisions affect later ones? | **Episodic**: each decision stands alone | **Sequential**: today's choice shapes tomorrow's options |
| Does the world change while the agent thinks? | **Static** | **Dynamic** |
| How many agents act in it? | **Single agent** | **Multi-agent**: others cooperate or compete |

A rough rule: each "harder" answer adds a demand on the agent. Partly observable means it needs **memory and guesswork**. Stochastic means it needs **probabilities**. Sequential means it must **plan ahead**. Dynamic means it must be **fast**. Multi-agent means it must **anticipate others**.

## A worked example: chess versus taxi driving

| Property | Chess (untimed) | Taxi driving |
| --- | --- | --- |
| Observable? | fully | partly (you cannot see round the corner) |
| Deterministic? | yes | no (other drivers, weather, pedestrians) |
| Episodic or sequential? | sequential | sequential |
| Static or dynamic? | static | dynamic |
| Agents | multi (an opponent) | multi (all other road users) |

Chess has two "hard" properties (it is sequential and has an opponent), while driving has all five. The taxi problem is harder because *the world is harder*, even though a chess program is deeply impressive.

## Bench

```bench
id: environment-classifier
title: How hard is this environment?
fallback: Eight environments, from crosswords to taxi driving. For each you answer five questions about it, then check against the textbook classification and see how many of the five hard properties it has.
```

**Try this**

1. Classify the **Crossword puzzle** and **Poker**, then check. What do the extra hard properties in poker force a player to do?
2. Do **Backgammon** next. Which single property separates it from chess?
3. Find the environment with all five hard properties. What kind of agent would it need?
4. The **Classifying a single photo** environment is the easiest here. Is that why image recognition is easier to solve than driving?

**What you should notice:** difficulty is not one number. Different properties call for different tools, which is why so many AI methods exist.

## Where it appears in AI

These properties explain why some planets exist. Hidden state and chance lead to [[Probability]]. Sequential decisions with feedback lead to planning and reinforcement learning. Multi-agent settings lead to game-playing methods. The [[Agents]] planet returns to dynamic, partly observable, multi-agent worlds.

## Common pitfalls

* **Labels can depend on how you frame it.** Chess with a clock is more dynamic than untimed chess. State your assumptions.
* **Stochastic is not the same as unpredictable to you.** It means the outcome involves chance, even if the odds are known.
* **Hard for humans is not hard for machines.** Chess is hard for people and easy on these five measures. Walking is easy for people and hard for robots.
* **Real environments rarely tick every "easy" box.** Most interesting ones are partly observable, stochastic, sequential and dynamic.

## Quick check

<details><summary>1. Why is poker partly observable?</summary>
The other players' cards are hidden, so the agent cannot see the whole state.
</details>

<details><summary>2. Which property means today's choice affects tomorrow's options?</summary>
Sequential (as opposed to episodic).
</details>

<details><summary>3. Why is taxi driving harder than chess on these measures?</summary>
It has all five hard properties: it is partly observable, stochastic, sequential, dynamic and multi-agent, while chess is fully observable, deterministic and static.
</details>

## Key terms

* **Fully or partly observable:** whether the agent can see everything relevant.
* **Deterministic or stochastic:** whether outcomes are fixed by the state and action, or involve chance.
* **Episodic or sequential:** whether decisions stand alone or shape later options.
* **Static or dynamic:** whether the world waits for the agent or keeps changing.
* **Multi-agent:** an environment in which other agents also act, cooperating or competing.

## Related

[[Agents and Environments]] · [[State and Representation]] · [[PDA Loop]] · [[Probability]] · [[Agents]]
