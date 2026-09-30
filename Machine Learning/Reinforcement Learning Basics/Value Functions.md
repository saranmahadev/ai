A **value function** answers "how good is it to be here?": the expected return an agent will collect from a state onward if it behaves well. Values obey a simple recursion, **the Bellman equation**: the value of a state is the best available reward now plus the discounted value of where you land. Solving it sweep by sweep is **value iteration**.

**You need:** [[Rewards, States and Policies]] and [[Expectation]].

## The question it answers

"Which states are worth heading for?" A good policy follows the values uphill. Knowing every state's value turns a long-range planning problem into a local one: at each step, pick the action that leads to the best-valued neighbour.

## Intuition: value flows backwards from the reward

The goal is worth +1. A cell one step away is worth almost as much, minus the step cost and a discount. A cell two steps away is worth a little less again. Value therefore *spreads outward from the reward*, one step per sweep, until every cell knows how far it is from success, and the best route is simply "go towards higher numbers".

## Definitions

```text
V*(s)   = max over actions a of  Σ P(s′ | s, a) · [ r + γ · V*(s′) ]        Bellman optimality
sweep   update every state's value using the neighbours' current values
value iteration: repeat sweeps from V = 0 until the values stop changing
greedy policy:   in each state, choose the action with the highest one-step lookahead value
```

If the world is deterministic, values are exact after as many sweeps as the longest shortest-path. With random transitions they converge gradually. Value iteration needs a model of the world (the transitions); learning without one is the topic of [[Q-Learning]].

## A worked example

The 4×4 grid from the previous topic (goal +1 top-right, pit below it, wall, step cost −0.04, γ = 0.9). Converged optimal values along the winning route, from the goal backwards:

```text
cell next to the goal:              1 (the reward itself)             = 1.00
one further:  −0.04 + 0.9 × 1.00                                      = 0.86
next:         −0.04 + 0.9 × 0.86                                      = 0.73
next:         −0.04 + 0.9 × 0.73 = 0.62;   then 0.52;   the start cell = 0.43
```

Value iteration finds these by sweeping. The start cell's value after each sweep:

```text
sweep     1       2       3       4       5       6       7
start   −0.040  −0.076  −0.108  −0.138  −0.164   0.427   0.427     (no further change: converged)
```

For five sweeps the start cell only "knows" the step costs. On the sixth sweep the goal's value has travelled the six steps back to the start and the value jumps to its final 0.427. With a 20% chance of slipping, the optimal start value falls to 0.317, and the best route may change to one that keeps further from the pit.

## Bench

```bench
id: value-iteration
title: Values spread backwards
fallback: A grid world starts with all values at zero; step or play value iteration one sweep at a time and watch the goal's value spread backwards, with the best action shown as an arrow in each cell, and sliders for the discount and the slip probability.
```

**Try this**

1. Press **One sweep** repeatedly and watch which cells change.
2. Note the sweep on which the start cell's value jumps.
3. Lower γ to 0.6 and repeat.
4. Add slip and compare the values near the pit.

**What you should notice:** information travels one cell per sweep from the goal, the arrows settle once values have reached them, and slipping lowers values, most of all near danger.

## Where it appears in AI

* **Planning and control** when a model of the world is known.
* **Deep RL:** value networks estimate V or Q with a neural network.
* **Search algorithms** (A* and its relatives) use the same idea of estimated distance-to-goal.

## Common pitfalls

* **Needing a model:** value iteration requires the transition probabilities.
* **Tables that explode:** the number of states can be astronomically large.
* **Stopping too early,** before values reach distant states.
* **Mistaking a value for a reward:** a value is a prediction of future reward.

## Quick check

<details><summary>1. State next to the goal with reward +1, γ = 0.9, step cost 0: what is the value of a state one step further away?</summary>
0.9 × 1 = 0.9.
</details>

<details><summary>2. Why does value iteration start at zero yet find the right values?</summary>
Each sweep pushes information one step further from the rewards, and the values converge to the fixed point of the Bellman equation.
</details>

<details><summary>3. How is a policy obtained from values?</summary>
Choose, in each state, the action with the highest expected reward plus discounted next-state value.
</details>

## Key terms

* **Value function:** the expected return from a state.
* **Bellman equation:** value = best (reward + discounted next value).
* **Value iteration:** repeatedly applying the Bellman update to all states.
* **Greedy policy:** always taking the action with the best one-step lookahead.

## Related

[[Rewards, States and Policies]] · [[Expectation]] · [[Q-Learning]] · [[Heuristics and A-star Search]] · [[Markov Chains]]
