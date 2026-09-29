An agent needs a way to choose between options. A **goal** says what it wants, a **utility** score turns each possible outcome into a number, and a **rational** agent picks the action with the best *expected* outcome, given what it knows.

**You need:** [[Agents and Environments]] and [[PDA Loop]].

## The question it answers

When several actions are possible, how does an agent pick one? A rule of thumb is not enough when the options trade one thing against another, such as speed against cost.

## Intuition: turning wants into numbers

A goal like "get home" is too vague to compare two routes. **Utility** gives the agent a single score for each outcome, so the "best" option is the one with the highest score. Different priorities give different scores, so the same options can produce different choices.

**Rational** does not mean *perfect* or *all-knowing*. It means choosing the action that is expected to do best according to the goal, using the information available at the time. A rational agent can still be unlucky.

## Expected outcomes: weighing the chances

Real choices involve uncertainty. The standard fix is to weigh each possible result by its chance:

```text
expected value = (chance of outcome A × value of A) + (chance of outcome B × value of B) + …
```

## A worked example: three routes

| Route | Usual time | Cost | Chance of a delay | Delay length |
| --- | --- | --- | --- | --- |
| Highway | 25 min | $6 toll | 30% | 20 min |
| Back roads | 35 min | $0 | 5% | 10 min |
| Train | 40 min | $4 | 2% | 15 min |

Expected time is the usual time plus the chance of delay times the delay:

```text
Highway:    25 + 0.30 × 20 = 31 min
Back roads: 35 + 0.05 × 10 = 35.5 min
Train:      40 + 0.02 × 15 = 40.3 min
```

Now the goal decides the choice:

* Care only about **time**: the highway wins (31 min).
* Care only about **cost**: the back roads win ($0).
* Care only about **predictability** (expected delay 6, 0.5 and 0.3 minutes): the train wins.

No route is best in the abstract. The best route depends on what the agent's goal rewards.

## Bench

```bench
id: route-chooser
title: Choosing a route
fallback: Three routes are scored from sliders for how much the agent cares about time, cost and risk. The best route changes as the priorities change.
```

**Try this**

1. Press **In a hurry**, **On a budget** and **Hates surprises**. Which route wins each time?
2. Set time to 5 and cost to 0, and slide risk from 0 up to 10. At what point does the winner change?
3. Find priorities where all three routes score nearly the same. What does that tell you about the choice?

**What you should notice:** the *options* did not change, only the goal. The action is decided jointly by what the agent can do and what it values.

## A warning: goals can be wrong

The agent maximises the goal you gave it, not the one you meant. A feed that maximises *clicks* may promote outrage. A cleaning robot rewarded for "no visible dirt" may hide dirt under the rug. Choosing the goal is as important as building the agent.

## Where it appears in AI

Goals and utility become **loss functions** in [[Machine Learning]] (a number to make small) and **reward functions** in reinforcement learning (a number to make large). Finding the best action is [[Optimization]]. Weighing chances is the subject of [[Probability Fundamentals]].

## Common pitfalls

* **Rational is not perfect.** It means best given the available information, not best in hindsight.
* **A score is only as good as its ingredients.** Bad weights or a badly chosen goal give confident, wrong choices.
* **Averages hide risk.** Two options with the same expected value can feel very different if one has a rare disaster.
* **Different people, different utilities.** There is no neutral score for "best".

## Quick check

<details><summary>1. What is the expected time of a route that usually takes 30 minutes but has a 10% chance of a 20-minute delay?</summary>
30 + 0.10 × 20 = 32 minutes.
</details>

<details><summary>2. Is a rational agent one that never makes mistakes?</summary>
No. It chooses the action with the best expected result given what it knows, which can still turn out badly.
</details>

<details><summary>3. Why is choosing the goal risky?</summary>
The agent optimises exactly what it was told, which may differ from what was intended, for example rewarding clicks instead of quality.
</details>

## Related

[[Agents and Environments]] · [[PDA Loop]] · [[Optimization]] · [[Probability Fundamentals]] · [[Machine Learning]]
