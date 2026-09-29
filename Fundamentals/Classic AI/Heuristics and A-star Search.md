A **heuristic** is an informed guess about how far you still are from the goal. **A\* search** combines the distance already travelled with that guess to choose which state to explore next, and it finds the shortest path while exploring far fewer states than blind search, as long as the guess never overestimates.

**You need:** [[Search]].

## The question it answers

Breadth-first search finds the shortest path but explores everywhere. Can a machine use what it knows about the goal to search smarter?

## Intuition: a compass that is never too optimistic

Walking through a city to a landmark, you glance at it and prefer streets that lead in its direction. That glance is a heuristic. On a grid, a good one is the **Manhattan distance**: the number of steps you would need if there were no walls at all, `|Δrow| + |Δcolumn|`.

Three searches use the guess differently, and each one scores a state by a value it tries to keep small:

| Algorithm | Score of a state | Behaviour |
| --- | --- | --- |
| **BFS** | steps taken so far (`g`) | ignores the goal, explores in rings |
| **Greedy best-first** | the guess only (`h`) | rushes towards the goal, but can be fooled |
| **A\*** | steps so far plus the guess (`g + h`) | leans towards the goal while staying honest about cost |

A* is **optimal** when the heuristic is **admissible**, meaning it never claims the goal is farther than it really is. The Manhattan distance on a grid with unit steps qualifies, because walls can only make the trip longer.

## A worked example: three searches on scattered rocks

On the bench's "Scattered rocks" grid, the start and goal are 11 steps apart in a straight line but rocks force detours:

| Algorithm | Cells explored | Path length |
| --- | --- | --- |
| BFS | 109 | 15 (shortest) |
| A\* | 31 | 15 (shortest) |
| Greedy | 30 | 19 (**not** the shortest) |

A* found the same shortest path as BFS after exploring under a third as many cells. Greedy explored a little less again but took a 19-step route: fast and sloppy. The guess saves work, and *how* you use it decides whether the answer is still the best one.

## Bench

```bench
id: astar-vs-bfs
title: A guess that saves work: BFS, A* and greedy
fallback: A grid with rocks. A table compares breadth-first search, A* and greedy search on the same grid (cells explored and path length), and you can animate any one of them and draw walls.
```

**Try this**

1. With **Scattered rocks**, read the table. Which algorithm explores the fewest cells? Which gives the shortest path?
2. Animate greedy and watch where it rushes. Then animate A* on the same grid.
3. Switch to **Open field**. How big is the gap between BFS and A* when nothing is in the way?
4. Draw a wall right across the middle with one far-away gap. What does the guess do to help, or to mislead, greedy?

**What you should notice:** A* explores a narrow beam towards the goal. Greedy explores even less but can lose the shortest path. BFS explores everything nearby.

## Where it appears in AI

A* powers route finding in maps and games. The idea of scoring options with a cheap estimate reappears in modern systems: game programs use a learned model to score positions, and many machine-learning methods rely on cheap approximations to avoid exhaustive search. [[Optimization]] is closely related: finding the best option among many.

## Common pitfalls

* **A bad heuristic breaks the guarantee.** If the guess overestimates, A* may return a path that is not the shortest.
* **A heuristic must be cheap.** If computing it takes longer than the search it saves, it is no help.
* **Greedy is tempting and risky.** It is fast and sometimes wrong.
* **Guesses are problem-specific.** Manhattan distance suits grids and not much else.

## Quick check

<details><summary>1. What is the Manhattan distance between (2, 3) and (6, 1)?</summary>
|6 − 2| + |1 − 3| = 4 + 2 = 6.
</details>

<details><summary>2. What does it mean for a heuristic to be admissible?</summary>
It never overestimates the true remaining cost, so A* is guaranteed to find the shortest path.
</details>

<details><summary>3. Why can greedy search return a longer path than A*?</summary>
It looks only at the guessed distance to the goal and ignores the cost already paid, so it can commit to a poor route.
</details>

## Key terms

* **Heuristic:** a cheap, informed estimate of how far a state is from the goal.
* **Admissible heuristic:** one that never overestimates the true remaining cost.
* **Manhattan distance:** the steps needed on a grid if nothing blocked the way: |Δrow| + |Δcolumn|.
* **A*:** a search that picks states by steps so far plus the heuristic estimate.
* **Greedy best-first search:** a search that follows the heuristic alone.

## Related

[[Search]] · [[Planning]] · [[Optimization]] · [[State and Representation]]
