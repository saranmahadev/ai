An **agent** is anything that **perceives** its surroundings through sensors and **acts** on them through actuators to pursue a goal. The surroundings it lives in are its **environment**. Almost every AI system, from a thermostat to a chatbot, can be described this way.

**You need:** [[What Counts as AI]].

## The question it answers

What is the most basic building block of an AI system? Before models, data or training, there is a simple picture: something that senses, something that acts, and a world in between.

## Intuition: a creature and its world

Think of a small animal. Its eyes and ears are **sensors**. Its legs and jaws are **actuators**. Whatever it sees at a given moment is a **percept**. The forest, the weather and the other animals are the **environment**. The animal keeps looking, choosing and moving to get what it needs.

An AI agent is the same idea with different parts:

```text
        percepts
Environment ─────────▶ Agent (decides)
     ▲                      │
     └────────── actions ───┘
```

The agent does not have to be physical. A software agent's sensors are data (files, messages, clicks) and its actuators are outputs (a reply, a database change, a purchase).

## The parts, with examples

| Agent | Sensors (percepts) | Actuators (actions) | Goal |
| --- | --- | --- | --- |
| Robot vacuum | bump and cliff sensors, camera | wheels, brushes | clean the floor |
| Thermostat | temperature sensor | switch on the heating or cooling | hold a target temperature |
| Spam filter | incoming email text | move a message to the spam folder | keep junk out of the inbox |
| Chess program | the board position | a chosen move | win the game |
| Chatbot | your message | the reply it writes | give a helpful answer |

## A worked example: the two-square vacuum world

A classic textbook toy is a vacuum agent in a world of just two squares, left and right, each of which may be dirty. The agent can see only whether *its own square* is dirty, and it can suck, move left or move right.

* **Percept:** "I am on the left square, and it is dirty."
* **Action:** suck.
* **Next percept:** "I am on the left square, and it is clean." **Action:** move right.

The whole behaviour is a mapping from what the agent perceives to what it does. Even this tiny world raises real questions: what if the sensor sometimes lies? What if squares get dirty again? Later topics tackle these.

## Bench

```bench
id: agent-or-not
title: What makes something an agent?
fallback: A diagram of environment, sensors, decision maker, actuators and goal for four example systems. Switching a part off shows what stops working.
```

**Try this**

1. Pick **Robot vacuum** and switch off the sensors. What goes wrong?
2. Switch the sensors back on and turn off the **Goal**. Can it still act? Can it act *well*?
3. Try the **Chatbot**. Which part would you say is hardest to identify?
4. Switch off two parts at once. How does the description of what fails change?

**What you should notice:** each part is necessary. Without sensors the agent acts blindly, without a decision maker it cannot use what it senses, without actuators it cannot affect anything, and without a goal it cannot tell good actions from bad.

## Where it appears in AI

Every planet builds on this picture. In [[Machine Learning]] the decision maker is a model learned from data. In [[Agents]] the decision maker is often a language model choosing which tool to call. The next topic, [[PDA Loop]], adds the missing ingredient: the agent does all this *repeatedly*.

## Common pitfalls

* **An agent is not necessarily a robot.** Software agents sense data and act by producing outputs.
* **"Agent" has two meanings.** Here it is the broad idea. In modern AI products it often means an LLM that uses tools. That is one kind of agent, not the definition.
* **The environment includes other agents.** Other players, users and competing systems are part of it.
* **Percepts are not the whole truth.** The agent sees only what its sensors report.

## Quick check

<details><summary>1. What are the sensors and actuators of a spam filter?</summary>
Its sensors are the incoming email data. Its actuators are the actions it can take, such as moving a message to the spam folder.
</details>

<details><summary>2. What is a percept?</summary>
What the agent's sensors report at a given moment, for example "my square is dirty".
</details>

<details><summary>3. Why does an agent need a goal?</summary>
Without one it cannot tell a good action from a bad one, so any action is as good as another.
</details>

## Key terms

* **Agent:** anything that perceives its environment through sensors and acts on it through actuators to pursue a goal.
* **Environment:** everything outside the agent that it senses and affects.
* **Sensor:** a channel through which the agent receives information: a camera, a microphone, a data feed.
* **Actuator:** a channel through which the agent acts: a motor, a screen, an outgoing message.
* **Percept:** what the sensors report at one moment.

## Related

[[What Counts as AI]] · [[PDA Loop]] · [[Goals, Utility and Rationality]] · [[Agents]]
