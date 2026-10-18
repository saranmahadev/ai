Told to "launch the product," an agent that lists tasks in whatever order they occur to it can end up trying to launch before the thing it's launching has been tested — the launch step depends on a step that hasn't run yet. Goal decomposition breaks a goal into subtasks and their dependencies explicitly, so the order the agent actually runs them in respects what each one needs to already be true.

**You need:** [[Anatomy of an Agent Architecture]].

## The question it answers

"How does an agent turn one big goal into an ordered sequence of smaller steps it can actually execute?" Goal decomposition identifies a goal's subtasks and the dependencies between them — which subtasks need which others to have finished first — then orders the subtasks so that every dependency is satisfied before the subtask that needs it runs. A **flat** ordering, one that lists subtasks without working out their dependencies, can easily put a subtask before something it secretly depends on.

## Intuition

Told to "throw a dinner party," listing tasks in the order they come to mind — clean the house, buy ingredients, cook the meal, invite guests — puts cooking before buying ingredients and invites after the cooking's already supposed to start. Working out what depends on what first (buy ingredients → cook → invite guests with a time that's actually realistic) gives an order that could actually be followed.

## Definition and notation

```text
subtask graph:  task → [its prerequisite tasks]
dependency violation:  a task appears in the order before one of its own prerequisites has completed
decomposed order = a topological order of the subtask graph (zero violations, by construction)
```

## A worked example

A "launch the product" goal with five subtasks and real dependencies between them, ordered two ways:

```text
dependencies:
  write spec            → (none)
  build backend         → needs: write spec
  build frontend        → needs: write spec
  integration test      → needs: build backend, build frontend
  launch                → needs: integration test

flat order (as first mentioned): launch, write spec, integration test, build backend, build frontend
  → 3 dependency violations

decomposed order (topological):  write spec, build backend, build frontend, integration test, launch
  → 0 dependency violations
```

The flat order isn't a careless mistake — it's what naturally happens when subtasks are listed without first asking what each one needs. Working out the dependency graph and sorting by it is what guarantees zero violations, not luck.

## Bench

```bench
id: goal-decomposition-order
title: Decomposed order, or a flat guess
fallback: Compare a flat task order against one derived from the actual dependencies between subtasks.
```

**Try this**

1. Look at the flat order and find each place a task is marked as needing something that hasn't happened yet.
2. Switch to the decomposed order and confirm every task's prerequisites are already checked off.
3. Imagine adding a sixth subtask that only "launch" depends on — where would decomposition place it?

**What you should notice:** the violations in the flat order aren't about which task is more "important" — they're purely about whether a task's prerequisites happened before it, which is exactly what a dependency graph makes explicit and a flat list doesn't.

## Where it appears in AI

* **[[Orchestrator-Workers]]'s decomposition step is this same mechanism**, applied specifically to splitting a task into pieces that can be assigned to parallel workers — the dependency-tracking half of this topic is what decides whether those pieces can safely run in parallel at all.
* **[[Plan-and-Execute Agents]] uses decomposition's output as its plan**: once subtasks are ordered, a plan-and-execute agent executes them one at a time.
* **A subtask graph with no valid topological order (a cycle) means the goal as stated is unsatisfiable** — two subtasks that each depend on the other can never both run first.

## Common pitfalls

* **Listing subtasks in the order they're mentioned rather than the order their dependencies require.** The worked example shows this isn't a minor risk — three of five tasks violate a real dependency when ordered this way.
* **Assuming decomposition alone guarantees correctness.** Decomposition only guarantees the *order* respects dependencies; it doesn't guarantee the subtasks list itself is complete, or that each subtask is actually achievable.
* **Treating every subtask as independent by default.** The actual dependency structure needs to be worked out, not assumed away — assuming independence is exactly what the flat order implicitly does.

## Quick check

<details><summary>1. Why does the flat order in the worked example have exactly 3 violations?</summary>
"Launch" is listed first but needs integration test to finish before it; "integration test" is listed before both "build backend" and "build frontend" have finished — each of those three mismatches between a task's position and its prerequisites' position counts as one violation.
</details>

<details><summary>2. What guarantees the decomposed order has zero violations?</summary>
It's constructed as a topological order of the dependency graph — by definition, a topological order places every task after all of its prerequisites, so no violation can occur.
</details>

<details><summary>3. What does it mean if a goal's subtask graph has no valid topological order?</summary>
There's a cycle of dependencies (some subtask directly or indirectly depends on itself through others), which makes the goal as decomposed unsatisfiable — the subtasks or their stated dependencies need to be reconsidered.
</details>

## Key terms

* **Goal decomposition:** breaking a goal into subtasks and the dependencies between them.
* **Dependency violation:** a subtask appearing in an order before one of its own prerequisites has completed.
* **Topological order:** an ordering of a dependency graph's tasks that places every task after all of its prerequisites.

## Related

[[Anatomy of an Agent Architecture]] · [[Orchestrator-Workers]] · [[Plan-and-Execute Agents]]
