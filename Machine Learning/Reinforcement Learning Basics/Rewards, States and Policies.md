In **reinforcement learning** an agent is never told the right action. It acts, the world changes, and a **reward** arrives, often late. The agent's behaviour is a **policy**: a rule from state to action. Its quality is the **return**: the total reward it collects, with later rewards counted a little less.

**You need:** [[Agents and Environments]], [[Markov Chains]] and [[Expectation]].

## The question it answers

"How do you judge behaviour when feedback is only a score?" Not by whether a single action was right, but by the reward the whole sequence earns.

## Intuition: a robot in a maze

A robot starts in a corner of a small grid. One cell holds treasure (+1), another a pit (−1), and every step costs a little energy (−0.04). Nobody tells it "go up". At each cell it picks a direction; what it does at every cell is its policy. A good policy walks the shortest safe route; a poor one wanders or falls in the pit. The **discount** γ (between 0 and 1) says how much a reward one step later is worth today: γ = 0.9 makes a reward next step worth 0.9 of itself now, so shorter routes win.

## Definitions

```text
state s         where the agent is                 action a    what it can do
reward r        a number received after an action  policy π    a rule: state → action (or probabilities)
return G        G = r₁ + γ·r₂ + γ²·r₃ + …          discount γ  0 = only now, close to 1 = long-sighted
MDP             states, actions, transitions P(s′ | s, a), rewards, discount
                the Markov property: the next state depends only on the current state and action
```

The goal is a policy with the highest *expected* return, since transitions may be random ("slip": an action sometimes goes astray).

## A worked example

A 4×4 grid: goal (+1) in the top-right corner, a pit (−1) directly below it, a wall cell, start bottom-left, every step −0.04. The safe policy goes up the left column then east along the top row: six moves, five ordinary steps then the goal.

```text
γ = 1:    return = 5 × (−0.04) + 1                          = 0.800
γ = 0.9:  return = −0.04·(1 + 0.9 + 0.81 + 0.729 + 0.656) + 0.9⁵·1
                 = −0.164 + 0.590                           = 0.427
γ = 0.5:  return ≈ −0.046   (the far-off goal is barely worth reaching)
```

Comparing three policies (γ = 0.9, no slipping):

```text
safe route            0.427
east then north       −0.794      (walks into the pit)
random moves          −0.420      (wanders, pays step costs, sometimes hits the pit)
```

Adding a 20% chance that any move goes in a random direction lowers the safe route to 0.201 and the risky route to −0.677; random moves are unaffected, since they were random already. Discounting and slipping both make the same route worth less.

## Bench

```bench
id: gridworld-policy
title: A policy and its return
fallback: A four by four grid world with a goal, a pit and a wall; choose a policy (safe route, risky route or random moves) and sliders for the discount, the slip probability and the step cost, and the bench shows each cell's value and the expected return from the start.
```

**Try this**

1. Read the return of the safe route.
2. Switch to the risky route and to random moves.
3. Lower γ to 0.5 and see how the safe route's return changes.
4. Raise slip to 40% and compare the routes.

**What you should notice:** the return ranks policies without anyone labelling actions as right or wrong, and shrinking γ or adding randomness shrinks the value of long routes.

## Where it appears in AI

* **Games and robotics:** win, lose or distance walked are rewards.
* **Recommendations and ads:** clicks or purchases as rewards, over a series of choices.
* **Tuning language models** from human feedback, with a reward model as the score.

## Common pitfalls

* **Badly designed rewards:** agents exploit loopholes in the score ("reward hacking").
* **Confusing reward and return:** one reward is a single number; return is the discounted total.
* **Forgetting the Markov property:** if the state omits something important, the policy is blind to it.
* **Choosing γ = 1 in never-ending tasks,** where returns can grow without bound.

## Quick check

<details><summary>1. What does a discount γ = 0 mean?</summary>
The agent cares only about the immediate reward.
</details>

<details><summary>2. What is a policy?</summary>
A rule that gives the action (or action probabilities) for each state.
</details>

<details><summary>3. Why is the objective an expected return?</summary>
Transitions and rewards can be random, so the agent maximises the average total reward.
</details>

## Key terms

* **Reward:** the number received after an action.
* **Return:** the discounted sum of future rewards.
* **Policy:** a rule from states to actions.
* **Markov decision process (MDP):** states, actions, transitions and rewards with the Markov property.

## Related

[[Agents and Environments]] · [[Goals, Utility and Rationality]] · [[Markov Chains]] · [[Expectation]] · [[Value Functions]]
