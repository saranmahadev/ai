"Organize a conference" eventually breaks down into 36 individual primitive actions — booking a specific venue, sending a specific email, printing a specific badge. A flat planner has to consider all 36 at once. A hierarchical planner never considers more than a handful at a time: pick the top-level tasks, then for each one pick its sub-tasks, then for each of those pick its primitive actions — the same 36 actions, reached through a sequence of small decisions instead of one enormous one.

**You need:** [[Goal Decomposition into Subtasks]].

## The question it answers

"How does decomposition stay manageable when a goal has dozens or hundreds of eventual primitive actions?" Hierarchical task planning (the classic **HTN**, hierarchical task network, idea) decomposes a goal into a small number of high-level tasks, then decomposes each of those into its own sub-tasks, continuing down levels until the remaining pieces are primitive actions that can just be executed. At no single level does the planner ever have to reason about more than that level's own handful of choices.

## Intuition

Planning a wedding by listing all several hundred individual tasks at once — order flowers, book the venue, print invitations, choose a song, confirm the caterer's menu — in one giant undifferentiated list is overwhelming. Planning it by first deciding the handful of major areas (venue, catering, guests, ceremony), then working out each area's own handful of tasks, keeps every single decision small, even though the same several hundred tasks eventually get covered.

## Definition and notation

```text
flat planner's branching factor       = total number of primitive actions, all reasoned about at once
hierarchical planner's branching factor = the largest number of choices faced at any single level
```

## A worked example

"Organize a conference," with 3 top-level tasks, each split into 4 sub-tasks, each split into 3 primitive actions:

```text
total primitive actions = 3 × 4 × 3 = 36

flat planner:          reasons about all 36 primitive actions at once → branching factor 36
hierarchical planner:  top level picks among 3, then among 4, then among 3
                        → widest single decision is max(3, 4, 3) = 4
```

The hierarchical planner still has to decide, eventually, over all 36 primitive actions — nothing about the task got smaller. What changed is that no single decision point ever has to weigh more than 4 options at once, instead of one decision point weighing all 36.

## Bench

```bench
id: hierarchical-task-planning
title: One huge choice, or several small ones
fallback: Compare a flat planner's branching factor against a hierarchical planner's widest single choice.
```

**Try this**

1. Note the total primitive actions and the flat planner's branching factor — they're always equal.
2. Slide each of the three levels up and watch the hierarchical planner's branching factor track only the largest single level, not the total.
3. Push all three levels up to their maximum and compare how far apart the two bars get.

**What you should notice:** the hierarchical planner's branching factor is bounded by the *widest single level*, not by the total number of primitive actions — adding more top-level tasks or more primitive actions per sub-task barely moves it, as long as no individual level itself gets wide.

## Where it appears in AI

* **This is the same branching-factor idea behind [[Tree-of-Thought and Search-Based Reasoning|tree-of-thought search]] on the LLMs planet**, applied to planning actions in the world instead of searching over reasoning paths — keeping each level's choice set small is what makes either kind of search tractable at all.
* **[[Goal Decomposition into Subtasks]] is the single-level version of this same mechanism**; hierarchical planning is what happens when decomposition is applied recursively, level after level, rather than just once.
* **A deep hierarchy trades a smaller branching factor at each level for more total levels to plan through** — there's a real cost on the other side of this benefit.

## Common pitfalls

* **Assuming a hierarchical planner "does less work" than a flat one.** The worked example's total of 36 primitive actions doesn't shrink — hierarchical planning only changes how that total is reached, spreading it across several small decisions instead of one big one.
* **Making the hierarchy too deep for the goal's actual complexity.** A hierarchy with many levels for a goal that only has a handful of primitive actions adds planning overhead without reducing any single level's branching factor meaningfully.
* **Choosing level boundaries that don't correspond to anything meaningful.** A hierarchy's levels are useful insofar as they reflect genuine sub-goals (venue, catering, guests) — an arbitrary split that doesn't track real structure just adds bookkeeping without the benefit.

## Quick check

<details><summary>1. Why is the flat planner's branching factor always equal to the total number of primitive actions?</summary>
A flat planner reasons about every primitive action in one undifferentiated decision, so its branching factor is exactly the count of all of them — there's no smaller decision to make instead.
</details>

<details><summary>2. In the worked example, why is the hierarchical planner's branching factor 4 rather than something related to 36?</summary>
The hierarchical planner never reasons about more than one level's own choices at a time, and the widest single level here has 4 options (4 sub-tasks per top-level task) — the total of 36 is reached across several separate small decisions, not one combined one.
</details>

<details><summary>3. What's the actual trade-off of going hierarchical rather than flat?</summary>
A smaller branching factor at any single decision point, in exchange for having to plan through more levels overall — the total amount of eventual decision-making doesn't shrink, only how concentrated it is.
</details>

## Key terms

* **Hierarchical task network (HTN):** a planning approach that decomposes a goal into tasks, then those tasks into sub-tasks, continuing down to primitive actions.
* **Branching factor:** the number of choices a planner has to weigh at a single decision point.
* **Primitive action:** a task simple enough to just be executed, with no further decomposition.

## Related

[[Goal Decomposition into Subtasks]] · [[Tree-of-Thought and Search-Based Reasoning]] · [[Plan-and-Execute Agents]]
