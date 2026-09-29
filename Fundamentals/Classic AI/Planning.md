**Planning** is finding a sequence of actions that turns the current situation into a goal. Each action has **preconditions** (what must be true first) and **effects** (what changes), and a planner searches through the possible sequences to find one that works.

**You need:** [[Search]] and [[Logic and Knowledge Representation]].

## The question it answers

Search finds a path when moves are obvious steps on a map. What if the "moves" are things like *pick up the block*, *put it on the table* or *load the truck*, and each one is only allowed in certain situations?

## Intuition: getting dressed

You cannot put shoes on before socks, and you cannot put a jacket on if your hands are full. Every action has conditions that must hold before you may do it, and it changes the world afterwards. Planning is figuring out the order.

An action is described by:

* **Preconditions:** what must already be true (the block is clear, the hand is empty).
* **Effects:** what becomes true and false afterwards (the block is now on the table).

Early planning languages such as STRIPS, from the early 1970s, wrote actions exactly this way, and modern planners still build on the idea.

## The blocks world

A classic teaching problem has a few blocks on a table. One move takes a block that has nothing on top of it and places it on the table or onto another clear block. The goal is a target arrangement.

In the bench, the start has **B on A** and **D on C**. The goal is a single tower: **A on B, B on C, C on D**.

## A worked example: the shortest plan

The planner searches the space of arrangements, applying legal moves until it reaches the goal. The shortest plan has four moves:

1. Move D to the table (this clears C).
2. Move C onto D.
3. Move B onto C (B was sitting on A).
4. Move A onto B.

Notice the order matters: A can only move once B has left it, and B can only move onto C after C has been cleared. Planners find these dependencies by search, not by being told.

## Bench

```bench
id: blocks-world
title: Planning: a sequence of moves to a goal
fallback: Four blocks on a table. You can make legal moves yourself, or press Plan from here to search for the shortest sequence to the goal tower and step through it. Counters show moves made and the number of states the planner examined.
```

**Try this**

1. Try to solve it yourself. Notice which moves the buttons offer, and which are missing (why?).
2. Press **Plan from here**. How many moves is the shortest plan, and how many states did the planner examine?
3. Make a poor move, such as putting D back on A, and plan again. How does the shortest plan change?
4. Compare your solution's length with the planner's.

**What you should notice:** a state's legal moves depend on preconditions, and the planner finds the shortest plan by exploring arrangements, exactly like the maze searches but with arrangements as states.

## The catch: arrangements multiply

With four blocks there are only 73 possible arrangements, and the planner examined 63 of them to find its four-move plan. But the number grows quickly: ten blocks can be arranged in nearly 59 million ways. Real planning problems, such as scheduling a factory or routing a fleet, are far larger, so practical planners rely on **heuristics** (see [[Heuristics and A-star Search]]) and clever ways of ignoring irrelevant detail.

## Planning in a changing world

A plan assumes the world will behave as expected. In a real, [[Kinds of Environments]] that is dynamic or partly hidden, things go wrong: a block slips, a road closes. The usual fix is to **replan**: run the perceive–decide–act loop again from the new situation. See [[PDA Loop]].

## Where it appears in AI

Planning drives logistics, robotics, game AI and scheduling. Modern [[Agents]] built on language models also plan, by breaking a goal into steps and choosing tools, but they do it by generating text, not by the exhaustive search shown here.

## Common pitfalls

* **Assuming a plan stays valid.** Any surprise can break it.
* **Ignoring preconditions.** A sequence that skips one is not a plan.
* **Underestimating the size of the space.** Small examples hide how fast options multiply.
* **Optimal versus good enough.** Finding the shortest plan is often too costly, so practical systems settle for a good one.

## Quick check

<details><summary>1. What are preconditions and effects?</summary>
Preconditions are what must be true before an action is allowed. Effects are what changes after it happens.
</details>

<details><summary>2. Why can block A not move at the start of the bench problem?</summary>
Block B sits on top of it, so A is not clear.
</details>

<details><summary>3. What should an agent do when its plan stops working?</summary>
Replan from the new situation, by running the perceive–decide–act loop again.
</details>

## Key terms

* **Plan:** a sequence of actions that reaches a goal.
* **Precondition:** what must be true before an action is allowed.
* **Effect:** what changes after an action.
* **Replanning:** making a new plan when the world does not go as expected.
* **STRIPS:** an early planning language that described actions by their preconditions and effects.

## Related

[[Search]] · [[Heuristics and A-star Search]] · [[Logic and Knowledge Representation]] · [[PDA Loop]] · [[Agents]]
