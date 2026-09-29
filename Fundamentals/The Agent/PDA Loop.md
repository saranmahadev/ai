The **Perception → Decision → Action loop** is the heartbeat of every intelligent system. It **perceives** what is happening, **decides** what to do about it, **acts**, and then perceives again, this time seeing the result of its own action.

**You need:** [[Agents and Environments]].

## The question it answers

What does an agent actually *do*, moment to moment? It does not sense once and act once. It runs a loop, and the loop is where intelligent behaviour comes from.

## The three phases

### Perception: "What is happening?"

The agent collects information from its environment and turns it into an understanding of the situation. The senses can be cameras, microphones, sensors, or text and data from files and websites.

**Example:** a self-driving car's camera detects a pedestrian at the kerb.

### Decision: "What should I do?"

The agent analyses the situation and chooses an action. The choice may rest on rules, goals, previous experience, a learned model, or predictions of what might happen next.

**Example:** the car judges that the pedestrian is likely to step into its path, and decides to slow down and stop.

### Action: "Do it"

The agent carries out the decision and changes the world. It might move a robot arm, apply brakes, speak, or show a recommendation.

**Example:** the car applies the brakes.

## Why it is a loop

Acting changes the environment, so the next perception is different. That feedback is what lets an agent correct itself:

```text
   ┌─────────────── Environment ───────────────┐
   ▼                                           │
Perceive ──▶ Decide ──▶ Act ───────────────────┘
```

Robotics has long used the same idea under the name **sense–plan–act**. Compare a system that acts once and never looks again (an *open loop*, like a toaster on a timer) with one that keeps checking (a *closed loop*, like a thermostat). The closed loop copes with surprises, and the open loop does not.

## A worked example: three trips round the loop

A thermostat, target 20 °C:

| Loop | Perceive | Decide | Act |
| --- | --- | --- | --- |
| 1 | 17 °C | too cold: heat | heating on |
| 2 | 19 °C | still cold: keep heating | heating stays on |
| 3 | 20.5 °C | warm enough: stop | heating off |

Each decision depends on the perception that the previous action helped produce. Nothing is decided in advance about *how long* to heat. The loop finds out.

## Bench

```bench
id: pda-grid-loop
title: The perceive – decide – act loop
fallback: A small grid world with an agent, a wall and a goal. Each press of Step runs one phase (perceive, decide or act). Sliders add sensor noise and turn the agent's memory on or off.
```

**Try this**

1. Press **Step** repeatedly with no noise. Name what the agent does in each phase.
2. Turn **Remember where it has been** off, then run again. What happens when the agent meets the wall?
3. Turn memory back on and raise the sensor noise to 30–40%. What changes? What does a bump tell you about the perception phase?
4. Use **New run with different noise** a few times. Is every run the same?

**What you should notice:** a bad perception makes a bad decision even when the decision rule is fine, and without memory a simple agent can get stuck repeating one mistake. The loop is only as good as its weakest phase.

## Where it appears in AI

This loop returns in every later planet. A learned model usually lives inside the *decide* phase. Reinforcement learning is about improving the decisions over many trips round the loop. In the [[Agents]] planet, a language model perceives text and tool results, decides what to do next, and acts by calling a tool, and then the loop runs again.

## Common pitfalls

* **It is not one pass.** The value is in repetition and feedback.
* **Perception is not passive.** The agent has to interpret raw signals, and can misread them.
* **Deciding is not acting.** A perfect plan is useless if the actuators fail, and a good actuator is useless with a bad plan.
* **Delay matters.** If the world changes faster than the loop runs, the agent acts on stale information.

## Quick check

<details><summary>1. In the thermostat example, why is the loop needed at all?</summary>
The right amount of heating is not known in advance. Each perception shows the effect of the last action, so the agent can keep adjusting until the goal is met.
</details>

<details><summary>2. A robot perceives a wall that is not there and refuses to move. Which phase failed?</summary>
Perception. The decision rule may be perfectly sensible; it was given wrong input.
</details>

<details><summary>3. What is the difference between an open loop and a closed loop?</summary>
An open loop acts without checking the result, like a timer. A closed loop perceives the result and adjusts, like a thermostat.
</details>

## Related

[[Agents and Environments]] · [[Goals, Utility and Rationality]] · [[Kinds of Environments]] · [[Agents]]
