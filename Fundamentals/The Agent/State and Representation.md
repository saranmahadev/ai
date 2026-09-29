The **state** is the agent's summary of the situation: everything it needs to know to choose a good action, and nothing more. How you **represent** that state, as numbers, a table, a graph or something else, decides what the agent can notice and how hard its problem becomes.

**You need:** [[Agents and Environments]] and [[PDA Loop]].

## The question it answers

An agent cannot use the whole world. So what does it keep track of? Too little and it makes silly mistakes. Too much and the problem becomes enormous.

## Intuition: the notes you would jot down

Imagine handing your job to a colleague halfway through a task. You would write a short note: where things stand, what matters, what is next. That note is the state. If you forget something important ("the battery is nearly flat"), your colleague will make a bad call. If you write down every detail of the day, the note is too long to be useful.

A good state includes **every fact that changes the right decision** and leaves out the rest.

## State in two familiar systems

| System | What the state holds |
| --- | --- |
| Chess program | the position of every piece, whose turn it is, castling rights and whether a capture by en passant is possible |
| Delivery robot | its position, its destination, its battery level, whether something blocks the way, whether it is carrying the package |

Notice what is missing from the chess state: how the game *got* here. The decision depends on the position, not the history (with a few exceptions, such as rules about repeated positions).

## Representation: the same state, written differently

The same situation can be written in different forms, and each makes different things easy:

* **A list of numbers**, such as `[x, y, battery, blocked]`: compact, and ideal for learning from data.
* **A table**, such as a chessboard grid: easy to inspect and update.
* **A graph** of places and connections: ideal for routes and knowledge (see [[Logic and Knowledge Representation]]).
* **A learned vector** (an embedding): a list of numbers that a model discovered, often capturing meaning. Modern AI leans heavily on these.

## Bigger state, bigger problem

Each extra fact multiplies the number of distinct situations the agent might face. For the delivery robot, suppose it can be in 100 places, head for 100 destinations, have 4 battery levels, see an obstacle or not, and carry the package or not:

```text
position only:                     100
+ destination:                     100 × 100          =     10,000
+ battery level (4):               10,000 × 4         =     40,000
+ obstacle ahead (2):              40,000 × 2         =     80,000
+ carrying the package (2):        80,000 × 2         =    160,000
```

Five simple facts already give 160,000 configurations. This growth, called **state explosion**, is why choosing what to leave out matters as much as choosing what to keep.

## Bench

```bench
id: state-builder
title: What goes into the state?
fallback: A delivery robot must handle six situations. Ticking which facts it tracks shows which situations it can handle and how many distinct states it must distinguish.
```

**Try this**

1. Track only position and destination. Which situations can the robot handle? Which fail, and why?
2. Add facts one at a time until every situation is covered. What is the smallest state that handles all six?
3. Tick everything. What happened to the number of configurations, and was every fact needed?

**What you should notice:** each situation needs particular facts, and none of them is optional. But every fact you add makes the world the agent must reason about much bigger.

## Where it appears in AI

State reappears everywhere. In [[Kinds of Environments]], whether an agent can see the whole state is a key property. In [[Search]], each node is a state. In reinforcement learning, the agent learns which actions are best in each state. In [[LLMs]] and [[Agents]], the "state" is the text and tool results held in the model's context.

## Common pitfalls

* **Leaving out something the decision depends on.** The agent will look irrational when it is only uninformed.
* **Including everything.** Extra detail adds cost and can drown the useful signal.
* **Confusing the state with the world.** The state is the agent's *description* of the world, which may be incomplete or wrong.
* **Assuming one representation fits all.** The form you choose makes some questions easy and others hard.

## Quick check

<details><summary>1. What should a good state include?</summary>
Every fact that affects the right decision, and little else.
</details>

<details><summary>2. A robot has 50 positions and 3 battery levels. How many states is that?</summary>
50 × 3 = 150 distinct states.
</details>

<details><summary>3. Why does adding more facts make a problem harder?</summary>
The number of possible situations multiplies with each new fact, so there is much more for the agent to distinguish and learn about.
</details>

## Related

[[Agents and Environments]] · [[PDA Loop]] · [[Kinds of Environments]] · [[Search]] · [[Logic and Knowledge Representation]]
