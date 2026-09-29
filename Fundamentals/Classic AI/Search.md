**Search** is how a machine finds a path or a plan by exploring possibilities systematically. It describes the problem as **states** joined by **actions**, and then hunts through them for one that reaches the goal. Two basic strategies, breadth-first and depth-first, explore in very different ways.

**You need:** [[State and Representation]] and [[Kinds of Environments]].

## The question it answers

How does a machine find a route through a maze, a solution to a puzzle, or a move in a game, when nobody has told it the answer?

## Intuition: a maze and a ball of string

Imagine standing at a maze entrance. You can try every option methodically and keep track of where you have been. That is search. To describe a search problem you need four things:

* a **starting state** (where you are),
* the **actions** available from each state (which ways you can step),
* a **goal test** (are we there yet?), and
* a **cost** for each step (here, every step costs 1).

A solution is a sequence of actions from the start to a goal state. Because every state links to others, the possibilities form a tree or a web, and search is a way of walking it.

## Two ways to explore

Both strategies keep a list of states waiting to be explored, called the **frontier**. They differ in which one they take next.

| | Breadth-first search (BFS) | Depth-first search (DFS) |
| --- | --- | --- |
| Takes next | the **oldest** state on the frontier (a queue) | the **newest** state (a stack) |
| Explores | in rings: everything one step away, then two, then three | one route as deep as it goes, then backs up |
| Shortest path? | **Yes**, when every step costs the same | **No**, it takes the first path it stumbles on |
| Memory | large: the frontier can be wide | small: only the current route is kept |

## A worked example: a wall with a gap

The bench grid is 16 cells wide and 10 tall. Start is on the left, the goal is on the right, and a wall between them has one gap near the bottom.

| Algorithm | Cells explored | Path length |
| --- | --- | --- |
| BFS | 135 | **21** steps (the shortest) |
| DFS | 69 | 41 steps (valid but twice as long) |

BFS pays by exploring almost the whole grid, but it guarantees the shortest path. DFS explores less, yet the path it returns wanders.

## Bench

```bench
id: maze-search
title: Searching for a path
fallback: A grid maze with a start and a goal. Breadth-first or depth-first search spreads across it step by step, and you can draw walls to change the problem. Counters show cells explored, frontier size and path length.
```

**Try this**

1. Choose **Wall with a gap** and step through BFS. Describe the shape of the explored region.
2. Switch to DFS on the same maze. How does the region differ, and how long is the path it finds?
3. Draw a wall that completely blocks the goal. What does each algorithm do?
4. Try **Zig-zag walls**. Which algorithm's path length is closest to the shortest?

**What you should notice:** BFS spreads evenly like a ripple. DFS dives. The one that explores less is not the one that finds the best answer.

## The real problem: too many possibilities

Grids are friendly. Real problems explode. If each state has *b* possible actions and the solution is *d* steps away, the number of possibilities grows like *bᵈ*. Chess has around 35 legal moves in a typical position, so looking just 10 moves ahead means about 35¹⁰, which is roughly 2.8 quadrillion positions. Systematic search alone cannot cope, which is why the next topic is about searching more cleverly.

## Where it appears in AI

Search underlies route finding, puzzle solving, game-playing programs and many planning systems. In [[Planning]] each state is an arrangement of the world and each action a legal move. Learned systems often *combine* search with learning, as in game-playing programs that use a trained model to decide which branches deserve attention.

## Common pitfalls

* **Forgetting where you have been.** Without a record of visited states, a search can loop forever.
* **Assuming DFS finds the best path.** It finds *a* path.
* **Assuming BFS is always affordable.** It can run out of memory on large problems.
* **Ignoring step costs.** BFS is shortest only when all steps cost the same.

## Quick check

<details><summary>1. What are the four ingredients of a search problem?</summary>
A starting state, the available actions, a goal test, and a cost for each step.
</details>

<details><summary>2. Which of BFS and DFS is guaranteed to find the fewest steps?</summary>
BFS, when every step costs the same.
</details>

<details><summary>3. If each state has 10 actions, roughly how many sequences of 4 actions are there?</summary>
10⁴ = 10,000.
</details>

## Key terms

* **State space:** all the states a problem can be in, joined by actions.
* **Frontier:** the states discovered but not yet explored.
* **Goal test:** the check that says a state is a solution.
* **Breadth-first search:** exploring the nearest states first, in rings.
* **Depth-first search:** following one route as deep as possible before backing up.
* **Branching factor:** the number of actions available from a typical state.

## Related

[[State and Representation]] · [[Kinds of Environments]] · [[Heuristics and A-star Search]] · [[Planning]] · [[Optimization]]
